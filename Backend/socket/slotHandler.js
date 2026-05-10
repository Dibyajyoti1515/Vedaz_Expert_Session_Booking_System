const slotHandler = (io) => {
    io.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Client joins expert room to get slot updates
        socket.on("joinExpert", (expertId) => {
            socket.join(expertId);
            console.log(`Client ${socket.id} joined expert room: ${expertId}`);
        });

        // Client leaves expert room
        socket.on("leaveExpert", (expertId) => {
            socket.leave(expertId);
            console.log(`Client ${socket.id} left expert room: ${expertId}`);
        });

        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
};

module.exports = slotHandler;