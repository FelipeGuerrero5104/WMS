import { useState } from "react";
import { supabase } from "../hooks/supabaseClient";
import BackRecep from "../components/BackRecep";
import BotonesSiYNo from "../components/BotoSubmit";
import IngresoPallet from "../components/IngresoPallets";

export default function QuantityR() {
  const [sku, setSku] = useState("");
  const [lote, setLote] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [cantidad, setCantidad] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1️⃣ Crear la recepción
      const { data: recepcion, error: errorRecep } = await supabase
        .from("recepciones")
        .insert([
          { tipo_recepcion: "02", contenedor_recepcion: "default", usuario_recepcion: "admin" },
        ])
        .select()
        .single();

      if (errorRecep) throw errorRecep;

      // 2️⃣ Crear o actualizar el lote
      const { data: loteData, error: errorLote } = await supabase
        .from("lotes")
        .upsert([{ sku, lote, fecha_vencimiento: vencimiento }])
        .select()
        .single();

      if (errorLote) throw errorLote;

      // 3️⃣ Insertar detalle de recepción
      const { error: errorDetalle } = await supabase
        .from("detalle_recepcion")
        .insert([
          { id_recepcion: recepcion.id_recepcion, id_lote: loteData.id_lote, cantidad: Number(cantidad) },
        ]);

      if (errorDetalle) throw errorDetalle;

      // 4️⃣ Insertar en inventario en ubicación 1 (recepción)
      const { error: errorInventario } = await supabase
        .from("inventario")
        .insert([{ id_lote: loteData.id_lote, id_ubicacion: 1, cantidad: Number(cantidad) }]);

      if (errorInventario) throw errorInventario;

      alert("Recepción registrada y producto ubicado en la zona de recepción ✅");

      // Limpiar formulario
      setSku("");
      setLote("");
      setVencimiento("");
      setCantidad("");
    } catch (error) {
      console.error("Error en recepción:", error);
      alert("Ocurrió un error al registrar la recepción.");
    }
  };

  return (
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
        <BotonesSiYNo />
      </form>

      <BackRecep />
    </div>
  );
}

