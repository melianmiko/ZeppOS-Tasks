from pathlib import Path
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
  "AboutScreen",
  "NewNoteScreen",
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
    "icon_size": 80,
    "class": "amazfit",
    "icon_s": 32,
    "icon_m": 48,
    "low_ram_spinner": False,
    "qr": "normal",
}

mi_band_config = {
    "icon_size": 100,
    "class": "miband7",
    "icon_s": 24,
    "icon_m": 48,
    "low_ram_spinner": True,
    "qr": "small",
}

targets = {
  "gts-4-mini": generic_target_big_screen,
  "band-7": {
    "icon_size": 80,
    "class": "amazfit",
    "icon_s": 24,
    "icon_m": 48,
    "low_ram_spinner": True,
    "qr": "small",
  },
  "mi-band-7": mi_band_config,
  "mi-band-7-offline": mi_band_config,
  "t-rex-ultra": generic_target_big_screen,
  "gtr-mini": generic_target_big_screen,
  "gtr-4": generic_target_big_screen,
  "gts-4": generic_target_big_screen,
  "falcon": generic_target_big_screen,
  "gtr-3-pro": generic_target_big_screen,
  "gtr-3": generic_target_big_screen,
  "gts-3": generic_target_big_screen,
  "t-rex-2": generic_target_big_screen,
}

with open("app.json", "r") as f:
  app_json = json.load(f)


# Prepare assets
for target_id in targets:
  data = targets[target_id]
  assets_dir = project / "assets" / target_id
  if assets_dir.is_dir():
    shutil.rmtree(assets_dir)
  assets_dir.mkdir()

  # Icon
  shutil.copy(common_assets / f"icon{data['icon_size']}.png", assets_dir / "icon.png")

  # Spinner
  if data["low_ram_spinner"]:
    shutil.copy(common_assets / "spinner_lowram.png", assets_dir / "spinner.png")
  else:
    shutil.copytree(common_assets / "spinner", assets_dir / "spinner")

  # Donate QR
  shutil.copy(common_assets / f"qr_{data['qr']}.png", assets_dir / "donate.png")

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
