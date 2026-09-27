#!/usr/bin/env python3
"""Importa los ZIP PET de Katherine, Karen y Karencita a assets/pets/."""

from __future__ import annotations

import re
import shutil
import sys
import zipfile
from pathlib import Path

AGENTS = {
    "katherine": "katherine",
    "karen_pet": "karen",
    "karencita": "karencita",
}

FRAME_RE = re.compile(r"(?P<name>katherine|karen|karencita)_pet_frame_(?P<num>\d{3})\.png$", re.I)


def detect_agent(zip_path: Path) -> str:
    name = zip_path.name.lower()
    if name.startswith("katherine_"):
        return "katherine"
    if name.startswith("karencita_"):
        return "karencita"
    if name.startswith("karen_"):
        return "karen"
    raise ValueError(f"No pude identificar personaje por nombre: {zip_path.name}")


def import_zip(zip_path: Path, dest_root: Path) -> tuple[str, int]:
    agent = detect_agent(zip_path)
    dest = dest_root / agent
    dest.mkdir(parents=True, exist_ok=True)
    count = 0

    with zipfile.ZipFile(zip_path) as zf:
        for member in zf.infolist():
            base = Path(member.filename).name
            match = FRAME_RE.match(base)
            if not match:
                continue
            number = match.group("num")
            target = dest / f"frame_{number}.png"
            with zf.open(member) as src, target.open("wb") as out:
                shutil.copyfileobj(src, out)
            count += 1

    if count != 50:
        raise RuntimeError(f"{agent}: esperaba 50 frames y encontré {count}")

    return agent, count


def main() -> int:
    if len(sys.argv) < 4:
        print(
            "Uso:\n"
            "  python3 scripts/import_pet_frames.py "
            "/ruta/Katherine_PET_Netheris_50_frames.zip "
            "/ruta/Karen_PET_Netheris_50_frames.zip "
            "/ruta/Karencita_PET_Netheris_50_frames.zip"
        )
        return 2

    world_ui = Path(__file__).resolve().parent.parent
    dest_root = world_ui / "assets" / "pets"

    for value in sys.argv[1:]:
        path = Path(value).expanduser().resolve()
        if not path.is_file():
            raise FileNotFoundError(path)
        agent, count = import_zip(path, dest_root)
        print(f"OK {agent}: {count} frames -> {dest_root / agent}")

    print("\nListo. Recarga http://localhost:8080")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
