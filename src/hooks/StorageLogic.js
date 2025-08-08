// hooks/useStorageLogic.js
import { useState, useEffect } from "react";
import { supabase } from "../hooks/supabaseClient";

export default function useStorageLogic() {
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

  return {
    etiqueta,
    setEtiqueta,
    productos,
    ubicaciones,
    ubicacionSeleccionada,
    setUbicacionSeleccionada,
    buscarEtiqueta,
    moverPallet,
  };
}
