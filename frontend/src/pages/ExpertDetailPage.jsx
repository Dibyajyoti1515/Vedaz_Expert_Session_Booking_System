import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import useAuthStore from "../store/authStore";
import useSocket from "../hooks/useSocket";
import Loader from "../components/Loader";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStar,
    faCalendarCheck,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const ExpertDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [expert, setExpert] = useState(null);
    const [slotsByDate, setSlotsByDate] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchExpert = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get(`/experts/${id}`);
            setExpert(res.data.data);
            setSlotsByDate(res.data.data.slotsByDate);

            const dates = Object.keys(res.data.data.slotsByDate);
            if (dates.length > 0) setSelectedDate(dates[0]);

        } catch (err) {
            setError(err.message || "Failed to fetch expert");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchExpert();
    }, [fetchExpert]);

    useSocket(id, ({ date, timeSlot }) => {
        setSlotsByDate((prev) => {
            const updated = { ...prev };
            if (updated[date]) {
                updated[date] = updated[date].map((slot) =>
                    slot.time === timeSlot
                        ? { ...slot, isBooked: true }
                        : slot
                );
            }
            return updated;
        });

        if (
            selectedSlot &&
            selectedSlot.time === timeSlot &&
            selectedDate === date
        ) {
            setSelectedSlot(null);
            toast.error("Your selected slot was just booked. Please choose another.");
        }
    });

    const handleSlotSelect = (slot) => {
        if (slot.isBooked) return;
        setSelectedSlot(slot);
    };

    const handleBookNow = () => {
        if (!user) {
            toast.error("Please login to book a session");
            navigate("/login");
            return;
        }
        if (!selectedSlot) {
            toast.error("Please select a time slot");
            return;
        }
        navigate(`/booking/${id}`, {
            state: {
                expertId: id,
                expertName: expert.name,
                date: selectedDate,
                timeSlot: selectedSlot.time,
            },
        });
    };

    if (isLoading) return <Loader />;

    if (error) {
        return (
            <div className="text-center py-20">
                <p className="text-red-500 text-lg mb-4">{error}</p>
                <button
                    onClick={fetchExpert}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!expert) return null;

    const dates = Object.keys(slotsByDate);

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-6">
            <div className="max-w-4xl mx-auto">

                <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
                    <div className="flex flex-col sm:flex-row gap-6 items-start">

                        <img
                            src={
                                expert.avatar ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.name}`
                            }
                            alt={expert.name}
                            className="w-28 h-28 rounded-2xl object-cover border-4 border-blue-100"
                        />

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-800">
                                    {expert.name}
                                </h1>
                                <span className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full font-medium">
                                    {expert.category}
                                </span>
                            </div>

                            <p className="text-gray-500 text-sm mb-3">
                                {expert.experience} years of experience
                            </p>

                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <FontAwesomeIcon
                                        key={i}
                                        icon={faStar}
                                        className={`w-4 h-4 ${i < Math.floor(expert.rating)
                                            ? "text-yellow-400"
                                            : "text-gray-300"
                                            }`}
                                    />
                                ))}
                                <span className="text-sm text-gray-600 ml-1">
                                    ({expert.rating})
                                </span>
                            </div>

                            <p className="text-gray-600 text-sm leading-relaxed">
                                {expert.bio}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                        Available Time Slots
                    </h2>

                    {dates.length === 0 ? (
                        <p className="text-gray-400 text-center py-10">
                            No available slots at the moment
                        </p>
                    ) : (
                        <>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {dates.map((date) => (
                                    <button
                                        key={date}
                                        onClick={() => {
                                            setSelectedDate(date);
                                            setSelectedSlot(null);
                                        }}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition
                                            ${selectedDate === date
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        {new Date(date).toLocaleDateString("en-US", {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </button>
                                ))}
                            </div>

                            {selectedDate && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-8">
                                    {slotsByDate[selectedDate]?.map((slot) => (
                                        <button
                                            key={slot.id}
                                            onClick={() => handleSlotSelect(slot)}
                                            disabled={slot.isBooked}
                                            className={`py-2.5 px-3 rounded-xl text-sm font-medium transition
                                                ${slot.isBooked
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                                                    : selectedSlot?.id === slot.id
                                                        ? "bg-blue-600 text-white ring-2 ring-blue-400"
                                                        : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                                                }`}
                                        >
                                            {slot.time}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-4 mb-8 text-xs text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-green-200 border border-green-400" />
                                    Available
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                                    Selected
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-gray-200" />
                                    Booked
                                </div>
                            </div>

                            {selectedSlot && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                    <p className="text-sm text-blue-700 font-medium flex items-center gap-1.5">
                                        <FontAwesomeIcon icon={faCalendarCheck} />
                                        Selected Session
                                    </p>
                                    <p className="text-blue-800 font-bold mt-1">
                                        {new Date(selectedDate).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}{" "}
                                        at {selectedSlot.time}
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleBookNow}
                                disabled={!selectedSlot}
                                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold
                                hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed
                                flex items-center justify-center gap-2"
                            >
                                <FontAwesomeIcon icon={faCalendarCheck} />
                                {selectedSlot ? "Proceed to Book" : "Select a Time Slot"}
                            </button>

                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ExpertDetailPage;