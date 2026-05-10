import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChartBar,
    faUserTie,
    faUserPlus,
    faCalendarCheck,
    faHome,
    faRightFromBracket,
    faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";

const MENU = [
    {
        label: "Dashboard",
        path: "/admin",
        icon: faChartBar,
    },
    {
        label: "Manage Experts",
        path: "/admin/experts",
        icon: faUserTie,
    },
    {
        label: "Add Expert",
        path: "/admin/experts/add",
        icon: faUserPlus,
    },
    {
        label: "Manage Bookings",
        path: "/admin/bookings",
        icon: faCalendarCheck,
    },
];

const AdminSidebar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        navigate("/login");
    };

    return (
        <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">

            {/* Logo */}
            <div className="px-6 py-6 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                        icon={faShieldHalved}
                        className="text-purple-400 text-xl"
                    />
                    <div>
                        <h1 className="text-xl font-bold text-white">ExpertBook</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
                    </div>
                </div>
            </div>

            {/* Admin Info */}
            <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center
                        justify-center text-white font-bold text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{user?.name}</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {MENU.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/admin"}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                            font-medium transition
                            ${isActive
                                ? "bg-purple-600 text-white"
                                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            }`
                        }
                    >
                        <FontAwesomeIcon
                            icon={item.icon}
                            className="w-4 h-4"
                        />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="px-4 py-6 border-t border-gray-700 space-y-2">
                <NavLink
                    to="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                        font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition"
                >
                    <FontAwesomeIcon
                        icon={faHome}
                        className="w-4 h-4"
                    />
                    Back to Site
                </NavLink>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                        font-medium text-red-400 hover:bg-red-900 hover:text-red-300 transition"
                >
                    <FontAwesomeIcon
                        icon={faRightFromBracket}
                        className="w-4 h-4"
                    />
                    Logout
                </button>
            </div>

        </aside>
    );
};

export default AdminSidebar;