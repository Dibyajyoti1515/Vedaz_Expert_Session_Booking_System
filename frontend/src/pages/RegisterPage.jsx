import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";

const registerSchema = z
    .object({
        name: z
            .string()
            .min(1, "Name is required")
            .min(3, "Name must be at least 3 characters"),
        email: z
            .string()
            .min(1, "Email is required")
            .email("Invalid email address"),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters"),
        confirmPassword: z
            .string()
            .min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

const RegisterPage = () => {
    const { register: registerUser, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data) => {
        const result = await registerUser({
            name: data.name,
            email: data.email,
            password: data.password,
        });
        if (result.success) {
            toast.success("Registered successfully");
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
                    <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        Register to start booking expert sessions
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            {...register("name")}
                            type="text"
                            placeholder="John Doe"
                            className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition
                                ${errors.name
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-gray-300 focus:border-blue-500"
                                }`}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

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

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <input
                            {...register("confirmPassword")}
                            type="password"
                            placeholder="••••••••"
                            className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition
                                ${errors.confirmPassword
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-gray-300 focus:border-blue-500"
                                }`}
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.confirmPassword.message}
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
                        {isLoading ? "Creating account..." : "Create Account"}
                    </button>

                    {/* Google Register */}
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
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 font-medium hover:underline">
                    Login here
                </Link>
            </p>

        </div>
    </div >
  );
};

export default RegisterPage;