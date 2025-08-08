import { useState, useEffect } from "react";
import { supabase } from "../hooks/supabaseClient";

export default function useMovements() {
  const [etiqueta, setEtiqueta] = useState("");
  const [pallet, setPallet] = useState(null);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [ubicacionDestino, setUbicacionDestino] = useState("");
  const [cantidadMover, setCantidadMover] = useState("");
  const [modoMovimiento, setModoMovimiento] = useState("pallet"); // "pallet" o "unidades"
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [usuarioMovimiento, setUsuarioMovimiento] = useState("");

  const cargarUbicaciones = async () => {
    const { data, error } = await supabase
      .from("locations")
      .select("id_ubicacion, descripcion")
      .neq("id_ubicacion", 99);
    if (!error) setUbicaciones(data);
  };

  useEffect(() => {
    cargarUbicaciones();
  }, []);

  const buscarPallet = async () => {
    setMensaje("");
    setError("");
    setPallet(null);

    if (!etiqueta.trim()) {
      setError("Debe ingresar una etiqueta");
      return;
    }

    const { data, error } = await supabase
      .from("storage")
      .select(
        `
        id_almacenaje,
        etiqueta_pallet,
        cantidad,
        id_ubicacion,
        lots (
          id_lote,
          lote,
          fecha_vencimiento,
          sku,
          products (
            descripcion
          )
        )
      `
      )
      .eq("etiqueta_pallet", etiqueta.trim())
      .single();

    if (error || !data) {
      setError("No se encontró un pallet con esa etiqueta.");
      return;
    }

    setPallet(data);
  };

  const moverPallet = async () => {
    setMensaje("");
    setError("");

    if (!ubicacionDestino) {
      setError("Debes seleccionar una ubicación destino.");
      return;
    }

    if (!usuarioMovimiento.trim()) {
      setError(
        "Debes ingresar el nombre del usuario que realiza el movimiento."
      );
      return;
    }

    try {
      const idUbicacionOrigen = pallet.id_ubicacion;
      const idUbicacionDestino = Number(ubicacionDestino);

      if (modoMovimiento === "unidades") {
        const cantidadNum = parseInt(cantidadMover);
        if (isNaN(cantidadNum) || cantidadNum <= 0) {
          setError("Cantidad inválida.");
          return;
        }
        if (cantidadNum > pallet.cantidad) {
          setError("No hay suficientes unidades en el pallet.");
          return;
        }

        if (cantidadNum === pallet.cantidad) {
          const { error: updateError } = await supabase
            .from("storage")
            .update({ id_ubicacion: idUbicacionDestino })
            .eq("id_almacenaje", pallet.id_almacenaje);
          if (updateError) throw updateError;

          await supabase.from("movements").insert({
            id_lote: pallet.lots.id_lote,
            ubicacion_origen: idUbicacionOrigen,
            ubicacion_destino: idUbicacionDestino,
            cantidad: cantidadNum,
            usuario_movimiento: usuarioMovimiento.trim(),
          });
        } else {
          const { error: updateOrigenError } = await supabase
            .from("storage")
            .update({ cantidad: pallet.cantidad - cantidadNum })
            .eq("id_almacenaje", pallet.id_almacenaje);
          if (updateOrigenError) throw updateOrigenError;

          const { error: insertError } = await supabase.from("storage").insert({
            etiqueta_pallet: etiqueta + "-split-" + Date.now(),
            cantidad: cantidadNum,
            id_ubicacion: idUbicacionDestino,
            id_lote: pallet.lots.id_lote,
          });
          if (insertError) throw insertError;

          await supabase.from("movements").insert({
            id_lote: pallet.lots.id_lote,
            ubicacion_origen: idUbicacionOrigen,
            ubicacion_destino: idUbicacionDestino,
            cantidad: cantidadNum,
            usuario_movimiento: usuarioMovimiento.trim(),
          });
        }
      } else {
        const { error: updateError } = await supabase
          .from("storage")
          .update({ id_ubicacion: idUbicacionDestino })
          .eq("id_almacenaje", pallet.id_almacenaje);
        if (updateError) throw updateError;

        await supabase.from("movements").insert({
          id_lote: pallet.lots.id_lote,
          ubicacion_origen: idUbicacionOrigen,
          ubicacion_destino: idUbicacionDestino,
          cantidad: pallet.cantidad,
          usuario_movimiento: usuarioMovimiento.trim(),
        });
      }

      setMensaje("Movimiento realizado con éxito.");
      setPallet(null);
      setEtiqueta("");
      setCantidadMover("");
      setUbicacionDestino("");
      setUsuarioMovimiento("");
    } catch (err) {
      setError("Error al realizar movimiento: " + err.message);
      console.error(err);
    }
  };

  const reset = () => {
    setPallet(null);
    setEtiqueta("");
    setCantidadMover("");
    setUbicacionDestino("");
    setUsuarioMovimiento("");
    setMensaje("");
    setError("");
  };

  return {
    etiqueta,
    setEtiqueta,
    pallet,
    buscarPallet,
    ubicaciones,
    ubicacionDestino,
    setUbicacionDestino,
    cantidadMover,
    setCantidadMover,
    modoMovimiento,
    setModoMovimiento,
    mensaje,
    error,
    usuarioMovimiento,
    setUsuarioMovimiento,
    moverPallet,
    reset,
  };
}
