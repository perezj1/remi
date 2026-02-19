import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { Volume2, VolumeX, X } from "lucide-react";
import { useRegisterModalOpen } from "@/contexts/ModalUiContext";

type ZenMode = "calm" | "energy";

type Bubble = {
  id: number;
  x: number;
  y: number;
  radius: number;
  speedY: number;
  amp: number;
  freq: number;
  phase: number;
  opacity: number;
  hue: number;
  sat: number;
  light: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  ttl: number;
  size: number;
  alpha: number;
  hue: number;
};

type PopRing = {
  x: number;
  y: number;
  radius: number;
  life: number;
  ttl: number;
  width: number;
  alpha: number;
  hue: number;
};

type Stain = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  hue: number;
  sat: number;
  light: number;
  rotation: number;
  stretchX: number;
  stretchY: number;
};

type MindRelaxSurfaceLabels = {
  close: string;
  sound: string;
  soundOff: string;
  pops: string;
  modeTitle: string;
  modeCalm: string;
  modeEnergy: string;
  resetDoneTitle: string;
  resetDoneSubtitle: string;
  capture: string;
  viewCanvas: string;
  tapToReturn: string;
};

type MindRelaxSurfaceProps = {
  open: boolean;
  onClose: () => void;
  onCapture: () => void;
  labels: MindRelaxSurfaceLabels;
};

const SESSION_MS = 60_000;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickRadius(): number {
  const roll = Math.random();
  if (roll < 0.4) return randomBetween(20, 30);
  if (roll < 0.85) return randomBetween(35, 50);
  return randomBetween(55, 75);
}

function modeConfig(mode: ZenMode) {
  if (mode === "energy") {
    return {
      minBubbles: 10,
      maxBubbles: 14,
      spawnMinMs: 400,
      spawnMaxMs: 520,
    };
  }
  return {
    minBubbles: 8,
    maxBubbles: 11,
    spawnMinMs: 560,
    spawnMaxMs: 700,
  };
}

function createBubble(width: number, height: number, id: number): Bubble {
  const palette = [
    { h: 204, s: 72, l: 66 },
    { h: 224, s: 70, l: 68 },
    { h: 287, s: 64, l: 70 },
    { h: 332, s: 70, l: 72 },
    { h: 168, s: 54, l: 68 },
    { h: 258, s: 62, l: 67 },
  ] as const;
  const tone = palette[Math.floor(Math.random() * palette.length)];
  const radius = pickRadius();
  return {
    id,
    x: randomBetween(radius + 8, width - radius - 8),
    y: height + radius + randomBetween(6, 120),
    radius,
    speedY: randomBetween(20, 50),
    amp: randomBetween(6, 24),
    freq: randomBetween(0.8, 1.6),
    phase: randomBetween(0, Math.PI * 2),
    opacity: randomBetween(0.5, 0.86),
    hue: tone.h,
    sat: tone.s,
    light: tone.l,
  };
}

export default function MindRelaxSurface({
  open,
  onClose,
  onCapture,
  labels,
}: MindRelaxSurfaceProps) {
  useRegisterModalOpen(open);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);
  const nextSpawnAtRef = useRef<number>(0);
  const startAtRef = useRef<number>(0);
  const bubbleIdRef = useRef<number>(1);
  const bubblesRef = useRef<Bubble[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const ringsRef = useRef<PopRing[]>([]);
  const stainsRef = useRef<Stain[]>([]);
  const audioRef = useRef<AudioContext | null>(null);

  const [mode, setMode] = useState<ZenMode | null>(null);
  const [pops, setPops] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [remainingMs, setRemainingMs] = useState(SESSION_MS);
  const [ended, setEnded] = useState(false);
  const [showCanvasOnly, setShowCanvasOnly] = useState(false);

  const started = mode !== null;

  useEffect(() => {
    if (!open) return;
    setMode(null);
    setPops(0);
    setRemainingMs(SESSION_MS);
    setEnded(false);
    setShowCanvasOnly(false);
    bubblesRef.current = [];
    particlesRef.current = [];
    ringsRef.current = [];
    stainsRef.current = [];
    bubbleIdRef.current = 1;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  const playPop = () => {
    if (!soundOn) return;
    if (typeof window === "undefined") return;
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    if (!audioRef.current) audioRef.current = new AudioCtor();
    const ctx = audioRef.current;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc2.type = "triangle";

    // "blup": corto, redondo y ligeramente grave
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(118, now + 0.09);

    osc2.frequency.setValueAtTime(150, now);
    osc2.frequency.exponentialRampToValueAtTime(88, now + 0.09);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(760, now);
    filter.Q.setValueAtTime(0.95, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.12);
    osc2.stop(now + 0.12);
  };

  const spawnBubble = (width: number, height: number) => {
    const bubble = createBubble(width, height, bubbleIdRef.current++);
    bubblesRef.current.push(bubble);
  };

  const explodeBubble = (bubble: Bubble) => {
    const particleCount = Math.floor(randomBetween(8, 16));
    const baseHue = bubble.hue;
    const splatCount = Math.floor(randomBetween(5, 10));

    stainsRef.current.push({
      x: bubble.x,
      y: bubble.y,
      radius: bubble.radius * randomBetween(0.75, 1.15),
      alpha: randomBetween(0.16, 0.24),
      hue: bubble.hue,
      sat: bubble.sat,
      light: bubble.light,
      rotation: randomBetween(0, Math.PI * 2),
      stretchX: randomBetween(0.95, 1.25),
      stretchY: randomBetween(0.78, 1.08),
    });

    for (let i = 0; i < splatCount; i += 1) {
      const angle = randomBetween(0, Math.PI * 2);
      const dist = randomBetween(bubble.radius * 0.16, bubble.radius * 0.95);
      stainsRef.current.push({
        x: bubble.x + Math.cos(angle) * dist,
        y: bubble.y + Math.sin(angle) * dist,
        radius: bubble.radius * randomBetween(0.14, 0.42),
        alpha: randomBetween(0.09, 0.16),
        hue: bubble.hue,
        sat: bubble.sat,
        light: bubble.light,
        rotation: randomBetween(0, Math.PI * 2),
        stretchX: randomBetween(0.7, 1.45),
        stretchY: randomBetween(0.65, 1.3),
      });
    }

    if (stainsRef.current.length > 300) {
      stainsRef.current.splice(0, stainsRef.current.length - 300);
    }

    ringsRef.current.push({
      x: bubble.x,
      y: bubble.y,
      radius: bubble.radius * 0.55,
      life: 0,
      ttl: randomBetween(0.28, 0.45),
      width: randomBetween(2, 3.8),
      alpha: 0.8,
      hue: baseHue,
    });

    for (let i = 0; i < particleCount; i += 1) {
      const angle = (Math.PI * 2 * i) / particleCount + randomBetween(-0.18, 0.18);
      const speed = randomBetween(40, 120);
      particlesRef.current.push({
        x: bubble.x,
        y: bubble.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        ttl: randomBetween(0.3, 0.5),
        size: randomBetween(1.6, 4.2),
        alpha: randomBetween(0.45, 0.8),
        hue: baseHue + randomBetween(-8, 10),
      });
    }
  };

  useEffect(() => {
    if (!open || !started) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const config = modeConfig(mode);
    resize();
    window.addEventListener("resize", resize);
    startAtRef.current = performance.now();
    nextSpawnAtRef.current = startAtRef.current + randomBetween(config.spawnMinMs, config.spawnMaxMs);
    lastFrameRef.current = startAtRef.current;
    setRemainingMs(SESSION_MS);

    const animate = (now: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dt = Math.min((now - lastFrameRef.current) / 1000, 0.033);
      lastFrameRef.current = now;

      if (!ended) {
        const elapsed = now - startAtRef.current;
        const remaining = Math.max(0, SESSION_MS - elapsed);
        setRemainingMs(remaining);
        if (remaining <= 0) {
          setEnded(true);
        }
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stainsRef.current.length; i += 1) {
        const stain = stainsRef.current[i];
        ctx.save();
        ctx.translate(stain.x, stain.y);
        ctx.rotate(stain.rotation);
        ctx.scale(stain.stretchX, stain.stretchY);
        ctx.fillStyle = `hsla(${stain.hue}, ${Math.max(24, stain.sat - 20)}%, ${Math.max(62, stain.light - 8)}%, ${stain.alpha})`;
        ctx.beginPath();
        ctx.arc(0, 0, stain.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (!showCanvasOnly) {
        const target = Math.floor(randomBetween(config.minBubbles, config.maxBubbles + 0.999));
        while (bubblesRef.current.length < config.minBubbles) {
          spawnBubble(width, height);
        }
        if (now >= nextSpawnAtRef.current && bubblesRef.current.length < target) {
          spawnBubble(width, height);
          nextSpawnAtRef.current = now + randomBetween(config.spawnMinMs, config.spawnMaxMs);
        }

        for (let i = bubblesRef.current.length - 1; i >= 0; i -= 1) {
          const bubble = bubblesRef.current[i];
          bubble.y -= bubble.speedY * dt;
          bubble.x += Math.sin(now * 0.001 * bubble.freq + bubble.phase) * 14 * dt;
          if (bubble.y + bubble.radius < -20) {
            bubblesRef.current.splice(i, 1);
            continue;
          }

          const topFade = Math.min(1, Math.max(0, (bubble.y + bubble.radius) / 140));
          const alpha = bubble.opacity * topFade;

          const grad = ctx.createRadialGradient(
            bubble.x - bubble.radius * 0.35,
            bubble.y - bubble.radius * 0.4,
            bubble.radius * 0.15,
            bubble.x,
            bubble.y,
            bubble.radius,
          );
          grad.addColorStop(0, `hsla(${bubble.hue}, ${Math.min(90, bubble.sat + 14)}%, 96%, ${alpha * 0.98})`);
          grad.addColorStop(0.45, `hsla(${bubble.hue}, ${bubble.sat}%, ${bubble.light}%, ${alpha * 0.45})`);
          grad.addColorStop(1, `hsla(${bubble.hue}, ${Math.max(36, bubble.sat - 20)}%, ${Math.max(56, bubble.light - 20)}%, ${alpha * 0.22})`);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `hsla(${bubble.hue}, ${Math.min(85, bubble.sat + 10)}%, 90%, ${alpha * 0.78})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(bubble.x, bubble.y, bubble.radius - 0.6, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.55})`;
          ctx.beginPath();
          ctx.arc(
            bubble.x - bubble.radius * 0.28,
            bubble.y - bubble.radius * 0.3,
            Math.max(1.5, bubble.radius * 0.12),
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }

        for (let i = ringsRef.current.length - 1; i >= 0; i -= 1) {
          const ring = ringsRef.current[i];
          ring.life += dt;
          const progress = ring.life / ring.ttl;
          if (progress >= 1) {
            ringsRef.current.splice(i, 1);
            continue;
          }
          ring.radius += dt * 95;
          const alpha = ring.alpha * (1 - progress);
          ctx.strokeStyle = `hsla(${ring.hue}, 95%, 78%, ${alpha})`;
          ctx.lineWidth = ring.width * (1 - progress * 0.4);
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        for (let i = particlesRef.current.length - 1; i >= 0; i -= 1) {
          const p = particlesRef.current[i];
          p.life += dt;
          const progress = p.life / p.ttl;
          if (progress >= 1) {
            particlesRef.current.splice(i, 1);
            continue;
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.986;
          p.vy *= 0.986;
          const alpha = p.alpha * (1 - progress);
          ctx.fillStyle = `hsla(${p.hue}, 84%, 76%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - progress * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      frameRef.current = window.requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("resize", resize);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [ended, mode, open, showCanvasOnly, started]);

  const timeLabel = useMemo(() => {
    const sec = Math.ceil(remainingMs / 1000);
    return `0:${String(Math.max(0, sec)).padStart(2, "0")}`;
  }, [remainingMs]);

  const tryPopAt = (x: number, y: number) => {
    if (!started || ended) return;
    for (let i = bubblesRef.current.length - 1; i >= 0; i -= 1) {
      const bubble = bubblesRef.current[i];
      const dx = x - bubble.x;
      const dy = y - bubble.y;
      if (dx * dx + dy * dy <= bubble.radius * bubble.radius) {
        bubblesRef.current.splice(i, 1);
        explodeBubble(bubble);
        playPop();
        try {
          if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
            navigator.vibrate(12);
          }
        } catch {
          // Ignore haptic failures (unsupported browser/device).
        }
        setPops((prev) => prev + 1);
        break;
      }
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (showCanvasOnly) {
      setShowCanvasOnly(false);
      return;
    }
    tryPopAt(event.clientX, event.clientY);
  };

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const content = (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{
        background:
          "linear-gradient(128deg, #ffffff 0%, #f6f9ff 34%, #fef6ff 62%, #f5fbff 100%)",
        backgroundSize: "180% 180%",
        animation: "zen-gradient 32s ease-in-out infinite",
      }}
      onPointerDown={onPointerDown}
    >
      <style>
        {`
          @keyframes zen-gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>

      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.05),transparent_55%)]" />

      {!showCanvasOnly && (
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 pt-[calc(12px+env(safe-area-inset-top))]">
        <button
          type="button"
          aria-label={labels.close}
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300/80 bg-white/80 text-slate-700 backdrop-blur-sm transition hover:border-slate-400"
        >
          <X className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label={labels.sound}
          onClick={() => setSoundOn((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300/80 bg-white/80 text-slate-700 backdrop-blur-sm transition hover:border-slate-400"
        >
          {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
      </div>
      )}

      {!showCanvasOnly && (
      <div className="pointer-events-none absolute left-4 top-[calc(62px+env(safe-area-inset-top))] rounded-full border border-slate-300/80 bg-white/80 px-3 py-1 text-xs text-slate-700">
        {labels.pops}: {pops}
      </div>
      )}
      {started && !ended && (
        <div className="pointer-events-none absolute right-4 top-[calc(62px+env(safe-area-inset-top))] rounded-full border border-slate-300/80 bg-white/80 px-3 py-1 text-xs text-slate-700">
          {timeLabel}
        </div>
      )}

      {!started && !showCanvasOnly && (
        <div className="absolute inset-0 flex items-center justify-center px-5">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white/90 p-6 text-center backdrop-blur-md shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
            <h2 className="text-lg font-semibold text-slate-800">{labels.modeTitle}</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode("calm")}
                className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
              >
                {labels.modeCalm}
              </button>
              <button
                type="button"
                onClick={() => setMode("energy")}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                {labels.modeEnergy}
              </button>
            </div>
          </div>
        </div>
      )}

      {ended && !showCanvasOnly && (
        <div className="absolute inset-0 flex items-center justify-center px-5">
          <div className="w-full max-w-sm rounded-3xl border border-emerald-200 bg-white/90 p-6 text-center backdrop-blur-md shadow-[0_16px_36px_rgba(16,185,129,0.12)]">
            <h3 className="text-xl font-bold text-emerald-700">{labels.resetDoneTitle}</h3>
            <p className="mt-2 text-sm text-slate-600">{labels.resetDoneSubtitle}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onCapture}
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                {labels.capture}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {labels.close}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowCanvasOnly(true)}
              className="mt-3 text-[12px] font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700"
            >
              {labels.viewCanvas}
            </button>
          </div>
        </div>
      )}

      {!soundOn && !showCanvasOnly && (
        <div className="pointer-events-none absolute right-4 top-[calc(112px+env(safe-area-inset-top))] rounded-full border border-slate-300/80 bg-white/80 px-3 py-1 text-[11px] text-slate-600">
          {labels.soundOff}
        </div>
      )}

    </div>
  );

  return createPortal(content, document.body);
}
