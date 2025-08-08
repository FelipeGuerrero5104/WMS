// hooks/useUnityRLogic.js
import { useState } from "react";
import { supabase } from "../hooks/supabaseClient";

export default function useUnityRLogic() {
  const [contenedor, setContenedor] = useState("");
  const [sku, setSku] = useState("");
  const [lote, setLote] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [codigoAutorizacion, setCodigoAutorizacion] = useState("");
  const [idRecepcion, setIdRecepcion] = useState(null);
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

  const handleCrearRecepcion = async () => {
    try {
      const { data, error } = await supabase
        .from("receptions")
        .insert([
          {
            tipo_recepcion: "01",
            contenedor_recepcion: contenedor,
            usuario_recepcion: "pendiente",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setIdRecepcion(data.id_recepcion);
      setAgregando(true);
    } catch (error) {
      console.error("Error al crear recepción:", error);
      alert("Error al crear la recepción.");
    }
  };

  const handleAgregarProducto = async (e) => {
    e.preventDefault();

    const usuario = await verificarCodigoAutorizacion();
    if (!usuario) return;

    try {
      const { data: productoExistente, error: errorProducto } = await supabase
        .from("products")
        .select("*")
        .eq("sku", sku)
        .single();

      if (errorProducto || !productoExistente) {
        alert("El SKU no existe");
        return;
      }

      const { data: loteData, error: errorLote } = await supabase
        .from("lots")
        .upsert([{ sku, lote, fecha_vencimiento: vencimiento }])
        .select()
        .single();

      if (errorLote) throw errorLote;

      const { error: errorDetalle } = await supabase
        .from("reception_detail")
        .insert([
          {
            id_recepcion: idRecepcion,
            id_lote: loteData.id_lote,
            cantidad: Number(cantidad),
          },
        ]);

      if (errorDetalle) throw errorDetalle;

      const { error: errorStorage } = await supabase.from("storage").insert([
        {
          etiqueta_pallet: contenedor,
          id_lote: loteData.id_lote,
          cantidad: Number(cantidad),
          id_ubicacion: null,
        },
      ]);

      if (errorStorage) {
        alert("Error al guardar en storage");
        return;
      }

      await supabase
        .from("receptions")
        .update({ usuario_recepcion: usuario.nombre || "autorizado" })
        .eq("id_recepcion", idRecepcion);

      const agregarOtro = confirm(
        "Producto ingresado ✅ ¿Deseas ingresar otro producto?"
      );

      if (agregarOtro) {
        setSku("");
        setLote("");
        setVencimiento("");
        setCantidad("");
        setCodigoAutorizacion("");
      } else {
        alert("Recepción completada ✅");
        setContenedor("");
        setSku("");
        setLote("");
        setVencimiento("");
        setCantidad("");
        setCodigoAutorizacion("");
        setIdRecepcion(null);
        setAgregando(false);
      }
    } catch (error) {
      console.error("Error al agregar producto:", error);
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
    codigoAutorizacion,
    setCodigoAutorizacion,
    idRecepcion,
    agregando,
    handleCrearRecepcion,
    handleAgregarProducto,
  };
}
