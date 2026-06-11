export function obtenerEstiloEstado(estado: string) {
  const estadoNormalizado = estado.toLowerCase();

  if (estadoNormalizado.includes("abierto")) {
    return "bg-sky-50 text-sky-700 border-sky-200";
  }

  if (estadoNormalizado.includes("proceso")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (estadoNormalizado.includes("resuelto")) {
    return "bg-green-50 text-green-700 border-green-200";
  }

  if (estadoNormalizado.includes("cerrado")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (estadoNormalizado.includes("cancelado")) {
    return "bg-slate-100 text-slate-700 border-slate-300";
  }

  if (estadoNormalizado.includes("escalado")) {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  return "bg-slate-50 text-slate-700 border-slate-200";
}

export function obtenerEstiloPrioridad(prioridad: string) {
  const prioridadNormalizada = prioridad.toLowerCase();

  if (
    prioridadNormalizada.includes("crítica") ||
    prioridadNormalizada.includes("critica")
  ) {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (prioridadNormalizada.includes("alta")) {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  if (prioridadNormalizada.includes("media")) {
    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  }

  if (prioridadNormalizada.includes("baja")) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  return "bg-slate-50 text-slate-700 border-slate-200";
}