create unique index if not exists remi_notifications_log_social_push_user_type_uidx
on public.remi_notifications_log (user_id, type)
where type like 'SOCIAL_PUSH:%';
