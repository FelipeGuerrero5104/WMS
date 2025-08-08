import BackRecep from "./BackRecep";
import BotonesSiYNo from "../components/BotoSubmit";
import IngresoUnidad from "./IngresoUnidad";
import useUnityRLogic from "../hooks/UnityLogic";

export default function UnityR() {
  const {
    contenedor,
    setContenedor,
    sku,
    setSku,
    lote,
    setLote,
    vencimiento,
    setVencimiento,
    cantidad,
    setCantidad,
    codigoAutorizacion,
    setCodigoAutorizacion,
    agregando,
    handleCrearRecepcion,
    handleAgregarProducto,
  } = useUnityRLogic();

  return (
    <div>
      <div className="h-screen w-full flex flex-col gap-8 items-center justify-center bg-[#052a34]">
        {!agregando ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCrearRecepcion();
            }}
            className="flex flex-col gap-y-8 items-center justify-center w-full px-4"
          >
            <h1 className="text-2xl font-semibold sm:text-3xl md:text-4xl lg:text-5xl text-white">
              INGRESAR CONTENEDOR
            </h1>
            <input
              type="text"
              value={contenedor}
              onChange={(e) => setContenedor(e.target.value)}
              required
              placeholder="Código del contenedor"
              className="border border-white bg-[#128E95] placeholder-white outline-none text-white w-60 sm:w-72 md:w-96 px-4 py-2 rounded"
            />
            <BotonesSiYNo />
          </form>
        ) : (
          <form
            onSubmit={handleAgregarProducto}
            className="flex flex-col gap-y-8 items-center justify-center w-full px-4"
          >
            <IngresoUnidad />
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
              type="password"
              value={codigoAutorizacion}
              onChange={(e) => setCodigoAutorizacion(e.target.value)}
              required
              placeholder="Código de autorización"
              className="border border-white bg-[#ff914d] placeholder-white outline-none text-white w-60 sm:w-72 md:w-96 px-4 py-2 rounded"
            />
            <BotonesSiYNo />
          </form>
        )}
      </div>
      <BackRecep />
    </div>
  );
}


