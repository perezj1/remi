// src/pages/ShareInvitePage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { acceptShareInvite, getShareInvite } from "@/lib/shareInvitesApi";
import { Check, ExternalLink, Loader2, AlertTriangle } from "lucide-react";

type InviteStatus = "pending" | "accepted" | "rejected" | "expired";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | {
      kind: "ready";
      status: InviteStatus;
      senderDisplayName: string | null;
      previewLines: string[];
      dueDate: string | null;
    };

function safeJoinPreview(lines: string[]) {
  const text = (lines || []).filter(Boolean).join("\n").trim();
  // UI: no saturar (máximo 2 líneas visibles)
  const parts = text.split("\n").map((s) => s.trim()).filter(Boolean);
  return parts.slice(0, 2).join("\n");
}

function normalizeInviteStatus(raw: any): InviteStatus {
  if (raw === "accepted" || raw === "rejected" || raw === "expired") return raw;
  return "pending";
}

export default function ShareInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();

  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [accepting, setAccepting] = useState(false);

  const safeToken = useMemo(() => (token || "").trim(), [token]);

  // Opcional: si vienes del login y guardaste token, no bloquea si no existe
  useEffect(() => {
    try {
      const pending = sessionStorage.getItem("pending_share_token");
      if (pending && safeToken && pending === safeToken) {
        sessionStorage.removeItem("pending_share_token");
      }
    } catch {
      // ignore
    }
  }, [safeToken]);

  // Carga pública del invite (JWT desactivado en get-share-invite)
  useEffect(() => {
    if (!safeToken) {
      setState({ kind: "error", message: t("shareInvite.missingToken") });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setState({ kind: "loading" });
        const data = await getShareInvite(safeToken);
        if (cancelled) return;

        setState({
          kind: "ready",
          status: normalizeInviteStatus((data as any)?.status),
          senderDisplayName: (data as any)?.senderDisplayName ?? null,
          previewLines: (data as any)?.previewLines ?? [],
          dueDate: (data as any)?.dueDate ?? null,
        });
      } catch (e: any) {
        console.error(e);
        if (cancelled) return;
        setState({
          kind: "error",
          message: e?.message || t("shareInvite.loadError"),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [safeToken, t]);

  const onAccept = async () => {
    if (!safeToken) return;

    // Si no está logueado -> login y volver a esta misma ruta
    if (!user) {
      try {
        sessionStorage.setItem("pending_share_token", safeToken);
      } catch {
        // ignore
      }
      navigate(`/auth?redirect=/share/${safeToken}`);
      return;
    }

    try {
      setAccepting(true);

      const res = await acceptShareInvite(safeToken);

      if (!res?.ok) {
        alert(res?.warning || t("shareInvite.acceptError"));
        return;
      }

      // Refrescar estado (para pintar "accepted")
      const data = await getShareInvite(safeToken);
      setState({
        kind: "ready",
        status: normalizeInviteStatus((data as any)?.status),
        senderDisplayName: (data as any)?.senderDisplayName ?? null,
        previewLines: (data as any)?.previewLines ?? [],
        dueDate: (data as any)?.dueDate ?? null,
      });

      // Ir al home y (opcional) abrir la tarea si quieres: ?task=<id>
      // Si tu app ya soporta /?task=... puedes usarlo:
      if (res.newBrainItemId) {
        navigate(`/?task=${encodeURIComponent(res.newBrainItemId)}&shared=1`);
      } else {
        navigate(`/?shared=1`);
      }
    } catch (e) {
      console.error(e);
      alert(t("shareInvite.acceptError"));
    } finally {
      setAccepting(false);
    }
  };

  const titleText = useMemo(() => {
    if (state.kind !== "ready") return "";
    const name = state.senderDisplayName || t("shareInvite.someone");
    const text = safeJoinPreview(state.previewLines || []);
    // Formato exacto pedido: "(usuario) quiere que recuerdes: (texto)"
    return t("shareInvite.message", { name, text });
  }, [state, t]);

  const statusLine = useMemo(() => {
    if (state.kind !== "ready") return "";
    if (state.status === "accepted") return t("shareInvite.alreadyAccepted");
    if (state.status === "expired") return t("shareInvite.expired");
    if (state.status === "rejected") return t("shareInvite.rejected");
    return "";
  }, [state, t]);

  return (
    <div className="remi-page min-h-dvh bg-[#F6F7FB] text-slate-900 flex flex-col">
      <header
        className="bg-[#7d59c9] text-white px-4 pb-8 rounded-b-3xl shadow-md"
        style={{ paddingTop: "calc(2rem + env(safe-area-inset-top))" }}
      >
        <h1 className="text-lg font-semibold">{t("shareInvite.pageTitle")}</h1>
        <p className="text-xs text-white/80">{t("shareInvite.pageSubtitle")}</p>
      </header>

      <main
        className="flex-1 px-4 pt-4 bg-[#F6F7FB] remi-scroll"
        style={{ paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}
      >
        {state.kind === "loading" && (
          <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_14px_34px_rgba(15,23,42,0.06)] px-4 py-4 flex items-center gap-3">
            <Loader2 className="animate-spin text-slate-400" size={18} />
            <p className="text-[13px] text-slate-600">{t("shareInvite.loading")}</p>
          </div>
        )}

        {state.kind === "error" && (
          <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_14px_34px_rgba(15,23,42,0.06)] px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-slate-900">
                  {t("shareInvite.invalidLinkTitle")}
                </p>
                <p className="text-[12px] text-slate-500 mt-1 whitespace-pre-wrap">
                  {state.message}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#7d59c9]"
              >
                <ExternalLink size={16} />
                {t("shareInvite.goHome")}
              </Link>
            </div>
          </div>
        )}

        {state.kind === "ready" && (
          <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_14px_34px_rgba(15,23,42,0.06)] px-4 py-4">
            <p className="text-[14px] font-semibold text-slate-900 whitespace-pre-wrap">
              {titleText}
            </p>

            {state.dueDate ? (
              <p className="text-[12px] text-slate-500 mt-2">
                {t("shareInvite.due")}: {new Date(state.dueDate).toLocaleString()}
              </p>
            ) : null}

            <div className="mt-4">
              {state.status === "pending" ? (
                <button
                  type="button"
                  onClick={onAccept}
                  disabled={accepting}
                  className="w-full rounded-2xl bg-[#7d59c9] text-white py-3 text-[14px] font-semibold shadow-md hover:opacity-95 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  {accepting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      {t("shareInvite.accepting")}
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      {t("shareInvite.acceptCta")}
                    </>
                  )}
                </button>
              ) : (
                <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-[13px] text-slate-600">
                  {statusLine}
                </div>
              )}
            </div>

            <div className="mt-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#7d59c9]"
              >
                <ExternalLink size={16} />
                {t("shareInvite.openRemi")}
              </Link>
            </div>

            {/* Nota: si el usuario NO está logueado, al pulsar se va a /auth y vuelve */}
            {!user && state.status === "pending" ? (
              <p className="mt-3 text-[12px] text-slate-500">
                {t("shareInvite.loginHint")}
              </p>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
