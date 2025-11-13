import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Flame, Trophy, Zap, User, LogOut, Settings as SettingsIcon } from "lucide-react";
import { getCategoryIcon, getCategoryColor, getCategoryName } from "@/lib/categories";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { useI18n } from "@/contexts/I18nContext";
import { shuffleTasks } from "@/lib/taskShuffler";
import { getTaskTranslation } from "@/lib/taskTranslations";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** ================================
 *  DIFFICULTY HELPERS (prefijos)
 *  ================================ */
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

function difficultyFromUserLevel(level: number): Difficulty {
  if (level >= 1 && level <= 3) return 'EASY';
  if (level >= 4 && level <= 6) return 'MEDIUM';
  return 'HARD'; // 7–10+
}

function parseDifficultyFromText(text?: string | null): Difficulty | null {
  if (!text) return null;
  if (/^EASY_/i.test(text)) return 'EASY';
  if (/^MEDIUM_/i.test(text)) return 'MEDIUM';
  if (/^HARD_/i.test(text)) return 'HARD';
  return null;
}

function stripDifficultyPrefix(text?: string | null): string | undefined | null {
  if (!text) return text;
  return text.replace(/^(EASY_|MEDIUM_|HARD_)/i, '');
}

/** ================================
 *  TYPES
 *  ================================ */
interface Task {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: string | null;
}

const Home = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t, locale } = useI18n();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState({
    totalXP: 0,
    currentStreak: 0,
    level: 1,
    username: '',
    avatarUrl: ''
  });

  /** ================================
   *  INIT
   *  ================================ */
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadTasks();
    loadUserStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  /** ================================
   *  USER STATS / LEVEL
   *  ================================ */
  const loadUserStats = async () => {
    try {
      // Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user?.id)
        .single();

      // Completed tasks → XP
      const { data: completedTasks } = await supabase
        .from('completed_tasks')
        .select('completed_at')
        .eq('user_id', user?.id)
        .eq('skipped', false);

      const totalXP = (completedTasks?.length || 0) * 10;
      const level = Math.floor(totalXP / 100) + 1;

      // Streak
      let currentStreak = 0;
      if (completedTasks && completedTasks.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dates = completedTasks.map(t => {
          const d = new Date(t.completed_at);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        });

        const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);

        for (let i = 0; i < uniqueDates.length; i++) {
          const daysDiff = Math.floor((today.getTime() - uniqueDates[i]) / (1000 * 60 * 60 * 24));
          if (i === 0 && daysDiff <= 1) {
            currentStreak = 1;
          } else if (i > 0) {
            const prevDaysDiff = Math.floor((today.getTime() - uniqueDates[i - 1]) / (1000 * 60 * 60 * 24));
            if (daysDiff === prevDaysDiff + 1) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
      }

      setStats({
        totalXP,
        currentStreak,
        level,
        username: profile?.username || user?.email?.split('@')[0] || 'Usuario',
        avatarUrl: profile?.avatar_url || ''
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  /** ================================
   *  LOAD TASKS (con dificultad)
   *  ================================ */
  const loadTasks = async () => {
    try {
      const { data: userCategories } = await supabase
        .from("user_categories")
        .select("category")
        .eq("user_id", user?.id!)
        .eq("active", true) as { data: { category: string }[] | null };

      if (!userCategories || userCategories.length === 0) {
        setTasks([]);
        setLoading(false);
        return;
      }

      const activeCategories = userCategories.map((uc) => uc.category);
      const today = new Date().toISOString().split('T')[0];

      // Dificultad del usuario según su nivel actual
      // (usamos el nivel localmente; en el primer render puede ser 1. Se recalcula tras stats)
      const userDifficulty = difficultyFromUserLevel(stats.level || 1);

      // Ver si ya hay daily_tasks hoy
      const { data: dailyTasksData } = await supabase
        .from("daily_tasks")
        .select("task_id")
        .eq("user_id", user?.id!)
        .eq("assigned_date", today) as { data: { task_id: string }[] | null };

      if (dailyTasksData && dailyTasksData.length > 0) {
        // Cargar tasks y filtrar por categoría activa + prefijo dificultad
        const taskIds = dailyTasksData.map(dt => dt.task_id);
        const { data: existingTasks } = await supabase
          .from("tasks")
          .select("*")
          .in("id", taskIds);

        const filteredExisting = (existingTasks || []).filter(t => {
          const matchesCategory = activeCategories.includes(t.category);
          const d = parseDifficultyFromText(t.title) || parseDifficultyFromText(t.id);
          const matchesDifficulty = d === userDifficulty;
          return matchesCategory && matchesDifficulty;
        });

        // Detectar categorías faltantes para esta dificultad
        const categoriesWithTasks = new Set(filteredExisting.map(t => t.category));
        const missingCategories = activeCategories.filter(cat => !categoriesWithTasks.has(cat));

        // Eliminar de daily_tasks las que no coincidan con categoría activa o dificultad
        const invalidTasks = (existingTasks || []).filter(t => {
          const inActive = activeCategories.includes(t.category);
          const d = parseDifficultyFromText(t.title) || parseDifficultyFromText(t.id);
          const matchDiff = d === userDifficulty;
          return !(inActive && matchDiff);
        });

        if (invalidTasks.length > 0) {
          const idsToRemove = invalidTasks.map(t => t.id);
          await supabase
            .from("daily_tasks")
            .delete()
            .eq("user_id", user?.id!)
            .eq("assigned_date", today)
            .in("task_id", idsToRemove);
        }

        // Añadir tasks para categorías faltantes (solo de la dificultad del usuario)
        let updatedTasks = [...filteredExisting];

        if (missingCategories.length > 0) {
          for (const category of missingCategories) {
            const { data: categoryTasks } = await supabase
              .from("tasks")
              .select("*")
              .eq("category", category);

            const eligibleByPrefix = (categoryTasks || []).filter(t => {
              const d = parseDifficultyFromText(t.title) || parseDifficultyFromText(t.id);
              return d === userDifficulty;
            });

            if (eligibleByPrefix.length > 0) {
              // Seleccionar 5 aleatorias de esta categoría y dificultad
              const shuffled = [...eligibleByPrefix].sort(() => Math.random() - 0.5);
              const selected = shuffled.slice(0, 5);

              // Guardar en daily_tasks
              const toInsert = selected.map(task => ({
                user_id: user?.id!,
                task_id: task.id,
                assigned_date: today
              }));
              await supabase.from("daily_tasks").insert(toInsert as any);

              updatedTasks = [...updatedTasks, ...selected];
            }
          }
        }

        // Mantener orden (primero las que ya existían en daily_tasks y son válidas)
        const validIdsInDaily = dailyTasksData
          .map(dt => dt.task_id)
          .filter(id => updatedTasks.some(t => t.id === id));
        const appended = updatedTasks.filter(t => !validIdsInDaily.includes(t.id)).map(t => t.id);
        const finalTaskIds = [...validIdsInDaily, ...appended];

        const orderedTasks = finalTaskIds
          .map(id => updatedTasks.find(t => t.id === id))
          .filter(Boolean) as Task[];

        setTasks(orderedTasks);
        setCurrentIndex(0);
        setLoading(false);
        return;
      }

      // No hay daily_tasks hoy → generar nuevas por categoría y dificultad del usuario
      const { data: allTasks, error } = await supabase
        .from("tasks")
        .select("*")
        .in("category", activeCategories);

      if (error) throw error;

      // Filtrar por dificultad del usuario mediante prefijo
      const eligibleAll = (allTasks || []).filter(t => {
        const d = parseDifficultyFromText(t.title) || parseDifficultyFromText(t.id);
        return d === userDifficulty;
      });

      // Agrupar por categoría
      const tasksByCategory: Record<string, Task[]> = {};
      eligibleAll.forEach(task => {
        if (!tasksByCategory[task.category]) tasksByCategory[task.category] = [];
        tasksByCategory[task.category].push(task);
      });

      // Seleccionar 5 por categoría
      const selectedTasks: Task[] = [];
      Object.keys(tasksByCategory).forEach(category => {
        const categoryTasks = tasksByCategory[category];
        const shuffled = [...categoryTasks].sort(() => Math.random() - 0.5);
        selectedTasks.push(...shuffled.slice(0, 5));
      });

      // Mezclar entre categorías
      const finalTasks = shuffleTasks(selectedTasks);

      // Guardar daily_tasks
      const dailyTasksToInsert = finalTasks.map(task => ({
        user_id: user?.id!,
        task_id: task.id,
        assigned_date: today
      }));
      if (dailyTasksToInsert.length > 0) {
        await supabase.from("daily_tasks").insert(dailyTasksToInsert as any);
      }

      setTasks(finalTasks);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error(t("error_loading_tasks") || "Error al cargar tus tareas");
    } finally {
      setLoading(false);
    }
  };

  /** ================================
   *  CURRENT TASK + TRANSLATIONS
   *  ================================ */
  const current = tasks[currentIndex];
  const translatedTask = current ? getTaskTranslation(current.id, locale) : null;
  const taskTitle = stripDifficultyPrefix(translatedTask?.title || current?.title);
  const taskDescription = translatedTask?.description || current?.description;

  /** ================================
   *  COMPLETE / SKIP (respetando dificultad)
   *  ================================ */
  const handleComplete = useCallback(async () => {
    if (!current) return;
    try {
      const today = new Date().toISOString().split('T')[0];

      await supabase.from("completed_tasks").insert({
        user_id: user?.id!,
        task_id: current.id,
        completed_at: new Date().toISOString(),
        skipped: false,
      } as any);

      await supabase
        .from("daily_tasks")
        .delete()
        .eq("user_id", user?.id!)
        .eq("task_id", current.id)
        .eq("assigned_date", today);

      toast.success(t("task_completed") || "¡Tarea completada! 🎉");

      // Preparar reemplazo desde misma categoría y misma dificultad del usuario
      const userDifficulty = difficultyFromUserLevel(stats.level || 1);

      const { data: categoryTasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("category", current.category);

      const usedTaskIds = tasks.map(t => t.id);
      const availableTasks = (categoryTasks || []).filter(task => {
        const d = parseDifficultyFromText(task.title) || parseDifficultyFromText(task.id);
        return d === userDifficulty && !usedTaskIds.includes(task.id);
      });

      const newTasks = [...tasks];
      newTasks.splice(currentIndex, 1);

      if (availableTasks.length > 0) {
        const randomTask = availableTasks[Math.floor(Math.random() * availableTasks.length)];
        const randomPosition = Math.floor(Math.random() * (newTasks.length + 1));
        newTasks.splice(randomPosition, 0, randomTask);

        await supabase.from("daily_tasks").insert({
          user_id: user?.id!,
          task_id: randomTask.id,
          assigned_date: today
        } as any);
      }

      // Reescribir daily_tasks con el nuevo orden
      await supabase
        .from("daily_tasks")
        .delete()
        .eq("user_id", user?.id!)
        .eq("assigned_date", today);

      const dailyTasksToInsert = newTasks.map(task => ({
        user_id: user?.id!,
        task_id: task.id,
        assigned_date: today
      }));
      if (dailyTasksToInsert.length > 0) {
        await supabase.from("daily_tasks").insert(dailyTasksToInsert as any);
      }

      setTasks(newTasks);
      const newIndex = Math.min(currentIndex, newTasks.length - 1);
      setCurrentIndex(newIndex >= 0 ? newIndex : 0);
    } catch (e) {
      console.error(e);
      toast.error(t("error_complete") || "Error al completar la tarea");
    }
  }, [current, tasks, currentIndex, user?.id, t, stats.level]);

  const handleSkip = useCallback(async () => {
    if (!current) return;
    try {
      const today = new Date().toISOString().split('T')[0];

      await supabase.from("completed_tasks").insert({
        user_id: user?.id!,
        task_id: current.id,
        completed_at: new Date().toISOString(),
        skipped: true,
      } as any);

      await supabase
        .from("daily_tasks")
        .delete()
        .eq("user_id", user?.id!)
        .eq("task_id", current.id)
        .eq("assigned_date", today);

      toast.info(t("task_skipped") || "Tarea omitida");

      // Reemplazo misma categoría + dificultad del usuario
      const userDifficulty = difficultyFromUserLevel(stats.level || 1);

      const { data: categoryTasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("category", current.category);

      const usedTaskIds = tasks.map(t => t.id);
      const availableTasks = (categoryTasks || []).filter(task => {
        const d = parseDifficultyFromText(task.title) || parseDifficultyFromText(task.id);
        return d === userDifficulty && !usedTaskIds.includes(task.id);
      });

      const newTasks = [...tasks];
      newTasks.splice(currentIndex, 1);

      if (availableTasks.length > 0) {
        const randomTask = availableTasks[Math.floor(Math.random() * availableTasks.length)];
        const randomPosition = Math.floor(Math.random() * (newTasks.length + 1));
        newTasks.splice(randomPosition, 0, randomTask);

        await supabase.from("daily_tasks").insert({
          user_id: user?.id!,
          task_id: randomTask.id,
          assigned_date: today
        } as any);
      }

      // Reescribir daily_tasks con nuevo orden
      await supabase
        .from("daily_tasks")
        .delete()
        .eq("user_id", user?.id!)
        .eq("assigned_date", today);

      const dailyTasksToInsert = newTasks.map(task => ({
        user_id: user?.id!,
        task_id: task.id,
        assigned_date: today
      }));
      if (dailyTasksToInsert.length > 0) {
        await supabase.from("daily_tasks").insert(dailyTasksToInsert as any);
      }

      setTasks(newTasks);
      const newIndex = Math.min(currentIndex, newTasks.length - 1);
      setCurrentIndex(newIndex >= 0 ? newIndex : 0);
    } catch (e) {
      console.error(e);
      toast.error(t("error_skip") || "Error al omitir la tarea");
    }
  }, [current, tasks, currentIndex, user?.id, t, stats.level]);

  /** ================================
   *  SWIPE / NAV
   *  ================================ */
  const prev = () => setCurrentIndex((i) => Math.max(i - 1, 0));
  const next = () => setCurrentIndex((i) => Math.min(i + 1, tasks.length - 1));

  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;

    if (isLeftSwipe) next();
    if (isRightSwipe) prev();
  };

  /** ================================
   *  LOADING / EMPTY
   *  ================================ */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!current) {
    const hasCompletedTasksToday = tasks.length === 0 && !loading;

    return (
      <div className="min-h-screen bg-background p-6 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-hero text-white p-4 shadow-button">
          <div className="max-w-2xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-black">{t("app_name")}</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarImage src={stats.avatarUrl} />
                    <AvatarFallback className="bg-white text-primary text-sm font-black">
                      {stats.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  {t("profile")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  {t("settings")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="text-6xl mb-4">{hasCompletedTasksToday ? "🎉" : "🎯"}</div>
            <h2 className="text-2xl font-bold mb-2">
              {hasCompletedTasksToday ? t("all_done_title") : t("no_tasks_title")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {hasCompletedTasksToday ? t("all_done_desc") : t("no_tasks_desc")}
            </p>
            <Button onClick={() => navigate("/settings")}>{t("go_settings")}</Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  /** ================================
   *  LEVEL PROGRESS
   *  ================================ */
  const xpToNextLevel = stats.level * 100;
  const currentLevelXP = stats.totalXP % 100;
  const levelProgress = (currentLevelXP / 100) * 100;

  /** ================================
   *  RENDER
   *  ================================ */
  return (
    <div className="min-h-screen bg-background flex flex-col pb-16">
      {/* Header - Simplified */}
      <div className="bg-gradient-hero text-white p-4 shadow-button">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black">{t("app_name")}</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
                <Avatar className="h-8 w-8 border-2 border-white">
                  <AvatarImage src={stats.avatarUrl} />
                  <AvatarFallback className="bg-white text-primary text-sm font-black">
                    {stats.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="h-4 w-4 mr-2" />
                {t("profile")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <SettingsIcon className="h-4 w-4 mr-2" />
                {t("settings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                {t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Compact User Stats */}
      <div className="bg-gradient-hero text-white px-4 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-button border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-300" />
                  <span className="font-bold text-lg">{t("level")} {stats.level}</span>
                </div>
                <div className="h-4 w-px bg-white/30" />
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-300" />
                  <span className="font-bold">{stats.currentStreak}</span>
                </div>
                <div className="h-4 w-px bg-white/30" />
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-300" />
                  <span className="font-bold">{stats.totalXP}</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs opacity-80">
                <span>{currentLevelXP} XP</span>
                <span>{xpToNextLevel} XP</span>
              </div>
              <Progress value={levelProgress} className="h-2 bg-white/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Task Card */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center gap-6">
        <div className="w-full max-w-md">
          <Card 
            className="w-full shadow-hover" 
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <CardContent className="p-10 text-center relative">
              {/* Category color indicator at top */}
              <div 
                className="absolute top-0 left-0 right-0 h-2 rounded-t-2xl"
                style={{ backgroundColor: getCategoryColor(current.category) }}
              />

              <div className="mb-6 mt-2">
                <div className="text-8xl mb-8 animate-scale-in">{current.icon || getCategoryIcon(current.category)}</div>
                <div 
                  className="inline-block px-5 py-2 rounded-full text-white text-sm font-black mb-6 uppercase tracking-wider shadow-button"
                  style={{ backgroundColor: getCategoryColor(current.category) }}
                >
                  {getCategoryName(current.category, locale)}
                </div>

                {/* Badge de Dificultad (opcional, derivada del prefijo) */}
                <div className="mb-2">
                  <span className="text-xs font-bold uppercase opacity-70">
                    {parseDifficultyFromText(current.title) || parseDifficultyFromText(current.id) || ''}
                  </span>
                </div>

                <h2 className="text-3xl font-black mb-6 leading-tight text-foreground">
                  {taskTitle}
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">{taskDescription}</p>
              </div>

              <div className="flex flex-col gap-4 mt-8">
                <Button 
                  className="w-full shadow-button hover:scale-[1.02] transition-transform" 
                  size="lg" 
                  onClick={handleComplete}
                  variant="success"
                >
                  {t("complete")}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full hover:scale-[1.02] transition-transform" 
                  size="lg" 
                  onClick={handleSkip}
                >
                  {t("skip")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation controls */}
        <div className="flex items-center justify-center gap-6 text-base">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={prev} 
            disabled={currentIndex === 0}
            className="hover:scale-110 transition-transform rounded-full"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2 font-bold text-muted-foreground">
            <span className="text-xl text-primary">{currentIndex + 1}</span>
            <span>/</span>
            <span className="text-lg">{tasks.length}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={next} 
            disabled={currentIndex >= tasks.length - 1}
            className="hover:scale-110 transition-transform rounded-full"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-primary/5 via-accent/5 to-mint/5 text-center text-xs text-muted-foreground">
        <p>{t("interact_hint")}</p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
