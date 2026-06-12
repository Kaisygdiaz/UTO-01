export function obtenerEstiloEstado(estado: string) {
  const valor = estado.toLowerCase();

  if (valor.includes("abierto")) {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (valor.includes("proceso")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (valor.includes("resuelto")) {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (valor.includes("cerrado")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (valor.includes("cancelado")) {
    return "border-slate-300 bg-slate-100 text-slate-700";
  }

  if (valor.includes("escalado")) {
    return "border-purple-200 bg-purple-50 text-purple-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function obtenerEstiloPrioridad(prioridad: string) {
  const valor = prioridad.toLowerCase();

  if (valor.includes("crítica") || valor.includes("critica")) {
    return "border-red-300 bg-red-100 text-red-800";
  }

  if (valor.includes("alta")) {
    return "border-orange-300 bg-orange-50 text-orange-700";
  }

  if (valor.includes("media")) {
    return "border-yellow-300 bg-yellow-50 text-yellow-700";
  }

  if (valor.includes("baja")) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function obtenerEstiloImpacto(impacto: string) {
  const valor = impacto.toLowerCase();

  if (valor.includes("alto")) {
    return "border-red-300 bg-red-100 text-red-800";
  }

  if (valor.includes("medio")) {
    return "border-yellow-300 bg-yellow-50 text-yellow-700";
  }

  if (valor.includes("bajo")) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function obtenerEstiloUrgencia(urgencia: string) {
  const valor = urgencia.toLowerCase();

  if (valor.includes("alta")) {
    return "border-red-300 bg-red-100 text-red-800";
  }

  if (valor.includes("media")) {
    return "border-yellow-300 bg-yellow-50 text-yellow-700";
  }

  if (valor.includes("baja")) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function obtenerEstiloTextoEstado(estado: string) {
  const valor = estado.toLowerCase();

  if (valor.includes("abierto")) return "text-sky-700";
  if (valor.includes("proceso")) return "text-amber-700";
  if (valor.includes("resuelto")) return "text-green-700";
  if (valor.includes("cerrado")) return "text-emerald-700";
  if (valor.includes("cancelado")) return "text-slate-600";
  if (valor.includes("escalado")) return "text-purple-700";

  return "text-slate-800";
}

export function obtenerEstiloTextoPrioridad(prioridad: string) {
  const valor = prioridad.toLowerCase();

  if (valor.includes("crítica") || valor.includes("critica")) {
    return "text-red-800";
  }

  if (valor.includes("alta")) return "text-orange-700";
  if (valor.includes("media")) return "text-yellow-700";
  if (valor.includes("baja")) return "text-blue-700";

  return "text-slate-800";
}

export function obtenerEstiloTextoImpacto(impacto: string) {
  const valor = impacto.toLowerCase();

  if (valor.includes("alto")) return "text-red-800";
  if (valor.includes("medio")) return "text-yellow-700";
  if (valor.includes("bajo")) return "text-blue-700";

  return "text-slate-800";
}

export function obtenerEstiloTextoUrgencia(urgencia: string) {
  const valor = urgencia.toLowerCase();

  if (valor.includes("alta")) return "text-red-800";
  if (valor.includes("media")) return "text-yellow-700";
  if (valor.includes("baja")) return "text-blue-700";

  return "text-slate-800";
}