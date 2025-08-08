import React from "react";
import { useCounting } from "../hooks/Counting";
import TituloConteo from "./TituloConteos";
import BackInventory from "./BackInventory";

export default function Counting() {
  const {
    inputUbicacion,
    setInputUbicacion,
    ubicacionValida,
    inputLote,
    setInputLote,
    loteValido,
    productosUbicacion,
    cantidadSistema,
    cantidadFisica,
    setCantidadFisica,
    usuarioConteo,
    setUsuarioConteo,
    mensaje,
    error,
    activeTab,
    setActiveTab,
    nuevoSku,
    setNuevoSku,
    nuevoLote,
    setNuevoLote,
    nuevaFechaVencimiento,
    setNuevaFechaVencimiento,
    buscarUbicacion,
    buscarLote,
    guardarConteo,
  } = useCounting();

  return (
    <div>
      <div className="min-h-screen bg-[#052a34] text-white p-6 flex flex-col items-center justify-center gap-y-4">
        <TituloConteo />

        <div className="max-w-lg w-full bg-[#0a3b45] p-6 rounded flex flex-col gap-4">
          {/* Input Ubicación */}
          <label className="font-semibold " htmlFor="ubicacion">
            Ingrese Ubicación (ID o descripción)
          </label>
          <div className="flex gap-2">
            <input
              id="ubicacion"
              type="text"
              className="px-3 py-2 rounded text-white border border-white bg-[#128E95] flex-grow"
              value={inputUbicacion}
              onChange={(e) => setInputUbicacion(e.target.value)}
            />
            <button
              onClick={buscarUbicacion}
              className="bg-[#128E95] px-4 py-2 rounded hover:bg-green-600"
            >
              Buscar
            </button>
          </div>
          {ubicacionValida && (
            <p className="text-green-400">
              Ubicación encontrada: {ubicacionValida.descripcion} (ID:{" "}
              {ubicacionValida.id_ubicacion})
            </p>
          )}

          {/* Tabs productos */}
          {productosUbicacion.length > 0 && (
            <div className="mt-4">
              <div className="flex gap-2 border-b border-gray-600">
                {productosUbicacion.map((p, index) => (
                  <button
                    key={p.id_almacenaje}
                    className={`px-3 py-1 rounded-t ${
                      activeTab === index
                        ? "bg-[#128E95] text-white"
                        : "bg-[#0a3b45] text-gray-400 hover:text-white"
                    }`}
                    onClick={() => setActiveTab(index)}
                  >
                    {p.lots.sku} - {p.lots.lote}
                  </button>
                ))}
              </div>

              <div className="bg-[#128E95] p-4 rounded-b text-white mt-2">
                <p>
                  <b>Lote:</b> {productosUbicacion[activeTab].lots.lote}
                </p>
                <p>
                  <b>SKU:</b> {productosUbicacion[activeTab].lots.sku}
                </p>
                <p>
                  <b>Fecha Vencimiento:</b>{" "}
                  {productosUbicacion[activeTab].lots.fecha_vencimiento
                    ? new Date(
                        productosUbicacion[activeTab].lots.fecha_vencimiento
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
                <p>
                  <b>Cantidad:</b> {productosUbicacion[activeTab].cantidad}
                </p>
              </div>
            </div>
          )}

          {/* Input Lote / SKU */}
          <label className="font-semibold mt-6" htmlFor="lote">
            Ingrese Lote o SKU para conteo
          </label>
          <div className="flex gap-2">
            <input
              id="lote"
              type="text"
              className="px-3 py-2 rounded text-white border border-white bg-[#128E95] flex-grow"
              value={inputLote}
              onChange={(e) => setInputLote(e.target.value)}
            />
            <button
              onClick={buscarLote}
              className="bg-[#128E95] px-4 py-2 rounded hover:bg-green-600"
            >
              Buscar
            </button>
          </div>

          {/* Mostrar lote válido */}
          {loteValido && (
            <p className="text-green-400">
              Lote encontrado: {loteValido.lots.lote} - SKU: {loteValido.lots.sku}
            </p>
          )}

          {/* Crear nuevo lote/SKU si no existe */}
          {!loteValido && inputLote.trim() && (
            <div className="mt-4 bg-[#144d56] p-4 rounded">
              <h3 className="font-semibold mb-2 text-white">
                Nuevo Lote / SKU no encontrado, crea uno:
              </h3>
              <input
                type="text"
                placeholder="Ingrese SKU (ej: 0_1000)"
                className="px-3 py-2 rounded text-white border border-white bg-[#128E95] w-full mb-2"
                value={nuevoSku}
                onChange={(e) => setNuevoSku(e.target.value)}
              />
              <input
                type="text"
                placeholder="Ingrese Lote (ej: LOTE001)"
                className="px-3 py-2 rounded text-white border border-white bg-[#128E95] w-full mb-2"
                value={nuevoLote}
                onChange={(e) => setNuevoLote(e.target.value)}
              />
              <input
                type="date"
                placeholder="Fecha de vencimiento"
                className="px-3 py-2 rounded text-white border border-white bg-[#128E95] w-full mb-2 placeholder-white"
                value={nuevaFechaVencimiento}
                onChange={(e) => setNuevaFechaVencimiento(e.target.value)}
              />
              <input
                type="number"
                placeholder="Cantidad física contada"
                className="px-3 py-2 rounded text-white border border-white bg-[#128E95] w-full"
                value={cantidadFisica}
                onChange={(e) => setCantidadFisica(e.target.value)}
              />
            </div>
          )}

          {/* Mostrar cantidad sistema si lote válido */}
          {cantidadSistema !== null && loteValido && (
            <div>
              <label className="font-semibold">Cantidad Sistema</label>
              <p className="bg-[#128E95] rounded p-2 text-white">{cantidadSistema}</p>
            </div>
          )}

          {/* Cantidad física */}
          {loteValido && (
            <>
              <label className="font-semibold" htmlFor="cantidadFisica">
                Cantidad Física Contada
              </label>
              <input
                id="cantidadFisica"
                type="number"
                min="0"
                className="px-3 py-2 rounded text-white border border-white bg-[#128E95]"
                value={cantidadFisica}
                onChange={(e) => setCantidadFisica(e.target.value)}
              />
            </>
          )}

          {/* Usuario conteo */}
          <label className="font-semibold" htmlFor="usuarioConteo">
            Usuario que realiza el conteo
          </label>
          <input
            id="usuarioConteo"
            type="text"
            className="px-3 py-2 rounded text-white border border-white bg-[#128E95]"
            value={usuarioConteo}
            onChange={(e) => setUsuarioConteo(e.target.value)}
          />

          {/* Mensajes */}
          {error && <p className="text-red-400">{error}</p>}
          {mensaje && <p className="text-green-400">{mensaje}</p>}

          {/* Botón Guardar */}
          <button
            onClick={guardarConteo}
            className="bg-[#128E95] hover:bg-green-600 transition-colors py-2 rounded font-semibold mt-4"
            disabled={(!loteValido && !nuevoSku) || cantidadFisica === ""}
          >
            Guardar Conteo
          </button>
        </div>
      </div>
      <BackInventory />
    </div>
  );
}

