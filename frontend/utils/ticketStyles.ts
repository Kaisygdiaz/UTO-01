function normalizar(valor: string) {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function coincide(valor: string, ...opciones: string[]) {
  const texto = normalizar(valor);
  return opciones.some((opcion) => texto.includes(normalizar(opcion)));
}

/* =========================
   BADGES
========================= */

export function obtenerEstiloEstado(estado: string) {
  if (coincide(estado, "abierto")) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (coincide(estado, "proceso")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (coincide(estado, "escalado")) {
    return "border-purple-200 bg-purple-50 text-purple-700";
  }

  if (coincide(estado, "resuelto")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (coincide(estado, "cerrado")) {
    return "border-slate-300 bg-slate-100 text-slate-700";
  }

  if (coincide(estado, "cancelado")) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function obtenerEstiloPrioridad(prioridad: string) {
  if (coincide(prioridad, "critica", "crítica")) {
    return "border-red-300 bg-red-50 text-red-700";
  }

  if (coincide(prioridad, "alta")) {
    return "border-orange-300 bg-orange-50 text-orange-700";
  }

  if (coincide(prioridad, "media")) {
    return "border-amber-300 bg-amber-50 text-amber-700";
  }

  if (coincide(prioridad, "baja")) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function obtenerEstiloImpacto(impacto: string) {
  if (coincide(impacto, "alto")) {
    return "border-red-300 bg-red-50 text-red-700";
  }

  if (coincide(impacto, "medio")) {
    return "border-amber-300 bg-amber-50 text-amber-700";
  }

  if (coincide(impacto, "bajo")) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function obtenerEstiloUrgencia(urgencia: string) {
  if (coincide(urgencia, "alta")) {
    return "border-red-300 bg-red-50 text-red-700";
  }

  if (coincide(urgencia, "media")) {
    return "border-amber-300 bg-amber-50 text-amber-700";
  }

  if (coincide(urgencia, "baja")) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

/* =========================
   TEXTO
========================= */

export function obtenerEstiloTextoEstado(estado: string) {
  if (coincide(estado, "abierto")) return "text-blue-700";
  if (coincide(estado, "proceso")) return "text-amber-700";
  if (coincide(estado, "escalado")) return "text-purple-700";
  if (coincide(estado, "resuelto")) return "text-emerald-700";
  if (coincide(estado, "cerrado")) return "text-slate-700";
  if (coincide(estado, "cancelado")) return "text-red-700";

  return "text-slate-800";
}

export function obtenerEstiloTextoPrioridad(prioridad: string) {
  if (coincide(prioridad, "critica", "crítica")) return "text-red-700";
  if (coincide(prioridad, "alta")) return "text-orange-700";
  if (coincide(prioridad, "media")) return "text-amber-700";
  if (coincide(prioridad, "baja")) return "text-blue-700";

  return "text-slate-800";
}

export function obtenerEstiloTextoImpacto(impacto: string) {
  if (coincide(impacto, "alto")) return "text-red-700";
  if (coincide(impacto, "medio")) return "text-amber-700";
  if (coincide(impacto, "bajo")) return "text-blue-700";

  return "text-slate-800";
}

export function obtenerEstiloTextoUrgencia(urgencia: string) {
  if (coincide(urgencia, "alta")) return "text-red-700";
  if (coincide(urgencia, "media")) return "text-amber-700";
  if (coincide(urgencia, "baja")) return "text-blue-700";

  return "text-slate-800";
}