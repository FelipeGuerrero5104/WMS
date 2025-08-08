import useStorageLogic from "../hooks/StorageLogic";

export default function Storage() {
  const {
    etiqueta,
    setEtiqueta,
    productos,
    ubicaciones,
    ubicacionSeleccionada,
    setUbicacionSeleccionada,
    buscarEtiqueta,
    moverPallet,
  } = useStorageLogic();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-8 bg-[#052a34] px-4 py-8">
      <h2 className="text-2xl font-semibold sm:text-3xl md:text-4xl lg:text-5xl text-white">ALMACENAMIENTO</h2>

      <input
        type="text"
        value={etiqueta}
        onChange={(e) => setEtiqueta(e.target.value)}
        placeholder="Etiqueta del contenedor"
        className="border border-white bg-[#128E95] placeholder-white text-white px-4 py-2 rounded w-72 md:w-96"
      />

      <button
        onClick={buscarEtiqueta}
        className="bg-white text-[#052a34] px-6 py-2 rounded font-semibold shadow"
      >
        Buscar
      </button>

      {productos.length > 0 && (
        <div className="text-white bg-[#0a3b45] p-6 rounded w-full max-w-xl shadow-lg flex flex-col gap-6">
          {productos.map((prod) => (
            <div
              key={prod.id_almacenaje}
              className="border-b border-gray-600 pb-4 last:border-b-0"
            >
              <p>
                <strong>SKU:</strong> {prod.sku}
              </p>
              <p>
                <strong>Descripción:</strong> {prod.descripcion}
              </p>
              <p>
                <strong>Lote:</strong> {prod.lote}
              </p>
              <p>
                <strong>Vencimiento:</strong> {prod.vencimiento}
              </p>
              <p>
                <strong>Cantidad:</strong> {prod.cantidad}
              </p>

              <select
                value={ubicacionSeleccionada}
                onChange={(e) => setUbicacionSeleccionada(e.target.value)}
                className="bg-[#128E95] text-white px-4 py-2 rounded border border-white mt-2 w-full"
              >
                <option value="">Selecciona una ubicación</option>
                {ubicaciones.map((ubi) => (
                  <option key={ubi.id_ubicacion} value={ubi.id_ubicacion}>
                    {ubi.descripcion || `Ubicación ${ubi.id_ubicacion}`}
                  </option>
                ))}
              </select>

              <button
                onClick={() => moverPallet(prod.id_almacenaje)}
                className="mt-3 bg-white text-[#052a34] px-5 py-2 rounded font-semibold shadow w-full"
              >
                Ingresar a ubicación
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
