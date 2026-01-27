#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INPUT_PATH="${1:-$ROOT_DIR/code/mobile/产品报告.md}"
OUTPUT_PATH="${2:-${INPUT_PATH%.md}.pdf}"

MAIN_FONT="${MAIN_FONT:-PingFang SC}"
CJK_FONT="${CJK_FONT:-$MAIN_FONT}"
MONO_FONT="${MONO_FONT:-Menlo}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command '$1' not found." >&2
    exit 1
  fi
}

require_cmd pandoc
require_cmd python3
require_cmd npx
require_cmd xelatex

export INPUT_PATH OUTPUT_PATH MAIN_FONT CJK_FONT MONO_FONT

python3 - <<'PY'
import os
import re
import subprocess
import tempfile
from pathlib import Path

input_path = Path(os.environ['INPUT_PATH']).expanduser().resolve()
output_path = Path(os.environ['OUTPUT_PATH']).expanduser().resolve()
main_font = os.environ.get('MAIN_FONT', 'PingFang SC')
cjk_font = os.environ.get('CJK_FONT', main_font)
mono_font = os.environ.get('MONO_FONT', 'Menlo')

if not input_path.exists():
    raise SystemExit(f"Input markdown not found: {input_path}")

text = input_path.read_text()
pattern = re.compile(r"```mermaid\n(.*?)\n```", re.S)
blocks = []

def repl(match):
    blocks.append(match.group(1).strip())
    idx = len(blocks)
    token = f"__MERMAID_IMAGE_{idx}__"
    return f"![Mermaid Diagram {idx}](<{token}>)"

rendered = pattern.sub(repl, text)

if not blocks:
    subprocess.run([
        'pandoc',
        str(input_path),
        '-o', str(output_path),
        '--pdf-engine=xelatex',
        '-V', f'mainfont={main_font}',
        '-V', f'CJKmainfont={cjk_font}',
        '-V', f'monofont={mono_font}',
    ], check=True)
    raise SystemExit(0)

with tempfile.TemporaryDirectory(prefix='mermaid-render-') as tmpdir:
    tmpdir_path = Path(tmpdir)
    image_paths = []

    for idx, code in enumerate(blocks, start=1):
        mmd_path = tmpdir_path / f'mermaid-{idx}.mmd'
        png_path = tmpdir_path / f'mermaid-{idx}.png'
        mmd_path.write_text(code)
        subprocess.run([
            'npx', '-y', '@mermaid-js/mermaid-cli',
            '-i', str(mmd_path),
            '-o', str(png_path),
            '-b', 'transparent',
            '--scale', '2',
        ], check=True)
        image_paths.append(png_path)

    for idx, img_path in enumerate(image_paths, start=1):
        token = f"__MERMAID_IMAGE_{idx}__"
        rendered = rendered.replace(token, img_path.as_posix())

    with tempfile.NamedTemporaryFile('w', suffix='.md', delete=False) as tmp_md:
        tmp_md_path = Path(tmp_md.name)
        tmp_md.write(rendered)

    try:
        subprocess.run([
            'pandoc',
            str(tmp_md_path),
            '-o', str(output_path),
            '--pdf-engine=xelatex',
            '-V', f'mainfont={main_font}',
            '-V', f'CJKmainfont={cjk_font}',
            '-V', f'monofont={mono_font}',
        ], check=True)
    finally:
        try:
            tmp_md_path.unlink()
        except FileNotFoundError:
            pass
PY

echo "PDF generated: $OUTPUT_PATH"
