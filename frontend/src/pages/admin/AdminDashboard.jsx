import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserTie,
    faCalendarCheck,
    faClock,
    faCheckCircle,
    faFlagCheckered,
    faUser,
    faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";

const StatCard = ({ label, value, icon, color, iconColor }) => (
    <div className={`bg-white rounded-2xl shadow-md p-6 border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
            <div className={`text-4xl ${iconColor}`}>
                <FontAwesomeIcon icon={icon} />
            </div>
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

                {/* Header */}
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
                                icon={faUserTie}
                                color="border-blue-500"
                                iconColor="text-blue-400"
                            />
                            <StatCard
                                label="Total Bookings"
                                value={stats?.totalBookings || 0}
                                icon={faCalendarCheck}
                                color="border-purple-500"
                                iconColor="text-purple-400"
                            />
                            <StatCard
                                label="Pending"
                                value={stats?.pending || 0}
                                icon={faClock}
                                color="border-yellow-500"
                                iconColor="text-yellow-400"
                            />
                            <StatCard
                                label="Confirmed"
                                value={stats?.confirmed || 0}
                                icon={faCheckCircle}
                                color="border-green-500"
                                iconColor="text-green-400"
                            />
                            <StatCard
                                label="Completed"
                                value={stats?.completed || 0}
                                icon={faFlagCheckered}
                                color="border-indigo-500"
                                iconColor="text-indigo-400"
                            />
                        </div>

                        {/* Recent Bookings */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FontAwesomeIcon
                                    icon={faCalendarAlt}
                                    className="text-purple-500"
                                />
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
                                                <th className="pb-3 font-medium">
                                                    <FontAwesomeIcon
                                                        icon={faUser}
                                                        className="mr-1 text-gray-300"
                                                    />
                                                    User
                                                </th>
                                                <th className="pb-3 font-medium">
                                                    <FontAwesomeIcon
                                                        icon={faUserTie}
                                                        className="mr-1 text-gray-300"
                                                    />
                                                    Expert
                                                </th>
                                                <th className="pb-3 font-medium">
                                                    <FontAwesomeIcon
                                                        icon={faCalendarAlt}
                                                        className="mr-1 text-gray-300"
                                                    />
                                                    Date
                                                </th>
                                                <th className="pb-3 font-medium">
                                                    <FontAwesomeIcon
                                                        icon={faClock}
                                                        className="mr-1 text-gray-300"
                                                    />
                                                    Slot
                                                </th>
                                                <th className="pb-3 font-medium">
                                                    <FontAwesomeIcon
                                                        icon={faCheckCircle}
                                                        className="mr-1 text-gray-300"
                                                    />
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {recentBookings.map((booking) => (
                                                <tr
                                                    key={booking._id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="py-3 font-medium text-gray-700">
                                                        <FontAwesomeIcon
                                                            icon={faUser}
                                                            className="mr-2 text-gray-300"
                                                        />
                                                        {booking.name}
                                                    </td>
                                                    <td className="py-3 text-gray-500">
                                                        <FontAwesomeIcon
                                                            icon={faUserTie}
                                                            className="mr-2 text-gray-300"
                                                        />
                                                        {booking.expertId?.name}
                                                    </td>
                                                    <td className="py-3 text-gray-500">
                                                        <FontAwesomeIcon
                                                            icon={faCalendarAlt}
                                                            className="mr-2 text-gray-300"
                                                        />
                                                        {new Date(booking.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 text-gray-500">
                                                        <FontAwesomeIcon
                                                            icon={faClock}
                                                            className="mr-2 text-gray-300"
                                                        />
                                                        {booking.timeSlot}
                                                    </td>
                                                    <td className="py-3">
                                                        <span
                                                            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit
                                                            ${booking.status === "pending"
                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                    : booking.status === "confirmed"
                                                                        ? "bg-green-100 text-green-700"
                                                                        : "bg-blue-100 text-blue-700"
                                                                }`}
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    booking.status === "pending"
                                                                        ? faClock
                                                                        : booking.status === "confirmed"
                                                                            ? faCheckCircle
                                                                            : faFlagCheckered
                                                                }
                                                            />
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