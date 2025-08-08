import { useState, useEffect } from "react";
import { supabase } from "../hooks/supabaseClient";
import BotonesSiYNo from "../components/BotoSubmit";

export default function Storage() {
  const [etiqueta, setEtiqueta] = useState("");
  const [productos, setProductos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState("");

  const buscarEtiqueta = async () => {
    try {
      // Verificar si la etiqueta existe en receptions
      const { data: receptionData, error: errorReception } = await supabase
        .from("receptions")
        .select("id_recepcion")
        .eq("contenedor_recepcion", etiqueta)
        .single();

      if (errorReception || !receptionData) {
        alert("Contenedor no encontrado en recepciones ❌");
        setProductos([]);
        return;
      }

      // Buscar productos en storage con esa etiqueta
      const { data: storageData, error: errorStorage } = await supabase
        .from("storage")
        .select("id_almacenaje, id_lote, cantidad")
        .eq("etiqueta_pallet", etiqueta);

      if (errorStorage || !storageData || storageData.length === 0) {
        alert(
          "No hay productos asociados a este contenedor en almacenamiento ❌"
        );
        setProductos([]);
        return;
      }

      const idsLote = storageData.map((item) => item.id_lote);

      // Traer todos los lotes de una vez
      const { data: lotes, error: errorLotes } = await supabase
        .from("lots")
        .select("id_lote, sku, lote, fecha_vencimiento")
        .in("id_lote", idsLote);

      if (errorLotes || !lotes) {
        alert("Error al obtener detalles de los lotes ❌");
        return;
      }

      const skus = lotes.map((l) => l.sku);

      // Traer todos los productos (descripciones) de una vez
      const { data: productosData, error: errorProductos } = await supabase
        .from("products")
        .select("sku, descripcion")
        .in("sku", skus);

      if (errorProductos || !productosData) {
        alert("Error al obtener productos ❌");
        return;
      }

      // Mapear los productos con los detalles de storage
      const productosConDetalle = storageData.map((item) => {
        const lote = lotes.find((l) => l.id_lote === item.id_lote);
        const producto = productosData.find((p) => p.sku === lote?.sku);

        return {
          id_almacenaje: item.id_almacenaje,
          cantidad: item.cantidad,
          sku: lote?.sku || "N/A",
          lote: lote?.lote || "N/A",
          vencimiento: lote?.fecha_vencimiento || "N/A",
          descripcion: producto?.descripcion || "Sin descripción",
        };
      });

      setProductos(productosConDetalle);
    } catch (error) {
      console.error("Error al buscar la etiqueta:", error);
      alert("Error inesperado al buscar etiqueta ❌");
    }
  };

  const obtenerUbicaciones = async () => {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .neq("id_ubicacion", 99);

    if (!error) setUbicaciones(data);
  };

  useEffect(() => {
    obtenerUbicaciones();
  }, []);

  const moverPallet = async (id_almacenaje) => {
    if (!ubicacionSeleccionada) {
      alert("Debes seleccionar una ubicación");
      return;
    }

    try {
      const { error } = await supabase
        .from("storage")
        .update({ id_ubicacion: ubicacionSeleccionada })
        .eq("id_almacenaje", id_almacenaje);

      if (error) throw error;

      alert("Producto movido exitosamente ✅");
      // Limpiar estado
      setEtiqueta("");
      setProductos([]);
      setUbicacionSeleccionada("");
    } catch (err) {
      console.error("Error al mover pallet:", err);
      alert("Error al mover el pallet ❌");
    }
  };

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
