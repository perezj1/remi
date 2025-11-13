-- Crear tabla para categorías activas del usuario
CREATE TABLE IF NOT EXISTS public.user_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category)
);

-- Enable RLS
ALTER TABLE public.user_categories ENABLE ROW LEVEL SECURITY;

-- Políticas para user_categories
CREATE POLICY "Users can view their own categories"
ON public.user_categories
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
ON public.user_categories
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
ON public.user_categories
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
ON public.user_categories
FOR DELETE
USING (auth.uid() = user_id);

-- Crear tabla para tasks genéricas
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (tasks son públicas, todos pueden leerlas)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks are viewable by everyone"
ON public.tasks
FOR SELECT
USING (true);

-- Crear tabla para tracking de tasks completadas
CREATE TABLE IF NOT EXISTS public.completed_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID NOT NULL REFERENCES public.tasks(id),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  skipped BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.completed_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own completed tasks"
ON public.completed_tasks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completed tasks"
ON public.completed_tasks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insertar tasks genéricas para cada categoría
INSERT INTO public.tasks (category, title, description, icon) VALUES
-- Bajar peso
('bajar_peso', 'Camina 15 minutos', 'Da un paseo corto después de comer para activar tu metabolismo', '🚶'),
('bajar_peso', 'Bebe agua antes de comer', 'Toma un vaso de agua 20 minutos antes de cada comida', '💧'),
('bajar_peso', 'Usa escaleras', 'Sube escaleras en lugar del ascensor hoy', '🪜'),
('bajar_peso', 'Porciones más pequeñas', 'Usa un plato más pequeño en tu próxima comida', '🍽️'),
('bajar_peso', 'Mastica despacio', 'Tómate al menos 20 minutos para comer tu próxima comida', '⏱️'),

-- Ahorrar
('ahorrar', 'Café en casa', 'Prepara tu café en casa en lugar de comprarlo', '☕'),
('ahorrar', 'Lista de compras', 'Haz una lista antes de ir al supermercado y síguela', '📝'),
('ahorrar', 'Revisa suscripciones', 'Revisa tus suscripciones y cancela las que no uses', '💳'),
('ahorrar', 'Comida casera', 'Cocina en casa en lugar de pedir comida', '🍳'),
('ahorrar', 'Regla 24 horas', 'Espera 24 horas antes de hacer una compra impulsiva', '⏰'),

-- Mantenerse en forma
('mantenerse_forma', '10 flexiones', 'Haz 10 flexiones ahora mismo', '💪'),
('mantenerse_forma', 'Estira 5 minutos', 'Toma 5 minutos para estirar todo tu cuerpo', '🧘'),
('mantenerse_forma', '20 sentadillas', 'Realiza 20 sentadillas con buena forma', '🏋️'),
('mantenerse_forma', 'Plancha 30 segundos', 'Mantén una plancha durante 30 segundos', '⚡'),
('mantenerse_forma', 'Baila una canción', 'Pon música y baila durante una canción completa', '💃'),

-- Dejar de fumar
('dejar_fumar', 'Respira profundo', 'Cuando sientas el deseo, respira profundamente 10 veces', '🌬️'),
('dejar_fumar', 'Bebe agua', 'Mantén una botella de agua cerca y bebe cuando tengas ganas', '💧'),
('dejar_fumar', 'Mastica chicle', 'Ten chicle sin azúcar a mano para ocupar tu boca', '🍬'),
('dejar_fumar', 'Llama a alguien', 'Habla con un amigo durante 5 minutos cuando sientas el impulso', '📞'),
('dejar_fumar', 'Camina 5 minutos', 'Sal a caminar cuando aparezca el deseo de fumar', '🚶'),

-- Comer más sano
('comer_sano', 'Añade una fruta', 'Incluye una fruta en tu próxima comida o snack', '🍎'),
('comer_sano', 'Ensalada de entrada', 'Empieza tu comida con una ensalada pequeña', '🥗'),
('comer_sano', 'Snack de vegetales', 'Prepara palitos de zanahoria o apio como snack', '🥕'),
('comer_sano', 'Evita procesados', 'Elige alimentos sin procesar en tu próxima comida', '🌾'),
('comer_sano', 'Proteína en el desayuno', 'Incluye proteína en tu desayuno de mañana', '🥚'),

-- Dormir mejor
('dormir_mejor', 'Sin pantallas 1 hora antes', 'Apaga todos los dispositivos 1 hora antes de dormir', '📱'),
('dormir_mejor', 'Rutina de sueño', 'Ve a la cama a la misma hora esta noche', '⏰'),
('dormir_mejor', 'Té relajante', 'Prepara una infusión relajante antes de dormir', '🍵'),
('dormir_mejor', 'Oscurece tu habitación', 'Asegúrate de que tu cuarto esté completamente oscuro', '🌙'),
('dormir_mejor', 'Temperatura fresca', 'Mantén tu habitación fresca (18-20°C)', '❄️'),

-- Eliminar stress
('eliminar_stress', 'Meditación 5 minutos', 'Practica 5 minutos de meditación guiada', '🧘'),
('eliminar_stress', 'Escribe 3 cosas positivas', 'Anota 3 cosas buenas que te pasaron hoy', '📝'),
('eliminar_stress', 'Respira 4-7-8', 'Practica la técnica 4-7-8: inhala 4, retén 7, exhala 8', '🌬️'),
('eliminar_stress', 'Música relajante', 'Escucha música tranquila durante 10 minutos', '🎵'),
('eliminar_stress', 'Desconecta 15 minutos', 'Apaga el teléfono y descansa 15 minutos', '📵');