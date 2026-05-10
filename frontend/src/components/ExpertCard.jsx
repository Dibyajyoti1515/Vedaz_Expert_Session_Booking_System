import { Link } from "react-router-dom";

const ExpertCard = ({ expert }) => {
    return (
        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">

            {/* Avatar */}
            <div className="relative">
                <img
                    src={expert.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + expert.name}
                    alt={expert.name}
                    className="w-full h-48 object-cover"
                />
                <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                    {expert.category}
                </span>
            </div>

            {/* Info */}
            <div className="p-5">

                {/* Name */}
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {expert.name}
                </h3>

                {/* Experience */}
                <p className="text-sm text-gray-500 mb-3">
                    {expert.experience} years of experience
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                        <svg
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(expert.rating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                                }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                    <span className="text-sm text-gray-600 ml-1">
                        ({expert.rating})
                    </span>
                </div>

                {/* Button */}
                <Link
                    to={`/experts/${expert._id}`}
                    className="block w-full text-center bg-blue-600 text-white py-2.5 rounded-lg
            text-sm font-semibold hover:bg-blue-700 transition"
                >
                    View Profile & Book
                </Link>

            </div>
        </div>
    );
};

export default ExpertCard;