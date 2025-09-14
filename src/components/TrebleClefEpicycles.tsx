"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Lightweight complex number helpers
type Complex = { re: number; im: number };

function add(a: Complex, b: Complex): Complex { return { re: a.re + b.re, im: a.im + b.im }; }
function mul(a: Complex, b: Complex): Complex { return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }; }
function expi(theta: number): Complex { return { re: Math.cos(theta), im: Math.sin(theta) }; }

// Discrete Fourier Transform of a complex-valued signal x(t_i)
function dft(samples: Complex[]): { freq: number; amp: number; phase: number; re: number; im: number }[] {
  const N = samples.length;
  const coeffs: { freq: number; amp: number; phase: number; re: number; im: number }[] = [];
  for (let k = -Math.floor(N/2); k < Math.ceil(N/2); k++) {
    let sum: Complex = { re: 0, im: 0 };
    for (let n = 0; n < N; n++) {
      const phi = (-2 * Math.PI * k * n) / N; // negative for synthesis rotating forward
      const w = expi(phi);
      sum = add(sum, mul(samples[n], w));
    }
    sum.re /= N;
    sum.im /= N;
    const amp = Math.hypot(sum.re, sum.im);
    const phase = Math.atan2(sum.im, sum.re);
    coeffs.push({ freq: k, amp, phase, re: sum.re, im: sum.im });
  }
  // sort by amplitude descending for faster convergence
  coeffs.sort((a, b) => b.amp - a.amp);
  return coeffs;
}

// Sample points along an SVG path using DOM API and normalize to [-1,1]
function sampleSVGPath(pathD: string, count = 900, wrapperEl?: HTMLElement | null): Complex[] {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.setAttribute("style", "position:absolute;left:-9999px;top:-9999px;opacity:0;");
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", pathD);
  svg.appendChild(path);
  (wrapperEl ?? document.body).appendChild(svg);

  const total = (path as any).getTotalLength() as number;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const p = (path as any).getPointAtLength((i / (count - 1)) * total) as { x: number; y: number };
    pts.push({ x: p.x, y: p.y });
  }

  svg.remove();

  // Normalize to [-1,1], invert Y to match math coordinates
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pts) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }
  const w = maxX - minX;
  const h = maxY - minY;
  const s = 2 / Math.max(w, h);
  const mx = (minX + maxX) / 2;
  const my = (minY + maxY) / 2;
  return pts.map(p => ({ re: (p.x - mx) * s, im: -(p.y - my) * s }));
}

export type TrebleClefEpicyclesProps = {
  className?: string;
  height?: number; // CSS pixels height; width auto fills container
  maxCircles?: number; // number of epicycles (harmonics) to draw
  speed?: number; // animation speed multiplier
  pathD?: string; // SVG path data for the shape
  showCircles?: boolean; // render epicycle guides
};

// Default stylized treble clef path (approximation), designed for a ~200x400 box
const DEFAULT_TREBLE_CLEF_D = [
  "m 51.688 5.25",
  "c -5.427 -0.1409 -11.774 12.818 -11.563 24.375 0.049 3.52 1.16 10.659 2.781 19.625 -10.223 10.581 -22.094 21.44 -22.094 35.688 -0.163 13.057 7.817 29.692 26.75 29.532 2.906 -0.02 5.521 -0.38 7.844 -1 1.731 9.49 2.882 16.98 2.875 20.44 0.061 13.64 -17.86 14.99 -18.719 7.15 3.777 -0.13 6.782 -3.13 6.782 -6.84 0 -3.79 -3.138 -6.88 -7.032 -6.88 -2.141 0 -4.049 0.94 -5.343 2.41 -0.03 0.03 -0.065 0.06 -0.094 0.09 -0.292 0.31 -0.538 0.68 -0.781 1.1 -0.798 1.35 -1.316 3.29 -1.344 6.06 0 11.42 28.875 18.77 28.875 -3.75 0.045 -3.03 -1.258 -10.72 -3.156 -20.41 20.603 -7.45 15.427 -38.04 -3.531 -38.184 -1.47 0.015 -2.887 0.186 -4.25 0.532 -1.08 -5.197 -2.122 -10.241 -3.032 -14.876 7.199 -7.071 13.485 -16.224 13.344 -33.093 0.022 -12.114 -4.014 -21.828 -8.312 -21.969",
  "m 1.281 11.719",
  "c 2.456 -0.237 4.406 2.043 4.406 7.062 0.199 8.62 -5.84 16.148 -13.031 23.719 -0.688 -4.147 -1.139 -7.507 -1.188 -9.5 0.204 -13.466 5.719 -20.886 9.813 -21.281",
  "m -7.719 44.687",
  "c 0.877 4.515 1.824 9.272 2.781 14.063 -12.548 4.464 -18.57 21.954 -0.781 29.781 -10.843 -9.231 -5.506 -20.158 2.312 -22.062 1.966 9.816 3.886 19.502 5.438 27.872 -2.107 0.74 -4.566 1.17 -7.438 1.19 -7.181 0 -21.531 -4.57 -21.531 -21.875 0 -14.494 10.047 -20.384 19.219 -28.969",
  "m 6.094 21.469",
  "c 0.313 -0.019 0.652 -0.011 0.968 0 13.063 0 17.99 20.745 4.688 27.375 -1.655 -8.32 -3.662 -17.86 -5.656 -27.375"
].join(" ");

export default function TrebleClefEpicycles({ className = "", height = 360, maxCircles = 40, speed = 1, pathD, showCircles = true }: TrebleClefEpicyclesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [resolvedPath, setResolvedPath] = useState<string | null>(pathD ?? null);

  // Try loading from public SVG if a path isn't provided
  useEffect(() => {
    let cancelled = false;
    if (pathD) { setResolvedPath(pathD); return; }
    (async () => {
      try {
        const res = await fetch("/treble-clef.svg", { cache: "force-cache" });
        if (!res.ok) throw new Error("svg not found");
        const text = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "image/svg+xml");
        const firstPath = doc.querySelector("path");
        const d = firstPath?.getAttribute("d");
        if (!cancelled) setResolvedPath(d || DEFAULT_TREBLE_CLEF_D);
      } catch {
        if (!cancelled) setResolvedPath(DEFAULT_TREBLE_CLEF_D);
      }
    })();
    return () => { cancelled = true; };
  }, [pathD]);

  useEffect(() => {
    if (!resolvedPath) return;
    const canvas = canvasRef.current!;
    const _ctx = canvas.getContext("2d");
    if (!_ctx) return;
    const ctx: CanvasRenderingContext2D = _ctx;

    const points = sampleSVGPath(resolvedPath, 1200, wrapperRef.current!);
    const coeffs = dft(points);

    let deviceRatio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    function resize() {
      const parent = wrapperRef.current!;
      const cssW = parent.clientWidth;
      const cssH = height;
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      canvas.width = Math.floor(cssW * deviceRatio);
      canvas.height = Math.floor(cssH * deviceRatio);
      ctx.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    let animationId = 0;
    let t = 0; // [0,1) parameter along the curve
    const path: { x: number; y: number }[] = [];

    function synthAt(u: number) {
      // Reconstruct complex position from epicycles at time u
      let x = 0, y = 0;
      const L = Math.min(maxCircles, coeffs.length);
      for (let i = 0; i < L; i++) {
        const c = coeffs[i];
        const angle = 2 * Math.PI * c.freq * u + c.phase;
        x += c.amp * Math.cos(angle);
        y += c.amp * Math.sin(angle);
      }
      return { x, y };
    }

    function draw() {
      const { width, height: hpx } = canvas;
      ctx.clearRect(0, 0, width, hpx);

      // Center and scale to fit nicely
      const cssW = width / deviceRatio;
      const cssH = hpx / deviceRatio;
  const scale = Math.min(cssW, cssH) * 0.42;
  const ox = cssW * 0.5;
  const oy = cssH * 0.56;

      // Draw epicycles
      let px = 0, py = 0;
      const L = Math.min(maxCircles, coeffs.length);
      for (let i = 0; i < L; i++) {
        const c = coeffs[i];
        const angle = 2 * Math.PI * c.freq * t + c.phase;
        const vx = c.amp * Math.cos(angle);
        const vy = c.amp * Math.sin(angle);

        if (showCircles) {
          // circle
          ctx.beginPath();
          ctx.strokeStyle = "rgba(148, 163, 184, 0.18)"; // subtle
          ctx.lineWidth = 1.0;
          ctx.arc(ox + (px) * scale, oy + (py) * scale, Math.max(0.5, c.amp * scale), 0, Math.PI * 2);
          ctx.stroke();

          // radius
          ctx.beginPath();
          ctx.strokeStyle = "rgba(226, 232, 240, 0.55)";
          ctx.lineWidth = 1.1;
          ctx.moveTo(ox + px * scale, oy + py * scale);
          ctx.lineTo(ox + (px + vx) * scale, oy + (py + vy) * scale);
          ctx.stroke();
        }

        px += vx; py += vy;
      }

      const head = { x: ox + px * scale, y: oy + py * scale };

  // Update trace path (longer memory for graceful curve)
  path.push({ x: head.x, y: head.y });
  if (path.length > 3500) path.shift();

      // Draw trace
      ctx.beginPath();
      for (let i = 0; i < path.length; i++) {
        const p = path[i];
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
  ctx.strokeStyle = "rgba(255,255,255,0.96)";
  ctx.lineWidth = 2.2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
      ctx.stroke();

      // Draw head point
      ctx.beginPath();
      ctx.fillStyle = "#ffffff";
      ctx.arc(head.x, head.y, 3.0, 0, Math.PI * 2);
      ctx.fill();

      t = (t + 0.0019 * speed) % 1;
      animationId = requestAnimationFrame(draw);
    }

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [height, maxCircles, speed, resolvedPath, showCircles]);

  return (
    <div ref={wrapperRef} className={"relative w-full " + className} style={{ height }}>
      <canvas ref={canvasRef} className="block w-full h-full" />
      {/* subtle gradient overlay for depth */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/30" />
    </div>
  );
}
