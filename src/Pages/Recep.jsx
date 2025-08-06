import { Link } from "react-router-dom";
import TituloRecep from "../components/TituloRecep";
import Logo from "../components/Logo";

export default function Recep() {
  return (
    <div className="h-screen w-full bg-[#052a34]">
      <Logo/>
      <div className="text-white flex flex-col items-center justify-center gap-y-10 mt-5 lg:mt-0 lg:gap-y-8 md:gap-y-8 sm:gap-y-10">
        <TituloRecep />
        <Link
          to="/Recep/Unity"
          className="border px-5 py-2.5 w-60 flex items-center justify-center lg:text-xl bg-[#128E95] rounded shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
        >
          UNIDAD
        </Link>
        <Link
          to="/Recep/Quantity"
          className="border px-5 py-2.5 w-60  flex items-center justify-center lg:text-xl bg-[#128E95] rounded"
        >
          PALLET
        </Link>
      </div>
      
    </div>
  );
}
