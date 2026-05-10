import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import useAuthStore from "../store/authStore";
import useSocket from "../hooks/useSocket";
import Loader from "../components/Loader";

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

            // Auto select first available date
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

    // Real time slot update via socket
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

        // Deselect if selected slot was just booked by someone else
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

                {/* Expert Profile Card */}
                <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
                    <div className="flex flex-col sm:flex-row gap-6 items-start">

                        {/* Avatar */}
                        <img
                            src={
                                expert.avatar ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.name}`
                            }
                            alt={expert.name}
                            className="w-28 h-28 rounded-2xl object-cover border-4 border-blue-100"
                        />

                        {/* Details */}
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

                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.floor(expert.rating)
                                            ? "text-yellow-400"
                                            : "text-gray-300"
                                            }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                                <span className="text-sm text-gray-600 ml-1">
                                    ({expert.rating})
                                </span>
                            </div>

                            {/* Bio */}
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {expert.bio}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Slot Booking Section */}
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
                            {/* Date Tabs */}
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

                            {/* Time Slots Grid */}
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

                            {/* Slot Legend */}
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

                            {/* Selected Slot Summary */}
                            {selectedSlot && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                    <p className="text-sm text-blue-700 font-medium">
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

                            {/* Book Button */}
                            <button
                                onClick={handleBookNow}
                                disabled={!selectedSlot}
                                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold
                  hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
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