import { useState } from "react";
import { supabase } from "../hooks/supabaseClient";

export default function useReverseLog() {
  const [contenedor, setContenedor] = useState("");
  const [sku, setSku] = useState("");
  const [lote, setLote] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [factura, setFactura] = useState("");
  const [motivo, setMotivo] = useState("");
  const [codigoAutorizacion, setCodigoAutorizacion] = useState("");
  const [agregando, setAgregando] = useState(false);

  const verificarCodigoAutorizacion = async () => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("codigo_autorizacion", codigoAutorizacion)
      .single();

    if (error || !data) {
      alert("Código de usuario inválido ❌");
      return null;
    }

    return data;
  };

  const handleCrearOperacion = () => {
    setAgregando(true);
  };

  const handleAgregarProducto = async (e) => {
    e.preventDefault();

    const usuario = await verificarCodigoAutorizacion();
    if (!usuario) return;

    try {
      // Validar que SKU exista
      const { data: productoExistente, error: errorProducto } = await supabase
        .from("products")
        .select("*")
        .eq("sku", sku)
        .single();

      if (errorProducto || !productoExistente) {
        alert("El SKU no existe");
        return;
      }

      // Validar contenedor no vacío
      if (!contenedor.trim()) {
        alert("Debe ingresar el código del contenedor.");
        return;
      }

      // Crear o actualizar lote
      const { data: loteData, error: errorLote } = await supabase
        .from("lots")
        .upsert([{ sku, lote, fecha_vencimiento: vencimiento }])
        .select()
        .single();

      if (errorLote) throw errorLote;

      // Insertar en receptions
      const { data: receptionData, error: errorReception } = await supabase
        .from("receptions")
        .insert([
          {
            tipo_recepcion: "logistica inversa",
            contenedor_recepcion: contenedor,
            usuario_recepcion: usuario.nombre || "autorizado",
          },
        ])
        .select()
        .single();

      if (errorReception) throw errorReception;

      // Insertar en reverse_logistics incluyendo motivo
      const { error: errorRL } = await supabase
        .from("reverse_logistics")
        .insert([
          {
            id_lote: loteData.id_lote,
            cantidad: Number(cantidad),
            factura_asociada: factura,
            motivo: motivo,
            usuario_logistica: usuario.nombre || "autorizado",
            id_ubicacion: null,
            fecha_vencimiento: vencimiento,
          },
        ]);

      if (errorRL) throw errorRL;

      // Insertar en storage
      const { error: errorStorage } = await supabase
        .from("storage")
        .insert([
          {
            etiqueta_pallet: contenedor,
            id_lote: loteData.id_lote,
            cantidad: Number(cantidad),
            id_ubicacion: null,
          },
        ]);

      if (errorStorage) throw errorStorage;

      // Preguntar si desea ingresar otro producto
      const agregarOtro = confirm(
        "Producto ingresado en logística inversa ✅ ¿Deseas ingresar otro producto?"
      );

      if (agregarOtro) {
        setSku("");
        setLote("");
        setVencimiento("");
        setCantidad("");
        setFactura("");
        setMotivo("");
        setCodigoAutorizacion("");
      } else {
        alert("Operación completada ✅");
        setContenedor("");
        setSku("");
        setLote("");
        setVencimiento("");
        setCantidad("");
        setFactura("");
        setMotivo("");
        setCodigoAutorizacion("");
        setAgregando(false);
      }
    } catch (error) {
      console.error("Error en logística inversa:", error);
      alert("Ocurrió un error al agregar el producto.");
    }
  };

  return {
    contenedor,
    setContenedor,
    sku,
    setSku,
    lote,
    setLote,
    vencimiento,
    setVencimiento,
    cantidad,
    setCantidad,
    factura,
    setFactura,
    motivo,
    setMotivo,
    codigoAutorizacion,
    setCodigoAutorizacion,
    agregando,
    handleCrearOperacion,
    handleAgregarProducto,
  };
}
