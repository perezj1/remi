import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { ensurePushSubscription } from "@/hooks/usePush";

export default function PushBootstrapper() {
  const { user } = useAuth();
  const { locale } = useI18n();

  useEffect(() => {
    if (!user) return;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Zurich";
    ensurePushSubscription(user.id, locale, tz);
  }, [user, locale]);

  return null;
}
