import { useState } from "react";
import { supabase } from "../hooks/supabaseClient";
import TituloMovimientos from "./TituloMovimientos";

export default function Movements() {
  const [ubicacionOrigen, setUbicacionOrigen] = useState("");
  const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false);

  const [sku, setSku] = useState("");
  const [lote, setLote] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [codigoAuth, setCodigoAuth] = useState("");

  const [ubicacionDestino, setUbicacionDestino] = useState("");
  const [destinoConfirmado, setDestinoConfirmado] = useState(false);

  // Paso 1: Confirmar ubicación origen
  const validarUbicacionOrigen = async (e) => {
    e.preventDefault();
    const idUbicacionOrigen = Number(ubicacionOrigen);
    if (isNaN(idUbicacionOrigen)) {
      alert("La ubicación origen debe ser un número válido");
      return;
    }

    const { data: ubicOrigen } = await supabase
      .from("locations")
      .select("*")
      .eq("id_ubicacion", idUbicacionOrigen);

    if (!ubicOrigen || ubicOrigen.length === 0) {
      alert("Ubicación de origen no encontrada");
      return;
    }

    setUbicacionConfirmada(true);
  };

  // Paso 2: Validar datos intermedios (sku, lote, fecha y código auth)
  const handleDatosIntermedios = async (e) => {
    e.preventDefault();

    const { data: lotData } = await supabase
      .from("lots")
      .select("*")
      .eq("sku", sku)
      .eq("lote", lote)
      .eq("fecha_vencimiento", fechaVencimiento);

    if (!lotData || lotData.length === 0) {
      alert("SKU, lote o fecha de vencimiento no encontrados");
      return;
    }

    const { data: authData } = await supabase
      .from("usuarios")
      .select("*")
      .eq("codigo_autorizacion", codigoAuth);

    if (!authData || authData.length === 0) {
      alert("Código de autorización inválido");
      return;
    }

    setDestinoConfirmado(true);
  };

  // Paso 3: Confirmar ubicación destino e insertar movimiento
  const handleConfirmarDestino = async (e) => {
    e.preventDefault();

    const idUbicacionDestino = Number(ubicacionDestino);
    const idUbicacionOrigen = Number(ubicacionOrigen);

    if (isNaN(idUbicacionDestino)) {
      alert("La ubicación destino debe ser un número válido");
      return;
    }

    if (idUbicacionDestino === 1) {
      alert("No se puede mover productos a la ubicación 1");
      return;
    }

    const { data: ubicDest } = await supabase
      .from("locations")
      .select("*")
      .eq("id_ubicacion", idUbicacionDestino);

    if (!ubicDest || ubicDest.length === 0) {
      alert("Ubicación de destino no encontrada");
      return;
    }

    const { data: lotData } = await supabase
      .from("lots")
      .select("*")
      .eq("sku", sku)
      .eq("lote", lote)
      .eq("fecha_vencimiento", fechaVencimiento);

    if (!lotData || lotData.length === 0) {
      alert("Error interno: lote no encontrado");
      return;
    }

    const idLote = Number(lotData[0].id_lote);

    // Verificar stock en ubicación origen
    const { data: stockEnOrigen, error: storageError } = await supabase
      .from("storage")
      .select("*")
      .eq("id_lote", idLote)
      .eq("id_ubicacion", idUbicacionOrigen);

    if (storageError) {
      alert("Error consultando stock en ubicación origen");
      console.error(storageError);
      return;
    }

    if (!stockEnOrigen || stockEnOrigen.length === 0) {
      alert("El producto no se encuentra en la ubicación de origen.");
      return;
    }

    if (stockEnOrigen[0].cantidad < parseInt(cantidad)) {
      alert("Cantidad solicitada supera el stock disponible en la ubicación de origen.");
      return;
    }

    const { data: authData } = await supabase
      .from("usuarios")
      .select("*")
      .eq("codigo_autorizacion", codigoAuth);

    if (!authData || authData.length === 0) {
      alert("Error interno: autorización inválida");
      return;
    }

    // Insertar movimiento
    const { error: movError } = await supabase.from("movements").insert([
      {
        id_lote: idLote,
        ubicacion_origen: idUbicacionOrigen,
        ubicacion_destino: idUbicacionDestino,
        cantidad: parseInt(cantidad),
        usuario_movimiento: authData[0].nombre,
      },
    ]);

    if (movError) {
      alert("Error registrando movimiento");
      console.error(movError);
      return;
    }

    // Actualizar reverse_logistics con condición fecha_vencimiento también
    const { error: revLogError } = await supabase
      .from("reverse_logistics")
      .update({ id_ubicacion: idUbicacionDestino })
      .eq("id_lote", idLote)
      .eq("fecha_vencimiento", fechaVencimiento);

    if (revLogError) {
      alert("Error actualizando reverse_logistics");
      console.error(revLogError);
      return;
    }

    // Actualizar stock en origen
    const { error: errorOrigen } = await supabase
      .from("storage")
      .update({ cantidad: stockEnOrigen[0].cantidad - parseInt(cantidad) })
      .eq("id_lote", idLote)
      .eq("id_ubicacion", idUbicacionOrigen);

    if (errorOrigen) {
      alert("Error actualizando stock en ubicación origen");
      console.error(errorOrigen);
      return;
    }

    // Actualizar o insertar stock en destino
    const { data: stockEnDestino } = await supabase
      .from("storage")
      .select("*")
      .eq("id_lote", idLote)
      .eq("id_ubicacion", idUbicacionDestino);

    if (stockEnDestino && stockEnDestino.length > 0) {
      const { error: errorDestino } = await supabase
        .from("storage")
        .update({ cantidad: stockEnDestino[0].cantidad + parseInt(cantidad) })
        .eq("id_lote", idLote)
        .eq("id_ubicacion", idUbicacionDestino);

      if (errorDestino) {
        alert("Error actualizando stock en ubicación destino");
        console.error(errorDestino);
        return;
      }
    } else {
      const { error: errorInsertDestino } = await supabase
        .from("storage")
        .insert([
          {
            id_lote: idLote,
            id_ubicacion: idUbicacionDestino,
            cantidad: parseInt(cantidad),
          },
        ]);

      if (errorInsertDestino) {
        alert("Error creando registro en ubicación destino");
        console.error(errorInsertDestino);
        return;
      }
    }

    alert("Movimiento registrado correctamente ✅");

    // Resetear formulario
    setUbicacionOrigen("");
    setUbicacionConfirmada(false);
    setSku("");
    setLote("");
    setFechaVencimiento("");
    setCantidad("");
    setCodigoAuth("");
    setUbicacionDestino("");
    setDestinoConfirmado(false);
  };

  return (
    <div className="h-screen w-full bg-[#052a34] flex flex-col gap-y-10 items-center justify-center">
      <TituloMovimientos />
      {!ubicacionConfirmada ? (
        <form
          onSubmit={validarUbicacionOrigen}
          className="bg-[#0a3b45] text-white p-6 rounded-xl shadow-lg w-full max-w-md mx-auto"
        >
          <h2 className="text-xl font-bold mb-4">Ingresar Ubicación Origen</h2>
          <input
            type="text"
            placeholder="Ubicación Origen"
            value={ubicacionOrigen}
            onChange={(e) => setUbicacionOrigen(e.target.value)}
            className="w-full p-2 mb-3 rounded bg-[#128E95] text-white placeholder-white focus:outline-none"
            required
          />
          <button
            type="submit"
            className="bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 rounded w-full"
          >
            Confirmar Origen
          </button>
        </form>
      ) : !destinoConfirmado ? (
        <form
          onSubmit={handleDatosIntermedios}
          className="bg-[#0a3b45] text-white p-6 rounded-xl shadow-lg w-full max-w-md mx-auto"
        >
          <h2 className="text-xl font-bold mb-4">Ingresar detalles del movimiento</h2>
          <input
            type="text"
            placeholder="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full p-2 mb-3 rounded bg-[#128E95] focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Lote"
            value={lote}
            onChange={(e) => setLote(e.target.value)}
            className="w-full p-2 mb-3 rounded bg-[#128E95] focus:outline-none"
            required
          />
          <input
            type="date"
            value={fechaVencimiento}
            onChange={(e) => setFechaVencimiento(e.target.value)}
            className="w-full p-2 mb-3 rounded bg-[#128E95] focus:outline-none"
            required
          />
          <input
            type="number"
            placeholder="Cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="w-full p-2 mb-3 rounded bg-[#128E95] focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Código de Autorización"
            value={codigoAuth}
            onChange={(e) => setCodigoAuth(e.target.value)}
            className="w-full p-2 mb-3 rounded bg-[#128E95] focus:outline-none"
            required
          />
          <button
            type="submit"
            className="bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 rounded w-full"
          >
            Siguiente
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleConfirmarDestino}
          className="bg-[#0a3b45] text-white p-6 rounded-xl shadow-lg w-full max-w-md mx-auto"
        >
          <h2 className="text-xl font-bold mb-4">Confirmar Ubicación Destino</h2>
          <input
            type="text"
            placeholder="Ubicación Destino"
            value={ubicacionDestino}
            onChange={(e) => setUbicacionDestino(e.target.value)}
            className="w-full p-2 mb-3 rounded bg-[#128E95] focus:outline-none"
            required
          />
          <button
            type="submit"
            className="bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 rounded w-full"
          >
            Registrar Movimiento
          </button>
        </form>
      )}
    </div>
  );
}



