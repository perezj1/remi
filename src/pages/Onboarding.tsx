import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CATEGORIES } from '@/lib/categories';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleComplete = async () => {
    if (selectedCategories.length === 0) {
      toast.error('Selecciona al menos una categoría');
      return;
    }

    setLoading(true);
    try {
      // Insertar categorías seleccionadas
      const categoryRecords = selectedCategories.map(category => ({
        user_id: user?.id,
        category,
        active: true
      }));

      const { error } = await supabase
        .from('user_categories')
        .insert(categoryRecords);

      if (error) throw error;

      toast.success('¡Perfecto! Empecemos tu viaje');
      navigate('/');
    } catch (error) {
      console.error('Error saving categories:', error);
      toast.error('Error al guardar tus categorías');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <div className="text-center mb-8 mt-8">
          <h1 className="text-3xl font-bold mb-2">¿Qué quieres lograr?</h1>
          <p className="text-muted-foreground">
            Selecciona todas las categorías que te interesen
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
                onClick={() => toggleCategory(category.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{category.icon}</div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-auto sticky bottom-6 bg-background pt-4">
          <Button
            className="w-full"
            size="lg"
            onClick={handleComplete}
            disabled={loading || selectedCategories.length === 0}
          >
            {loading ? 'Guardando...' : `Continuar (${selectedCategories.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
