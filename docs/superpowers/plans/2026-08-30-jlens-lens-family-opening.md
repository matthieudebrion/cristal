# J-lens Lens-Family Opening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Distill article opening with a lens-family start and delete the calculus warm-up, including its tangent-line figure and JS.

**Architecture:** One HTML file. Cut the two opening sections after the TOC, insert Distill-tagged TL;DR plus lens-family copy from the spec, then delete `renderFirstOrder` so leftover JS cannot resurrect the tangent plot.

**Tech Stack:** Distill `template.v2.js`, KaTeX delimiters already in front matter, inline diagrams in the same page script.

## Global Constraints

- Only `cristal/site/jacobian-lens.html`. Do not edit the vault markdown or `VOICE.md`.
- Distill inline `$ $` and display `$$ $$`. Do not convert the article to display-only math.
- No em dashes.
- Right-multiply: `unembed(\mathbf{h}_\ell J_\ell)`, never `J_\ell \mathbf{h}_\ell`.
- Do not call `J_\ell` a change of basis.
- Keep the existing J-lens `.definition` box wording unchanged.
- Do not publish. Do not commit unless the user asks.
- Leave title, byline, glossary, and every section from "The Model as a (Locally Linear) Function" onward unchanged except the JS cleanup.

---

### Task 1: Replace the opening HTML

**Files:**
- Modify: `cristal/site/jacobian-lens.html` lines 60–143 (from `<h2>Where the Logit Lens Breaks Down</h2>` through the "Pause and think: shapes" `</details>`, exclusive of `<h2>The Model as a (Locally Linear) Function</h2>`)

**Interfaces:**
- Consumes: spec opening copy; existing J-lens definition box (lines 68–70)
- Produces: first heading after TOC is "The Lens Family"; glossary anchors `#logit-lens` and `#tuned-lens` still used

- [ ] **Step 1: Grep the current opening so the cut is checkable**

Run from `cristal/site`:

```bash
rg -n "Where the Logit Lens Breaks Down|Warm-Up: Derivatives|The Lens Family|The Model as a" jacobian-lens.html
```

Expected: first two headings present, "The Lens Family" absent, "The Model as a" present.

- [ ] **Step 2: Replace the cut block with this HTML**

```html
    <p><strong>TL;DR.</strong> The Jacobian lens (J-lens) characterizes an intermediate activation by its first-order causal effect on the final residual stream. It averages that effect across prompts and positions, then decodes it with the model's unembedding.</p>

    <h2>The Lens Family</h2>

    <h3>How does the Jacobian lens differ from the logit lens?</h3>

    <p>The <a href="#logit-lens">logit lens</a> applies the model's unembedding matrix $W_U$ (typically after a final layer norm) directly to an intermediate residual $\mathbf{h}_\ell$ and reads off a vocabulary distribution:</p>

    $$
    \operatorname{LogitLens}(\mathbf{h}_\ell)
    =
    \operatorname{unembed}(\mathbf{h}_\ell).
    $$

    <p>This skips the remaining layers $\ell+1,\ldots,L$ and treats the current residual as if it were already the final residual. The assumption is that intermediate representations live in the same coordinates as the final layer. That often works in late layers. In early layers the projections are often incoherent: the information may be present, but not yet in the coordinates $W_U$ expects.</p>

    <h3>Jacobian lens</h3>

    <p>The Jacobian lens keeps that same last decoding step, but first applies a linear map that approximates the skipped layers. The construction is due to Gurnee, Lindsey, and collaborators<d-cite key="gurnee2026workspace"></d-cite>.</p>

    $$
    \operatorname{JacobianLens}(\mathbf{h}_\ell)
    =
    \operatorname{unembed}(\mathbf{h}_\ell J_\ell),
    $$

    <p>where</p>

    $$
    J_\ell
    =
    \mathbb{E}\left[
    \left(\frac{\partial \mathbf{h}_{\mathrm{final}}}
         {\partial \mathbf{h}_\ell}\right)^{T}
    \right].
    $$

    <p>That Jacobian is a local, first-order linearization of a nonlinear map, not a trained probe. The logit lens is the special case</p>

    $$
    J_\ell = I.
    $$

    <div class="definition">
      <strong>Jacobian Lens (J-lens):</strong> A per-layer vocabulary readout obtained by (1) computing the Jacobian of the final residual stream with respect to an intermediate residual stream, (2) averaging that Jacobian over token positions and a corpus of prompts, and (3) composing the resulting matrix with the unembedding. It surfaces concepts the model is <em>poised to verbalize</em>, whether or not they appear in the next token.
    </div>

    <p>The <a href="#tuned-lens">tuned lens</a> instead learns a per-layer map to match output distributions. We return to it when comparing the three lenses.</p>
```

- [ ] **Step 3: Grep that the old opening is gone and the new one is right-multiply**

```bash
rg -n "Where the Logit Lens Breaks Down|Warm-Up: Derivatives|jl-fo-plot|The Lens Family|J_\\\\ell \\\\mathbf|unembed\(\\\\mathbf\{h\}_\\\\ell J_\\\\ell\)" jacobian-lens.html
```

Expected: "The Lens Family" present; old headings and `jl-fo-plot` absent; `unembed(\mathbf{h}_\ell J_\ell)` present; no `J_\ell\mathbf{h}`.

Do not commit.

---

### Task 2: Delete tangent-line JS

**Files:**
- Modify: `cristal/site/jacobian-lens.html` `renderFirstOrder` function (comment `// --- First-order approximation diagram ---` through the function's closing `}`, immediately before `// --- Jacobian shape diagram`) and the `renderFirstOrder();` line in `init()`

**Interfaces:**
- Consumes: Task 1 (no `#jl-fo-plot` in the DOM)
- Produces: `init()` calls only `renderShape`, `renderAveraging`, `renderLayers`

- [ ] **Step 1: Confirm the function bounds**

```bash
rg -n "renderFirstOrder|renderShape|function init" jacobian-lens.html
```

Expected: `renderFirstOrder` definition, a call in `init`, then `renderShape`.

- [ ] **Step 2: Delete `renderFirstOrder` and its `init()` call**

Remove the whole function. `init()` must become:

```javascript
  function init() {
    renderShape();
    renderAveraging();
    renderLayers();
  }
```

Leave `curve`, `tangent`, `truePoint`, `predPoint` in `themeAware`.

- [ ] **Step 3: Confirm JS is gone**

```bash
rg -n "renderFirstOrder|jl-fo-" jacobian-lens.html
```

Expected: no matches.

Do not commit.

---

### Task 3: Browser verification

**Files:**
- Test: `cristal/site/jacobian-lens.html` served or opened locally

**Interfaces:**
- Consumes: Tasks 1–2
- Produces: checklist evidence from a live page

- [ ] **Step 1: Open the article in the browser**

Prefer `file:///Users/debrion/current/cristal/site/jacobian-lens.html` or the existing Distill static server if one is already running.

- [ ] **Step 2: Check the spec checklist**

1. First heading after the TOC is "The Lens Family". No "Where the Logit Lens Breaks Down", no calculus warm-up, no tangent-line sliders.
2. Visible formulas include `h_ℓ J_ℓ`, not `J_ℓ h_ℓ`.
3. Logit-lens and tuned-lens links jump to glossary entries.
4. Averaging heatmap slider, Jacobian-shape diagram, and layer-compression toggle still work.
5. No em dash in the new opening.

- [ ] **Step 3: Report gaps or completion with that evidence**

Do not claim done without the browser pass. Do not commit. Do not publish.
