from pathlib import Path
from PIL import Image

import json
import shutil
import os

project = Path(".").resolve()
common_assets = project / "assets" / "common"
lib_assets = project / "lib" / "mmk" / "assets"

pages = [
  "HomeScreen",
  "FontSizeSetupScreen",
  "ScreenBoardSetup",
  "SettingsScreen",
  "MarkdownReader",
  "AboutScreen",
  "NewNoteScreen",
  "TaskEditScreen",
  "DonatePage"
]

module = {
  "app-side": {
    "path": "app-side/index"
  },
  "setting": {
    "path": "setting/index"
  }
}

generic_target_big_screen = {
    "class": "amazfit",
    "icon_s": 32,
    "icon_m": 48,
    "low_ram_spinner": False,
    "qr": "normal",
}

mi_band_config = {
    "class": "miband7",
    "icon_s": 24,
    "icon_m": 48,
    "low_ram_spinner": True,
    "qr": "small",
}

targets = {
  "gts-4-mini": generic_target_big_screen,
  "mi-band-7": mi_band_config,
  "mi-band-7-offline": mi_band_config,
  "band-7": {
    "icon_size": 100,
    "class": "amazfit",
    "icon_s": 24,
    "icon_m": 48,
    "low_ram_spinner": True,
    "qr": "small",
  },
  "t-rex-ultra": generic_target_big_screen,
  "gtr-mini": generic_target_big_screen,
  "balance": generic_target_big_screen,
  "gtr-4": generic_target_big_screen,
  "gts-4": generic_target_big_screen,
  "falcon": generic_target_big_screen,
  "cheetah": generic_target_big_screen,
  "cheetah-pro": generic_target_big_screen,
  "gtr-3-pro": generic_target_big_screen,
  "gtr-3": generic_target_big_screen,
  "gts-3": generic_target_big_screen,
  "t-rex-2": generic_target_big_screen,
}

target_icon_size = {
  "gts-4-mini": 80,
  "mi-band-7": 100,
  "mi-band-7-offline": 100,
  "band-7": 100,
  "t-rex-ultra": 124,
  "gtr-mini": 124,
  "balance": 248,
  "gtr-4": 248,
  "gts-4": 124,
  "falcon": 80,
  "cheetah": 124,
  "cheetah-pro": 124,
  "gtr-3-pro": 92,
  "gtr-3": 86,
  "gts-3": 92,
  "t-rex-2": 86,
}

with open("app.json", "r") as f:
  app_json = json.load(f)

# Generic icon
app_icon_src = Image.open(common_assets / "icon.png")
app_icon = Image.new("RGB", app_icon_src.size, color="#000000")
app_icon.paste(app_icon_src)
about_icon = app_icon.copy()
about_icon.thumbnail((100, 100))

# Prepare assets
for target_id in targets:
  data = targets[target_id]
  assets_dir = project / "assets" / target_id
  if assets_dir.is_dir():
    shutil.rmtree(assets_dir)
  assets_dir.mkdir()

  # App icon
  icon_size = target_icon_size[target_id]
  icon_item = app_icon.copy()
  icon_item.thumbnail((icon_size, icon_size))
  icon_item.save(assets_dir / "icon.png")

  # Misc files
  about_icon.save(assets_dir / "icon_about.png")
  shutil.copy(common_assets / f"qr_{data['qr']}.png", assets_dir / "donate.png")

  # Spinner
  if data["low_ram_spinner"]:
    shutil.copy(common_assets / "spinner_lowram.png", assets_dir / "spinner.png")
  else:
    shutil.copytree(common_assets / "spinner", assets_dir / "spinner")

  # Icons
  for group in ["s", "m"]:
    size = data[f"icon_{group}"]
    shutil.copytree(common_assets / f"icon_{group}_{size}", assets_dir / f"icon_{group}")

  # ScreenBaord data
  os.mkdir(assets_dir / "screen_board")
  for f in (lib_assets / "screen_board").iterdir():
    if f.name.endswith(".png"):
      shutil.copy(f, assets_dir / "screen_board" / f.name)

  shutil.copytree(lib_assets / "screen_board" / str(data["icon_s"]),
    assets_dir / "screen_board" / str(data["icon_s"]))

  # App.json
  app_json["targets"][target_id]["module"] = {
    "page": {
      "pages": [f"page/{data['class']}/{i}" for i in pages]
    },
    **module
  }

  if target_id.endswith("-offline"):
    app_json["targets"][target_id]["module"]["page"]["pages"][0] = f"page/{data['class']}/HomeScreenOffline"

with open("app.json", "w") as f:
  f.write(json.dumps(app_json, indent=2))
