const { createSchema, mongoose } = require("./schema");

const TimeSlotSchema = new mongoose.Schema(
    {
        date: {
            type: String,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        isBooked: {
            type: Boolean,
            default: false,
        },
    },
    { _id: true, versionKey: false }
);

const ExpertSchema = createSchema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        trim: true,
    },
    experience: {
        type: Number,
        required: [true, "Experience is required"],
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    bio: {
        type: String,
        trim: true,
    },
    availableSlots: [TimeSlotSchema],
});

ExpertSchema.index({ name: "text", bio: "text" });
ExpertSchema.index({ category: 1 });
ExpertSchema.index({ rating: -1 });
ExpertSchema.index({ experience: -1 }); 

module.exports = mongoose.model("Expert", ExpertSchema);