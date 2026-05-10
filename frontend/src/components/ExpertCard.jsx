import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const ExpertCard = ({ expert }) => {
    return (
        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">

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

            <div className="p-5">

                <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {expert.name}
                </h3>

                <p className="text-sm text-gray-500 mb-3">
                    {expert.experience} years of experience
                </p>

                <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                        <FontAwesomeIcon
                            key={i}
                            icon={faStar}
                            className={`w-4 h-4 ${i < Math.floor(expert.rating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                                }`}
                        />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">
                        ({expert.rating})
                    </span>
                </div>

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