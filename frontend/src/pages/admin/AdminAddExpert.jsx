import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faTag,
    faBriefcase,
    faStar,
    faLink,
    faFileAlt,
    faCalendarAlt,
    faClock,
    faPlus,
    faTrash,
    faCheckCircle,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";

import AdminSidebar from "../../components/AdminSidebar";
import api from "../../services/api";

const expertSchema = z.object({
    name: z.string().min(1, "Name is required"),
    category: z.string().min(1, "Category is required"),
    experience: z.coerce.number().min(1, "Experience is required"),
    rating: z.coerce.number().min(0).max(5),
    bio: z.string().min(1, "Bio is required"),
    avatar: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

const CATEGORIES = [
    "Design",
    "Finance",
    "Marketing",
    "Technology",
    "Health",
    "Education",
    "Legal",
    "Business",
];

const TIME_OPTIONS = [
    "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM",
    "03:00 PM", "04:00 PM", "05:00 PM",
    "06:00 PM",
];

const AdminAddExpert = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Slots state
    const [slots, setSlots] = useState([]);
    const [slotDate, setSlotDate] = useState("");
    const [slotTime, setSlotTime] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(expertSchema),
        defaultValues: { rating: 0 },
    });

    const addSlot = () => {
        if (!slotDate || !slotTime) {
            toast.error("Please select both date and time");
            return;
        }

        const exists = slots.find(
            (s) => s.date === slotDate && s.time === slotTime
        );
        if (exists) {
            toast.error("Slot already added");
            return;
        }

        setSlots((prev) => [
            ...prev,
            { date: slotDate, time: slotTime, isBooked: false },
        ]);
        setSlotTime("");
    };

    const removeSlot = (index) => {
        setSlots((prev) => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data) => {
        if (slots.length === 0) {
            toast.error("Please add at least one time slot");
            return;
        }

        setIsLoading(true);
        try {
            await api.post("/experts", {
                ...data,
                availableSlots: slots,
            });
            toast.success("Expert added successfully");
            navigate("/admin/experts");
        } catch (error) {
            toast.error(error.message || "Failed to add expert");
        } finally {
            setIsLoading(false);
        }
    };

    // Group slots by date for display
    const slotsByDate = slots.reduce((acc, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
    }, {});

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />

            <main className="flex-1 p-8">

                <div className="mb-8">
                    <button
                        onClick={() => navigate("/admin/experts")}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700
                        text-sm mb-4 transition"
                    >
                        ← Back to Experts
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Add New Expert</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Fill in the details and add available time slots
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    <div className="bg-white rounded-2xl shadow-md p-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-6">
                            Expert Details
                        </h2>

                        <form
                            id="expert-form"
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-5"
                        >

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <FontAwesomeIcon icon={faUser} className="mr-2 text-purple-500" />
                                    Full Name
                                </label>
                                <input
                                    {...register("name")}
                                    type="text"
                                    placeholder="Dr. John Smith"
                                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none
                                    transition ${errors.name
                                            ? "border-red-500"
                                            : "border-gray-300 focus:border-purple-500"
                                        }`}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <FontAwesomeIcon icon={faTag} className="mr-2 text-purple-500" />
                                    Category
                                </label>
                                <select
                                    {...register("category")}
                                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none
                                    transition bg-white ${errors.category
                                            ? "border-red-500"
                                            : "border-gray-300 focus:border-purple-500"
                                        }`}
                                >
                                    <option value="">Select Category</option>
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                {errors.category && (
                                    <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-purple-500" />
                                        Experience (years)
                                    </label>
                                    <input
                                        {...register("experience")}
                                        type="number"
                                        min="0"
                                        placeholder="5"
                                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none
                                        transition ${errors.experience
                                                ? "border-red-500"
                                                : "border-gray-300 focus:border-purple-500"
                                            }`}
                                    />
                                    {errors.experience && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.experience.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <FontAwesomeIcon icon={faStar} className="mr-2 text-yellow-500" />
                                        Rating (0-5)
                                    </label>
                                    <input
                                        {...register("rating")}
                                        type="number"
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        placeholder="4.5"
                                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none
                                        transition ${errors.rating
                                                ? "border-red-500"
                                                : "border-gray-300 focus:border-purple-500"
                                            }`}
                                    />
                                    {errors.rating && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.rating.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <FontAwesomeIcon icon={faLink} className="mr-2 text-purple-500" />
                                    Avatar URL
                                    <span className="text-gray-400 font-normal ml-1">(optional)</span>
                                </label>
                                <input
                                    {...register("avatar")}
                                    type="text"
                                    placeholder="https://example.com/avatar.jpg"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300
                                    focus:border-purple-500 text-sm outline-none transition"
                                />
                                {errors.avatar && (
                                    <p className="text-red-500 text-xs mt-1">{errors.avatar.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-purple-500" />
                                    Bio
                                </label>
                                <textarea
                                    {...register("bio")}
                                    rows={4}
                                    placeholder="Describe the expert's background and expertise..."
                                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none
                                    transition resize-none ${errors.bio
                                            ? "border-red-500"
                                            : "border-gray-300 focus:border-purple-500"
                                        }`}
                                />
                                {errors.bio && (
                                    <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>
                                )}
                            </div>

                        </form>
                    </div>

                    <div className="space-y-6">

                        <div className="bg-white rounded-2xl shadow-md p-8">
                            <h2 className="text-lg font-bold text-gray-800 mb-6">
                                Add Time Slots
                            </h2>

                            <div className="space-y-4">

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-purple-500" />
                                        Select Date
                                    </label>
                                    <input
                                        type="date"
                                        value={slotDate}
                                        min={new Date().toISOString().split("T")[0]}
                                        onChange={(e) => setSlotDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300
                                        focus:border-purple-500 text-sm outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <FontAwesomeIcon icon={faClock} className="mr-2 text-purple-500" />
                                        Select Time
                                    </label>
                                    <select
                                        value={slotTime}
                                        onChange={(e) => setSlotTime(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300
                                        focus:border-purple-500 text-sm outline-none transition bg-white"
                                    >
                                        <option value="">Select Time</option>
                                        {TIME_OPTIONS.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    onClick={addSlot}
                                    className="w-full bg-purple-600 text-white py-3 rounded-xl
                                    text-sm font-semibold hover:bg-purple-700 transition"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                    Add Slot
                                </button>

                            </div>
                        </div>

                        {slots.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-md p-8">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">
                                    Added Slots ({slots.length})
                                </h2>

                                <div className="space-y-4 max-h-72 overflow-y-auto">
                                    {Object.entries(slotsByDate).map(([date, dateSlots]) => (
                                        <div key={date}>
                                            <p className="text-xs font-semibold text-gray-400
                                            uppercase mb-2">
                                                {new Date(date).toLocaleDateString("en-US", {
                                                    weekday: "long",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {dateSlots.map((slot, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-1.5 bg-purple-50
                                                        border border-purple-200 text-purple-700 px-3 py-1.5
                                                        rounded-lg text-xs font-medium"
                                                    >
                                                        {slot.time}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeSlot(slots.findIndex(
                                                                    (s) => s.date === date && s.time === slot.time
                                                                ))
                                                            }
                                                            className="text-purple-400 hover:text-red-500
                                                            transition font-bold ml-1"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            form="expert-form"
                            disabled={isLoading}
                            className="w-full bg-green-600 text-white py-4 rounded-2xl
                            font-bold text-sm hover:bg-green-700 transition
                            disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            {isLoading ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                                    Adding Expert...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                                    Save Expert
                                </>
                            )}
                        </button>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminAddExpert;