from pathlib import Path
from PIL import Image

import json
import shutil
import os
import requests

project = Path(".").resolve()
common_assets = project / "assets" / "common"
lib_assets = project / "lib" / "mmk" / "assets"

print("Loading zepp devices list...")
zepp_devices = requests.get("https://raw.githubusercontent.com/melianmiko/ZeppOS-DevicesList/main/zepp_devices.json").json()

module = {
    "app-side": {
        "path": "app-side/index"
    },
    "setting": {
        "path": "setting/index"
    },
    "page": {
        "pages": [
            "page/amazfit/HomeScreen",
            "page/amazfit/FontSizeSetupScreen",
            "page/amazfit/ScreenBoardSetup",
            "page/amazfit/SettingsScreen",
            "page/amazfit/MarkdownReader",
            "page/amazfit/AboutScreen",
            "page/amazfit/NewNoteScreen",
            "page/amazfit/TaskEditScreen",
            "page/amazfit/DonatePage"
        ]
    },
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


with open("app.json", "r") as f:
  app_json = json.load(f)

# Generic icon
about_icon = Image.open(common_assets / "icon.png")
about_icon.thumbnail((100, 100))

# Prepare assets
for target_data in zepp_devices:
  target_id = target_data["id"]
  if target_id not in app_json["targets"]:
    print("Not supported:", target_id, target_data["deviceSource"])
    continue

  assets_dir = project / "assets" / target_id
  if assets_dir.is_dir():
    shutil.rmtree(assets_dir)
  assets_dir.mkdir()

  # App icon
  i = Image.open(common_assets / "icon.png")
  i.thumbnail((target_data['iconSize'], target_data['iconSize']))
  i.save(assets_dir / "icon.png")

  # Misc files
  about_icon.save(assets_dir / "icon_about.png")
  qr_file = "qr_small.png" if target_data["screenShape"] == "band" else "qr_normal.png"
  shutil.copy(common_assets / qr_file, assets_dir / "donate.png")

  # Spinner
  if target_data["screenShape"] == "band":
    shutil.copy(common_assets / "spinner_lowram.png", assets_dir / "spinner.png")
  else:
    shutil.copytree(common_assets / "spinner", assets_dir / "spinner")

  # Icons
  icons_size = 24 if target_data["screenShape"] == "band" else 32
  shutil.copytree(common_assets / f"icon_m_48", assets_dir / f"icon_m")
  shutil.copytree(common_assets / f"icon_s_{icons_size}", assets_dir / f"icon_s")

  # ScreenBaord data
  os.mkdir(assets_dir / "screen_board")
  for f in (lib_assets / "screen_board").iterdir():
    if f.name.endswith(".png"):
      shutil.copy(f, assets_dir / "screen_board" / f.name)

  shutil.copytree(lib_assets / "screen_board" / str(icons_size),
    assets_dir / "screen_board" / str(icons_size))

  # App.json
  app_json["targets"][target_id]["module"] = module

with open("app.json", "w") as f:
  f.write(json.dumps(app_json, indent=2))
