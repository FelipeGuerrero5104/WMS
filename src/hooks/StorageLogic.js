// hooks/useStorageLogic.js
import { useState, useEffect } from "react";
import { supabase } from "../hooks/supabaseClient";

export default function useStorageLogic() {

  const [etiqueta, setEtiqueta] = useState("");
  const [productos, setProductos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState("");



  // =============================
  // BUSCAR ETIQUETA
  // =============================
  const buscarEtiqueta = async () => {

    if (!etiqueta) {
      alert("Debes ingresar una etiqueta");
      return;
    }

    try {

      // 1️⃣ Validar que el contenedor exista
      const { data: receptionData, error: errorReception } = await supabase
        .from("receptions")
        .select("id_recepcion")
        .eq("contenedor_recepcion", etiqueta);

      if (errorReception) throw errorReception;

      if (!receptionData || receptionData.length === 0) {
        alert("Contenedor no encontrado en recepciones ❌");
        setProductos([]);
        return;
      }



      // 2️⃣ Buscar productos en storage
      const { data: storageData, error: errorStorage } = await supabase
        .from("storage")
        .select("id_almacenaje, id_lote, cantidad")
        .eq("etiqueta_pallet", etiqueta);

      if (errorStorage) throw errorStorage;

      if (!storageData || storageData.length === 0) {
        alert("No hay productos asociados a este contenedor ❌");
        setProductos([]);
        return;
      }



      // 3️⃣ Obtener ids de lote
      const idsLote = storageData.map(item => item.id_lote);



      // 4️⃣ Obtener información de los lotes
      const { data: lotes, error: errorLotes } = await supabase
        .from("lots")
        .select("id_lote, sku, lote, fecha_vencimiento")
        .in("id_lote", idsLote);

      if (errorLotes) throw errorLotes;



      const skus = lotes.map(l => l.sku);



      // 5️⃣ Obtener productos
      const { data: productosData, error: errorProductos } = await supabase
        .from("products")
        .select("sku, descripcion")
        .in("sku", skus);

      if (errorProductos) throw errorProductos;



      // 6️⃣ Combinar toda la info
      const productosConDetalle = storageData.map(item => {

        const lote = lotes.find(l => l.id_lote === item.id_lote);
        const producto = productosData.find(p => p.sku === lote?.sku);

        return {
          id_almacenaje: item.id_almacenaje,
          cantidad: item.cantidad,
          sku: lote?.sku ?? "N/A",
          lote: lote?.lote ?? "N/A",
          vencimiento: lote?.fecha_vencimiento ?? "N/A",
          descripcion: producto?.descripcion ?? "Sin descripción"
        };

      });

      setProductos(productosConDetalle);

    } catch (error) {

      console.error("Error al buscar etiqueta:", error);
      alert("Error al buscar la etiqueta ❌");

    }

  };



  // =============================
  // OBTENER UBICACIONES
  // =============================
  const obtenerUbicaciones = async () => {

    try {

      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .neq("id_ubicacion", 99);

      if (error) throw error;

      setUbicaciones(data || []);

    } catch (error) {

      console.error("Error cargando ubicaciones:", error);

    }

  };



  useEffect(() => {

    obtenerUbicaciones();

  }, []);




  // =============================
  // MOVER PALLET
  // =============================
  const moverPallet = async (id_almacenaje) => {

    if (!ubicacionSeleccionada) {
      alert("Debes seleccionar una ubicación");
      return;
    }

    try {

      const { error } = await supabase
        .from("storage")
        .update({ id_ubicacion: Number(ubicacionSeleccionada) })
        .eq("id_almacenaje", id_almacenaje);

      if (error) throw error;

      alert("Producto movido exitosamente ✅");

      // limpiar
      setEtiqueta("");
      setProductos([]);
      setUbicacionSeleccionada("");

    } catch (error) {

      console.error("Error al mover pallet:", error);
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
    moverPallet

  };

}
