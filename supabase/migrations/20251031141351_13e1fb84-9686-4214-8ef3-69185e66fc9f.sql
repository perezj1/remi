-- Add new category: reducir uso de pantallas
-- First, update categories colors to be unique
-- Add avatar_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Insert tasks for "reducir_uso_pantallas" category
INSERT INTO public.tasks (category, title, description, icon) VALUES
('reducir_uso_pantallas', 'Desactiva notificaciones', 'Silencia las notificaciones no esenciales en tu teléfono durante 2 horas', '🔕'),
('reducir_uso_pantallas', 'Lee un libro físico', 'Lee al menos 20 páginas de un libro en papel en lugar de tu pantalla', '📚'),
('reducir_uso_pantallas', 'Camina sin teléfono', 'Sal a caminar 15 minutos sin llevar tu teléfono contigo', '🚶'),
('reducir_uso_pantallas', 'Cena sin pantallas', 'Disfruta tu cena sin ver televisión, teléfono o tablet', '🍽️'),
('reducir_uso_pantallas', 'Modo avión por la noche', 'Activa el modo avión 1 hora antes de dormir', '✈️'),
('reducir_uso_pantallas', 'Charla cara a cara', 'Ten una conversación de 10 minutos con alguien sin mirar tu teléfono', '💬'),
('reducir_uso_pantallas', 'Desinstala una app', 'Elimina una aplicación que te hace perder tiempo', '🗑️'),
('reducir_uso_pantallas', 'Zona libre de pantallas', 'Designa un espacio en casa donde no se permiten dispositivos', '🏠'),
('reducir_uso_pantallas', 'Temporizador de uso', 'Configura límites de tiempo en tus apps más usadas', '⏱️'),
('reducir_uso_pantallas', 'Actividad al aire libre', 'Pasa 30 minutos haciendo una actividad al aire libre sin pantallas', '🌳')
ON CONFLICT DO NOTHING;