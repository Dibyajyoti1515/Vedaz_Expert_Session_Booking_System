import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import AdminSidebar from "../../components/AdminSidebar";
import api from "../../services/api";
import Loader from "../../components/Loader";

const STATUS_OPTIONS = ["pending", "confirmed", "completed"];

const STATUS_COLORS = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
};

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10;

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("page", page);
            params.append("limit", LIMIT);
            if (statusFilter !== "all") params.append("status", statusFilter);

            const res = await api.get(`/bookings/all?${params.toString()}`);
            setBookings(res.data.data);
            setTotalPages(res.data.pages);
        } catch (error) {
            toast.error("Failed to fetch bookings");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [statusFilter, page]);

    useEffect(() => {
        setPage(1);
    }, [statusFilter]);

    const handleStatusChange = async (id, status) => {
        setUpdatingId(id);
        try {
            await api.patch(`/bookings/${id}/status`, { status });
            setBookings((prev) =>
                prev.map((b) => (b._id === id ? { ...b, status } : b))
            );
            toast.success(`Status updated to ${status}`);
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    const filtered = bookings.filter(
        (b) =>
            b.name.toLowerCase().includes(search.toLowerCase()) ||
            b.email.toLowerCase().includes(search.toLowerCase()) ||
            b.expertId?.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />

            <main className="flex-1 p-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Manage Bookings</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        View and update all booking statuses
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">

                    {/* Search */}
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email or expert..."
                        className="flex-1 min-w-60 px-4 py-3 rounded-xl border border-gray-300
                        text-sm outline-none focus:border-purple-500 transition"
                    />

                    {/* Status Filter */}
                    <div className="flex gap-2 flex-wrap">
                        {["all", ...STATUS_OPTIONS].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition
                                ${statusFilter === s
                                        ? "bg-purple-600 text-white"
                                        : "bg-white border border-gray-300 text-gray-600 hover:border-purple-400"
                                    }`}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>

                </div>

                {/* Table */}
                {isLoading ? (
                    <Loader />
                ) : (
                    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr className="text-left text-gray-500">
                                        <th className="px-6 py-4 font-medium">User</th>
                                        <th className="px-6 py-4 font-medium">Expert</th>
                                        <th className="px-6 py-4 font-medium">Date & Time</th>
                                        <th className="px-6 py-4 font-medium">Contact</th>
                                        <th className="px-6 py-4 font-medium">Notes</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Update</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="text-center py-12 text-gray-400"
                                            >
                                                No bookings found
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((booking) => (
                                            <tr
                                                key={booking._id}
                                                className="hover:bg-gray-50 transition"
                                            >
                                                {/* User */}
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-gray-800">
                                                        {booking.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {booking.email}
                                                    </p>
                                                </td>

                                                {/* Expert */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <img
                                                            src={
                                                                booking.expertId?.avatar ||
                                                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.expertId?.name}`
                                                            }
                                                            alt={booking.expertId?.name}
                                                            className="w-8 h-8 rounded-lg object-cover"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-gray-700">
                                                                {booking.expertId?.name}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {booking.expertId?.category}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Date & Time */}
                                                <td className="px-6 py-4">
                                                    <p className="text-gray-700 font-medium">
                                                        {new Date(booking.date).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        })}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {booking.timeSlot}
                                                    </p>
                                                </td>

                                                {/* Contact */}
                                                <td className="px-6 py-4">
                                                    <p className="text-gray-500 text-xs">{booking.phone}</p>
                                                </td>

                                                {/* Notes */}
                                                <td className="px-6 py-4 max-w-xs">
                                                    <p className="text-gray-500 text-xs truncate">
                                                        {booking.notes || "—"}
                                                    </p>
                                                </td>

                                                {/* Status Badge */}
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs
                                                    font-semibold ${STATUS_COLORS[booking.status]}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>

                                                {/* Update Status */}
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={booking.status}
                                                        disabled={updatingId === booking._id}
                                                        onChange={(e) =>
                                                            handleStatusChange(booking._id, e.target.value)
                                                        }
                                                        className="px-3 py-2 rounded-lg border border-gray-300
                                                        text-xs outline-none focus:border-purple-500
                                                        bg-white transition disabled:opacity-50"
                                                    >
                                                        {STATUS_OPTIONS.map((s) => (
                                                            <option key={s} value={s}>
                                                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>

                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 p-6
                            border-t border-gray-100">
                                <button
                                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm
                                    text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition"
                                >
                                    Previous
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-10 h-10 rounded-lg text-sm font-medium transition
                                            ${page === i + 1
                                                ? "bg-purple-600 text-white"
                                                : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm
                                    text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition"
                                >
                                    Next
                                </button>
                            </div>
                        )}

                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminBookings;