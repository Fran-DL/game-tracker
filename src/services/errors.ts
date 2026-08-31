/**
 * Error de dominio para fallos relacionados con la autenticación de Twitch
 * o las peticiones a la API de IGDB. Se captura en la UI (toasts, banners
 * de error) para mostrar mensajes amigables en vez de errores técnicos.
 */
export class ErrorServicioIGDB extends Error {
  causaOriginal?: unknown

  constructor(message: string, causaOriginal?: unknown) {
    super(message)
    this.name = 'ErrorServicioIGDB'
    this.causaOriginal = causaOriginal
  }
}