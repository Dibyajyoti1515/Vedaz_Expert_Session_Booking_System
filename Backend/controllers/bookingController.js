const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Expert = require("../models/Expert");

// @route  POST /api/v1/bookings
// @access Private (user only)
const createBooking = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { expertId, date, timeSlot, name, email, phone, notes } = req.body;

        // Step 1 — Check expert exists
        const expertExists = await Expert.findById(expertId);
        if (!expertExists) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "Expert not found",
            });
        }

        // Step 2 — Atomic slot lock
        // Only updates if slot exists AND isBooked is false
        const expert = await Expert.findOneAndUpdate(
            {
                _id: expertId,
                "availableSlots.date": date,
                "availableSlots.time": timeSlot,
                "availableSlots.isBooked": false,   // ← guard condition
            },
            {
                $set: { "availableSlots.$.isBooked": true },
            },
            { new: true, session }
        );

        // Step 3 — If null slot already taken
        if (!expert) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({
                success: false,
                message: "Slot already booked. Please choose another slot.",
            });
        }

        // Step 4 — Create booking record
        const booking = await Booking.create(
            [
                {
                    expertId,
                    userId: req.user._id,
                    name,
                    email,
                    phone,
                    date,
                    timeSlot,
                    notes,
                    status: "pending",
                },
            ],
            { session }
        );

        // Step 5 — Commit transaction
        await session.commitTransaction();
        session.endSession();

        // Step 6 — Emit real time event to all connected clients
        req.io.emit("slotBooked", {
            expertId,
            date,
            timeSlot,
        });

        res.status(201).json({
            success: true,
            message: "Booking confirmed successfully",
            data: booking[0],
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};

// @route  GET /api/v1/bookings?email=
// @access Private (user only)
const getMyBookings = async (req, res, next) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const bookings = await Booking.find({ email })
            .read("secondaryPreferred")
            .populate("expertId", "name category avatar rating")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });

    } catch (error) {
        next(error);
    }
};

// @route  PATCH /api/v1/bookings/:id/status
// @access Private (admin only)
const updateBookingStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        // Validate status
        const allowedStatus = ["pending", "confirmed", "completed"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be pending, confirmed or completed",
            });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate("expertId", "name category avatar");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Emit real time status update
        req.io.emit("bookingStatusUpdated", {
            bookingId: booking._id,
            status: booking.status,
            userId: booking.userId,
        });

        res.status(200).json({
            success: true,
            message: "Booking status updated successfully",
            data: booking,
        });

    } catch (error) {
        next(error);
    }
};

// @route  GET /api/v1/bookings/all
// @access Private (admin only)
const getAllBookings = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const query = {};
        if (status) query.status = status;

        const skip = (page - 1) * limit;

        const [bookings, total] = await Promise.all([
            Booking.find(query)
                .read("secondaryPreferred")
                .populate("expertId", "name category avatar")
                .populate("userId", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Booking.countDocuments(query)
                .read("secondaryPreferred"),
        ]);

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            count: bookings.length,
            data: bookings,
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    updateBookingStatus,
    getAllBookings,
};