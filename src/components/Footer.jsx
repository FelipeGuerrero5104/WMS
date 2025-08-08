import { Link } from "react-router-dom";

export default function Footer() {
    return(
        <div className="bg-[#128E95] w-full h-12 flex items-center justify-center border border-white">
            <Link to="/" className="text-white flex items-center justify-center " >
                HOME
            </Link>

        </div>
    )
}