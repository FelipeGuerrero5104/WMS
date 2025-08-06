import { Link } from "react-router-dom";

export default function BackRecep() {
    return(
        <div className="bg-[#128E95] w-full h-12 flex items-center justify-center border border-white">
            <Link to="/Recep" className="text-white flex items-center justify-center " >
                Ingresos    
            </Link>

        </div>
    )
}