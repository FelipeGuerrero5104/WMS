import { Link } from "react-router-dom";

export default function Footer() {
    return(
        <div className="bg-[#128E95] w-full h-12 flex items-center justify-center">
            <Link to="/" className="text-white flex items-center justify-center " >
                Home    
            </Link>

        </div>
    )
}