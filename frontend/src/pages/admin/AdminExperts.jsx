import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import AdminSidebar from "../../components/AdminSidebar";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserTie,
    faPlus,
    faSearch,
    faTag,
    faBriefcase,
    faStar,
    faCalendarAlt,
    faTrash,
    faSpinner,
    faUserSlash,
} from "@fortawesome/free-solid-svg-icons";

const AdminExperts = () => {
    const [experts, setExperts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [search, setSearch] = useState("");

    const fetchExperts = async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/experts?limit=100");
            setExperts(res.data.data);
        } catch (error) {
            toast.error("Failed to fetch experts");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExperts();
    }, []);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
        setDeletingId(id);
        try {
            await api.delete(`/experts/${id}`);
            setExperts((prev) => prev.filter((e) => e._id !== id));
            toast.success(`${name} deleted successfully`);
        } catch (error) {
            toast.error("Failed to delete expert");
        } finally {
            setDeletingId(null);
        }
    };

    const filtered = experts.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />

            <main className="flex-1 p-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <FontAwesomeIcon
                                icon={faUserTie}
                                className="text-purple-500"
                            />
                            Manage Experts
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {experts.length} experts total
                        </p>
                    </div>
                    <Link
                        to="/admin/experts/add"
                        className="bg-purple-600 text-white px-5 py-2.5 rounded-xl
                            text-sm font-semibold hover:bg-purple-700 transition
                            flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Add Expert
                    </Link>
                </div>

                {/* Search */}
                <div className="mb-6 relative max-w-md">
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search experts by name..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300
                            text-sm outline-none focus:border-purple-500 transition"
                    />
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
                                        <th className="px-6 py-4 font-medium">
                                            <FontAwesomeIcon
                                                icon={faUserTie}
                                                className="mr-2 text-gray-400"
                                            />
                                            Expert
                                        </th>
                                        <th className="px-6 py-4 font-medium">
                                            <FontAwesomeIcon
                                                icon={faTag}
                                                className="mr-2 text-gray-400"
                                            />
                                            Category
                                        </th>
                                        <th className="px-6 py-4 font-medium">
                                            <FontAwesomeIcon
                                                icon={faBriefcase}
                                                className="mr-2 text-gray-400"
                                            />
                                            Experience
                                        </th>
                                        <th className="px-6 py-4 font-medium">
                                            <FontAwesomeIcon
                                                icon={faStar}
                                                className="mr-2 text-gray-400"
                                            />
                                            Rating
                                        </th>
                                        <th className="px-6 py-4 font-medium">
                                            <FontAwesomeIcon
                                                icon={faCalendarAlt}
                                                className="mr-2 text-gray-400"
                                            />
                                            Slots
                                        </th>
                                        <th className="px-6 py-4 font-medium">
                                            <FontAwesomeIcon
                                                icon={faTrash}
                                                className="mr-2 text-gray-400"
                                            />
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="text-center py-12 text-gray-400"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faUserSlash}
                                                    className="text-4xl mb-3 block mx-auto text-gray-300"
                                                />
                                                No experts found
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((expert) => (
                                            <tr
                                                key={expert._id}
                                                className="hover:bg-gray-50 transition"
                                            >
                                                {/* Expert Name + Avatar */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={
                                                                expert.avatar ||
                                                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.name}`
                                                            }
                                                            alt={expert.name}
                                                            className="w-10 h-10 rounded-xl object-cover"
                                                        />
                                                        <p className="font-semibold text-gray-800">
                                                            {expert.name}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Category */}
                                                <td className="px-6 py-4">
                                                    <span className="bg-blue-50 text-blue-600 px-2.5 py-1
                                                        rounded-full text-xs font-medium flex items-center
                                                        gap-1.5 w-fit">
                                                        <FontAwesomeIcon icon={faTag} />
                                                        {expert.category}
                                                    </span>
                                                </td>

                                                {/* Experience */}
                                                <td className="px-6 py-4 text-gray-500">
                                                    <FontAwesomeIcon
                                                        icon={faBriefcase}
                                                        className="mr-2 text-gray-300"
                                                    />
                                                    {expert.experience} yrs
                                                </td>

                                                {/* Rating */}
                                                <td className="px-6 py-4">
                                                    <span className="flex items-center gap-1.5
                                                        text-yellow-500 font-semibold">
                                                        <FontAwesomeIcon icon={faStar} />
                                                        {expert.rating}
                                                    </span>
                                                </td>

                                                {/* Slots */}
                                                <td className="px-6 py-4 text-gray-500">
                                                    <FontAwesomeIcon
                                                        icon={faCalendarAlt}
                                                        className="mr-2 text-gray-300"
                                                    />
                                                    {expert.availableSlots?.length || 0} slots
                                                </td>

                                                {/* Delete Button */}
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(expert._id, expert.name)
                                                        }
                                                        disabled={deletingId === expert._id}
                                                        className="bg-red-50 text-red-600 px-3 py-1.5
                                                            rounded-lg text-xs font-semibold
                                                            hover:bg-red-100 transition
                                                            disabled:opacity-50 flex items-center gap-1.5"
                                                    >
                                                        {deletingId === expert._id ? (
                                                            <>
                                                                <FontAwesomeIcon
                                                                    icon={faSpinner}
                                                                    className="animate-spin"
                                                                />
                                                                Deleting...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FontAwesomeIcon icon={faTrash} />
                                                                Delete
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminExperts;