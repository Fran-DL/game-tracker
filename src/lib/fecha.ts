/**
 * Utilidades de fecha compartidas por los stores y, más adelante,
 * por los componentes que muestran fechas en pantalla (Home, modal, etc).
 */

/**
 * Devuelve el mes actual en formato "YYYY-MM", tal como lo espera
 * el campo `fechaInicio` / `fechaFin` del modelo `Juego`.
 */
export function mesActual(): string {
  const ahora = new Date()
  const año = ahora.getFullYear()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  return `${año}-${mes}`
}
