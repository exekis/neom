# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NOEM is an AI Audio Co-Pilot - a web-based Digital Audio Workstation (DAW) built for Hack the North 2025. This is a hackathon "one-box" system with clearly marked stretch hooks for Azure integration.

## System Architecture

### Frontend (Next.js/React)
- **Upload UI**: Multipart file upload to `/upload` endpoint
- **Audio Players**: Two `<audio>` elements for original and modified files
- **Timeline**: Bar grid with region selection for audio editing
- **Chat Sidebar**: LLM prompt interface for natural language commands

### Backend (FastAPI + FFmpeg)
Single compute box architecture with three core endpoints:

#### API Endpoints (DO NOT DEVIATE)
1. **POST /upload**
   - Input: `multipart/form-data: file=<wav/mp3>`
   - Output: `{"projectId": "<id>", "originalUrl": "/files/<id>/original.wav"}`
   - Saves to `/srv/noem/projects/{id}/original.wav`

2. **POST /ops**
   - Input: `{"projectId": "<id>", "ops": [DSL_OP, ...]}`
   - Output: `{"modifiedUrl": "/files/<id>/modified.wav", "latencyMs": <int>}`
   - Validates DSL, routes to whitelisted operations, runs FFmpeg

3. **GET /files/***: StaticFiles serving for original/modified WAVs

### Audio Processing Pipeline
Router with whitelisted operations → FFmpeg executors:
- **fade** → `afade` filter
- **gain** → `volume` filter
- **reverb** → `aecho` (demo) or `afir` with impulse response
- **normalize** → `loudnorm` filter
- **add_loop** → `stream_loop/trim/fade/gain + adelay + amix`

### File System Layout
```
/srv/noem/projects/<id>/original.wav
/srv/noem/projects/<id>/modified.wav
/srv/noem/loops/index.json
/srv/noem/loops/*.wav
```

## JSON DSL Schema

### Operations
Op ∈ `{"fade", "gain", "reverb", "normalize", "add_loop"}`

### Examples
```json
{"op":"fade","startSec":60,"endSec":80,"shape":"linear"}
{"op":"gain","db":-3}
{"op":"reverb","preset":"plate"}
{"op":"normalize","targetLufs":-14}
{"op":"add_loop","style":"punk_heavy_guitar","region":{"startSec":12.0,"endSec":17.0},"gainDb":-6}
```

### Validation Rules (Server-side)
- `0 ≤ startSec < endSec ≤ duration`
- `−24 ≤ db ≤ +24`
- `targetLufs ∈ [−23, −10]`
- `preset ∈ {"plate","room","hall"}`
- `style ∈` known loop tags from `/srv/noem/loops/index.json`

## FFmpeg Command Templates (Authoritative)

### Fade Out
```bash
ffmpeg -y -i IN -af "afade=t=out:st={start}:d={dur}" OUT
```

### Gain
```bash
ffmpeg -y -i IN -af "volume={db}dB" OUT
```

### Reverb (Demo)
```bash
ffmpeg -y -i IN -af "aecho=0.8:0.9:60:0.5,aecho=0.6:0.8:120:0.4" OUT
```

### Normalize
```bash
ffmpeg -y -i IN -af "loudnorm=I={LUFS}:LRA=11:TP=-1.5" OUT
```

### Add Loop
```bash
# Build loop segment of duration D=(endSec-startSec):
ffmpeg -y -stream_loop -1 -i LOOP.wav -t D \
  -af "afade=t=in:st=0:d=0.05,afade=t=out:st={D-0.1}:d=0.1,volume={gainDb}dB" /tmp/seg.wav
# Offset and mix with original at startSec:
ffmpeg -y -i original.wav -i /tmp/seg.wav \
  -filter_complex "[1:a]adelay={ms}|{ms},apad[L];[0:a][L]amix=inputs=2:duration=first:dropout_transition=2" \
  modified.wav
```

## LLM Integration

### System Prompt
```
You translate user audio intents into a JSON DSL for Noem. Only output a single JSON object per operation or a JSON array of operations. Never output prose, code, or shell. Use these ops: fade, gain, reverb, normalize, add_loop. Use SELECTION_START/SELECTION_END placeholders only if the user references "the selection".
```

### Few-shot Examples
- "fade out the last 20 seconds" → `{"op":"fade","startSec":DURATION-20,"endSec":DURATION,"shape":"linear"}`
- "lower volume by 3 dB" → `{"op":"gain","db":-3}`
- "add some heavy punk riffs under the selection" → `{"op":"add_loop","style":"punk_heavy_guitar","region":{"startSec":SELECTION_START,"endSec":SELECTION_END},"gainDb":-6}`

## Current Implementation Status

### Frontend (Next.js)
- Basic DAW interface with track management (`src/app/page.tsx`)
- Audio upload component (`src/components/AudioUploader.tsx`)
- Timeline visualization (`src/components/TrackView.tsx`)
- Web Audio API integration for client-side audio processing

### Backend (Planned)
- FastAPI server implementation needed
- FFmpeg integration required
- File system structure setup needed

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build the application
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main DAW interface with track management
│   ├── layout.tsx        # App layout and metadata
│   └── globals.css       # Global styles
└── components/
    ├── AudioUploader.tsx # File upload component
    └── TrackView.tsx     # Timeline and track visualization
```

## Key Technical Details

### Audio Processing
- Uses Web Audio API (`AudioContext`) for decoding audio files
- Supports multiple audio formats (MP3, WAV, OGG)
- 60 pixels per second timeline scale for track visualization
- Tracks are draggable along the timeline with real-time position updates

### State Management
- React useState for track collection and selection state
- Track data includes: id, name, audioBuffer, color, startTime, duration
- Color cycling through predefined palette for visual distinction

### Styling Conventions
- Tailwind CSS with utility-first approach
- Consistent gray color palette for UI chrome
- Vibrant colors for audio track visualization
- Hover states and interactive feedback throughout

## Loops Pack Structure

### Index Format (/srv/noem/loops/index.json)
```json
[
  {
    "id": "punk1",
    "file": "punk_gtr_180bpm_E.wav",
    "tags": ["punk", "guitar", "heavy"],
    "bpm": 180,
    "key": "E"
  }
]
```

### Selection Logic
- Match by style tag
- Optional `atempo` within [0.75, 1.25]
- Prefer power-chord/percussive loops to avoid key clashes

## Security Guardrails

### Backend Responsibilities
- Strict JSON schema validation; whitelist operations only
- Clamp times/dB values; compute DURATION server-side
- Replace SELECTION_START/SELECTION_END placeholders from UI
- No arbitrary shell execution: render FFmpeg commands from templates only
- Timeouts per job; idempotent paths in `/srv/noem/projects/<id>/`
- Log operations (SQLite or ops.json) for reproducibility

## Hackathon Timeline (Toronto)

- **T+0–2h**: FastAPI + `/upload` → `original.wav`; FE player for original
- **T+2–5h**: `/ops` with fade + gain; FE A/B players
- **T+5–7h**: reverb + normalize; timeline overlay
- **T+7–9h**: add_loop operation (1–2 punk guitar loops); selection→region; mix
- **T+9–11h**: LLM → DSL integration; JSON validation; error states
- **T+11–end**: polish, record 60s demo, rehearse

## Stretch Hooks (DO NOT BUILD NOW)

### External Services (Optional for MVP)
- **LLM**: Azure OpenAI (Chat Completions) — for NL → DSL only
- **Speech-to-Text**: Azure Speech Service — if voice commands needed
- **Azure Scale-out**: Azure Functions + Azure Storage + Azure Cosmos DB
- **DAW Integration**: LMMS SDK, Ardour Lua API, or REAPER ReaScript

## Team Responsibilities

- **Frontend**: Upload, two audio players, timeline region select, chat box
- **Backend**: FastAPI endpoints, router, FFmpeg calls, validation
- **LLM**: Prompt + client; enforce JSON-only; post-process DURATION/SELECTION
- **Loops/DSP**: Curate loops/, write index.json, test add_loop pipeline
- **PM/Integrator**: Demo script, sample audio, dry runs

## Development Standards

### SOLID Principles (MANDATORY)

**All code must strictly follow SOLID principles:**

1. **Single Responsibility Principle (SRP)**: Each component/function/class has one reason to change
   - Components handle only UI rendering OR logic, never both
   - Custom hooks extract all business logic from components
   - Utility functions have single, focused purposes

2. **Open/Closed Principle (OCP)**: Open for extension, closed for modification
   - Use composition over inheritance
   - Leverage TypeScript interfaces for extensibility
   - Design components to accept props for customization

3. **Liskov Substitution Principle (LSP)**: Subtypes must be substitutable for base types
   - Ensure interface implementations are fully compatible
   - Props and return types must match contracts exactly

4. **Interface Segregation Principle (ISP)**: Many specific interfaces over one general
   - Keep prop interfaces focused and minimal
   - Split large interfaces into smaller, cohesive ones

5. **Dependency Inversion Principle (DIP)**: Depend on abstractions, not concretions
   - Components depend on props/hooks, not implementation details
   - Use custom hooks to abstract external dependencies

### File Size Constraint

**HARD LIMIT: Maximum 150 lines per file**
- If any file exceeds 150 lines, it MUST be refactored immediately
- Break large components into smaller, focused components
- Extract logic into custom hooks
- Create utility functions for reusable code

### Code Quality Rules

- **No console.log statements** in production code
- **Remove debugging code** before commits
- **Meaningful component and variable names** that describe purpose
- **Extract magic numbers** into named constants
- **Use TypeScript strictly** - no `any` types

## Single Source of Truth

**CRITICAL**: Endpoints, DSL schema, router templates, and file layout above are canonical. Do not add endpoints or operations without group sign-off.