const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Create JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};



// @route  POST /api/v1/auth/register
// @access Public
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;


        // check user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered",
            });
        }


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            authProvider: "local",
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: "Registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        next(error);
    }
};




// @route  POST /api/v1/auth/login
// @access Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        console.log(user);
        console.log(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }


        if (user.authProvider === "google" && !user.password) {
            return res.status(401).json({
                success: false,
                message: "This account uses Google login. Please sign in with Google",
            });
        }


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password",
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        next(error);
    }
};





// @route  GET /api/v1/auth/me
// @access Private
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
};




// @route  GET /api/v1/auth/google/callback
// @access Public
const googleAuthCallback = async (profile, done) => {
    try {
        // Check if user exists by googleId
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        // Check if email exists as local account
        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
            user.googleId = profile.id;
            user.authProvider = "google";
            user.isVerified = true;
            user.avatar = profile.photos[0].value;
            await user.save();
            return done(null, user);
        }

        // Create new Google user
        user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            avatar: profile.photos[0].value,
            authProvider: "google",
            isVerified: true,
            password: null,
        });

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
};

module.exports = { register, login, getMe, googleAuthCallback };