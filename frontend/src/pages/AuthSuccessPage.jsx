import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/authStore";
import api from "../services/api";
import Loader from "../components/Loader";

const AuthSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuthStore();

    useEffect(() => {
        const handleGoogleCallback = async () => {
            const token = searchParams.get("token");

            if (!token) {
                navigate("/login");
                return;
            }

            localStorage.setItem("token", token);

            try {
                const res = await api.get("/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Save user to zustand store
                useAuthStore.setState({
                    user: res.data.user,
                    token,
                });

                navigate("/");
            } catch (error) {
                localStorage.removeItem("token");
                navigate("/login");
            }
        };

        handleGoogleCallback();
    }, []);

    return <Loader />;
};

export default AuthSuccessPage;