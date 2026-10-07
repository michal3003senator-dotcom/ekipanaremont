#!/usr/bin/env bash
# Podzbiór Archivo dla strony (ADR 0021): alfabet łaciński, Latin-1, polskie litery i typografia,
# osie wght 400–600 i wdth 100–108. Wynik: assets/fonts/archivo-pl.woff2 (~40 KB zamiast ~176 KB).
# Wymaga Pythona 3; fonttools instaluje się w katalogu tymczasowym, poza projektem.
set -euo pipefail

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
python3 -m venv "$work/venv"
"$work/venv/bin/pip" install --quiet fonttools brotli

curl -fsSL -o "$work/Archivo-VF.ttf" \
  "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/archivo/Archivo%5Bwdth,wght%5D.ttf"
"$work/venv/bin/python" -m fontTools.varLib.instancer "$work/Archivo-VF.ttf" \
  wght=400:600 wdth=100:108 -o "$work/Archivo-limited.ttf"

unicodes="U+0020-007E,U+00A0-00FF,U+0104-0107,U+0118-0119,U+0141-0144,U+015A-015B,U+0179-017C"
unicodes+=",U+2009,U+2011,U+2013-2014,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2032-2033"
unicodes+=",U+20AC,U+2122,U+2190-2193,U+2212"

"$work/venv/bin/pyftsubset" "$work/Archivo-limited.ttf" --unicodes="$unicodes" \
  --layout-features='*' --flavor=woff2 --no-hinting \
  --output-file="$(dirname "$0")/../../assets/fonts/archivo-pl.woff2"
