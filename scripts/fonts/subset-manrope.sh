#!/usr/bin/env bash
# Podzbiór Manrope dla strony (ADR 0024, zasady jak ADR 0021): łacinka, Latin-1, polskie litery
# i typografia, oś wght 400–800. Wynik: assets/fonts/manrope-pl.woff2. Licencja SIL OFL.
# Wymaga Pythona 3; fonttools instaluje się w katalogu tymczasowym, poza projektem.
set -euo pipefail

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
python3 -m venv "$work/venv"
"$work/venv/bin/pip" install --quiet fonttools brotli

curl -fsSL -o "$work/Manrope-VF.ttf" \
  "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/manrope/Manrope%5Bwght%5D.ttf"
"$work/venv/bin/python" -m fontTools.varLib.instancer "$work/Manrope-VF.ttf" \
  wght=400:800 -o "$work/Manrope-limited.ttf"

unicodes="U+0020-007E,U+00A0-00FF,U+0104-0107,U+0118-0119,U+0141-0144,U+015A-015B,U+0179-017C"
unicodes+=",U+2009,U+2011,U+2013-2014,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2032-2033"
unicodes+=",U+20AC,U+2122,U+2190-2193,U+2212,U+2605"

"$work/venv/bin/pyftsubset" "$work/Manrope-limited.ttf" --unicodes="$unicodes" \
  --layout-features='*' --flavor=woff2 --no-hinting \
  --output-file="$(dirname "$0")/../../assets/fonts/manrope-pl.woff2"
