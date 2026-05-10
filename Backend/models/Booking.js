const { createSchema, mongoose } = require("./schema");

const BookingSchema = createSchema({
    expertId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Expert",
        required: [true, "Expert is required"],
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
    },
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: [true, "Phone is required"],
        trim: true,
    },
    date: {
        type: String,
        required: [true, "Date is required"],
    },
    timeSlot: {
        type: String,
        required: [true, "Time slot is required"],
    },
    notes: {
        type: String,
        default: "",
        trim: true,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "completed"],
        default: "pending",
    },
});


BookingSchema.index({ email: 1 });
BookingSchema.index({ expertId: 1, date: 1 });
BookingSchema.index({ expertId: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model("Booking", BookingSchema);