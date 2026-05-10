import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import ExpertCard from "../components/ExpertCard";
import Loader from "../components/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faChevronLeft,
    faChevronRight,
    faRotateRight,
    faUserSlash,
    faTriangleExclamation,
    faPenNib,
    faLaptopCode,
    faHeartPulse,
    faScaleBalanced,
    faBriefcase,
    faGraduationCap,
    faBullhorn,
    faCoins,
    faBorderAll,
} from "@fortawesome/free-solid-svg-icons";

const CATEGORIES = [
    { label: "All", icon: faBorderAll },
    { label: "Design", icon: faPenNib },
    { label: "Finance", icon: faCoins },
    { label: "Marketing", icon: faBullhorn },
    { label: "Technology", icon: faLaptopCode },
    { label: "Health", icon: faHeartPulse },
    { label: "Education", icon: faGraduationCap },
    { label: "Legal", icon: faScaleBalanced },
    { label: "Business", icon: faBriefcase },
];

const HomePage = () => {
    const [experts, setExperts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [category, setCategory] = useState("All");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const LIMIT = 9;

    const fetchExperts = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({ page, limit: LIMIT });
            if (search) params.append("search", search);
            if (category !== "All") params.append("category", category);

            const res = await api.get(`/experts?${params.toString()}`);
            setExperts(res.data.data);
            setTotalPages(res.data.pages);
            setTotal(res.data.total);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to fetch experts"
            );
        } finally {
            setIsLoading(false);
        }
    }, [page, search, category]);

    useEffect(() => {
        fetchExperts();
    }, [fetchExperts]);

    useEffect(() => {
        setPage(1);
    }, [search, category]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
    };

    const handleCategoryChange = (cat) => {
        setCategory(cat);
        setSearch("");
        setSearchInput("");
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Hero Section */}
            <div className="bg-blue-600 text-white py-16 px-6 text-center">
                <h1 className="text-4xl font-bold mb-3">
                    Book Expert Sessions
                </h1>
                <p className="text-blue-100 text-lg mb-8">
                    Connect with top experts in your field
                </p>

                {/* Search Bar */}
                <form
                    onSubmit={handleSearch}
                    className="max-w-xl mx-auto flex gap-2"
                >
                    <div className="flex-1 relative">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                        />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search experts by name..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-800
                                text-sm outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold
                            text-sm hover:bg-blue-50 transition flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faSearch} />
                        Search
                    </button>
                </form>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.label}
                            onClick={() => handleCategoryChange(cat.label)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition
                                flex items-center gap-2
                                ${category === cat.label
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-gray-600 border border-gray-300 hover:border-blue-400"
                                }`}
                        >
                            <FontAwesomeIcon icon={cat.icon} />
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Results Count */}
                {!isLoading && !error && (
                    <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                        <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                        Showing {experts.length} of {total} experts
                        {search && ` for "${search}"`}
                        {category !== "All" && ` in ${category}`}
                    </p>
                )}

                {/* Loading */}
                {isLoading && <Loader />}

                {/* Error */}
                {error && !isLoading && (
                    <div className="text-center py-20">
                        <FontAwesomeIcon
                            icon={faTriangleExclamation}
                            className="text-red-400 text-5xl mb-4"
                        />
                        <p className="text-red-500 text-lg mb-4">{error}</p>
                        <button
                            onClick={fetchExperts}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg
                                hover:bg-blue-700 flex items-center gap-2 mx-auto"
                        >
                            <FontAwesomeIcon icon={faRotateRight} />
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && experts.length === 0 && (
                    <div className="text-center py-20">
                        <FontAwesomeIcon
                            icon={faUserSlash}
                            className="text-gray-300 text-6xl mb-4"
                        />
                        <p className="text-gray-500 text-lg">No experts found</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Try a different search or category
                        </p>
                    </div>
                )}

                {/* Expert Grid */}
                {!isLoading && !error && experts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {experts.map((expert) => (
                            <ExpertCard key={expert._id} expert={expert} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">

                        {/* Prev */}
                        <button
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-sm
                                text-gray-600 hover:bg-gray-100 disabled:opacity-40
                                disabled:cursor-not-allowed transition flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                            Previous
                        </button>

                        {/* Page Numbers */}
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`w-10 h-10 rounded-lg text-sm font-medium transition
                                    ${page === i + 1
                                        ? "bg-blue-600 text-white"
                                        : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        {/* Next */}
                        <button
                            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-sm
                                text-gray-600 hover:bg-gray-100 disabled:opacity-40
                                disabled:cursor-not-allowed transition flex items-center gap-2"
                        >
                            Next
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>

                    </div>
                )}

            </div>
        </div>
    );
};

export default HomePage;