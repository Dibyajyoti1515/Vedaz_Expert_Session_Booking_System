import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const Loader = () => {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <FontAwesomeIcon
                icon={faSpinner}
                className="text-blue-600 text-4xl animate-spin"
            />
        </div>
    );
};

export default Loader;