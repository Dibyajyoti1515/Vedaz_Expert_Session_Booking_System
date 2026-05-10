import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import api from "../../services/api";
import Loader from "../../components/Loader";

const StatCard = ({ label, value, icon, color }) => (
    <div className={`bg-white rounded-2xl shadow-md p-6 border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
            <span className="text-4xl">{icon}</span>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [recentBookings, setRecentBookings] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const [expertsRes, bookingsRes] = await Promise.all([
                    api.get("/experts?limit=1000"),
                    api.get("/bookings/all?limit=1000"),
                ]);

                const bookings = bookingsRes.data.data;

                setStats({
                    totalExperts: expertsRes.data.total,
                    totalBookings: bookingsRes.data.total,
                    pending: bookings.filter((b) => b.status === "pending").length,
                    confirmed: bookings.filter((b) => b.status === "confirmed").length,
                    completed: bookings.filter((b) => b.status === "completed").length,
                });

                setRecentBookings(bookings.slice(0, 5));
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />

            <main className="flex-1 p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Welcome back! Here is what is happening today.
                    </p>
                </div>

                {isLoading ? (
                    <Loader />
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                            <StatCard
                                label="Total Experts"
                                value={stats?.totalExperts || 0}
                                icon="👨‍💼"
                                color="border-blue-500"
                            />
                            <StatCard
                                label="Total Bookings"
                                value={stats?.totalBookings || 0}
                                icon="📅"
                                color="border-purple-500"
                            />
                            <StatCard
                                label="Pending"
                                value={stats?.pending || 0}
                                icon="⏳"
                                color="border-yellow-500"
                            />
                            <StatCard
                                label="Confirmed"
                                value={stats?.confirmed || 0}
                                icon="✅"
                                color="border-green-500"
                            />
                            <StatCard
                                label="Completed"
                                value={stats?.completed || 0}
                                icon="🎉"
                                color="border-indigo-500"
                            />
                        </div>

                        {/* Recent Bookings */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">
                                Recent Bookings
                            </h2>

                            {recentBookings.length === 0 ? (
                                <p className="text-gray-400 text-center py-6">
                                    No bookings yet
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-gray-400 border-b border-gray-100">
                                                <th className="pb-3 font-medium">User</th>
                                                <th className="pb-3 font-medium">Expert</th>
                                                <th className="pb-3 font-medium">Date</th>
                                                <th className="pb-3 font-medium">Slot</th>
                                                <th className="pb-3 font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {recentBookings.map((booking) => (
                                                <tr key={booking._id} className="hover:bg-gray-50">
                                                    <td className="py-3 font-medium text-gray-700">
                                                        {booking.name}
                                                    </td>
                                                    <td className="py-3 text-gray-500">
                                                        {booking.expertId?.name}
                                                    </td>
                                                    <td className="py-3 text-gray-500">
                                                        {new Date(booking.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 text-gray-500">
                                                        {booking.timeSlot}
                                                    </td>
                                                    <td className="py-3">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                              ${booking.status === "pending"
                                                                ? "bg-yellow-100 text-yellow-700"
                                                                : booking.status === "confirmed"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-blue-100 text-blue-700"
                                                            }`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;