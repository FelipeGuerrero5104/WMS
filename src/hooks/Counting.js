import { useState } from "react";
import { supabase } from "../hooks/supabaseClient";

export function useCounting() {
  const [inputUbicacion, setInputUbicacion] = useState("");
  const [ubicacionValida, setUbicacionValida] = useState(null);
  const [inputLote, setInputLote] = useState("");
  const [loteValido, setLoteValido] = useState(null);
  const [productosUbicacion, setProductosUbicacion] = useState([]);
  const [cantidadSistema, setCantidadSistema] = useState(null);
  const [cantidadFisica, setCantidadFisica] = useState("");
  const [usuarioConteo, setUsuarioConteo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const [nuevoSku, setNuevoSku] = useState("");
  const [nuevoLote, setNuevoLote] = useState("");
  const [nuevaFechaVencimiento, setNuevaFechaVencimiento] = useState("");

  const buscarUbicacion = async () => {
    setError("");
    setMensaje("");
    setUbicacionValida(null);
    setProductosUbicacion([]);
    setLoteValido(null);
    setCantidadSistema(null);

    if (!inputUbicacion.trim()) {
      setError("Debe ingresar una ubicación");
      return;
    }

    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .or(
        `id_ubicacion.eq.${inputUbicacion.trim()},descripcion.ilike.%${inputUbicacion.trim()}%`
      )
      .limit(1)
      .single();

    if (error || !data) {
      setError("Ubicación no encontrada");
      return;
    }

    setUbicacionValida(data);

    const { data: storageData, error: storageError } = await supabase
      .from("storage")
      .select(
        `
        id_almacenaje,
        cantidad,
        id_lote,
        lots (
          id_lote,
          lote,
          fecha_vencimiento,
          sku
        )
      `
      )
      .eq("id_ubicacion", data.id_ubicacion);

    if (storageError) {
      setError("Error al obtener productos en la ubicación");
      return;
    }

    setProductosUbicacion(storageData);
  };

  const buscarLote = () => {
    setError("");
    setMensaje("");
    setCantidadSistema(null);
    setLoteValido(null);

    if (!inputLote.trim()) {
      setError("Ingrese un lote o SKU");
      return;
    }

    if (!ubicacionValida) {
      setError("Primero ingrese una ubicación válida");
      return;
    }

    const encontrado = productosUbicacion.find(
      (p) =>
        p.lots.lote.toLowerCase() === inputLote.trim().toLowerCase() ||
        p.lots.sku.toLowerCase() === inputLote.trim().toLowerCase()
    );

    if (!encontrado) {
      setLoteValido(null);
      setCantidadSistema(null);
      setNuevoSku(inputLote.trim());
      setNuevoLote("");
      setNuevaFechaVencimiento("");
      return;
    }

    setLoteValido(encontrado);
    setCantidadSistema(encontrado.cantidad);

    setNuevoSku("");
    setNuevoLote("");
    setNuevaFechaVencimiento("");
  };

  const guardarConteo = async () => {
    setError("");
    setMensaje("");

    if (!ubicacionValida) {
      setError("Debe ingresar y buscar una ubicación válida");
      return;
    }

    if (!usuarioConteo.trim()) {
      setError("Debe ingresar el usuario que realiza el conteo");
      return;
    }

    const cantidadFisicaNum = parseInt(cantidadFisica);
    if (isNaN(cantidadFisicaNum) || cantidadFisicaNum < 0) {
      setError("Cantidad física inválida");
      return;
    }

    try {
      let idLoteAGuardar = null;

      if (loteValido) {
        idLoteAGuardar = loteValido.id_lote;
      } else {
        if (!nuevoSku.trim()) {
          setError("Debe ingresar un SKU válido para crear nuevo producto");
          return;
        }
        const { data: existingProduct } = await supabase
          .from("products")
          .select("*")
          .eq("sku", nuevoSku.trim())
          .single();

        if (!existingProduct) {
          const { error: errorProd } = await supabase.from("products").insert({
            sku: nuevoSku.trim(),
            descripcion: nuevoLote.trim() || "Descripción no ingresada",
            unidad_medida: "unidad",
          });
          if (errorProd) throw errorProd;
        }

        const { data: newLotData, error: errorLot } = await supabase
          .from("lots")
          .insert({
            sku: nuevoSku.trim(),
            lote: nuevoLote.trim() || nuevoSku.trim(),
            fecha_vencimiento: nuevaFechaVencimiento || null,
          })
          .select()
          .single();

        if (errorLot || !newLotData) {
          throw errorLot || new Error("Error al crear nuevo lote");
        }

        idLoteAGuardar = newLotData.id_lote;
      }

      const estadoConteo =
        cantidadFisicaNum === (cantidadSistema || 0)
          ? "cuadrado"
          : "con diferencias";

      const { error: insertError } = await supabase
        .from("cycle_counts")
        .insert({
          id_ubicacion: ubicacionValida.id_ubicacion,
          id_lote: idLoteAGuardar,
          cantidad_sistema: cantidadSistema || 0,
          cantidad_fisica: cantidadFisicaNum,
          usuario_conteo: usuarioConteo.trim(),
          estado: estadoConteo,
        });

      if (insertError) throw insertError;

      setMensaje("Conteo guardado correctamente.");
      setInputLote("");
      setLoteValido(null);
      setCantidadSistema(null);
      setCantidadFisica("");
      setUsuarioConteo("");
      setNuevoSku("");
      setNuevoLote("");
      setNuevaFechaVencimiento("");
    } catch (err) {
      setError("Error al guardar conteo: " + err.message);
    }
  };

  return {
    inputUbicacion,
    setInputUbicacion,
    ubicacionValida,
    inputLote,
    setInputLote,
    loteValido,
    productosUbicacion,
    cantidadSistema,
    cantidadFisica,
    setCantidadFisica,
    usuarioConteo,
    setUsuarioConteo,
    mensaje,
    error,
    activeTab,
    setActiveTab,
    nuevoSku,
    setNuevoSku,
    nuevoLote,
    setNuevoLote,
    nuevaFechaVencimiento,
    setNuevaFechaVencimiento,
    buscarUbicacion,
    buscarLote,
    guardarConteo,
  };
}
