import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User, Mail, Calendar, LogOut, Globe, Flame, Trophy, Heart, Share2, Camera, Award, Bell } from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { useI18n, Locale } from "@/contexts/I18nContext";
import { RewardsModal } from "@/components/RewardsModal";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t, locale, setLocale } = useI18n();
  
  const [profile, setProfile] = useState({
    username: "",
    email: user?.email || "",
    created_at: "",
    avatar_url: ""
  });
  const [stats, setStats] = useState({
    totalXP: 0,
    currentStreak: 0,
    maxStreak: 0,
    hearts: 3,
    level: 1
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      setProfile({
        username: data?.username || "",
        email: user?.email || "",
        created_at: data?.created_at || "",
        avatar_url: data?.avatar_url || ""
      });

      if (data?.locale) {
        setLocale(data.locale as Locale);
      }

      // Load preferences
      const { data: prefs } = await supabase
        .from("preferences")
        .select("notifications_enabled")
        .eq("user_id", user?.id)
        .single();

      if (prefs) {
        setNotificationsEnabled(prefs.notifications_enabled);
      }

      // Load gamification stats
      const { data: completedTasks } = await supabase
        .from("completed_tasks")
        .select("*")
        .eq("user_id", user?.id)
        .eq("skipped", false);

      const totalXP = (completedTasks?.length || 0) * 10;
      const level = Math.floor(totalXP / 100) + 1;

      // Calculate current streak
      const { data: recentTasks } = await supabase
        .from("completed_tasks")
        .select("completed_at")
        .eq("user_id", user?.id)
        .eq("skipped", false)
        .order("completed_at", { ascending: false })
        .limit(30);

      let currentStreak = 0;
      let maxStreak = 0;
      let tempStreak = 0;
      
      if (recentTasks && recentTasks.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dates = recentTasks.map(t => {
          const d = new Date(t.completed_at);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        });

        const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);
        
        for (let i = 0; i < uniqueDates.length; i++) {
          const daysDiff = Math.floor((today.getTime() - uniqueDates[i]) / (1000 * 60 * 60 * 24));
          
          if (i === 0 && daysDiff <= 1) {
            currentStreak = 1;
            tempStreak = 1;
          } else if (i > 0) {
            const prevDaysDiff = Math.floor((today.getTime() - uniqueDates[i-1]) / (1000 * 60 * 60 * 24));
            if (daysDiff === prevDaysDiff + 1) {
              tempStreak++;
              if (i === 1 && daysDiff <= 2) currentStreak = tempStreak;
            } else {
              maxStreak = Math.max(maxStreak, tempStreak);
              tempStreak = 1;
            }
          }
        }
        maxStreak = Math.max(maxStreak, tempStreak, currentStreak);
      }

      setStats({
        totalXP,
        currentStreak,
        maxStreak,
        hearts: 3,
        level
      });

    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error(t("error_loading_profile"));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          username: profile.username,
          locale
        })
        .eq("id", user?.id);

      if (profileError) throw profileError;

      const { error: prefsError } = await supabase
        .from("preferences")
        .update({ notifications_enabled: notificationsEnabled })
        .eq("user_id", user?.id);

      if (prefsError) throw prefsError;

      toast.success(t("profile_updated"));
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t("error_updating_profile"));
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success('Foto de perfil actualizada');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'REMI',
      text: t('share_message'),
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast.success('¡Link copiado al portapapeles!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16">
      {/* Header - Duolingo Style */}
      <div className="bg-gradient-hero text-white p-6 shadow-button">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-black">{t("profile")}</h1>
        </div>
      </div>

      {/* Profile Content - Duolingo Style */}
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-6">
        {/* Avatar Card */}
        <Card className="shadow-hover border-2">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-primary shadow-button">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-5xl font-black">
                    {profile.username.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-0 right-0 bg-accent text-white rounded-full p-3 cursor-pointer hover:scale-110 transition-transform shadow-button"
                >
                  <Camera className="h-5 w-5" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
              <h2 className="text-3xl font-black">{profile.username}</h2>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card - Duolingo Style */}
        <Card className="shadow-hover border-2">
          <CardContent className="pt-6 pb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-yellow-500/10 rounded-2xl shadow-soft hover:shadow-button transition-all">
                <Trophy className="h-10 w-10 text-yellow-500" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{t("level")}</p>
                  <p className="text-3xl font-black">{stats.level}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-orange-500/10 rounded-2xl shadow-soft hover:shadow-button transition-all">
                <Flame className="h-10 w-10 text-orange-500" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{t("streak")}</p>
                  <p className="text-3xl font-black">{stats.currentStreak}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-500/10 rounded-2xl shadow-soft hover:shadow-button transition-all">
                <div className="text-4xl">⚡</div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{t("total_xp")}</p>
                  <p className="text-3xl font-black">{stats.totalXP}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-2xl shadow-soft hover:shadow-button transition-all">
                <Heart className="h-10 w-10 text-red-500 fill-red-500" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{t("hearts")}</p>
                  <p className="text-3xl font-black">{stats.hearts}</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setShowRewards(true)} 
              variant="outline" 
              className="w-full mt-6 h-12"
              size="lg"
            >
              <Award className="h-5 w-5 mr-2" />
              {t("achievements")}
            </Button>
          </CardContent>
        </Card>

        {/* User Info Card */}
        <Card className="shadow-hover border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-black">
              <User className="h-6 w-6" />
              {t("user_info")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="font-bold">{t("username")}</Label>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
                placeholder={t("enter_username")}
                className="h-12"
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold">{t("email")}</Label>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-2xl">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{profile.email}</span>
              </div>
            </div>

            {/* Member since */}
            <div className="space-y-2">
              <Label className="font-bold">{t("member_since")}</Label>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-2xl">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{formatDate(profile.created_at)}</span>
              </div>
            </div>

            {/* Language Selector */}
            <div className="space-y-2">
              <Label htmlFor="language" className="flex items-center gap-2 font-bold">
                <Globe className="h-5 w-5" />
                {t("language")}
              </Label>
              <Select value={locale} onValueChange={handleLanguageChange}>
                <SelectTrigger id="language" className="shadow-soft hover:shadow-button transition-shadow h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="shadow-card">
                  <SelectItem value="es" className="cursor-pointer">
                    <div className="flex items-center gap-3 py-1">
                      <span className="text-2xl">🇪🇸</span>
                      <span className="font-bold">Español</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="en" className="cursor-pointer">
                    <div className="flex items-center gap-3 py-1">
                      <span className="text-2xl">🇬🇧</span>
                      <span className="font-bold">English</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="de" className="cursor-pointer">
                    <div className="flex items-center gap-3 py-1">
                      <span className="text-2xl">🇩🇪</span>
                      <span className="font-bold">Deutsch</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-2xl">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="notifications" className="font-bold cursor-pointer">
                  {t("notifications")}
                </Label>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            {/* Save button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full"
              size="lg"
            >
              {saving ? t("saving") : t("save_changes")}
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="shadow-hover border-2">
          <CardHeader>
            <CardTitle className="text-2xl font-black">{t("account_actions")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5 mr-2" />
              {t("share_app")}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => navigate("/settings")}
            >
              {t("go_settings")}
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              size="lg"
              onClick={signOut}
            >
              <LogOut className="h-5 w-5 mr-2" />
              {t("logout")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <RewardsModal 
        open={showRewards} 
        onOpenChange={setShowRewards}
        level={stats.level}
        xp={stats.totalXP}
        streak={stats.currentStreak}
      />

      <BottomNav />
    </div>
  );
};

export default Profile;
