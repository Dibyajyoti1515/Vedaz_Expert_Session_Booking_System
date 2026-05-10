require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./config/db");



// Routes
const authRoutes = require("./routes/authRoutes");
const expertRoutes = require("./routes/expertRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

// Socket
const slotHandler = require("./socket/slotHandler");


// Middleware
const errorHandler = require("./middleware/errorHandler");



const app = express();
const server = http.createServer(app);



// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
    },
});



// Connect Database
connectDB();



// Global Middleware
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());


app.use((req, res, next) => {
    req.io = io;
    next();
});




app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/experts", expertRoutes);
app.use("/api/v1/bookings", bookingRoutes);




app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        version: "v1",
    });
});




app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});




app.use(errorHandler);




io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});
slotHandler(io);




const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});