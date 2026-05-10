import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import useBookingStore from "../store/bookingStore";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faUser,
    faEnvelope,
    faMobileScreen,
    faCalendarDays,
    faClock,
    faNoteSticky,
    faCircleCheck,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const bookingSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .min(3, "Name must be at least 3 characters"),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email address"),
    phone: z
        .string()
        .min(1, "Phone is required")
        .regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
    notes: z.string().optional(),
});

const BookingPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { createBooking, isLoading } = useBookingStore();

    const { expertName, date, timeSlot } = location.state || {};

    useEffect(() => {
        if (!location.state) {
            toast.error("Invalid booking. Please select a slot first.");
            navigate(`/experts/${id}`);
        }
    }, [location.state]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            phone: "",
            notes: "",
        },
    });

    const onSubmit = async (data) => {
        const result = await createBooking({
            expertId: id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            date,
            timeSlot,
            notes: data.notes,
        });

        if (result.success) {
            toast.success("Booking confirmed successfully!");
            navigate("/my-bookings");
        } else {
            toast.error(result.message || "Booking failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-6">
            <div className="max-w-2xl mx-auto">

                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700
                        text-sm mb-4 transition"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                        Back
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Complete Your Booking
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Fill in your details to confirm the session
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                    <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">
                        Session Summary
                    </h2>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Expert</span>
                            <span className="font-semibold text-gray-800">{expertName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Date</span>
                            <span className="font-semibold text-gray-800">
                                {date &&
                                    new Date(date).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Time Slot</span>
                            <span className="font-semibold text-gray-800">{timeSlot}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">
                        Your Details
                    </h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                                    <FontAwesomeIcon icon={faUser} className="text-sm" />
                                </span>
                                <input
                                    {...register("name")}
                                    type="text"
                                    placeholder="John Doe"
                                    className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none transition
                                        ${errors.name
                                            ? "border-red-500 focus:border-red-500"
                                            : "border-gray-300 focus:border-blue-500"
                                        }`}
                                />
                            </div>
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                                    <FontAwesomeIcon icon={faEnvelope} className="text-sm" />
                                </span>
                                <input
                                    {...register("email")}
                                    type="email"
                                    placeholder="john@gmail.com"
                                    className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none transition
                                        ${errors.email
                                            ? "border-red-500 focus:border-red-500"
                                            : "border-gray-300 focus:border-blue-500"
                                        }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                                    <FontAwesomeIcon icon={faMobileScreen} className="text-sm" />
                                </span>
                                <input
                                    {...register("phone")}
                                    type="tel"
                                    placeholder="9876543210"
                                    className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none transition
                                        ${errors.phone
                                            ? "border-red-500 focus:border-red-500"
                                            : "border-gray-300 focus:border-blue-500"
                                        }`}
                                />
                            </div>
                            {errors.phone && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.phone.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                                    <FontAwesomeIcon icon={faCalendarDays} className="text-sm" />
                                </span>
                                <input
                                    type="text"
                                    value={
                                        date
                                            ? new Date(date).toLocaleDateString("en-US", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })
                                            : ""
                                    }
                                    readOnly
                                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200
                                    bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Time Slot
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                                    <FontAwesomeIcon icon={faClock} className="text-sm" />
                                </span>
                                <input
                                    type="text"
                                    value={timeSlot || ""}
                                    readOnly
                                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200
                                    bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <FontAwesomeIcon icon={faNoteSticky} className="text-gray-400 mr-1.5" />
                                Notes{" "}
                                <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <textarea
                                {...register("notes")}
                                rows={4}
                                placeholder="Describe what you'd like to discuss in this session..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-300
                                focus:border-blue-500 text-sm outline-none transition resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold
                            hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed
                            text-sm flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon
                                icon={isLoading ? faSpinner : faCircleCheck}
                                className={isLoading ? "animate-spin" : ""}
                            />
                            {isLoading ? "Confirming Booking..." : "Confirm Booking"}
                        </button>

                    </form>
                </div>

            </div>
        </div>
    );
};

export default BookingPage;