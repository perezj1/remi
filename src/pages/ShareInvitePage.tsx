import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { acceptShareInvite, getShareInvite } from "@/lib/shareInvitesApi";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  ExternalLink,
  Loader2,
  Share2,
  StickyNote,
} from "lucide-react";

type InviteStatus = "pending" | "accepted" | "rejected" | "expired";
type InviteType = "task" | "idea" | null;

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | {
      kind: "ready";
      status: InviteStatus;
      senderDisplayName: string | null;
      previewLines: string[];
      dueDate: string | null;
      inviteType: InviteType;
    };

function safeJoinPreview(lines: string[]) {
  const text = (lines || []).filter(Boolean).join("\n").trim();
  const parts = text.split("\n").map((value) => value.trim()).filter(Boolean);
  return parts.slice(0, 2).join("\n");
}

function normalizeInviteStatus(raw: unknown): InviteStatus {
  if (raw === "accepted" || raw === "rejected" || raw === "expired") return raw;
  return "pending";
}

function normalizeInviteType(raw: unknown): InviteType {
  return raw === "task" || raw === "idea" ? raw : null;
}

function resolveInviteType(raw: unknown, fallback: InviteType): InviteType {
  return normalizeInviteType(raw) ?? fallback;
}

export default function ShareInvitePage() {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();

  const safeT = useMemo(
    () => (key: string, fallback: string, vars?: Record<string, unknown>) => {
      const value = t(key as never, vars as never);
      if (!value || value === key) return fallback;
      return value;
    },
    [t],
  );

  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [accepting, setAccepting] = useState(false);

  const safeToken = useMemo(() => (token || "").trim(), [token]);
  const inviteTypeHint = useMemo(
    () => normalizeInviteType(new URLSearchParams(location.search).get("kind")),
    [location.search],
  );

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
      setState({
        kind: "error",
        message: safeT("shareInvite.missingToken", "Falta el token del enlace."),
      });
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        setState({ kind: "loading" });
        const data = await getShareInvite(safeToken);
        if (cancelled) return;

        setState({
          kind: "ready",
          status: normalizeInviteStatus(data.status),
          senderDisplayName: data.senderDisplayName ?? null,
          previewLines: data.previewLines ?? [],
          dueDate: data.dueDate ?? null,
          inviteType: resolveInviteType(data.type, inviteTypeHint),
        });
      } catch (error: any) {
        console.error(error);
        if (cancelled) return;
        setState({
          kind: "error",
          message: error?.message || safeT("shareInvite.loadError", "No se pudo cargar el enlace."),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [inviteTypeHint, safeT, safeToken]);

  const onAccept = async () => {
    if (!safeToken) return;

    if (!user) {
      try {
        sessionStorage.setItem("pending_share_token", safeToken);
      } catch {
        // ignore
      }
      navigate(`/auth?redirect=${encodeURIComponent(`/share/${safeToken}`)}`);
      return;
    }

    try {
      setAccepting(true);
      const result = await acceptShareInvite(safeToken);

      if (!result?.ok) {
        alert(result?.warning || safeT("shareInvite.acceptError", "No se pudo añadir. Inténtalo de nuevo."));
        return;
      }

      const data = await getShareInvite(safeToken);
      const nextInviteType = resolveInviteType(data.type, inviteTypeHint);
      setState({
        kind: "ready",
        status: normalizeInviteStatus(data.status),
        senderDisplayName: data.senderDisplayName ?? null,
        previewLines: data.previewLines ?? [],
        dueDate: data.dueDate ?? null,
        inviteType: nextInviteType,
      });

      navigate(nextInviteType === "idea" ? "/ideas" : nextInviteType === "task" ? "/tasks" : "/", {
        replace: true,
      });
    } catch (error) {
      console.error(error);
      alert(safeT("shareInvite.acceptError", "No se pudo añadir. Inténtalo de nuevo."));
    } finally {
      setAccepting(false);
    }
  };

  const inviteMeta = useMemo(() => {
    const inviteType = state.kind === "ready" ? state.inviteType : null;
    const isIdea = inviteType === "idea";
    const isTask = inviteType === "task";

    return {
      subtitle: isIdea
        ? safeT("shareInvite.pageSubtitleIdea", "Guarda esta nota en tu cuenta.")
        : isTask
          ? safeT("shareInvite.pageSubtitleTask", "Guarda este recordatorio en tu cuenta.")
          : safeT("shareInvite.pageSubtitleGeneric", "Guarda este elemento en tu cuenta."),
      messageLine1: isIdea
        ? safeT("shareInvite.messageLine1Idea", "{{name}} quiere que guardes esta nota:")
        : isTask
          ? safeT("shareInvite.messageLine1Task", "{{name}} quiere que recuerdes:")
          : safeT("shareInvite.messageLine1Generic", "{{name}} quiere compartir esto contigo:"),
      headerBg: isIdea ? "#d7b234" : isTask ? "#7d59c9" : "#7d59c9",
      headerTextColor: isIdea ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.82)",
      accentBg: isIdea ? "bg-[#fbf3c4]" : "bg-[#ede7f8]",
      accentText: isIdea ? "text-[#9a7300]" : "text-[#7d59c9]",
      ctaBg: isIdea ? "#d7b234" : isTask ? "#7d59c9" : "#7d59c9",
      ctaShadow: isIdea
        ? "0 16px 40px rgba(170, 132, 12, 0.30)"
        : "0 16px 40px rgba(125, 89, 201, 0.35)",
      linkColor: isIdea ? "#a67b00" : "#7d59c9",
      Icon: isIdea ? StickyNote : isTask ? CalendarClock : Share2,
    };
  }, [safeT, state]);

  const messageLine1 = useMemo(() => {
    if (state.kind !== "ready") return "";
    const name = state.senderDisplayName || safeT("shareInvite.someone", "Alguien");
    return inviteMeta.messageLine1.replace("{{name}}", name);
  }, [inviteMeta.messageLine1, safeT, state]);

  const messageLine1Parts = useMemo(() => {
    if (state.kind !== "ready") {
      return {
        senderName: "",
        prefix: "",
        suffix: "",
      };
    }

    const senderName = state.senderDisplayName || safeT("shareInvite.someone", "Alguien");
    const fullLine = messageLine1.trim();
    const markerIndex = senderName ? fullLine.indexOf(senderName) : -1;

    if (markerIndex < 0) {
      return {
        senderName,
        prefix: "",
        suffix: fullLine,
      };
    }

    return {
      senderName,
      prefix: fullLine.slice(0, markerIndex).trim(),
      suffix: fullLine.slice(markerIndex + senderName.length).trim(),
    };
  }, [messageLine1, safeT, state]);

  const messageLine2 = useMemo(() => {
    if (state.kind !== "ready") return "";
    return safeJoinPreview(state.previewLines || []);
  }, [state]);

  const statusLine = useMemo(() => {
    if (state.kind !== "ready") return "";
    if (state.status === "accepted") return safeT("shareInvite.alreadyAccepted", "Este enlace ya se ha usado.");
    if (state.status === "expired") return safeT("shareInvite.expired", "Este enlace ha caducado.");
    if (state.status === "rejected") return safeT("shareInvite.rejected", "Este enlace fue rechazado.");
    return "";
  }, [safeT, state]);

  return (
    <div className="min-h-[100dvh] bg-[#F6F7FB] text-slate-900 flex flex-col">
      <header
        className="text-white px-5 pb-12 rounded-b-[36px] shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
        style={{
          backgroundColor: inviteMeta.headerBg,
          paddingTop: "calc(2.25rem + env(safe-area-inset-top))",
        }}
      >
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white">
              <inviteMeta.Icon size={22} />
            </div>
            <div className="min-w-0">
          <h1 className="text-xl font-semibold leading-tight">
            {safeT("shareInvite.pageTitle", "Añadir a Remi")}
          </h1>
          <p className="text-sm mt-1" style={{ color: inviteMeta.headerTextColor }}>
            {inviteMeta.subtitle}
          </p>
            </div>
          </div>
        </div>
      </header>

      <main
        className="flex-1 px-4 -mt-0"
        style={{ paddingBottom: "calc(36px + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto w-full max-w-sm">
          <div className="min-h-[calc(100dvh-220px)] flex items-start justify-center pt-20">
            <div className="w-full rounded-[36px] bg-white/85 backdrop-blur border border-white/70 shadow-[0_18px_55px_rgba(15,23,42,0.14)] p-7">
              <div className="flex justify-center">
                <div className={`w-16 h-16 rounded-[22px] ${inviteMeta.accentBg} ${inviteMeta.accentText} flex items-center justify-center`}>
                  <inviteMeta.Icon size={26} />
                </div>
              </div>

              {state.kind === "loading" && (
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                    <Loader2 className="animate-spin" size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-slate-900">
                      {safeT("shareInvite.loading", "Cargando…")}
                    </p>
                    <p className="text-[12px] text-slate-500 mt-0.5">
                      {inviteMeta.subtitle}
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
                        {safeT("shareInvite.invalidLinkTitle", "Enlace no válido")}
                      </p>
                      <p className="text-[13px] text-slate-500 mt-1 whitespace-pre-wrap">
                        {state.message}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 text-[13px] font-semibold"
                      style={{ color: inviteMeta.linkColor }}
                    >
                      <ExternalLink size={16} />
                      {safeT("shareInvite.goHome", "Volver al inicio")}
                    </Link>
                  </div>
                </div>
              )}

              {state.kind === "ready" && (
                <div className="mt-6 flex flex-col gap-5">
                  <div>
                    <div className="space-y-1">
                      <p className="text-[15px] text-slate-900 leading-snug">
                        {messageLine1Parts.prefix ? `${messageLine1Parts.prefix} ` : ""}
                        <span className="font-semibold">{messageLine1Parts.senderName}</span>
                        {messageLine1Parts.suffix ? ` ${messageLine1Parts.suffix}` : ""}
                      </p>
                      {messageLine2 ? (
                        <p className="text-[15px] font-semibold text-slate-900 leading-snug whitespace-pre-wrap">
                          {messageLine2}
                        </p>
                      ) : null}
                    </div>

                    {state.dueDate ? (
                      <p className="text-[13px] text-slate-500 mt-2">
                        {safeT("shareInvite.due", "Fecha")}: {new Date(state.dueDate).toLocaleString()}
                      </p>
                    ) : null}
                  </div>

                  {state.status === "pending" ? (
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={onAccept}
                        disabled={accepting}
                        className="w-full rounded-full text-white py-3.5 text-[15px] font-semibold hover:opacity-95 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                        style={{
                          backgroundColor: inviteMeta.ctaBg,
                          boxShadow: inviteMeta.ctaShadow,
                        }}
                      >
                        {accepting ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            {safeT("shareInvite.accepting", "Añadiendo…")}
                          </>
                        ) : (
                          <>
                            <Check size={18} />
                            {safeT("shareInvite.acceptCta", "Añadir a Remi")}
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate("/", { replace: true })}
                        className="w-full rounded-full bg-slate-100 text-slate-700 py-3 text-[14px] font-semibold"
                      >
                        {safeT("shareInvite.laterCta", "Ahora no")}
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-[13px] text-slate-600">
                      {statusLine}
                    </div>
                  )}

                  {!user && state.status === "pending" ? (
                    <p className="text-[12px] text-slate-500 -mt-2">
                      {safeT(
                        "shareInvite.loginHint",
                        "Si no has iniciado sesión, te pediremos entrar o crear una cuenta para poder añadirlo.",
                      )}
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
