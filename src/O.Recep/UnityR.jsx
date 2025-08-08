import { useState } from "react";
import { supabase } from "../hooks/supabaseClient";
import BackRecep from "./BackRecep";
import BotonesSiYNo from "../components/BotoSubmit";
import IngresoUnidad from "./IngresoUnidad";

export default function UnityR() {
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
            tipo_recepcion: "02",
            contenedor_recepcion: contenedor,
            usuario_recepcion: "pendiente", // Será actualizado después
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

    // Verificar código antes de continuar
    const usuario = await verificarCodigoAutorizacion();
    if (!usuario) return;

    try {
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

      // Crear o actualizar lote
      const { data: loteData, error: errorLote } = await supabase
        .from("lots")
        .upsert([{ sku, lote, fecha_vencimiento: vencimiento }])
        .select()
        .single();

      if (errorLote) throw errorLote;

      // Insertar detalle de recepción
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

      // Insertar en tabla storage
      const { error: errorStorage } = await supabase
        .from("storage")
        .insert([
          {
            etiqueta_pallet: contenedor,
            id_lote: loteData.id_lote,
            cantidad: Number(cantidad),
            id_ubicacion: null, // Se asigna al mover manualmente
          },
        ]);

      if (errorStorage) {
        alert("Error al guardar en storage");
        return;
      }

      // Actualizar usuario de la recepción
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

  return (
    <div>
      <div className="h-screen w-full flex flex-col gap-8 items-center justify-center bg-[#052a34]">
        {!agregando ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCrearRecepcion();
            }}
            className="flex flex-col gap-y-8 items-center justify-center w-full px-4"
          >
            <h1 className="text-2xl font-semibold sm:text-3xl md:text-4xl lg:text-5xl text-white">
              INGRESAR CONTENEDOR
            </h1>
            <input
              type="text"
              value={contenedor}
              onChange={(e) => setContenedor(e.target.value)}
              required
              placeholder="Código del contenedor"
              className="border border-white bg-[#128E95] placeholder-white outline-none text-white w-60 sm:w-72 md:w-96 px-4 py-2 rounded"
            />
            <BotonesSiYNo />
          </form>
        ) : (
          <form
            onSubmit={handleAgregarProducto}
            className="flex flex-col gap-y-8 items-center justify-center w-full px-4"
          >
            <IngresoUnidad />
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
              placeholder="SKU"
              className="border border-white bg-[#128E95] placeholder-white outline-none text-white w-60 sm:w-72 md:w-96 px-4 py-2 rounded"
            />
            <input
              type="text"
              value={lote}
              onChange={(e) => setLote(e.target.value)}
              required
              placeholder="Lote"
              className="border border-white bg-[#128E95] placeholder-white outline-none text-white w-60 sm:w-72 md:w-96 px-4 py-2 rounded"
            />
            <input
              type="date"
              value={vencimiento}
              onChange={(e) => setVencimiento(e.target.value)}
              required
              className="border border-white bg-[#128E95] placeholder-white outline-none text-white w-60 sm:w-72 md:w-96 px-4 py-2 rounded"
            />
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
              placeholder="Cantidad"
              className="border border-white bg-[#128E95] placeholder-white outline-none text-white w-60 sm:w-72 md:w-96 px-4 py-2 rounded"
            />
            <input
              type="password"
              value={codigoAutorizacion}
              onChange={(e) => setCodigoAutorizacion(e.target.value)}
              required
              placeholder="Código de autorización"
              className="border border-white bg-[#ff914d] placeholder-white outline-none text-white w-60 sm:w-72 md:w-96 px-4 py-2 rounded"
            />
            <BotonesSiYNo />
          </form>
        )}
      </div>
      <BackRecep />
    </div>
  );
}

