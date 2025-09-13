---
mode: agent
---
Neom Audio Backend — Integration Guide
TL;DR

Public base URL: http://20.161.72.50

API base (via nginx): http://20.161.72.50/api

Files base (public): http://20.161.72.50/files

Key endpoints:

POST /api/run_direct — run a specific audio op (deterministic)

POST /api/ai/route_and_run — LLM chooses the op/params, then runs it

GET /api/projects/{projectId}/ops?limit=N — recent runs/history

GET /api/ops/{opId} — details for a specific run (includes manifest)

Outputs are saved under /srv/neom/projects/<project>/runs/<runId>/ and served at /files/<project>/….

Working + tested end-to-end (see “How we tested” below).

1) What’s running where
Processes

Uvicorn (FastAPI): listens on 127.0.0.1:8001 (local only)

Service: neom.service (systemd)

App module: neom_app:app

Gemini API key is provided via systemd drop-in env var

nginx: listens on 0.0.0.0:80 (public)

Proxies /api/ ➜ http://127.0.0.1:8001/

Serves /files/ from /srv/neom/files/

Code & Data layout (server)
/srv/neom/
  app/                 # code (this is the repo you’ll sync)
  files/               # public originals + outputs (exposed via /files/)
    <project>/...
  projects/            # per-run working dirs + manifests
    <project>/
      runs/<runId>/
        manifest.json
        <output>.wav
        original.wav -> symlink to /srv/neom/files/<project>/<file>
  loops/               # loop library (.wav), plus index.json
  neom.db              # sqlite
  venv/                # python venv (not in git)

2) API surface
POST /api/run_direct

Run a specific “operation” without LLM.

Request (JSON):

{
  "projectId": "demo1",
  "originalPath": "/srv/neom/files/demo1/try1.wav",
  "loopFileName": "guitar_mute_pluck_riff_122bpm_811473.wav",
  "startSec": 0.5,
  "gainDb": -4,
  "outName": "modified.wav"   // optional; if omitted, backend auto-generates a descriptive name
}


Response (JSON):

{
  "projectId": "demo1",
  "op": { /* normalized op payload for provenance */ },
  "originalUrl": "/files/demo1/try1.wav",
  "modifiedUrl": "/files/demo1/2025-09-13T14-11-13Z-demo1-add_loop-guitar_mute_pluck_riff_122bpm_811473-0.50s--4dB.wav",
  "outName": "2025-09-13T14-11-13Z-demo1-add_loop-guitar_mute_pluck_riff_122bpm_811473-0.50s--4dB.wav",
  "runId": "2025-09-13T14-11-13Z-fd08e3",
  "manifestUrl": "/files/demo1/runs/2025-09-13T14-11-13Z-fd08e3/manifest.json",
  "dbOpId": "2025-09-13T14-11-13Z-fd08e3"
}


modifiedUrl is immediately playable in the browser: http://20.161.72.50/files/...

POST /api/ai/route_and_run

You provide a natural language request; the backend calls Gemini to select params and then executes the same underlying op as run_direct.

Request (JSON):

{
  "projectId": "demo1",
  "originalPath": "/srv/neom/files/demo1/try1.wav",
  "text": "add a punk guitar riff at 0.5s, -4dB"
}


Response: same shape as /run_direct (includes modifiedUrl, manifestUrl, runId, …).

Internally the LLM is tool-calling a function schema that maps to run_direct. If the text implies “punk guitar” it prefers the guitar_mute_pluck_riff_122bpm_811473.wav loop.

GET /api/projects/{projectId}/ops?limit=20

Recent runs for a project (for a history sidebar).

Response (example):

{
  "projectId": "demo1",
  "ops": [
    {
      "id": "2025-09-13T14-11-13Z-fd08e3",
      "created_at": "2025-09-13T14-11-13Z",
      "op": "add_loop",
      "out_url": "/files/demo1/....wav",
      "out_name": "....wav",
      "loop_id": "guitar_mute_pluck_riff_122bpm_811473",
      "start_sec": 0.5,
      "gain_db": -4.0
    }
  ]
}

GET /api/ops/{opId}

One run by ID; includes the parsed DB row and the manifest contents so the UI can render details.

3) What the frontend needs to do
A) Upload flow (two options)

(Preferred) call a simple /api/upload endpoint (10 lines) that saves the dropped file to /srv/neom/files/<project>/… and returns publicUrl.

If not present yet, we can add it quickly; until then…

(Temporary) use the existing test file: /srv/neom/files/demo1/try1.wav.

The API expects a server path for originalPath, not a web URL. (That’s why an upload endpoint is useful.)

B) Kick off a run

LLM-assisted: POST /api/ai/route_and_run with { projectId, originalPath, text }

Manual: POST /api/run_direct with all params

C) Show results

Set <audio src={"http://20.161.72.50" + modifiedUrl} />

Fetch and display manifestUrl as a “provenance” panel (inputs, params, outputs).

Populate a history list from GET /api/projects/<project>/ops.

D) CORS

Files (/files/...) are already served with Access-Control-Allow-Origin: * by nginx.

API: FastAPI should have CORS middleware enabled (allow *) so the browser can call /api/* from your frontend domain. If you see preflight errors, add:

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your FE origin later
    allow_methods=["*"],
    allow_headers=["*"],
)

E) Minimal fetch examples

Run with LLM routing

const API = "http://20.161.72.50/api";

async function aiRoute(projectId: string, originalPath: string, text: string) {
  const res = await fetch(`${API}/ai/route_and_run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, originalPath, text }),
  });
  if (!res.ok) throw new Error(`AI route failed: ${res.status}`);
  return await res.json(); // { modifiedUrl, manifestUrl, runId, ... }
}


Render

const data = await aiRoute("demo1", "/srv/neom/files/demo1/try1.wav", "add a punk guitar riff at 0.5s, -4dB");
audio.src = `http://20.161.72.50${data.modifiedUrl}`;
const manifest = await fetch(`http://20.161.72.50${data.manifestUrl}`).then(r => r.json());


History

const hist = await fetch(`${API}/projects/demo1/ops?limit=20`).then(r => r.json());

4) How this was tested (so you can reproduce)

There’s a one-shot script that exercises everything:

/srv/neom/app/test_pipeline.sh


What it does:

Ensures an original test file exists at /srv/neom/files/demo1/try1.wav (3s 48k sine wave).

Imports loops into SQLite from /srv/neom/loops/index.json.

Calls POST /run_direct with a known loop + params.

Verifies:

200 OK from API

modifiedUrl and manifestUrl are reachable under /files/...

run directory exists under /srv/neom/projects/demo1/runs/<runId>/

ops row is in SQLite

GET /api/ops/{id} and GET /api/projects/demo1/ops work

Calls POST /ai/route_and_run and checks the same.

We’ve also validated from outside the VM that the file is accessible:

curl -I http://20.161.72.50/files/demo1/<output>.wav

5) Data model (SQLite)

Tables you’ll touch indirectly:

loops: id, name, file_path, tags, bpm, key
(Used by the LLM router to pick loops; populated by a small importer.)

ops (run history): includes

id (same as runId), created_at, project_id, op,

normalized columns for params (e.g., loop_id, start_sec, gain_db, out_name, out_url),

manifest_path, tool_args_json, etc.

You don’t need to write to the DB; the API does it and exposes reads via /api/ops/* endpoints.

6) File naming & manifests

If you omit outName, backend auto-generates descriptive names like:
2025-09-13T14-11-13Z-demo1-add_loop-<loopId>-0.50s--4dB.wav

For each run, a manifest.json is written under the run folder with:

inputs (originalPath, loopId/loopQuery), params (startSec, gainDb, …)

outputs (file path + public url)

provenance (tool name + args, model/prompt if LLM used)

Both the output .wav and the manifest.json are retrievable via /files/....

7) Config & operations

OpenAPI: http://20.161.72.50/api/openapi.json

Logs:

app: journalctl -u neom -f

nginx: /var/log/nginx/access.log, /var/log/nginx/error.log

Service:

restart app: sudo systemctl restart neom.service

confirm listening: ss -ltnp | grep 8001 (local), ss -ltnp | grep ':80 '

Env:

Gemini key is set in systemd drop-in (Environment="GEMINI_API_KEY=...")

8) Current ops & roadmap for FE

Current implemented op: add_loop (params: loop, startSec, gainDb[, endSec])

Coming soon (already planned, FE can leave UI hooks/placeholders):

gain (change level)

fade_in / fade_out

reverb

quantize (grid alignment)

FE should treat ops as a list of “effects”; for LLM path you still display the actual op picked + params from the manifest.

9) Gotchas / FAQs

Uploads: until /api/upload exists, you must use a server path that already exists under /srv/neom/files/<project>/. Add the tiny upload route to make DnD fully self-serve.

CORS: files are CORS-enabled via nginx; ensure API CORS is enabled in FastAPI for browser calls.

Auth: none (demo). If you need to hide it from the public internet, add basic auth or an API key header at nginx and/or FastAPI.

Stability: uvicorn runs behind nginx; nginx serves static files so playback is lightweight and reliable.

Backups: runtime data to protect is /srv/neom/projects, /srv/neom/files, /srv/neom/loops, /srv/neom/neom.db.

10) One-pager for your first integration test

Pick the existing demo original: /srv/neom/files/demo1/try1.wav

Call:

curl -s -X POST http://20.161.72.50/api/ai/route_and_run \
  -H "Content-Type: application/json" \
  -d '{"projectId":"demo1","originalPath":"/srv/neom/files/demo1/try1.wav","text":"add a punk guitar riff at 0.5s, -4dB"}'


Grab modifiedUrl from the JSON and open:
http://20.161.72.50<modifiedUrl>

(Optional) List recent runs:
curl -s http://20.161.72.50/api/projects/demo1/ops?limit=5 | jq .

That’s it. Ping if you need the /upload route added or CORS tightened to your frontend origin.