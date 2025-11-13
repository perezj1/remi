import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { CATEGORIES, getCategoryName, getCategoryDescription } from '@/lib/categories';
import { toast } from 'sonner';
import { ArrowLeft, Bell } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useI18n } from '@/contexts/I18nContext';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadActiveCategories();
  }, [user, navigate]);

  const loadActiveCategories = async () => {
    try {
      const { data } = await supabase
        .from('user_categories')
        .select('category')
        .eq('user_id', user?.id)
        .eq('active', true);

      setActiveCategories(data?.map(c => c.category) || []);

      // Cargar preferencias de notificaciones
      const { data: prefs } = await supabase
        .from('preferences')
        .select('notifications_enabled')
        .eq('user_id', user?.id)
        .single();

      if (prefs) {
        setNotificationsEnabled(prefs.notifications_enabled);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error(t('error_loading_settings'));
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('preferences')
        .update({ notifications_enabled: enabled })
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotificationsEnabled(enabled);
      toast.success(enabled ? t('notifications_enabled') : t('notifications_disabled'));
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error(t('error_updating_settings'));
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = async (categoryId: string) => {
    setSaving(true);
    try {
      const isActive = activeCategories.includes(categoryId);

      if (isActive) {
        // Desactivar
        await supabase
          .from('user_categories')
          .update({ active: false })
          .eq('user_id', user?.id)
          .eq('category', categoryId);

        setActiveCategories(prev => prev.filter(c => c !== categoryId));
        toast.success('Categoría desactivada');
      } else {
        // Activar (upsert)
        await supabase
          .from('user_categories')
          .upsert({
            user_id: user?.id,
            category: categoryId,
            active: true
          });

        setActiveCategories(prev => [...prev, categoryId]);
        toast.success('Categoría activada');
      }
    } catch (error) {
      console.error('Error toggling category:', error);
      toast.error('Error al actualizar categoría');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header - Duolingo Style */}
      <div className="bg-gradient-hero text-white p-6 shadow-button">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-black">{t('settings')}</h1>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Notificaciones - Duolingo Style */}
        <Card className="shadow-hover border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl font-black">
              <Bell className="h-6 w-6" />
              {t('notifications')}
            </CardTitle>
            <CardDescription className="text-base">
              {t('notifications_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
              <div>
                <p className="font-bold text-lg">{t('daily_reminders')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('daily_reminders_desc')}
                </p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={toggleNotifications}
                disabled={saving}
                className="scale-125"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categorías activas - Duolingo Style */}
        <Card className="shadow-hover border-2">
          <CardHeader>
            <CardTitle className="text-2xl font-black">{t('active_categories')}</CardTitle>
            <CardDescription className="text-base">
              {t('active_categories_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {CATEGORIES.map((category) => {
              const isActive = activeCategories.includes(category.id);
              return (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-5 border-2 rounded-2xl shadow-soft hover:shadow-button transition-all hover:scale-[1.02]"
                  style={{
                    borderColor: category.color,
                    background: isActive ? `${category.color}15` : 'transparent'
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{category.icon}</div>
                    <div>
                      <h3 className="font-bold text-lg">{getCategoryName(category.id, locale)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {getCategoryDescription(category.id, locale)}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isActive}
                    onCheckedChange={() => toggleCategory(category.id)}
                    disabled={saving}
                    className="scale-110"
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default Settings;
