// src/pages/ShareInvitePage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { acceptShareInvite, getShareInvite } from "@/lib/shareInvitesApi";
import {
  Check,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Share2,
} from "lucide-react";

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

      const data = await getShareInvite(safeToken);
      setState({
        kind: "ready",
        status: normalizeInviteStatus((data as any)?.status),
        senderDisplayName: (data as any)?.senderDisplayName ?? null,
        previewLines: (data as any)?.previewLines ?? [],
        dueDate: (data as any)?.dueDate ?? null,
      });

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

  const messageLine1 = useMemo(() => {
  if (state.kind !== "ready") return "";
  const name = state.senderDisplayName || t("shareInvite.someone");
  return t("shareInvite.messageLine1", { name }); // "X quiere que recuerdes:"
}, [state, t]);

const messageLine2 = useMemo(() => {
  if (state.kind !== "ready") return "";
  return safeJoinPreview(state.previewLines || []); // "texto" (máx 2 líneas si quieres)
}, [state]);


  const statusLine = useMemo(() => {
    if (state.kind !== "ready") return "";
    if (state.status === "accepted") return t("shareInvite.alreadyAccepted");
    if (state.status === "expired") return t("shareInvite.expired");
    if (state.status === "rejected") return t("shareInvite.rejected");
    return "";
  }, [state, t]);

  return (
    <div className="min-h-[100dvh] bg-[#F6F7FB] text-slate-900 flex flex-col">
      {/* Header */}
      <header
        className="bg-[#7d59c9] text-white px-5 pb-12 rounded-b-[36px] shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
        style={{ paddingTop: "calc(2.25rem + env(safe-area-inset-top))" }}
      >
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-xl font-semibold leading-tight">
            {t("shareInvite.pageTitle")}
          </h1>
          <p className="text-sm text-white/80 mt-1">
            {t("shareInvite.pageSubtitle")}
          </p>
        </div>
      </header>

      {/* Main */}
      <main
        className="flex-1 px-4 -mt-0"
        style={{ paddingBottom: "calc(36px + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto w-full max-w-sm">
          {/* Card (más centrada verticalmente) */}
          <div className="min-h-[calc(100dvh-220px)] flex items-start justify-center pt-24">
            <div className="w-full rounded-[36px] bg-white/85 backdrop-blur border border-white/70 shadow-[0_18px_55px_rgba(15,23,42,0.14)] p-7">
              {/* Icono superior (Share2) */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-[22px] bg-[#7d59c9]/10 text-[#7d59c9] flex items-center justify-center">
                  <Share2 size={26} />
                </div>
              </div>

              {state.kind === "loading" && (
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                    <Loader2 className="animate-spin" size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-slate-900">
                      {t("shareInvite.loading")}
                    </p>
                    <p className="text-[12px] text-slate-500 mt-0.5">
                      {t("shareInvite.pageSubtitle")}
                    </p>
                  </div>
                </div>
              )}

              {state.kind === "error" && (
                <div className="mt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-slate-900">
                        {t("shareInvite.invalidLinkTitle")}
                      </p>
                      <p className="text-[13px] text-slate-500 mt-1 whitespace-pre-wrap">
                        {state.message}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
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
                <div className="mt-6 flex flex-col gap-5">
                  <div>
                    <div className="space-y-1">
  <p className="text-[15px] font-semibold text-slate-900 leading-snug">
    {messageLine1}
  </p>
  <p className="text-[15px] font-semibold text-slate-900 leading-snug">
    {messageLine2}
  </p>
</div>


                    {state.dueDate ? (
                      <p className="text-[13px] text-slate-500 mt-2">
                        {t("shareInvite.due")}:{" "}
                        {new Date(state.dueDate).toLocaleString()}
                      </p>
                    ) : null}
                  </div>

                  {/* CTA invertido: morado + texto blanco */}
                  {state.status === "pending" ? (
                    <button
                      type="button"
                      onClick={onAccept}
                      disabled={accepting}
                      className="w-full rounded-full bg-[#7d59c9] text-white py-3.5 text-[15px] font-semibold shadow-[0_16px_40px_rgba(125,89,201,0.35)] hover:opacity-95 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                    >
                      {accepting ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          {t("shareInvite.accepting")}
                        </>
                      ) : (
                        <>
                          <Check size={18} />
                          {t("shareInvite.acceptCta")}
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-[13px] text-slate-600">
                      {statusLine}
                    </div>
                  )}

                  {/* Link abajo */}
                {/*   <div className="flex items-center gap-2">
                    <ExternalLink size={16} className="text-[#7d59c9]" />
                    <Link
                      to="/"
                      className="text-[13px] font-semibold text-[#7d59c9]"
                    >
                      {t("shareInvite.openRemi")}
                    </Link>
                  </div> */}

                  {!user && state.status === "pending" ? (
                    <p className="text-[12px] text-slate-500 -mt-2">
                      {t("shareInvite.loginHint")}
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
