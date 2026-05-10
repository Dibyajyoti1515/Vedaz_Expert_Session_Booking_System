const { createSchema, mongoose } = require("./schema");

const UserSchema = createSchema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: false,
        minlength: [6, "Password must be at least 6 characters"],
        default: null,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },

    // Google Auth 2.0
    googleId: {
        type: String,
        default: null,
        index: {
            unique: true,
            partialFilterExpression: {
                googleId: { $type: "string" }
            }
        }
    },
    avatar: {
        type: String,
        default: "",
    },
    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local",
    },
    isVerified: {     // For local users
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("User", UserSchema);