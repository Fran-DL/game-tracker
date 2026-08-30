import { useState } from 'react'
import { useLibraryStore, useProfileStore, useThemeStore, MAX_FAVORITOS } from '@/store'
import { OPCIONES_COLOR_PRIMARIO } from '@/lib/theme'

/**
 * Pantalla de prueba de la Fase 2 (store + persistencia).
 * No es UI final: sirve para validar a ojo que agregar/editar juegos,
 * el perfil y el color primario persisten correctamente en localStorage
 * antes de construir las pantallas reales (Home, Backlog, Top100, Perfil).
 */
function App() {
  const juegos = useLibraryStore((state) => state.juegos)
  const agregarJuego = useLibraryStore((state) => state.agregarJuego)
  const eliminarJuego = useLibraryStore((state) => state.eliminarJuego)
  const empezarJuego = useLibraryStore((state) => state.empezarJuego)
  const incrementarRejugado = useLibraryStore((state) => state.incrementarRejugado)
  const toggleFavorito = useLibraryStore((state) => state.toggleFavorito)
  const contarFavoritos = useLibraryStore((state) => state.contarFavoritos)

  const perfil = useProfileStore()
  const colorPrimario = useThemeStore((state) => state.colorPrimario)
  const setColorPrimario = useThemeStore((state) => state.setColorPrimario)

  const [aviso, setAviso] = useState<string | null>(null)

  function agregarJuegoDePrueba() {
    const id = Date.now()
    agregarJuego({
      id,
      titulo: `Juego de prueba #${juegos.length + 1}`,
      caratula: '',
      año: 2024,
      generos: ['Aventura'],
    })
  }

  function manejarToggleFavorito(id: number) {
    const ok = toggleFavorito(id)
    setAviso(ok ? null : `No podés marcar más de ${MAX_FAVORITOS} juegos como favoritos.`)
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            Tracker Personal de Videojuegos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fase 2 completa: stores de Zustand (biblioteca, perfil, color primario) con
            persistencia en localStorage. Recargá la página para confirmar que todo se
            restaura.
          </p>
        </header>

        {aviso && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
            {aviso}
          </div>
        )}

        {/* Color primario */}
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="font-medium">Color primario</h2>
          <p className="text-sm text-muted-foreground">
            Actual: {colorPrimario.nombre}
          </p>
          <div className="mt-3 flex gap-3">
            {OPCIONES_COLOR_PRIMARIO.map((opcion) => (
              <button
                key={opcion.nombre}
                type="button"
                onClick={() => setColorPrimario(opcion)}
                title={opcion.nombre}
                className="h-9 w-9 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: opcion.hex,
                  borderColor:
                    opcion.nombre === colorPrimario.nombre ? 'white' : 'transparent',
                }}
              />
            ))}
          </div>
        </section>

        {/* Perfil */}
        <section className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h2 className="font-medium">Perfil</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={perfil.nombreUsuario}
              onChange={(e) => perfil.setNombreUsuario(e.target.value)}
              placeholder="Nombre de usuario"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              value={perfil.biografia}
              onChange={(e) => perfil.setBiografia(e.target.value)}
              placeholder="Biografía"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </section>

        {/* Biblioteca */}
        <section className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">
              Biblioteca ({juegos.length} juegos, {contarFavoritos()}/{MAX_FAVORITOS} favoritos)
            </h2>
            <button
              type="button"
              onClick={agregarJuegoDePrueba}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              + Agregar juego de prueba
            </button>
          </div>

          {juegos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hay juegos en la biblioteca.
            </p>
          ) : (
            <ul className="space-y-2">
              {juegos.map((juego) => (
                <li
                  key={juego.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{juego.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {juego.estado} · rejugado {juego.vecesRejugado}x
                      {juego.esFavorito ? ' · favorito' : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => empezarJuego(juego.id)}
                      className="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
                    >
                      Empezar
                    </button>
                    <button
                      type="button"
                      onClick={() => incrementarRejugado(juego.id)}
                      className="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
                    >
                      +1 Rejugado
                    </button>
                    <button
                      type="button"
                      onClick={() => manejarToggleFavorito(juego.id)}
                      className="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
                    >
                      {juego.esFavorito ? 'Quitar favorito' : 'Marcar favorito'}
                    </button>
                    <button
                      type="button"
                      onClick={() => eliminarJuego(juego.id)}
                      className="rounded-md border border-destructive/50 px-2 py-1 text-xs text-destructive-foreground hover:bg-destructive/10"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

export default App
