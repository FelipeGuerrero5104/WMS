import React from "react";
import BackInventory from "./BackInventory";
import TituloConsultas from "./TituloConsultas";
import useConsultations from "../hooks/ConsultationsLogic";

export default function Consultations() {
  const {
    ubicacionInput,
    setUbicacionInput,
    ubicacionId,
    error,
    loading,
    productos,
    paginaActual,
    setPaginaActual,
    buscarPorUbicacion,
  } = useConsultations();

  return (
    <div>
      <div className="min-h-screen bg-[#052a34] text-white p-6 flex flex-col items-center justify-center gap-8">
        <TituloConsultas />

        <div className="flex gap-2 max-w-md w-full">
          <input
            type="text"
            placeholder="Ingresa ID de ubicación"
            value={ubicacionInput}
            onChange={(e) => setUbicacionInput(e.target.value)}
            className="flex-grow border border-white bg-[#128E95] placeholder-white text-white px-4 py-2 rounded"
          />
          <button
            onClick={buscarPorUbicacion}
            disabled={loading}
            className="bg-white text-[#052a34] px-6 py-2 rounded font-semibold shadow"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {error && <p className="text-red-400 max-w-md w-full mt-2">{error}</p>}

        {productos.length > 0 && (
          <div className="bg-[#0a3b45] text-white p-6 rounded max-w-md w-full">
            <h2 className="font-semibold mb-4">
              Productos en Ubicación {ubicacionId} (Pallet {paginaActual + 1} de{" "}
              {productos.length})
            </h2>

            <div className="mb-4 space-y-2">
              <p>
                <b>Contenedor:</b> {productos[paginaActual].etiqueta_pallet}
              </p>
              <p>
                <b>SKU:</b> {productos[paginaActual].lots.sku}
              </p>
              <p>
                <b>Descripción:</b>{" "}
                {productos[paginaActual].lots.products.descripcion}
              </p>
              <p>
                <b>Lote:</b> {productos[paginaActual].lots.lote}
              </p>
              <p>
                <b>Fecha de Vencimiento:</b>{" "}
                {productos[paginaActual].lots.fecha_vencimiento}
              </p>
              <p>
                <b>Cantidad:</b> {productos[paginaActual].cantidad}
              </p>
            </div>

            {productos.length > 1 && (
              <div className="flex justify-between">
                <button
                  onClick={() => setPaginaActual(paginaActual - 1)}
                  disabled={paginaActual === 0}
                  className="bg-[#128E95] px-5 py-2 rounded font-semibold disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPaginaActual(paginaActual + 1)}
                  disabled={paginaActual === productos.length - 1}
                  className="bg-[#128E95] px-5 py-2 rounded font-semibold disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <BackInventory />
    </div>
  );
}
