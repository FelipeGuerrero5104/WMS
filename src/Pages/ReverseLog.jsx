import { useState } from "react";
import { supabase } from "../hooks/supabaseClient";
import BotonesSiYNo from "../components/BotoSubmit";

export default function ReverseLog() {
  const [contenedor, setContenedor] = useState("");
  const [sku, setSku] = useState("");
  const [lote, setLote] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [factura, setFactura] = useState("");
  const [motivo, setMotivo] = useState(""); // <-- nuevo estado motivo
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
            motivo: motivo, // <-- aquí
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
        setMotivo(""); // limpiar motivo también
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

  return (
    <div className="h-screen w-full flex flex-col gap-8 items-center justify-center bg-[#052a34]">
      {!agregando ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCrearOperacion();
          }}
          className="flex flex-col gap-y-8 items-center justify-center w-full px-4"
        >
          <h1 className="text-2xl font-semibold sm:text-3xl md:text-4xl lg:text-5xl text-white">
            LOGÍSTICA INVERSA
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
            className="border border-white bg-[#128E95] outline-none text-white w-60 sm:w-72 md:w-96 px-4 py-2 rounded"
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
            value={factura}
            onChange={(e) => setFactura(e.target.value)}
            required
            placeholder="Factura asociada"
            className="border border-white bg-[#128E95] placeholder-white outline-none text-white w-60 sm:w-72 md:w-96 px-4 py-2 rounded"
          />
          {/* Nuevo input motivo */}
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo"
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
  );
}



