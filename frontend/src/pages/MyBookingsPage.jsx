import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import useBookingStore from "../store/bookingStore";
import socket from "../services/socket";
import Loader from "../components/Loader";

// Font Awesome imports
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarDays,
    faClock,
    faCalendarCheck,
    faStickyNote,
    faEnvelope,
    faMobileScreen,
    faLayerGroup,
    faHourglassHalf,
    faCircleCheck,
    faCheckDouble,
    faSearch,
} from "@fortawesome/free-solid-svg-icons";

const STATUS_COLORS = {
    pending: {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
        dot: "bg-yellow-400",
    },
    confirmed: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        dot: "bg-green-500",
    },
    completed: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        dot: "bg-blue-500",
    },
};

const BookingCard = ({ booking }) => {
    const colors = STATUS_COLORS[booking.status];
    const expert = booking.expertId;

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">

            {/* Status Bar */}
            <div className={`h-1.5 w-full ${colors.dot}`} />

            <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start">

                    {/* Expert Avatar */}
                    <img
                        src={
                            expert?.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert?.name}`
                        }
                        alt={expert?.name}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-gray-100"
                    />

                    {/* Booking Info */}
                    <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">

                            {/* Expert Name + Category */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                    {expert?.name}
                                </h3>
                                <span className="text-xs text-blue-600 font-medium bg-blue-50
                  px-2 py-0.5 rounded-full">
                                    {expert?.category}
                                </span>
                            </div>

                            {/* Status Badge */}
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full
                border text-xs font-semibold ${colors.bg} ${colors.text} ${colors.border}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </div>

                        </div>

                        {/* Session Details */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">

                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                                    <FontAwesomeIcon icon={faCalendarDays} className="text-gray-400" />
                                    Date
                                </p>
                                <p className="text-sm font-semibold text-gray-700">
                                    {new Date(booking.date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                                    <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                                    Time
                                </p>
                                <p className="text-sm font-semibold text-gray-700">
                                    {booking.timeSlot}
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                                    <FontAwesomeIcon icon={faCalendarCheck} className="text-gray-400" />
                                    Booked On
                                </p>
                                <p className="text-sm font-semibold text-gray-700">
                                    {new Date(booking.createdAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>

                        </div>

                        {/* Notes */}
                        {booking.notes && (
                            <div className="bg-gray-50 rounded-xl p-3 mb-4">
                                <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                                    <FontAwesomeIcon icon={faStickyNote} className="text-gray-400" />
                                    Notes
                                </p>
                                <p className="text-sm text-gray-600">{booking.notes}</p>
                            </div>
                        )}

                        {/* Contact Info */}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                                {booking.email}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faMobileScreen} className="text-gray-400" />
                                {booking.phone}
                            </span>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

const MyBookingsPage = () => {
    const { user } = useAuthStore();
    const { bookings, getMyBookings, isLoading, error } = useBookingStore();
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState("all");

    useEffect(() => {
        if (user?.email) {
            getMyBookings(user.email);
        }
    }, [user]);

    // Real time booking status update
    useEffect(() => {
        socket.connect();

        socket.on("bookingStatusUpdated", ({ bookingId, status }) => {
            useBookingStore.setState((state) => ({
                bookings: state.bookings.map((b) =>
                    b._id === bookingId ? { ...b, status } : b
                ),
            }));
            toast.success(`Booking status updated to ${status}`);
        });

        return () => {
            socket.off("bookingStatusUpdated");
            socket.disconnect();
        };
    }, []);

    const filteredBookings = bookings.filter((b) => {
        if (activeFilter === "all") return true;
        return b.status === activeFilter;
    });

    const counts = {
        all: bookings.length,
        pending: bookings.filter((b) => b.status === "pending").length,
        confirmed: bookings.filter((b) => b.status === "confirmed").length,
        completed: bookings.filter((b) => b.status === "completed").length,
    };

    const FILTERS = [
        { label: "All", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Completed", value: "completed" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-6">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Track all your expert sessions
                    </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total", count: counts.all, color: "text-gray-700", icon: faLayerGroup },
                        { label: "Pending", count: counts.pending, color: "text-yellow-600", icon: faHourglassHalf },
                        { label: "Confirmed", count: counts.confirmed, color: "text-green-600", icon: faCircleCheck },
                        { label: "Completed", count: counts.completed, color: "text-blue-600", icon: faCheckDouble },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm text-center">
                            <FontAwesomeIcon
                                icon={stat.icon}
                                className={`text-lg mb-1 ${stat.color}`}
                            />
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setActiveFilter(filter.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition
                flex items-center gap-1.5
                ${activeFilter === filter.value
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-gray-600 border border-gray-300 hover:border-blue-400"
                                }`}
                        >
                            {filter.label}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                ${activeFilter === filter.value
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-500"
                                }`}>
                                {counts[filter.value]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {isLoading && <Loader />}

                {/* Error */}
                {error && !isLoading && (
                    <div className="text-center py-20">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={() => getMyBookings(user.email)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && filteredBookings.length === 0 && (
                    <div className="text-center py-20">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="text-5xl text-gray-300 mb-4"
                        />
                        <p className="text-gray-500 text-lg font-medium">
                            No {activeFilter === "all" ? "" : activeFilter} bookings found
                        </p>
                        <p className="text-gray-400 text-sm mt-1 mb-6">
                            {activeFilter === "all"
                                ? "You have not booked any sessions yet"
                                : `You have no ${activeFilter} bookings`}
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl
                text-sm font-semibold hover:bg-blue-700 transition"
                        >
                            Browse Experts
                        </button>
                    </div>
                )}

                {/* Bookings List */}
                {!isLoading && !error && filteredBookings.length > 0 && (
                    <div className="space-y-4">
                        {filteredBookings.map((booking) => (
                            <BookingCard
                                key={booking._id}
                                booking={booking}
                            />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default MyBookingsPage;