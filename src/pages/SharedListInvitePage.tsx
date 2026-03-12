import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import {
  acceptSharedListInvite,
  getSharedListInvite,
  type SharedListInvitePublic,
} from "@/lib/sharedListsApi";
import { AlertTriangle, Check, ExternalLink, List, Loader2 } from "lucide-react";

type ViewState =
  | { kind: "loading" }
  | { kind: "login_required"; message: string }
  | { kind: "accept_only"; message: string }
  | { kind: "error"; message: string }
  | {
      kind: "ready";
      invite: SharedListInvitePublic;
    };

export default function SharedListInvitePage() {
  const params = useParams();
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

  const safeToken = useMemo(() => {
    const fromPath = (params.inviteToken ?? params["*"] ?? "").trim();
    const fromQuery = new URLSearchParams(location.search).get("token")?.trim() ?? "";
    const rawToken = fromPath || fromQuery;
    if (!rawToken) return "";

    try {
      return decodeURIComponent(rawToken).trim();
    } catch {
      return rawToken;
    }
  }, [location.search, params]);

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
        const invite = await getSharedListInvite(safeToken);
        if (cancelled) return;

        setState({
          kind: "ready",
          invite,
        });
      } catch (error: any) {
        console.error(error);
        if (cancelled) return;
        const errorMessage = String(error?.message ?? "");
        const edgeUnavailable =
          errorMessage.toLowerCase().includes("edge function") ||
          errorMessage.toLowerCase().includes("failed to send a request");

        if (edgeUnavailable) {
          setState({
            kind: "accept_only",
            message: safeT(
              "sharedListInvite.previewUnavailable",
              "No se pudo cargar la vista previa. Puedes unirte con este enlace igualmente.",
            ),
          });
          return;
        }

        if (!user) {
          setState({
            kind: "login_required",
            message: safeT(
              "sharedListInvite.loginHint",
              "Inicia sesion para revisar esta lista y decidir si quieres unirte.",
            ),
          });
          return;
        }

        setState({
          kind: "error",
          message:
            error?.message ||
            safeT("sharedListInvite.invalidLinkTitle", "Invitacion no valida"),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [safeT, safeToken, user]);

  const handleAccept = async () => {
    if (!safeToken) return;

    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(`/lists/invite/${encodeURIComponent(safeToken)}`)}`);
      return;
    }

    try {
      setAccepting(true);
      const listId = await acceptSharedListInvite(safeToken);
      navigate(`/lists?list=${encodeURIComponent(listId)}`, { replace: true });
    } catch (error) {
      console.error(error);
      alert(
        safeT(
          "sharedListInvite.acceptError",
          "No se pudo unir a la lista. Intentalo de nuevo.",
        ),
      );
    } finally {
      setAccepting(false);
    }
  };

  const statusLine = useMemo(() => {
    if (state.kind !== "ready") return "";
    if (state.invite.status === "accepted") {
      return safeT(
        "sharedListInvite.alreadyAccepted",
        "Esta invitacion ya se ha usado.",
      );
    }
    if (state.invite.status === "expired") {
      return safeT(
        "sharedListInvite.expired",
        "Esta invitacion ha caducado.",
      );
    }
    return "";
  }, [safeT, state]);

  const readyMessage = useMemo(() => {
    if (state.kind !== "ready") {
      return {
        senderName: "",
        prefix: "",
        suffix: "",
      };
    }

    const senderName =
      state.invite.senderDisplayName || safeT("sharedListInvite.someone", "Alguien");
    const fullLine = safeT(
      "sharedListInvite.messageLine1",
      "{{name}} quiere compartir esta lista contigo:",
      { name: senderName },
    ).trim();
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
  }, [safeT, state]);

  return (
    <div className="min-h-[100dvh] bg-[#F6F7FB] text-slate-900 flex flex-col">
      <header
        className="bg-[#59a5c9] text-white px-5 pb-12 rounded-b-[36px] shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
        style={{ paddingTop: "calc(2.25rem + env(safe-area-inset-top))" }}
      >
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-xl font-semibold leading-tight">
            {safeT("sharedListInvite.pageTitle", "Anadir lista compartida")}
          </h1>
          <p className="text-sm text-white/85 mt-1">
            {safeT(
              "sharedListInvite.pageSubtitle",
              "Revisa la lista y decide si quieres unirte.",
            )}
          </p>
        </div>
      </header>

      <main
        className="flex-1 px-4"
        style={{ paddingBottom: "calc(36px + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto w-full max-w-sm">
          <div className="min-h-[calc(100dvh-220px)] flex items-start justify-center pt-20">
            <div className="w-full rounded-[36px] bg-white/85 backdrop-blur border border-white/70 shadow-[0_18px_55px_rgba(15,23,42,0.14)] p-7">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-[22px] bg-[#e6f2f8] text-[#3f7f99] flex items-center justify-center relative">
                  <List size={26} />
                  {state.kind === "ready" && state.invite.listIconEmoji ? (
                    <span className="absolute -bottom-1 -right-1 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-white px-1 text-sm shadow-[0_8px_18px_rgba(15,23,42,0.12)]">
                      {state.invite.listIconEmoji}
                    </span>
                  ) : null}
                </div>
              </div>

              {state.kind === "loading" && (
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                    <Loader2 className="animate-spin" size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-slate-900">
                      {safeT("sharedListInvite.loading", "Cargando lista compartida...")}
                    </p>
                    <p className="text-[12px] text-slate-500 mt-0.5">
                      {safeT(
                        "sharedListInvite.pageSubtitle",
                        "Revisa la lista y decide si quieres unirte.",
                      )}
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
                        {safeT("sharedListInvite.invalidLinkTitle", "Invitacion no valida")}
                      </p>
                      <p className="text-[13px] text-slate-500 mt-1 whitespace-pre-wrap">
                        {state.message}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#59a5c9]"
                    >
                      <ExternalLink size={16} />
                      {safeT("sharedListInvite.goHome", "Volver al inicio")}
                    </Link>
                  </div>
                </div>
              )}

              {state.kind === "login_required" && (
                <div className="mt-6 flex flex-col gap-5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                      <ExternalLink size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-slate-900">
                        {safeT("sharedListInvite.pageTitle", "Anadir lista compartida")}
                      </p>
                      <p className="text-[13px] text-slate-500 mt-1 whitespace-pre-wrap">
                        {state.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/auth?redirect=${encodeURIComponent(`/lists/invite/${encodeURIComponent(safeToken)}`)}`)}
                      className="w-full rounded-full bg-[#59a5c9] text-white py-3.5 text-[15px] font-semibold shadow-[0_16px_40px_rgba(89,165,201,0.28)] hover:opacity-95"
                    >
                      {safeT("sharedListInvite.signInCta", "Entrar para ver la lista")}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/", { replace: true })}
                      className="w-full rounded-full bg-slate-100 text-slate-700 py-3 text-[14px] font-semibold"
                    >
                      {safeT("sharedListInvite.laterCta", "Ahora no")}
                    </button>
                  </div>
                </div>
              )}

              {state.kind === "accept_only" && (
                <div className="mt-6 flex flex-col gap-5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                      <ExternalLink size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-slate-900">
                        {safeT("sharedListInvite.pageTitle", "Anadir lista compartida")}
                      </p>
                      <p className="text-[13px] text-slate-500 mt-1 whitespace-pre-wrap">
                        {state.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {user ? (
                      <button
                        type="button"
                        onClick={handleAccept}
                        disabled={accepting}
                        className="w-full rounded-full bg-[#59a5c9] text-white py-3.5 text-[15px] font-semibold shadow-[0_16px_40px_rgba(89,165,201,0.28)] hover:opacity-95 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                      >
                        {accepting ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            {safeT("sharedListInvite.accepting", "Uniendome...")}
                          </>
                        ) : (
                          <>
                            <Check size={18} />
                            {safeT("sharedListInvite.acceptCta", "Unirme a la lista")}
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(`/auth?redirect=${encodeURIComponent(`/lists/invite/${encodeURIComponent(safeToken)}`)}`)}
                        className="w-full rounded-full bg-[#59a5c9] text-white py-3.5 text-[15px] font-semibold shadow-[0_16px_40px_rgba(89,165,201,0.28)] hover:opacity-95"
                      >
                        {safeT("sharedListInvite.signInCta", "Entrar para ver la lista")}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate("/", { replace: true })}
                      className="w-full rounded-full bg-slate-100 text-slate-700 py-3 text-[14px] font-semibold"
                    >
                      {safeT("sharedListInvite.laterCta", "Ahora no")}
                    </button>
                  </div>
                </div>
              )}

              {state.kind === "ready" && (
                <div className="mt-6 flex flex-col gap-5">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-[15px] text-slate-900 leading-snug">
                        {readyMessage.prefix ? `${readyMessage.prefix} ` : ""}
                        <span className="font-semibold">{readyMessage.senderName}</span>
                        {readyMessage.suffix ? ` ${readyMessage.suffix}` : ""}
                      </p>
                      <p className="text-[20px] font-semibold leading-tight text-slate-900 break-words">
                        {state.invite.listTitle}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="text-[12px] font-semibold tracking-[0.08em] uppercase text-slate-500">
                        {safeT("sharedListInvite.previewTitle", "Vista previa")}
                      </p>
                      {state.invite.previewItems.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {state.invite.previewItems.map((item, index) => (
                            <div
                              key={`${state.invite.listTitle}-${index}`}
                              className="flex items-start gap-3 rounded-2xl border border-white bg-white/85 px-3 py-2"
                            >
                              <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#59a5c9]" />
                              <p className="text-[14px] leading-6 text-slate-800 break-words">
                                {item}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-[13px] text-slate-500">
                          {safeT(
                            "sharedListInvite.emptyList",
                            "Esta lista aun no tiene elementos.",
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {state.invite.status === "pending" ? (
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={handleAccept}
                        disabled={accepting}
                        className="w-full rounded-full bg-[#59a5c9] text-white py-3.5 text-[15px] font-semibold shadow-[0_16px_40px_rgba(89,165,201,0.28)] hover:opacity-95 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                      >
                        {accepting ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            {safeT("sharedListInvite.accepting", "Uniendome...")}
                          </>
                        ) : (
                          <>
                            <Check size={18} />
                            {safeT("sharedListInvite.acceptCta", "Unirme a la lista")}
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate("/", { replace: true })}
                        className="w-full rounded-full bg-slate-100 text-slate-700 py-3 text-[14px] font-semibold"
                      >
                        {safeT("sharedListInvite.laterCta", "Ahora no")}
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-[13px] text-slate-600">
                      {statusLine}
                    </div>
                  )}

                  {!user && state.invite.status === "pending" ? (
                    <p className="text-[12px] text-slate-500 -mt-2">
                      {safeT(
                        "sharedListInvite.loginHint",
                        "Si no has iniciado sesion, te pediremos entrar o crear una cuenta antes de unirte a la lista.",
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
