const Expert = require("../models/Expert");


// @route  GET /api/v1/experts
// @access Public
const getExperts = async (req, res, next) => {
    try {
        const { search, category, page = 1, limit = 10 } = req.query;

        const query = {};

        const pageNum = Number(page);
        const limitNum = Number(limit);

        // Full text search
        if (search) {
            query.$text = { $search: search };
        }

        // Filter by category
        if (category && category !== "All") {
            query.category = category;
        }

        const skip = (pageNum - 1) * limitNum;

        const [experts, total] = await Promise.all([
            Expert.find(query)
                .read("secondaryPreferred")
                .skip(skip)
                .limit(Number(limit))
                .sort({ rating: -1 })
                .select("-availableSlots"),
            Expert.countDocuments(query)
                .read("secondaryPreferred"),
        ]);

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            count: experts.length,
            data: experts,
        });

    } catch (error) {
        next(error);
    }
};



// @route  GET /api/v1/experts/:id
// @access Public
const getExpertById = async (req, res, next) => {
    try {
        const expert = await Expert.findById(req.params.id)
            .read("secondaryPreferred");

        if (!expert) {
            return res.status(404).json({
                success: false,
                message: "Expert not found",
            });
        }


        const slotsByDate = expert.availableSlots.reduce((acc, slot) => {
            if (!acc[slot.date]) {
                acc[slot.date] = [];
            }
            acc[slot.date].push({
                id: slot._id,
                time: slot.time,
                isBooked: slot.isBooked,
            });
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: {
                _id: expert._id,
                name: expert.name,
                category: expert.category,
                experience: expert.experience,
                rating: expert.rating,
                bio: expert.bio,
                avatar: expert.avatar,
                slotsByDate,
            },
        });

    } catch (error) {
        next(error);
    }
};



// @route  POST /api/v1/experts
// @access Private (admin only)
const createExpert = async (req, res, next) => {
    try {
        const { name, category, experience, rating, bio, avatar, availableSlots } = req.body;

        const expert = await Expert.create({
            name,
            category,
            experience,
            rating,
            bio,
            avatar,
            availableSlots,
        });

        res.status(201).json({
            success: true,
            message: "Expert created successfully",
            data: expert,
        });

    } catch (error) {
        next(error);
    }
};



// @route  DELETE /api/v1/experts/:id
// @access Private (admin only)
const deleteExpert = async (req, res, next) => {
    try {
        const expert = await Expert.findByIdAndDelete(req.params.id);

        if (!expert) {
            return res.status(404).json({
                success: false,
                message: "Expert not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Expert deleted successfully",
        });

    } catch (error) {
        next(error);
    }
};



module.exports = {
    getExperts,
    getExpertById,
    createExpert,
    deleteExpert,
};