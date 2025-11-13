import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Trophy, Star, Zap, Crown, Target, Flame } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

interface RewardsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: number;
  xp: number;
  streak: number;
}

export const RewardsModal = ({ open, onOpenChange, level, xp, streak }: RewardsModalProps) => {
  const { t } = useI18n();

  const rewards = [
    {
      id: 'level_5',
      name: 'Novato Dedicado',
      icon: Star,
      color: 'text-blue-500',
      unlocked: level >= 5,
      requirement: 'Alcanza nivel 5'
    },
    {
      id: 'level_10',
      name: 'Profesional',
      icon: Trophy,
      color: 'text-yellow-500',
      unlocked: level >= 10,
      requirement: 'Alcanza nivel 10'
    },
    {
      id: 'level_20',
      name: 'Maestro del Cambio',
      icon: Crown,
      color: 'text-purple-500',
      unlocked: level >= 20,
      requirement: 'Alcanza nivel 20'
    },
    {
      id: 'streak_7',
      name: 'Semana Perfecta',
      icon: Flame,
      color: 'text-orange-500',
      unlocked: streak >= 7,
      requirement: '7 días de racha'
    },
    {
      id: 'streak_30',
      name: 'Mes Imparable',
      icon: Zap,
      color: 'text-red-500',
      unlocked: streak >= 30,
      requirement: '30 días de racha'
    },
    {
      id: 'xp_500',
      name: 'Coleccionista de XP',
      icon: Target,
      color: 'text-green-500',
      unlocked: xp >= 500,
      requirement: 'Consigue 500 XP'
    }
  ];

  const unlockedCount = rewards.filter(r => r.unlocked).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="h-6 w-6 text-primary" />
            {t("achievements")}
          </DialogTitle>
          <DialogDescription>
            {t("rewards_unlocked")}: {unlockedCount}/{rewards.length}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          {rewards.map((reward) => {
            const Icon = reward.icon;
            return (
              <div
                key={reward.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  reward.unlocked
                    ? 'bg-primary/5 border-primary shadow-md'
                    : 'bg-muted/30 border-muted opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${reward.unlocked ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon className={`h-6 w-6 ${reward.unlocked ? reward.color : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{reward.name}</p>
                    <p className="text-sm text-muted-foreground">{reward.requirement}</p>
                  </div>
                  {reward.unlocked && (
                    <div className="text-primary text-2xl">✓</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            ¿Por qué ganar XP y rachas?
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>🎯 <strong>Seguimiento visual:</strong> Ve tu progreso en tiempo real</li>
            <li>🏆 <strong>Logros especiales:</strong> Desbloquea insignias únicas</li>
            <li>🔥 <strong>Motivación diaria:</strong> Las rachas te mantienen comprometido</li>
            <li>⚡ <strong>Niveles:</strong> Sube de nivel completando tareas</li>
            <li>📊 <strong>Análisis:</strong> Comprende mejor tus hábitos</li>
            <li>🎉 <strong>Satisfacción:</strong> Celebra cada pequeño logro</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};
