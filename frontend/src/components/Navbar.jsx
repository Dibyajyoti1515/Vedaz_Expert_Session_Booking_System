import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faShieldHalved,
    faCalendarDays,
    faRightFromBracket,
    faRightToBracket,
    faUserPlus,
} from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        navigate("/login");
    };

    return (
        <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-blue-600">
                ExpertBook
            </Link>

            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <span className="text-gray-600 text-sm">
                            Hello, {user.name}
                        </span>

                        {user.role === "admin" && (
                            <Link
                                to="/admin"
                                className="flex items-center gap-1.5 text-xs bg-purple-600 text-white px-3 py-1.5
                                rounded-full font-semibold hover:bg-purple-700 transition"
                            >
                                <FontAwesomeIcon icon={faShieldHalved} />
                                Admin Panel
                            </Link>
                        )}

                        <Link
                            to="/my-bookings"
                            className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                        >
                            <FontAwesomeIcon icon={faCalendarDays} />
                            My Bookings
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 text-sm bg-red-500 text-white px-4 py-2
                            rounded-lg hover:bg-red-600 transition"
                        >
                            <FontAwesomeIcon icon={faRightFromBracket} />
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                        >
                            <FontAwesomeIcon icon={faRightToBracket} />
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-4 py-2
                            rounded-lg hover:bg-blue-700 transition"
                        >
                            <FontAwesomeIcon icon={faUserPlus} />
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;