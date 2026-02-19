import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
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
    opacity: randomBetween(0.45, 0.85),
    hue: randomBetween(252, 272),
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
  const audioRef = useRef<AudioContext | null>(null);

  const [mode, setMode] = useState<ZenMode | null>(null);
  const [pops, setPops] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [remainingMs, setRemainingMs] = useState(SESSION_MS);
  const [ended, setEnded] = useState(false);

  const started = mode !== null && !ended;

  useEffect(() => {
    if (!open) return;
    setMode(null);
    setPops(0);
    setRemainingMs(SESSION_MS);
    setEnded(false);
    bubblesRef.current = [];
    particlesRef.current = [];
    ringsRef.current = [];
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
    if (ended) return;

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

      const elapsed = now - startAtRef.current;
      const remaining = Math.max(0, SESSION_MS - elapsed);
      setRemainingMs(remaining);
      if (remaining <= 0) {
        setEnded(true);
      }

      ctx.clearRect(0, 0, width, height);

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
        grad.addColorStop(0, `hsla(${bubble.hue - 8}, 100%, 90%, ${alpha * 0.95})`);
        grad.addColorStop(0.45, `hsla(${bubble.hue}, 92%, 72%, ${alpha * 0.38})`);
        grad.addColorStop(1, `hsla(${bubble.hue + 8}, 85%, 56%, ${alpha * 0.2})`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `hsla(${bubble.hue + 10}, 98%, 88%, ${alpha * 0.75})`;
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
        ctx.fillStyle = `hsla(${p.hue}, 98%, 74%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }

      if (!ended) frameRef.current = window.requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("resize", resize);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [ended, mode, open, started]);

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
    tryPopAt(event.clientX, event.clientY);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        background:
          "linear-gradient(125deg, #0b0c1f 0%, #151037 34%, #1f1450 62%, #130d33 100%)",
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(165,134,255,0.08),transparent_55%)]" />

      <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 pt-[calc(12px+env(safe-area-inset-top))]">
        <button
          type="button"
          aria-label={labels.close}
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-violet-200/30 bg-black/25 text-violet-100 backdrop-blur-sm transition hover:border-violet-100/55"
        >
          <X className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label={labels.sound}
          onClick={() => setSoundOn((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-violet-200/30 bg-black/25 text-violet-100 backdrop-blur-sm transition hover:border-violet-100/55"
        >
          {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
      </div>

      <div className="pointer-events-none absolute left-4 top-[calc(62px+env(safe-area-inset-top))] rounded-full border border-violet-200/25 bg-black/20 px-3 py-1 text-xs text-violet-100/90">
        {labels.pops}: {pops}
      </div>
      {started && !ended && (
        <div className="pointer-events-none absolute right-4 top-[calc(62px+env(safe-area-inset-top))] rounded-full border border-violet-200/25 bg-black/20 px-3 py-1 text-xs text-violet-100/90">
          {timeLabel}
        </div>
      )}

      {!started && (
        <div className="absolute inset-0 flex items-center justify-center px-5">
          <div className="w-full max-w-sm rounded-3xl border border-violet-200/20 bg-black/30 p-6 text-center backdrop-blur-md">
            <h2 className="text-lg font-semibold text-violet-100">{labels.modeTitle}</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode("calm")}
                className="rounded-xl border border-violet-200/35 bg-violet-500/20 px-4 py-3 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/30"
              >
                {labels.modeCalm}
              </button>
              <button
                type="button"
                onClick={() => setMode("energy")}
                className="rounded-xl border border-fuchsia-200/35 bg-fuchsia-500/20 px-4 py-3 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/30"
              >
                {labels.modeEnergy}
              </button>
            </div>
          </div>
        </div>
      )}

      {ended && (
        <div className="absolute inset-0 flex items-center justify-center px-5">
          <div className="w-full max-w-sm rounded-3xl border border-emerald-200/25 bg-black/45 p-6 text-center backdrop-blur-md">
            <h3 className="text-xl font-bold text-emerald-100">{labels.resetDoneTitle}</h3>
            <p className="mt-2 text-sm text-emerald-50/90">{labels.resetDoneSubtitle}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onCapture}
                className="rounded-xl border border-emerald-200/30 bg-emerald-500/25 px-4 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-500/35"
              >
                {labels.capture}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-violet-200/30 bg-violet-500/20 px-4 py-3 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/30"
              >
                {labels.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {!soundOn && (
        <div className="pointer-events-none absolute right-4 top-[calc(112px+env(safe-area-inset-top))] rounded-full border border-violet-200/25 bg-black/20 px-3 py-1 text-[11px] text-violet-100/85">
          {labels.soundOff}
        </div>
      )}
    </div>
  );
}
