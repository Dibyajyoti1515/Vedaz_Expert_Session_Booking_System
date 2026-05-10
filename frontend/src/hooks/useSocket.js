import { useEffect } from "react";
import socket from "../services/socket";

const useSocket = (expertId, onSlotBooked) => {
    useEffect(() => {
        // Connect socket
        socket.connect();

        // Join expert room for real time slot updates
        if (expertId) {
            socket.emit("joinExpert", expertId);
        }

        // Listen for slot booked event
        socket.on("slotBooked", (data) => {
            if (data.expertId === expertId) {
                onSlotBooked(data);
            }
        });

        return () => {
            // Cleanup on unmount
            if (expertId) {
                socket.emit("leaveExpert", expertId);
            }
            socket.off("slotBooked");
            socket.disconnect();
        };
    }, [expertId]);
};

export default useSocket;