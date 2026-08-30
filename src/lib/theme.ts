import type { OpcionColorPrimario } from '@/types'

/**
 * Opciones de color primario disponibles en el selector de personalización
 * (pantalla de Perfil). Los valores HSL están expresados como "H S% L%"
 * (sin la función css hsl()) para poder combinarse con la opacidad de
 * Tailwind, ej. bg-primary/50.
 */
export const OPCIONES_COLOR_PRIMARIO: OpcionColorPrimario[] = [
  { nombre: 'Violeta', hex: '#7C3AED', hsl: '262 83% 58%' },
  { nombre: 'Naranja', hex: '#EA580C', hsl: '21 90% 48%' },
  { nombre: 'Azul', hex: '#2563EB', hsl: '221 83% 53%' },
  { nombre: 'Verde', hex: '#059669', hsl: '161 94% 30%' },
]

export const COLOR_PRIMARIO_POR_DEFECTO = OPCIONES_COLOR_PRIMARIO[0]

/**
 * Aplica un color primario a la aplicación completa sobreescribiendo las
 * variables CSS --primary y --ring en tiempo de ejecución.
 */
export function aplicarColorPrimario(opcion: OpcionColorPrimario): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.style.setProperty('--primary', opcion.hsl)
  root.style.setProperty('--ring', opcion.hsl)
}
