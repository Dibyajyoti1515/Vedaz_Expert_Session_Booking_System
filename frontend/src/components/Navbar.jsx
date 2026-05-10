import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

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

                        {/* Admin Badge + Link */}
                        {user.role === "admin" && (
                            <Link
                                to="/admin"
                                className="text-xs bg-purple-600 text-white px-3 py-1.5
                  rounded-full font-semibold hover:bg-purple-700 transition"
                            >
                                Admin Panel
                            </Link>
                        )}

                        <Link
                            to="/my-bookings"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            My Bookings
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="text-sm bg-red-500 text-white px-4 py-2
                rounded-lg hover:bg-red-600 transition"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-sm text-blue-600 hover:underline">
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="text-sm bg-blue-600 text-white px-4 py-2
                rounded-lg hover:bg-blue-700 transition"
                        >
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;