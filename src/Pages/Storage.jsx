import { useState, useEffect } from "react";
import { supabase } from "../hooks/supabaseClient";
import BotonesSiYNo from "../components/BotoSubmit";

export default function Storage() {
  const [etiqueta, setEtiqueta] = useState("");
  const [productos, setProductos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState("");

  // Buscar si existe el contenedor en receptions y obtener productos asociados en storage
  const buscarEtiqueta = async () => {
    try {
      // Validar que contenedor exista en receptions
      const { data: receptionData, error: errorReception } = await supabase
        .from("receptions")
        .select("*")
        .eq("contenedor_recepcion", etiqueta)
        .single();

      if (errorReception || !receptionData) {
        alert("Contenedor no encontrado en recepciones ❌");
        setProductos([]);
        return;
      }

      // Obtener todos los storage que tengan esa etiqueta_pallet = etiqueta
      const { data: storageData, error: errorStorage } = await supabase
        .from("storage")
        .select("*")
        .eq("etiqueta_pallet", etiqueta);

      if (errorStorage) {
        alert("Error al obtener datos de almacenamiento ❌");
        return;
      }

      if (!storageData || storageData.length === 0) {
        alert("No hay productos asociados a este contenedor en almacenamiento ❌");
        setProductos([]);
        return;
      }

      // Para cada storage obtenemos datos de lote y producto
      const productosConDetalle = await Promise.all(
        storageData.map(async (item) => {
          const { data: loteData } = await supabase
            .from("lots")
            .select("*")
            .eq("id_lote", item.id_lote)
            .single();

          const { data: productoData } = await supabase
            .from("products")
            .select("descripcion")
            .eq("sku", loteData?.sku)
            .single();

          return {
            id_almacenaje: item.id_almacenaje,
            cantidad: item.cantidad,
            sku: loteData?.sku,
            lote: loteData?.lote,
            vencimiento: loteData?.fecha_vencimiento,
            descripcion: productoData?.descripcion || "Sin descripción",
          };
        })
      );

      setProductos(productosConDetalle);
    } catch (error) {
      console.error("Error al buscar la etiqueta:", error);
      alert("Error inesperado al buscar etiqueta");
    }
  };

  // Obtener ubicaciones válidas (excepto id_ubicacion = 99)
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

  // Mover pallet a la ubicación seleccionada (actualiza storage.id_ubicacion)
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
      // Limpiar estados para nueva operación
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
      <h2 className="text-white text-2xl font-bold">Ingreso a ubicación</h2>

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
            <div key={prod.id_almacenaje} className="border-b border-gray-600 pb-4 last:border-b-0">
              <p><strong>SKU:</strong> {prod.sku}</p>
              <p><strong>Descripción:</strong> {prod.descripcion}</p>
              <p><strong>Lote:</strong> {prod.lote}</p>
              <p><strong>Vencimiento:</strong> {prod.vencimiento}</p>
              <p><strong>Cantidad:</strong> {prod.cantidad}</p>

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

      <BotonesSiYNo />
    </div>
  );
}
