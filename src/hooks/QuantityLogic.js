import { useState } from "react";
import { supabase } from "../hooks/supabaseClient";

export default function useQuantityR() {
  const [sku, setSku] = useState("");
  const [lote, setLote] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [contenedor, setContenedor] = useState("");
  const [codigoAutorizacion, setCodigoAutorizacion] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Verificar código de autorización
      const { data: usuario, error: errorUsuario } = await supabase
        .from("usuarios")
        .select("*")
        .eq("codigo_autorizacion", codigoAutorizacion)
        .single();

      if (errorUsuario || !usuario) {
        alert("Código de usuario inválido ❌");
        return;
      }

      // Validar que SKU exista en products
      const { data: productoExistente, error: errorProducto } = await supabase
        .from("products")
        .select("*")
        .eq("sku", sku)
        .single();

      if (errorProducto || !productoExistente) {
        alert("El SKU no existe");
        return;
      }

      // Crear recepción
      const { data: recepcion, error: errorRecep } = await supabase
        .from("receptions")
        .insert([
          {
            tipo_recepcion: "02",
            contenedor_recepcion: contenedor,
            usuario_recepcion: usuario.nombre || "autorizado",
          },
        ])
        .select()
        .single();

      if (errorRecep) throw errorRecep;

      // Crear o actualizar lote
      const { data: loteData, error: errorLote } = await supabase
        .from("lots")
        .upsert([{ sku, lote, fecha_vencimiento: vencimiento }])
        .select()
        .single();

      if (errorLote) throw errorLote;

      // Detalle de recepción
      const { error: errorDetalle } = await supabase
        .from("reception_detail")
        .insert([
          {
            id_recepcion: recepcion.id_recepcion,
            id_lote: loteData.id_lote,
            cantidad: Number(cantidad),
          },
        ]);

      if (errorDetalle) throw errorDetalle;

      // Inventario en ubicación 1 (recepción)
      const { error: errorInventario } = await supabase
        .from("inventory")
        .insert([
          {
            id_lote: loteData.id_lote,
            id_ubicacion: 1,
            cantidad: Number(cantidad),
          },
        ]);

      if (errorInventario) throw errorInventario;

      // Insertar en storage (sin ubicación asignada aún)
      const { error: errorStorage } = await supabase
        .from("storage")
        .insert([
          {
            etiqueta_pallet: contenedor,
            id_lote: loteData.id_lote,
            cantidad: Number(cantidad),
            id_ubicacion: null, // Se asigna cuando se mueve a una ubicación válida
          },
        ]);

      if (errorStorage) {
        alert("Error al guardar en storage");
        return;
      }

      alert("Recepción registrada ✅");

      // Limpiar campos
      setSku("");
      setLote("");
      setVencimiento("");
      setCantidad("");
      setContenedor("");
      setCodigoAutorizacion("");
    } catch (error) {
      console.error("Error en recepción:", error);
      alert("Ocurrió un error al registrar la recepción.");
    }
  };

  return {
    sku,
    setSku,
    lote,
    setLote,
    vencimiento,
    setVencimiento,
    cantidad,
    setCantidad,
    contenedor,
    setContenedor,
    codigoAutorizacion,
    setCodigoAutorizacion,
    handleSubmit,
  };
}
