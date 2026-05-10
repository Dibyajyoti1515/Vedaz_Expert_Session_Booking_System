import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import ExpertCard from "../components/ExpertCard";
import Loader from "../components/Loader";

const CATEGORIES = [
    "All",
    "Design",
    "Finance",
    "Marketing",
    "Technology",
    "Health",
    "Education",
    "Legal",
    "Business",
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
            const params = new URLSearchParams({
                page,
                limit: LIMIT,
            });

            if (search) params.append("search", search);
            if (category !== "All") {
                params.append("category", category);
            }

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

    // Reset page when filter changes
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
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search experts by name..."
                        className="flex-1 px-5 py-3 rounded-xl text-gray-800 text-sm outline-none"
                    />
                    <button
                        type="submit"
                        className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold
                        text-sm hover:bg-blue-50 transition"
                    >
                        Search
                    </button>
                </form>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition
                                ${category === cat
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-gray-600 border border-gray-300 hover:border-blue-400"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Results Count */}
                {!isLoading && !error && (
                    <p className="text-sm text-gray-500 mb-6">
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
                        <p className="text-red-500 text-lg mb-4">{error}</p>
                        <button
                            onClick={fetchExperts}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && experts.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-6xl mb-4">🔍</p>
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
                            disabled:cursor-not-allowed transition"
                        >
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
                            disabled:cursor-not-allowed transition"
                        >
                            Next
                        </button>

                    </div>
                )}

            </div>
        </div>
    );
};

export default HomePage;