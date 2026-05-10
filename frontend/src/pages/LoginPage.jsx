import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";

const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email address"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
});

const LoginPage = () => {
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        const result = await login(data);
        if (result.success) {
            toast.success("Logged in successfully");
            navigate("/");
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        Login to book your expert session
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="john@gmail.com"
                            className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition
                                ${errors.email
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-gray-300 focus:border-blue-500"
                                }`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            {...register("password")}
                            type="password"
                            placeholder="••••••••"
                            className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition
                                ${errors.password
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-gray-300 focus:border-blue-500"
                                }`}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold
                        hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>

                    {/* Google Login */}
                    <a
                    href={`${import.meta.env.VITE_API_URL}/auth/google`}
                    className="w-full flex items-center justify-center gap-3 border border-gray-300
                    py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="google"
                            className="w-5 h-5"
                        />
                        Continue with Google
                    </a>

                </form>

            {/* Footer */}
            <p className="text-center text-sm text-gray-500 mt-6">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 font-medium hover:underline">
                    Register here
                </Link>
            </p>

        </div>
    </div >
  );
};

export default LoginPage;