import React from "react";
import useMovements from "../hooks/MovementsLogic";
import TituloMovimientos from "./TituloMovimientos";
import BackInventory from "./BackInventory";

export default function Movements() {
  const {
    etiqueta,
    setEtiqueta,
    pallet,
    buscarPallet,
    ubicaciones,
    ubicacionDestino,
    setUbicacionDestino,
    cantidadMover,
    setCantidadMover,
    modoMovimiento,
    setModoMovimiento,
    mensaje,
    error,
    usuarioMovimiento,
    setUsuarioMovimiento,
    moverPallet,
    reset,
  } = useMovements();

  return (
    <div>
      <div className="min-h-screen bg-[#052a34] text-white p-4 flex flex-col items-center justify-center gap-8">
        <TituloMovimientos />

        <div className="flex gap-2 mb-4 max-w-md w-full">
          <input
            type="text"
            value={etiqueta}
            onChange={(e) => setEtiqueta(e.target.value)}
            placeholder="Etiqueta del pallet"
            className="border border-white bg-[#128E95] placeholder-white text-white px-4 py-2 rounded w-72 md:w-96"
          />
          <button
            onClick={buscarPallet}
            className="bg-white text-[#052a34] px-6 py-2 rounded font-semibold shadow"
          >
            Buscar
          </button>
        </div>

        {error && <p className="text-red-400 mb-2 max-w-md w-full">{error}</p>}
        {mensaje && (
          <p className="text-green-400 mb-2 max-w-md w-full">{mensaje}</p>
        )}

        {pallet && (
          <div className="bg-[#0a3b45] text-white p-4 flex flex-col gap-y-3 rounded w-full max-w-md">
            <p>
              <b>SKU:</b> {pallet.lots.sku}
            </p>
            <p>
              <b>Descripción:</b> {pallet.lots.products.descripcion}
            </p>
            <p>
              <b>Lote:</b> {pallet.lots.lote}
            </p>
            <p>
              <b>Vencimiento:</b> {pallet.lots.fecha_vencimiento}
            </p>
            <p>
              <b>Cantidad:</b> {pallet.cantidad}
            </p>

            <select
              value={ubicacionDestino}
              onChange={(e) => setUbicacionDestino(e.target.value)}
              className="mt-4 px-3 py-2 rounded w-full bg-[#128E95]"
            >
              <option value="">Selecciona ubicación destino</option>
              {ubicaciones.map((u) => (
                <option key={u.id_ubicacion} value={u.id_ubicacion}>
                  {u.descripcion}
                </option>
              ))}
            </select>

            <div className="mt-4">
              <label className="mr-2">
                <input
                  type="radio"
                  name="modo"
                  value="pallet"
                  checked={modoMovimiento === "pallet"}
                  onChange={() => setModoMovimiento("pallet")}
                />{" "}
                Mover pallet completo
              </label>
              <label className="ml-4">
                <input
                  type="radio"
                  name="modo"
                  value="unidades"
                  checked={modoMovimiento === "unidades"}
                  onChange={() => setModoMovimiento("unidades")}
                />{" "}
                Mover por unidades
              </label>
            </div>

            {modoMovimiento === "unidades" && (
              <input
                type="number"
                value={cantidadMover}
                onChange={(e) => setCantidadMover(e.target.value)}
                placeholder="Cantidad a mover"
                min="1"
                className="mt-2 px-3 py-2 rounded text-black w-full"
              />
            )}

            <input
              type="text"
              value={usuarioMovimiento}
              onChange={(e) => setUsuarioMovimiento(e.target.value)}
              placeholder="Usuario que realiza movimiento"
              className="border border-white bg-[#128E95] placeholder-white text-white px-4 py-2 rounded w-full"
            />

            <div className="mt-4 flex gap-4">
              <button
                onClick={moverPallet}
                className="bg-[#128E95]  px-5 py-2 rounded font-semibold hover:bg-green-600 flex-grow"
              >
                Confirmar movimiento
              </button>
              <button
                onClick={reset}
                className="bg-[#052a34] px-5 py-2 rounded font-semibold hover:bg-red-700 flex-grow border border-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
      <BackInventory />
    </div>
  );
}
