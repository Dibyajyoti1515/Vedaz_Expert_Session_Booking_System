const express = require("express");
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const jwt = require("jsonwebtoken");
const { register, login, getMe, googleAuthCallback } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            await googleAuthCallback(profile, done);
        }
    )
);


router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);



router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
    })
);



router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
    }),
    (req, res) => {

        const token = jwt.sign(
            { id: req.user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.redirect(
            `${process.env.CLIENT_URL}/auth/success?token=${token}`
        );
    }
);

module.exports = router;