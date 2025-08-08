import { useState } from "react";
import { supabase } from "../hooks/supabaseClient";
import BackRecep from "./BackRecep";
import BotonesSiYNo from "../components/BotoSubmit";
import IngresoPallet from "./IngresoPallets";

export default function QuantityR() {
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

  return (
    <div>
      <div className="h-screen w-full flex flex-col gap-8 items-center justify-center bg-[#052a34]">
        <IngresoPallet />

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-y-8 items-center justify-center w-full px-4"
        >
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
            placeholder="Vencimiento"
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
            type="text"
            value={contenedor}
            onChange={(e) => setContenedor(e.target.value)}
            required
            placeholder="Código del contenedor"
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
      </div>
      <BackRecep />
    </div>
  );
}


