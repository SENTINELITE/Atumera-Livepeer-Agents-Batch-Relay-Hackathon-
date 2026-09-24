# Batch Relay Creative

[Batch Relay](https://batchrelay.com) · Atumera Livepeer Agent Hackathon project

**Live demo:** [Creative desk](https://atumera-livepeer-batch-relay.vercel.app/creative) · [Storefront](https://atumera-livepeer-batch-relay.vercel.app/)

The hosted editor supports local composition, WebMCP edits, and PNG export.
Livepeer generation currently runs in the local demo, where its job journal has
durable storage. The hosted demo shows the previously generated sample and
does not accept new provider jobs.

**Track 1 — Livepeer Agent Builder.** Livepeer Agent powers the athlete cutout
and background generation at the center of the Creative workbench.

Open `/creative` to make a sports event card and banner from an athlete photo,
logo, event text, and a Livepeer-generated background. The browser agent can
inspect the project, propose a background, change event details, switch formats,
and export artwork through WebMCP. A person reviews a cost estimate before a
Livepeer job runs and chooses a finished candidate before it changes the proof.

The existing print storefront remains at `/` as the Batch Relay base for this
standalone project. Its code and WebMCP tools are included, but the Creative
workbench is the Livepeer hackathon entry.

## What Creative proves

- **Media generation with a review step.** Livepeer can remove an athlete's
  background and generate a new scene. The person approves each quoted job.
- **Editable composition.** Athlete, logo, background, and event text stay as
  independent layers. Local text and layout changes do not start another job.
- **Agent and person share one project.** Eleven WebMCP tools connect the browser
  agent to the visible editor, while the person can finish the artwork directly.
- **Two real outputs.** The same approved scene exports as a 1080 × 1350 PNG
  card and a 1920 × 1080 PNG banner.

## Storefront base

The storefront at `/` lets shoppers load JPEG or PNG photographs locally,
select a print, frame it, use a published studio template when available, and
review a print draft. People and agents use the same visible workbench through
the following capabilities:

- **Natural photo references.** A shopper can say “image 3” after loading a
  folder; the agent receives the matching visible tray ordinal.
- **Real template contracts.** A template print exposes its published image and
  text slots. The agent can assign the team and individual photographs, edit
  printed text, and frame each slot without guessing its layout.
- **Human approval where it matters.** A print already on screen can be added
  directly. A background print becomes a preview card that the shopper must
  accept or reject.
- **Shared visible feedback.** Agent actions update the page before returning
  and briefly report what changed, with undo/redo for the recent workbench
  history.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000/creative](http://localhost:3000/creative) for the
Livepeer workbench. The inherited print storefront is at
[http://localhost:3000](http://localhost:3000). Local composition and PNG export
work without Livepeer credentials. Live generation requires the server-only
setup in [`docs/creative/README.md`](docs/creative/README.md).

To reset the browser-local demo state while developing, open
`?reset=workbench` once, for example:

```text
http://localhost:3000/?reset=workbench
```

The reset clears this storefront's saved drafts, proposal cards, and cart. It
does not delete the original files or a browser-granted folder permission.

## WebMCP

The storefront registers these imperative tools:

- `ask_storefront` — inspect the visible tray, drafts, proposals, and cart.
- `find_prints` — search visible catalog formats without navigating away.
- `configure_print` — create or revise a print, template assignments, text, or
  framing.
- `revise_prints` — apply a framing change across named drafts.
- `propose_prints` — stage a batch of prints as shopper-reviewable cards.
- `add_to_cart` — add the visible draft or show a proposal for a background
  draft.
- `resolve_cart_proposal` — accept, reject, or change the quantity of a
  shopper-facing proposal.
- `manage_cart` — inspect, update, remove, or clear local cart lines.
- `undo_last_change` and `redo_last_change` — restore recent visible workbench
  changes.

The format chooser also exposes the declarative `search-print-formats` tool.
It remains an ordinary search form for a person; an agent invocation returns
the matching visible products through the browser's form-tool API.

For a browser agent demo, use a WebMCP-capable browser. Ordinary editor
controls remain available without an agent.

## Optional studio-template configuration

The direct-print demo works without server credentials. To demonstrate
studio-owned published templates, configure a dedicated, least-privilege
**Test Mode** key on the server only:

```bash
BATCH_RELAY_API_TOKEN=br_test_...
BATCH_RELAY_STUDIO_ID=stu_...
BATCH_RELAY_EVENT_ID=evt_...
```

Use a key limited to template preview/render work. Never place that key in a
`NEXT_PUBLIC_*` variable, in client code, or in this repository. The default
API origin is `https://api.batchrelay.com`; override
`BATCH_RELAY_API_BASE_URL` only when testing a compatible local API.

`NEXT_PUBLIC_WEBMCP_TRACKING_KEY` is optional telemetry. Tools work without
it.

## Creative workbench

The `/creative` route provides a local-first sports event kit with independent
athlete, logo, background, and text layers. It exports a 1080 × 1350 social
card and a 1920 × 1080 digital banner from the same deterministic renderer.
Text corrections and format switches do not spend on image generation.

Its WebMCP surface is documented in [`docs/creative/README.md`](docs/creative/README.md):
inspect the project, update event details, propose and check a background or
athlete cutout, apply each reviewed candidate, switch layout, export PNGs, and
undo or redo. A proposal only returns a bounded estimate or pending job reference;
the person must approve the visible quote before the server can execute it.
The browser agent never waits for the provider job, and it cannot silently
confirm spend.

The creative implementation builds on baseline `84ce005` of the existing
storefront. Provider credentials, participant access details, and submission
receipts remain private. See [`docs/creative/developer-guide.md`](docs/creative/developer-guide.md)
for the editor bridge contract, [`docs/creative/demo-script.md`](docs/creative/demo-script.md)
for the review flow, and [`docs/creative/final-demo-plan.md`](docs/creative/final-demo-plan.md)
for the short video plan.

### Known limitations

- Live generation needs registered-participant access configured on the server;
  the public repository contains no provider credentials. Local editing and
  PNG export work without them.
- The Vercel deployment has no durable Livepeer job journal. New provider jobs
  are disabled there; use the configured local demo to show live generation.
- Agent control requires a WebMCP-capable browser and agent. The editor has no
  built-in voice client; its manual controls work in an ordinary browser.
- Livepeer job availability and completion time depend on the provider. The
  last approved composition remains editable if a job fails.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run check:public-api
```

The last command fetches the public Batch Relay OpenAPI document and confirms
the operations this demo relies on. It needs network access.

## License

[MIT](LICENSE)
