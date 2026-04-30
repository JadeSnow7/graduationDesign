# Thesis Translation DOCX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all formula/figure placeholders in `paper-translations.md` and generate a HUST-compliant `attention-is-all-you-need-full.docx` from it.

**Architecture:** (1) Patch `paper-translations.md` in-place — fill blank formula lines with LaTeX, fix section headings, strip inline formatting instructions. (2) Extract figure images from PDF via PyMuPDF. (3) Run pandoc `--from markdown+tex_math_dollars --to docx --reference-doc hust-ref.docx` to convert to OMML-based Word document with proper A4/SimSun styling.

**Tech Stack:** Python 3.9 + PyMuPDF (fitz) + Pillow, pandoc 3.8.3, python-docx (template setup), Node docx library (already installed)

---

## File Map

| Action | Path |
|--------|------|
| Modify | `academic/literature/translations/paper-translations.md` |
| Create | `academic/literature/extract_figures.py` |
| Create | `academic/literature/translations/figures/fig1_transformer_architecture.png` |
| Create | `academic/literature/translations/figures/fig2_combined.png` |
| Create | `academic/literature/setup_hust_template.py` |
| Create | `academic/literature/translations/hust-ref.docx` |
| Overwrite | `academic/literature/translations/attention-is-all-you-need-full.docx` |

---

## Task 1: Fix paper-translations.md — formulas & headings

**Files:**
- Modify: `academic/literature/translations/paper-translations.md`

All formula lines are currently a single space ` `. Fill them in with LaTeX. Also fix section 3.5 title and inline formatting hints.

- [ ] **Step 1: Open the file and apply all fixes**

Exact changes (in order):

1. Line 45 — remove formatting instruction line `（宋体小4号加粗...）`
2. Line 53 — remove `（宋体5号加粗...）`
3. Line 58 — remove `（宋体5号，行间距...）`
4. Line 68 (blank before "图 1") → replace blank ` ` line with image reference:
   `![图1](figures/fig1_transformer_architecture.png)`
5. Line 72 — `编码器由  个` → `编码器由 $N=6$ 个`
6. Line 75 — `即  ，` → `即 $\text{LayerNorm}(x + \text{Sublayer}(x))$，`
7. Line 75 — `输出维度均设为 。` → `输出维度均设为 $d_{\text{model}}=512$。`
8. Line 76 — `解码器同样由  个` → `解码器同样由 $N=6$ 个`
9. Line 83 (blank before "图 2") → `![图2](figures/fig2_combined.png)`
10. Line 87 (blank formula) → `$$\text{Attention}(Q,K,V) = \text{softmax}\!\left(\frac{QK^T}{\sqrt{d_k}}\right)V \tag{1}$$`
11. Line 88 — `缩放因子  用于` → `缩放因子 $\frac{1}{\sqrt{d_k}}$ 用于`
12. Line 91 (blank) → `$$\text{MultiHead}(Q,K,V) = \text{Concat}(\text{head}_1,\ldots,\text{head}_h)W^O \tag{2}$$`
13. Line 93 (blank) → `$$\text{head}_i = \text{Attention}(QW_i^Q, KW_i^K, VW_i^V) \tag{3}$$`
14. Line 94 — `采用  个注意力头，每个头的维度为  。` → `采用 $h=8$ 个注意力头，每个头的维度为 $d_k=d_v=d_{\text{model}}/h=64$。`
15. Line 105 (blank) → `$$\text{FFN}(x) = \max(0,\,xW_1+b_1)W_2+b_2 \tag{4}$$`
16. Line 106 — `中间层维度为  ，输入输出维度均为  。` → `中间层维度为 $d_{ff}=2048$，输入输出维度均为 $d_{\text{model}}=512$。`
17. Line 108 — `映射到  维空间` → `映射到 $d_{\text{model}}$ 维空间`
18. Line 108 — `乘以  进行缩放` → `乘以 $\sqrt{d_{\text{model}}}$ 进行缩放`
19. Lines 111-114 — fix table LaTeX notation from `(O(...))` to `$O(...)$`
20. **Line 117 — fix section heading** `3.5 嵌入和归一化` → `3.5 位置编码`
21. Lines 120-121 (two blank formula lines) → 
    - `$$PE_{(pos,2i)} = \sin\!\left(\frac{pos}{10000^{2i/d_{\text{model}}}}\right) \tag{5}$$`
    - `$$PE_{(pos,2i+1)} = \cos\!\left(\frac{pos}{10000^{2i/d_{\text{model}}}}\right) \tag{6}$$`
22. Line 125 — `•	为什么选择自注意力机制` → `4. 为什么选择自注意力机制`
23. Lines 150-152 (three blank Adam param lines) → 
    - `$\beta_1=0.9$`、`$\beta_2=0.999$`、`$\varepsilon=10^{-9}$`
24. Line 154 (blank lrate) → `$$\text{lrate} = d_{\text{model}}^{-0.5} \cdot \min(\text{step}^{-0.5},\; \text{step} \cdot \text{warmup\_steps}^{-1.5}) \tag{7}$$`
25. Line 158 — `按  衰减` → `按 $\text{step}^{-0.5}$ 衰减`
26. Line 159 — `warmup_steps = 4000` (keep as-is, already correct)
27. Lines 162, 169, 171 (blank dropout/smoothing values) → `$P_{drop}=0.1$`, `$P_{drop}=0.1$`, `$\varepsilon_{ls}=0.1$`
28. Lines 257-299 — delete template example boilerplate (图2-1/表2-1/参考文献原文 placeholder block)

- [ ] **Step 2: Verify the file has no more blank formula lines**

```bash
grep -n "^[ 　]*$" academic/literature/translations/paper-translations.md | head -20
```

Expected: only truly empty paragraph breaks remain, not formula placeholders.

- [ ] **Step 3: Commit**

```bash
git add academic/literature/translations/paper-translations.md
git commit -m "fix: fill formula and figure placeholders in paper-translations.md"
```

---

## Task 2: Extract figures from PDF

**Files:**
- Create: `academic/literature/extract_figures.py`
- Create: `academic/literature/translations/figures/` (directory + 3 PNGs)

- [ ] **Step 1: Write extraction script**

```python
# academic/literature/extract_figures.py
import fitz
from PIL import Image
import io, os

PDF = "papers/1706.03762v7.pdf"
OUT = "translations/figures/"
os.makedirs(OUT, exist_ok=True)

doc = fitz.open(PDF)

# Figure 1 — Transformer architecture (page 3, index 2)
page3 = doc[2]
imgs = page3.get_images(full=True)
xref = imgs[0][0]
img = doc.extract_image(xref)
with open(OUT + "fig1_transformer_architecture.png", "wb") as f:
    f.write(img["image"])
print(f"fig1: {img['width']}x{img['height']}")

# Figure 2 — Attention diagrams (page 4, index 3)
page4 = doc[3]
imgs = page4.get_images(full=True)
parts = []
for info in imgs:
    xref = info[0]
    img = doc.extract_image(xref)
    parts.append(Image.open(io.BytesIO(img["image"])))
    print(f"fig2 part: {img['width']}x{img['height']}")

# Combine side-by-side
h = min(p.height for p in parts)
resized = [p.resize((int(p.width * h / p.height), h), Image.LANCZOS) for p in parts]
total_w = sum(p.width for p in resized) + 20 * (len(resized) - 1)
canvas = Image.new("RGB", (total_w, h), "white")
x = 0
for p in resized:
    canvas.paste(p, (x, 0))
    x += p.width + 20
canvas.save(OUT + "fig2_combined.png")
print("fig2_combined saved")
doc.close()
```

- [ ] **Step 2: Install Pillow if needed and run**

```bash
pip3 install Pillow -q
cd /Users/huaodong/graduationDesign/academic/literature
python3 extract_figures.py
```

Expected output:
```
fig1: 1520x2239
fig2 part: 445x884
fig2 part: 835x1282
fig2_combined saved
```

- [ ] **Step 3: Verify files exist**

```bash
ls -lh translations/figures/
```

Expected: `fig1_transformer_architecture.png` (~120 KB) and `fig2_combined.png`.

---

## Task 3: Create HUST pandoc reference DOCX

**Files:**
- Create: `academic/literature/setup_hust_template.py`
- Create: `academic/literature/translations/hust-ref.docx`

- [ ] **Step 1: Bootstrap reference docx**

```bash
pip3 install python-docx -q
cd /Users/huaodong/graduationDesign/academic/literature
pandoc --print-default-data-file reference.docx > translations/hust-ref.docx
```

- [ ] **Step 2: Write template setup script**

```python
# academic/literature/setup_hust_template.py
from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn

DOCX = "translations/hust-ref.docx"
doc = Document(DOCX)

# A4 page, 2.54cm margins
s = doc.sections[0]
s.page_width  = Cm(21)
s.page_height = Cm(29.7)
for attr in ('left_margin','right_margin','top_margin','bottom_margin'):
    setattr(s, attr, Cm(2.54))

def set_font(style, cn_font, en_font, size_pt, bold=False, align=None):
    style.font.name = en_font
    style.font.size = Pt(size_pt)
    style.font.bold = bold
    r = style.element.get_or_add_rPr()
    rFonts = r.get_or_add_rFonts()
    rFonts.set(qn('w:eastAsia'), cn_font)
    if align:
        style.paragraph_format.alignment = align

# Normal: SimSun 五号 (10.5pt) + Times New Roman
set_font(doc.styles['Normal'], '宋体', 'Times New Roman', 10.5)

# Heading 1: SimSun 小四 (12pt) bold centered
set_font(doc.styles['Heading 1'], '宋体', 'Times New Roman', 12, bold=True,
         align=WD_ALIGN_PARAGRAPH.CENTER)

# Heading 2: SimSun 五号 bold
set_font(doc.styles['Heading 2'], '宋体', 'Times New Roman', 10.5, bold=True)

# Heading 3: SimSun 五号 bold
set_font(doc.styles['Heading 3'], '宋体', 'Times New Roman', 10.5, bold=True)

doc.save(DOCX)
print("hust-ref.docx updated")
```

- [ ] **Step 3: Run template setup**

```bash
cd /Users/huaodong/graduationDesign/academic/literature
python3 setup_hust_template.py
```

Expected: `hust-ref.docx updated`

---

## Task 4: Generate final DOCX via pandoc

**Files:**
- Overwrite: `academic/literature/translations/attention-is-all-you-need-full.docx`

- [ ] **Step 1: Run pandoc conversion**

```bash
cd /Users/huaodong/graduationDesign/academic/literature/translations
pandoc paper-translations.md \
  --from=markdown+tex_math_dollars+raw_attribute \
  --to=docx \
  --reference-doc=hust-ref.docx \
  --resource-path=. \
  --standalone \
  --output=attention-is-all-you-need-full.docx
```

- [ ] **Step 2: Verify output**

```bash
python3 -c "
import zipfile, xml.etree.ElementTree as ET
with zipfile.ZipFile('attention-is-all-you-need-full.docx') as z:
    with z.open('word/document.xml') as f:
        content = f.read().decode()
    math_count = content.count('m:oMath')
    print(f'OMML formulas: {math_count}')
    print(f'File size: {z.fp.seek(0,2)} bytes')
    has_img = 'word/media' in str(z.namelist())
    print(f'Has images: {has_img}')
"
```

Expected: `math_count >= 20`, file size > 200 KB (figures embedded), `Has images: True`.

- [ ] **Step 3: Commit all new files**

```bash
cd /Users/huaodong/graduationDesign
git add academic/literature/translations/paper-translations.md \
        academic/literature/translations/attention-is-all-you-need-full.docx \
        academic/literature/extract_figures.py \
        academic/literature/setup_hust_template.py
git commit -m "feat: generate HUST thesis translation docx with OMML formulas and figures"
```

---

## Self-Review

- **Formula coverage**: All 8 key formulas + table LaTeX cells + inline variables covered.
- **Figure coverage**: fig1 (architecture) and fig2 (combined attention diagrams) both extracted and referenced.
- **Table coverage**: 4 tables already in MD as pipe-delimited — pandoc converts these to Word tables automatically.
- **Cover page**: paper-translations.md lines 1–43 contain the HUST cover/requirements/advisor sections — kept as-is (plain text, formatted by reference doc styles).
- **Section 6.3 gap**: Existing in source MD — not a formatting issue, reflects the original paper's section numbering.
- **No placeholders**: All `TBD`-style items have concrete code/commands.
