import confetti from "canvas-confetti";
import { toast } from "sonner";

export function celebrateCreation(realDeltaPercent: number) {
  const freed = Math.max(0, Math.round(realDeltaPercent * 10) / 10);

  void confetti({
    particleCount: 70,
    spread: 75,
    startVelocity: 28,
    origin: { y: 0.62 },
    colors: ["#7d59c9", "#b559c9", "#59a5c9", "#59c9b5", "#f4cf6a"],
  });

  setTimeout(() => {
    void confetti({
      particleCount: 45,
      spread: 95,
      startVelocity: 22,
      origin: { y: 0.58 },
      colors: ["#7d59c9", "#c959a5", "#59a5c9"],
    });
  }, 160);

  toast.success(`Memoria liberada: +${freed}%`);
}
