# Netheris World UI — Fase 1.2

Prototipo local de la interfaz viva de Netheris.

## Estado actual

La vista dejó de tratarse como dashboard y pasa a representar **El Hogar** como escenario:

- espacio principal de pantalla completa;
- PET de Katherine, Karen y Karencita dentro del mundo;
- tablero holográfico de Katherine;
- escritorio de investigación de Karen;
- consola de casa de Karencita;
- Core Netheris;
- portal hacia el mundo físico;
- mesa común;
- panel contextual al seleccionar una agente;
- laboratorio de simulación ocultable;
- trayecto luminoso breve cuando una agente se desplaza;
- sprites direccionales para caminar hacia arriba/abajo;
- precarga de frames usados para reducir parpadeos;
- PET visualmente más grandes;
- zonas de iluminación propias para Katherine, Karen y Karencita;
- lounge con sofá, alfombra y luz ambiental;
- hora local del mundo físico en cabecera;
- estaciones clickeables que disparan su simulación correspondiente;
- Core y portal utilizables con la agente seleccionada.

La regla continúa intacta: **trabajo real solo podrá representarse cuando exista un evento real**. Todo lo actual sigue identificado como `local-demo`.

## PET frames

Cada personaje usa 50 PNG transparentes de 256×256.

Mapeo provisional Fase 1.2:

- idle: 001–004;
- caminar hacia cámara: 034–037;
- caminar alejándose: 038–041;
- trabajo/tecnología: 019–020;
- interacción/energía: 043–044;
- sentada: 042;
- descanso: 050.

## Importar ZIP

```bash
python3 scripts/import_pet_frames.py \
  /home/katherine/Descargas/Katherine_PET_Netheris_50_frames.zip \
  /home/katherine/Descargas/Karen_PET_Netheris_50_frames.zip \
  /home/katherine/Descargas/Karencita_PET_Netheris_50_frames.zip
```

## Ejecutar

Desde `world-ui/`:

```bash
python3 -m http.server 8080
```

Abrir `http://localhost:8080`.

## Próximo paso

Iterar visualmente El Hogar con Franco y después formalizar el **World State Model**: contrato de eventos, cola de actividades, estados y transición entre tareas. La conexión con Platform Bridge se mantiene posterior a esa estabilización.
