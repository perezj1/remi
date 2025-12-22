import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";

type PasteBannerProps = {
  show: boolean;
  onDismiss: () => void;
  onInsert: (text: string) => void;
  disabled?: boolean;
};

export default function PasteBanner({
  show,
  onDismiss,
  onInsert,
  disabled = false,
}: PasteBannerProps) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);

  const canReadClipboard = useMemo(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined")
      return false;
    const secure = (window as any).isSecureContext === true;
    return secure && !!navigator.clipboard?.readText;
  }, []);

  const effectiveShow = show && canReadClipboard;

  const handlePaste = async () => {
    if (disabled || busy) return;

    try {
      setBusy(true);

      if (!navigator.clipboard?.readText) {
        toast.error(t("capture.paste.toastUnavailable"));
        return;
      }

      const raw = await navigator.clipboard.readText();
      const clip = (raw ?? "").trim();

      if (!clip) {
        toast.message(t("capture.paste.toastEmpty"));
        return;
      }

      onInsert(clip);
      onDismiss();
    } catch {
      toast.error(t("capture.paste.toastDenied"));
    } finally {
      setBusy(false);
    }
  };

  if (!effectiveShow) return null;

  return (
    <div
      style={{
        marginTop: 8,
        borderRadius: 14,
        border: "1px solid rgba(148, 163, 184, 0.35)",
        background: "rgba(248, 250, 252, 0.9)",
        padding: "8px 10px",
        position: "relative", // ✅ para la X absoluta
      }}
    >
      {/* X: solo icono, no empuja altura */}
    {/*   <button
        type="button"
        onClick={onDismiss}
        disabled={disabled || busy}
        aria-label={t("common.close")}
        style={{
          position: "absolute",
          top: 8,
          right: 10,
          width: 24,
          height: 24,
          border: "none",
          background: "transparent",
          padding: 0,
          color: "#94a3b8",
          lineHeight: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X style={{ width: 18, height: 18 }} />
      </button> */}

      {/* Layout principal: texto (stack muy pegado) + botón PEGAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        {/* Texto */}
        <div style={{ flex: 1, minWidth: 0, paddingRight: 26 /* espacio para la X */ }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              lineHeight: "14px",
              margin: 0,
            }}
          >
            {t("capture.paste.title")}
          </div>

          <div
            style={{
              marginTop: 1, // ✅ súper pegado al título
              fontSize: 11,
              color: "#94a3b8",
              lineHeight: "13px",
            }}
          >
            {t("capture.paste.sub")}
          </div>
        </div>

        {/* PEGAR */}
        <button
          type="button"
          onClick={handlePaste}
          disabled={disabled || busy}
          className="inline-flex items-center justify-center rounded-lg flex-shrink-0"
          style={{
            padding: "6px 10px",
            border: "1px solid rgba(125, 89, 201, 0.35)",
            background: "rgba(125, 89, 201, 0.08)",
            fontSize: 12,
            fontWeight: 600,
            color: "#4c1d95",
            opacity: disabled ? 0.6 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {busy ? t("capture.paste.pasting") : t("capture.paste.button")}
        </button>
      </div>
    </div>
  );
}
