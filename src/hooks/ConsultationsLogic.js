import { useState } from "react";
import { supabase } from "../hooks/supabaseClient";

export default function useConsultations() {
  const [ubicacionInput, setUbicacionInput] = useState("");
  const [ubicacionId, setUbicacionId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const [paginaActual, setPaginaActual] = useState(0);

  const buscarPorUbicacion = async () => {
    setError("");
    setProductos([]);
    setPaginaActual(0);

    if (!ubicacionInput.trim()) {
      setError("Por favor ingresa una ubicación válida.");
      return;
    }

    setLoading(true);

    const id = Number(ubicacionInput.trim());
    if (isNaN(id)) {
      setLoading(false);
      setError("La ubicación debe ser un número válido.");
      return;
    }

    const { data: ubicacionData, error: ubicacionError } = await supabase
      .from("locations")
      .select("id_ubicacion, descripcion")
      .eq("id_ubicacion", id)
      .single();

    if (ubicacionError || !ubicacionData) {
      setLoading(false);
      setError("Ubicación no encontrada.");
      return;
    }

    setUbicacionId(id);

    const { data, error: productosError } = await supabase
      .from("storage")
      .select(
        `
        id_almacenaje,
        etiqueta_pallet,
        cantidad,
        lots (
          lote,
          fecha_vencimiento,
          sku,
          products (
            descripcion
          )
        )
      `
      )
      .eq("id_ubicacion", id);

    setLoading(false);

    if (productosError) {
      setError("Error al obtener productos: " + productosError.message);
      return;
    }

    if (!data || data.length === 0) {
      setError("No hay productos en esta ubicación.");
      return;
    }

    setProductos(data);
  };

  return {
    ubicacionInput,
    setUbicacionInput,
    ubicacionId,
    error,
    loading,
    productos,
    paginaActual,
    setPaginaActual,
    buscarPorUbicacion,
  };
}
