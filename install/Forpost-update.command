#!/bin/bash
cd "$(dirname "$0")"
echo "=== Forpost: update modpack ==="
[ -f packwiz-installer-bootstrap.jar ] || curl -L -o packwiz-installer-bootstrap.jar https://github.com/packwiz/packwiz-installer-bootstrap/releases/latest/download/packwiz-installer-bootstrap.jar
java -jar packwiz-installer-bootstrap.jar https://raw.githubusercontent.com/Badyaa/forpost-pack/main/pack.toml || { echo "ERROR: is Java 17 installed?"; read -p "Enter..."; exit 1; }
echo "Done. You can start the game."
