import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";

export default function BotonesSiYNo() {
  return (
    <div className="flex gap-6 mt-4">
      <button
        type="submit"
        className="bg-[#128E95] text-white px-6 py-2 rounded shadow-md 
                   hover:bg-[#0f7c84] transition duration-300 text-lg flex items-center gap-2"
      >
        <AiOutlineCheck className="text-xl" />
      </button>

      <button
        type="reset"
        className="bg-[#0A4C54] text-white px-6 py-2 rounded shadow-md 
                   hover:bg-[#083c42] transition duration-300 text-lg flex items-center gap-2"
      >
        <AiOutlineClose className="text-xl" />
      </button>
    </div>
  );
}


