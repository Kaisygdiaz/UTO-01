export function ordenarPorTotalDesc<T extends { total: number }>(items: T[]) {
  return [...items].sort((a, b) => b.total - a.total);
}

export function formatearFechaDashboard(fecha: string) {
  return new Intl.DateTimeFormat("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(fecha));
}

export function generarResumenOperativo(
  cumplimientoSla: number,
  fueraSla: number,
  vencidosResolucion: number,
  escalados: number
) {
  const cumplimiento = Math.round(cumplimientoSla * 100) / 100;

  if (fueraSla === 0 && escalados === 0) {
    return `El cumplimiento SLA actual es de ${cumplimiento}%. No se reportan tickets fuera de tiempo ni tickets escalados, por lo que la operación se mantiene estable.`;
  }

  if (fueraSla > 0 || vencidosResolucion > 0) {
    return `El cumplimiento SLA actual es de ${cumplimiento}%. Existen ${fueraSla} tickets fuera de SLA y ${vencidosResolucion} vencidos por resolución, por lo que se recomienda priorizar los casos críticos, vencidos y próximos a vencer.`;
  }

  return `El cumplimiento SLA actual es de ${cumplimiento}%. Se registran ${escalados} tickets escalados, por lo que se recomienda dar seguimiento a los casos que requieren atención superior.`;
}