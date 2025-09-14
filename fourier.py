#!/usr/bin/env python3
# epicycles_clef.py
# Animate a musical-clef-like curve using rotating circles (epicycles).

import numpy as np
import argparse
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import matplotlib
matplotlib.use("TkAgg")  # or "Qt5Agg" if you have PyQt5 installed


# -----------------------------
# Curve: stylized treble-clef-like path
# -----------------------------
def generate_clef_points(n=2000, seed=0):
    """
    Returns complex samples z(t) ≈ stylized treble clef:
      - big spiral (body)
      - upward sweep
      - top curl
      - bottom tail
    This is not a perfect typographic clef, but reads visually as one.
    """
    rng = np.random.default_rng(seed)

    # Spiral body around origin (counter-clockwise, tightening towards center)
    t1 = np.linspace(0.0, 6.0*np.pi, int(0.55*n))
    a, b = 0.02, 0.13          # spiral scale and growth
    r1 = a * np.exp(b*(t1[::-1]))  # reverse to start outside and spiral inward
    x1 = r1 * np.cos(t1)
    y1 = r1 * np.sin(t1)

    # Upward sweep (the stem) from center upwards
    t2 = np.linspace(0, 1, int(0.15*n))
    x2 = 0.0 + 0.05*np.sin(4*np.pi*t2)      # slight waviness
    y2 = np.linspace(0.0, 1.2, t2.size)

    # Top small curl
    t3 = np.linspace(0, 2*np.pi, int(0.15*n))
    r3 = 0.08
    x3 = r3*np.cos(t3) + 0.0
    y3 = r3*np.sin(t3) + (y2[-1] + 0.05)

    # Downward return along stem (slightly offset to suggest thickness)
    t4 = np.linspace(0, 1, int(0.10*n))
    x4 = 0.01*np.sin(3*np.pi*t4)
    y4 = np.linspace(y3[-1], -0.9, t4.size)

    # Bottom tail (little flourish)
    t5 = np.linspace(0, np.pi, int(0.05*n))
    r5 = 0.07
    x5 = r5*np.cos(t5) + 0.0
    y5 = r5*np.sin(t5) - 0.95

    # Concatenate
    x = np.concatenate([x1, x2, x3, x4, x5])
    y = np.concatenate([y1, y2, y3, y4, y5])

    # Normalize and center
    z = x + 1j*y
    z -= np.mean(z)
    scale = np.max(np.abs(z.real)) + np.max(np.abs(z.imag))
    z /= (scale / 2.0)

    # Slight smoothing jitter to avoid perfectly repeated frequencies
    z += (rng.normal(0, 1e-4, z.size) + 1j*rng.normal(0, 1e-4, z.size))

    # Resample to uniform parameter length (optional but helps)
    # Compute cumulative arc-length and interpolate
    dz = np.diff(z, prepend=z[0])
    s = np.cumsum(np.abs(dz))
    s -= s[0]
    s /= s[-1]
    su = np.linspace(0, 1, n)
    zr = np.interp(su, s, z.real) + 1j*np.interp(su, s, z.imag)
    return zr

# -----------------------------
# Fourier (epicycles) utilities
# -----------------------------
def dft(z):
    """Return frequencies k, complex coefficients C_k using numpy FFT with centered spectrum."""
    N = z.size
    C = np.fft.fft(z) / N
    k = np.fft.fftfreq(N, d=1.0)  # cycles per sample
    # Shift zero to center for sorting, but return unshifted arrays; we’ll sort manually.
    return k, C

def sorted_indices_by_magnitude(C):
    """Indices of coefficients sorted by decreasing magnitude (include positive/negative freqs interleaved)."""
    # Build index list that alternates k=0, 1, -1, 2, -2, ...
    N = C.size
    # fftfreq returns symmetric ordering already; we’ll build explicit order
    pos = []
    neg = []
    # Find indices for k>=0 and k<0 in the fftfreq order
    k = np.fft.fftfreq(N, d=1.0)
    idx_sorted = np.argsort(np.abs(C))[::-1]  # by magnitude
    return idx_sorted

def epicycle_sum(C, k, t, order_idx):
    """
    Sum epicycles at time t in [0,1) for subset of coefficients given by order_idx.
    x(t) = sum_k C_k * exp(2πi k t)
    """
    # Note: k here are cycles/sample; t normalized to [0,1)
    exp_term = np.exp(2j*np.pi * k[order_idx] * t)
    return np.sum(C[order_idx] * exp_term)

# -----------------------------
# Animation
# -----------------------------
def animate_epicycles(z, n_circles=100, speed=1.0, trail_len=120):
    N = z.size
    k, C = dft(z)

    # Sort coefficients by magnitude, highest first
    order = np.argsort(np.abs(C))[::-1]

    # Precompute partial sums order for drawing circles sequentially
    # For circle i, center is the partial sum up to i-1
    fig, ax = plt.subplots(figsize=(6, 8))
    ax.set_aspect('equal', 'datalim')
    ax.set_xlim(-1.1, 1.1)
    ax.set_ylim(-1.3, 1.5)
    ax.axis('off')
    ax.set_title("Epicycles drawing a clef-like curve")

    # Artists
    circles = []   # list of (patch_circle, line_radius)
    centers_line, = ax.plot([], [], lw=0.6, alpha=0.3)
    trace_line,   = ax.plot([], [], lw=2.0)
    target_line,  = ax.plot(z.real, z.imag, lw=1.0, alpha=0.2)  # faint target curve

    # We'll draw radii as simple line segments, circles approximated by points
    circle_pts = 80
    circle_xs = [ax.plot([], [], lw=0.5, alpha=0.25)[0] for _ in range(min(n_circles, len(order)))]
    radius_ls = [ax.plot([], [], lw=0.6, alpha=0.5)[0] for _ in range(min(n_circles, len(order)))]

    trail = np.zeros(trail_len, dtype=complex)

    def init():
        for ln in circle_xs:
            ln.set_data([], [])
        for ln in radius_ls:
            ln.set_data([], [])
        centers_line.set_data([], [])
        trace_line.set_data([], [])
        return circle_xs + radius_ls + [centers_line, trace_line]

    def frame(f):
        # t in [0,1)
        t = (f * speed) % N / N

        # Build centers progressively
        centers = [0+0j]
        for i in range(min(n_circles, len(order))):
            idx = order[i]
            # end of this epicycle
            end = centers[-1] + C[idx] * np.exp(2j*np.pi * k[idx] * t)
            centers.append(end)

        # Draw circles and radii
        for i in range(1, len(centers)):
            c = centers[i-1]
            R = np.abs(C[order[i-1]])
            # circle
            theta = np.linspace(0, 2*np.pi, circle_pts)
            xx = c.real + R*np.cos(theta)
            yy = c.imag + R*np.sin(theta)
            circle_xs[i-1].set_data(xx, yy)
            # radius line to next center
            radius_ls[i-1].set_data([c.real, centers[i].real], [c.imag, centers[i].imag])

        # Centers polyline (optional)
        centers_arr = np.array(centers)
        centers_line.set_data(centers_arr.real, centers_arr.imag)

        # Current epicycles tip
        tip = centers[-1]

        # Update trail
        nonlocal_trail = trail
        nonlocal_trail[:-1] = nonlocal_trail[1:]
        nonlocal_trail[-1] = tip

        trace_line.set_data(nonlocal_trail.real, nonlocal_trail.imag)
        return circle_xs + radius_ls + [centers_line, trace_line]

    # Warm up trail with first frame
    trail[:] = z[:trail_len]

    frames = max(600, N)  # long enough for a full pass
    ani = FuncAnimation(fig, frame, init_func=init, frames=frames, interval=16, blit=True)
    ani.save("clef_epicycles.mp4", writer="ffmpeg", fps=60)


# -----------------------------
# Main
# -----------------------------
def main():
    parser = argparse.ArgumentParser(description="Epicycles animation of a clef-like curve.")
    parser.add_argument("--ncircles", type=int, default=120, help="Number of rotating circles (Fourier terms).")
    parser.add_argument("--speed", type=float, default=1.0, help="Playback speed multiplier.")
    parser.add_argument("--samples", type=int, default=2000, help="Number of curve samples.")
    args = parser.parse_args()

    z = generate_clef_points(n=args.samples)
    animate_epicycles(z, n_circles=args.ncircles, speed=args.speed)

if __name__ == "__main__":
    main()

