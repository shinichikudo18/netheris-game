# Netheris World UI — Fase 1

Primer prototipo visual de la futura interfaz viva de Netheris.

## Objetivo

Definir cómo se ve **El Hogar** y cómo las actividades de Katherine, Karen y Karencita se traducen a movimiento y animación, sin conectar todavía servicios reales.

> La interfaz no debe inventar trabajo real. En Fase 1 los eventos siguen marcados como `local-demo`.

## PET frames usados

Los tres paquetes originales tienen **50 frames PNG transparentes de 256×256** y comparten la misma numeración base:

- `Katherine_PET_Netheris_50_frames*.zip` → Katherine.
- `Karen_PET_Netheris_50_frames*.zip` → Karen.
- `Karencita_PET_Netheris_50_frames*.zip` → Karencita.

La UI ya soporta animación por frames:

- reposo/expresiones: primeros frames;
- caminar: frames 034–037 para el prototipo;
- trabajo/consulta: frames 019–020;
- sentada: frame 042;
- dormir: frame 050.

Este mapeo es provisional y se afinará visualmente en las siguientes iteraciones.

## Ejecutar en Linux

```bash
git clone https://github.com/shinichikudo18/netheris-game.git
cd netheris-game
git checkout world-ui-v2-phase1
cd world-ui
```

### Importar los tres ZIP PET

No renombres 150 PNG a mano. Usa:

```bash
python3 scripts/import_pet_frames.py \
  "/ruta/Katherine_PET_Netheris_50_frames(1).zip" \
  "/ruta/Karen_PET_Netheris_50_frames(1).zip" \
  "/ruta/Karencita_PET_Netheris_50_frames(1).zip"
```

El script genera:

```text
assets/pets/katherine/frame_001.png ... frame_050.png
assets/pets/karen/frame_001.png ... frame_050.png
assets/pets/karencita/frame_001.png ... frame_050.png
```

Luego:

```bash
python3 -m http.server 8080
```

Abrir `http://localhost:8080`.

Si los assets todavía no están importados, la UI usa iniciales como fallback.

## Qué probar

- Idle animado de las tres.
- Caminar al cambiar de estación.
- Katherine trabajando en su tablero.
- Karen investigando.
- Karencita revisando casa.
- Reunión de las tres.
- Estado de descanso.
- Payload JSON simulado de cada acción.

## Próxima iteración

Afinar el escenario de El Hogar y clasificar los 50 frames completos en un manifiesto de animaciones. Después pasamos al **World State Model**, todavía local, antes de conectar Platform Bridge.
