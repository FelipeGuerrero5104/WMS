import BackRecep from "./BackRecep";
import BotonesSiYNo from "../components/BotoSubmit";
import IngresoPallet from "./IngresoPallets";
import useQuantityR from "../hooks/QuantityLogic";

export default function QuantityR() {
  const {
    sku,
    setSku,
    lote,
    setLote,
    vencimiento,
    setVencimiento,
    cantidad,
    setCantidad,
    contenedor,
    setContenedor,
    codigoAutorizacion,
    setCodigoAutorizacion,
    handleSubmit,
  } = useQuantityR();

  return (
    <div>
      <div className="h-screen w-full flex flex-col gap-8 items-center justify-center bg-[#052a34]">
        <IngresoPallet />

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-y-8 items-center justify-center w-full px-4"
        >
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
            placeholder="SKU"
            className="border border-white bg-[#128E95] placeholder-white outline-none text-white w-60 sm:w-72 md:w-96 px-4 py-2 rounded"
          />
          <input
            type="text"
            value={lote}
            onChange={(e) => setLote(e.target.value)}
            required
            placeholder="Lote"
            className="border border-white bg-[#128E95] placeholder-white outline-none text-white w-60 sm:w-72 md:w-96 px-4 py-2 rounded"
          />
          <input
            type="date"
            value={vencimiento}
            onChange={(e) => setVencimiento(e.target.value)}
            required
            placeholder="Vencimiento"
            className="border border-white bg-[#128E95] placeholder-white outline-none text-white w-60 sm:w-72 md:w-96 px-4 py-2 rounded"
          />
          <input
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            required
            placeholder="Cantidad"
            className="border border-white bg-[#128E95] placeholder-white outline-none text-white w-60 sm:w-72 md:w-96 px-4 py-2 rounded"
          />
          <input
            type="text"
            value={contenedor}
            onChange={(e) => setContenedor(e.target.value)}
            required
            placeholder="Código del contenedor"
            className="border border-white bg-[#128E95] placeholder-white outline-none text-white w-60 sm:w-72 md:w-96 px-4 py-2 rounded"
          />
          <input
            type="password"
            value={codigoAutorizacion}
            onChange={(e) => setCodigoAutorizacion(e.target.value)}
            required
            placeholder="Código de autorización"
            className="border border-white bg-[#ff914d] placeholder-white outline-none text-white w-60 sm:w-72 md:w-96 px-4 py-2 rounded"
          />
          <BotonesSiYNo />
        </form>
      </div>
      <BackRecep />
    </div>
  );
}



