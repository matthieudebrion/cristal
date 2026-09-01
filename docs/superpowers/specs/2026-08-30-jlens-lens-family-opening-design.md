# J-lens Distill opening: lens family, drop calculus warm-up

Date: 2026-08-30
Status: implemented 2026-08-30

## Goal

Replace the Distill article opening so it starts from logit lens vs Jacobian lens, not from a calculus warm-up. Polish the user's lens-family draft into Distill HTML. Do not publish.

## File

Only `cristal/site/jacobian-lens.html`.

Do not edit `public-vault/content/The Jacobian Lens.md` or `jlens/VOICE.md` in this pass.

## Cut points

Delete, in one block, everything from `<h2>Where the Logit Lens Breaks Down</h2>` through the end of the warm-up (the "Pause and think: shapes" details), exclusive of `<h2>The Model as a (Locally Linear) Function</h2>`.

Insert the new opening in that gap, still after `<d-toc></d-toc>`.

Leave title, byline, description, bibliography, glossary, and every section from "The Model as a (Locally Linear) Function" onward unchanged, except the JS cleanup below.

## New opening (structure)

1. A **TL;DR** paragraph (not a heading).
2. `<h2>The Lens Family</h2>`
3. `<h3>How does the Jacobian lens differ from the logit lens?</h3>` then the logit-lens formula and why early layers fail.
4. Jacobian-lens formula with right-multiply, then `J_\ell = I` as the logit-lens special case.
5. Keep the existing `.definition` box, wording unchanged.
6. One sentence pointing at the tuned lens (`#tuned-lens`) and the later comparison section. No tuned-lens formulas in the opening.

## Math and wording constraints

- Distill inline `$ $` and display `$$ $$`, matching the rest of this file. Do not convert the article to display-only math.
- No em dashes.
- Right-multiply throughout the opening: `unembed(\mathbf{h}_\ell J_\ell)`, never `J_\ell \mathbf{h}_\ell`. This matches later sections (`\mathbf{h}_\ell \, J_\ell`).
- Do not call `J_\ell` a change of basis. Call it a linear map / first-order linearization of the remaining layers. It need not be invertible or orthogonal.
- Logit-lens glossary link: `<a href="#logit-lens">`.
- Cite the paper once in the Jacobian paragraph: `<d-cite key="gurnee2026workspace"></d-cite>`.
- Use Distill `<aside>` for margin notes, not `{% sidenote %}`. The opening does not need a new aside; the residual-stream section already has the `t' \ge t` aside.

## Opening copy (canonical)

Use this wording, Distill-tagged:

**TL;DR.** The Jacobian lens (J-lens) characterizes an intermediate activation by its first-order causal effect on the final residual stream. It averages that effect across prompts and positions, then decodes it with the model's unembedding.

Logit lens: applies unembedding (typically after final layer norm) directly to `\mathbf{h}_\ell`, skips layers `\ell+1,\ldots,L`, and treats the current residual as if it were already final. That often works in late layers. In early layers the projections are often incoherent: the information may be present, but not yet in the coordinates `W_U` expects.

```
\operatorname{LogitLens}(\mathbf{h}_\ell) = \operatorname{unembed}(\mathbf{h}_\ell)
```

Jacobian lens: same last decoding step, after a linear map that approximates the skipped layers.

```
\operatorname{JacobianLens}(\mathbf{h}_\ell) = \operatorname{unembed}(\mathbf{h}_\ell J_\ell)
```

```
J_\ell = \mathbb{E}\left[\left(\frac{\partial \mathbf{h}_{\mathrm{final}}}{\partial \mathbf{h}_\ell}\right)^{T}\right]
```

That Jacobian is a local, first-order linearization of a nonlinear map, not a trained probe. Logit lens is the special case `J_\ell = I`.

Tuned lens: one sentence, link to `#tuned-lens`, "we return to it when comparing the three lenses."

## Dead code to remove

The tangent-line figure lives only in the deleted warm-up. Remove:

- `function renderFirstOrder() { ... }` (through the MutationObserver, before `renderShape`)
- the `renderFirstOrder();` call in `init()`

Leave `renderShape`, `renderAveraging`, and `renderLayers`. Theme colors used only by the tangent plot (`curve`, `tangent`, `truePoint`, `predPoint`) may stay; they are harmless.

## Out of scope

- Syncing the vault markdown or `VOICE.md`
- Publishing or deploying
- Rewriting later sections, the comparison table, or the glossary
- New figures in the opening
- Changing the page subtitle / front-matter description

## Verification

Open `cristal/site/jacobian-lens.html` in the browser. Check:

1. First heading after the TOC is "The Lens Family". No "Where the Logit Lens Breaks Down", no calculus warm-up, no tangent-line sliders.
2. Formulas use `\mathbf{h}_\ell J_\ell`, not `J_\ell\mathbf{h}_\ell`.
3. Logit-lens and tuned-lens links jump to glossary entries.
4. Averaging heatmap, Jacobian-shape diagram, and layer-compression toggle still work.
5. No em dash in the new opening.
