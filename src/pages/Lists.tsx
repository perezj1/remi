import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Check, Copy, Plus, Share2, Trash2, UserRoundCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import {
  acceptSharedListInvite,
  createSharedList,
  createSharedListInviteShare,
  createSharedListItem,
  deleteSharedList,
  deleteSharedListItem,
  fetchSharedListItems,
  fetchSharedLists,
  leaveSharedList,
  subscribeToSharedList,
  toggleSharedListNotifications,
  updateSharedListItem,
  updateSharedListTitle,
  type SharedList,
  type SharedListItem,
} from "@/lib/sharedListsApi";
import { shareTextOrCopy } from "@/lib/shareInvitesApi";

export default function SharedListsPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { inviteToken } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const safeT = useCallback(
    (key: string, fallback: string) => {
      const value = t(key as any);
      if (!value || value === key) return fallback;
      return value;
    },
    [t],
  );

  const [loading, setLoading] = useState(true);
  const [lists, setLists] = useState<SharedList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [items, setItems] = useState<SharedListItem[]>([]);

  const [newListTitle, setNewListTitle] = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [saving, setSaving] = useState(false);
  const lastHandledInviteTokenRef = useRef<string | null>(null);

  const selected = useMemo(
    () => lists.find((l) => l.id === selectedListId) ?? null,
    [lists, selectedListId],
  );

  const loadLists = useCallback(async () => {
    if (!user) return;
    const next = await fetchSharedLists(user.id);
    setLists(next);
    setSelectedListId((prev) => {
      if (prev && next.some((l) => l.id === prev)) return prev;
      return next[0]?.id ?? null;
    });
  }, [user]);

  const loadItems = useCallback(async () => {
    if (!selectedListId) {
      setItems([]);
      return;
    }
    const next = await fetchSharedListItems(selectedListId);
    setItems(next);
  }, [selectedListId]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    void loadLists()
      .catch((err) => {
        console.error(err);
        toast.error(safeT("lists.loadError", "No se pudieron cargar las listas."));
      })
      .finally(() => setLoading(false));
  }, [loadLists, safeT, user]);

  useEffect(() => {
    void loadItems().catch((err) => {
      console.error(err);
      toast.error(safeT("lists.itemsLoadError", "No se pudieron cargar los puntos."));
    });
  }, [loadItems, safeT]);

  useEffect(() => {
    if (!selectedListId) return;
    const off = subscribeToSharedList(selectedListId, () => {
      void loadItems();
      void loadLists();
    });
    return off;
  }, [selectedListId, loadItems, loadLists]);

  useEffect(() => {
    if (!user) return;

    const rawToken = ((params.get("invite") ?? inviteToken ?? "") as string).trim();
    if (!rawToken) return;

    // Invite token is hex; some share targets append chars around URLs.
    const token = rawToken.toLowerCase().replace(/[^a-f0-9]/g, "");
    if (!token) return;

    if (lastHandledInviteTokenRef.current === token) return;
    lastHandledInviteTokenRef.current = token;

    void (async () => {
      try {
        const listId = await acceptSharedListInvite(token);
        toast.success(safeT("lists.inviteAccepted", "Lista compartida a?adida."));
        setParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.delete("invite");
            return next;
          },
          { replace: true },
        );
        if (inviteToken) {
          navigate("/lists", { replace: true });
        }
        await loadLists();
        setSelectedListId(listId);
      } catch (err) {
        console.error(err);
        toast.error(safeT("lists.inviteError", "No se pudo aceptar la invitaci?n."));
      }
    })();
  }, [inviteToken, loadLists, navigate, params, safeT, setParams, user]);

  const handleCreateList = async () => {
    if (!user) return;
    const title = newListTitle.trim();
    if (!title) return;

    setSaving(true);
    try {
      const created = await createSharedList(user.id, title);
      setNewListTitle("");
      await loadLists();
      setSelectedListId(created.id);
      toast.success(safeT("lists.created", "Lista creada."));
    } catch (err) {
      console.error(err);
      toast.error(safeT("lists.createError", "No se pudo crear la lista."));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteList = async () => {
    if (!selected) return;
    if (selected.my_role !== "owner") {
      toast.error(safeT("lists.onlyOwnerDelete", "Solo el owner puede eliminar la lista."));
      return;
    }

    const ok = window.confirm(safeT("lists.confirmDelete", "¿Eliminar esta lista compartida?"));
    if (!ok) return;

    try {
      await deleteSharedList(selected.id);
      toast.success(safeT("lists.deleted", "Lista eliminada."));
      await loadLists();
    } catch (err) {
      console.error(err);
      toast.error(safeT("lists.deleteError", "No se pudo eliminar la lista."));
    }
  };

  const handleLeaveList = async () => {
    if (!selected || !user) return;
    if (selected.my_role === "owner") return;

    const ok = window.confirm(safeT("lists.confirmLeave", "¿Salir de esta lista compartida?"));
    if (!ok) return;

    try {
      await leaveSharedList(selected.id, user.id);
      toast.success(safeT("lists.left", "Has salido de la lista."));
      await loadLists();
    } catch (err) {
      console.error(err);
      toast.error(safeT("lists.leaveError", "No se pudo salir de la lista."));
    }
  };

  const handleShare = async () => {
    if (!selected) return;
    try {
      const invite = await createSharedListInviteShare(selected.id, "editor");
      const result = await shareTextOrCopy(invite.shareMessage);
      if (result === "shared") {
        toast.success(safeT("shareInvite.sharedOk", "Listo. Enlace copiado/compartido."));
      } else {
        toast.success(safeT("lists.linkCopied", "Enlace copiado."));
      }
    } catch (err) {
      console.error(err);
      toast.error(safeT("lists.shareError", "No se pudo crear el enlace."));
    }
  };

  const handleToggleMyNotifications = async () => {
    if (!selected || !user) return;
    try {
      await toggleSharedListNotifications(selected.id, user.id, !selected.my_notification_enabled);
      await loadLists();
      toast.success(
        selected.my_notification_enabled
          ? safeT("lists.notificationsOff", "Notificaciones desactivadas para esta lista.")
          : safeT("lists.notificationsOn", "Notificaciones activadas para esta lista."),
      );
    } catch (err) {
      console.error(err);
      toast.error(safeT("lists.notificationsError", "No se pudo actualizar notificaciones."));
    }
  };

  const handleCreateItem = async () => {
    if (!selected || !user) return;
    const text = newItemText.trim();
    if (!text) return;

    try {
      await createSharedListItem(selected.id, text, user.id, items.length);
      setNewItemText("");
      await loadItems();
    } catch (err) {
      console.error(err);
      toast.error(safeT("lists.itemCreateError", "No se pudo crear el punto."));
    }
  };

  const handleToggleDone = async (item: SharedListItem) => {
    if (!user) return;
    try {
      await updateSharedListItem(item.id, { done: !item.done }, user.id);
      await loadItems();
    } catch (err) {
      console.error(err);
      toast.error(safeT("lists.itemUpdateError", "No se pudo actualizar el punto."));
    }
  };

  const handleAssignMe = async (item: SharedListItem) => {
    if (!user) return;
    const next = item.assigned_to_user_id === user.id ? null : user.id;
    try {
      await updateSharedListItem(item.id, { assigned_to_user_id: next }, user.id);
      await loadItems();
    } catch (err) {
      console.error(err);
      toast.error(safeT("lists.assignError", "No se pudo actualizar asignación."));
    }
  };

  const handleDeleteItem = async (item: SharedListItem) => {
    try {
      await deleteSharedListItem(item.id);
      await loadItems();
    } catch (err) {
      console.error(err);
      toast.error(safeT("lists.itemDeleteError", "No se pudo eliminar el punto."));
    }
  };

  const canEdit = selected?.my_role === "owner" || selected?.my_role === "editor";

  return (
    <div
      className="remi-page overflow-x-hidden text-slate-900"
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg, #f1eff7 0%, #fafafe 42%, #fafafe 100%)",
        paddingBottom: "calc(96px + env(safe-area-inset-bottom))",
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          paddingTop: "calc(14px + env(safe-area-inset-top))",
          paddingBottom: 10,
          paddingLeft: "calc(16px + env(safe-area-inset-left))",
          paddingRight: "calc(16px + env(safe-area-inset-right))",
          minHeight: 100,
          background: "#ffffff",
          borderBottomLeftRadius: 22,
          borderBottomRightRadius: 22,
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
        }}
      >
        <div className="mx-auto mt-0.5 w-full" style={{ maxWidth: "1120px" }}>
          <h1 className="leading-tight font-extrabold text-slate-900" style={{ fontSize: "clamp(19px, 1.3vw, 28px)" }}>
            {safeT("lists.title", "Listas compartidas")}
          </h1>
          <p className="mt-0.5 font-semibold text-slate-500" style={{ fontSize: "clamp(13px, 0.9vw, 18px)" }}>
            {safeT("lists.subtitle", "Coordina en tiempo real con familia y equipo.")}
          </p>
        </div>
      </div>

      <main
        className="pb-24"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "14px 16px 10px",
          maxWidth: "1120px",
          margin: "0 auto",
        }}
      >
        <div className="grid gap-3 lg:grid-cols-[340px_minmax(0,1fr)]">
          <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <input
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder={safeT("lists.newPlaceholder", "Nueva lista (ej: Preparar cumpleaños)")}
                className="h-10 flex-1 rounded-full border border-slate-200 px-3 text-sm outline-none focus:border-violet-300"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleCreateList();
                }}
              />
              <button
                type="button"
                onClick={handleCreateList}
                disabled={saving}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#7d59c9] text-white disabled:opacity-60"
                title={safeT("lists.create", "Crear")}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 space-y-2 max-h-[clamp(260px,38dvh,520px)] overflow-auto pr-1 lg:max-h-[calc(100dvh-320px)]">
              {loading && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  {safeT("lists.loading", "Cargando listas...")}
                </div>
              )}

              {!loading && lists.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  {safeT("lists.empty", "Aún no tienes listas compartidas.")}
                </div>
              )}

              {lists.map((list) => {
                const active = list.id === selectedListId;
                return (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => setSelectedListId(list.id)}
                    className="w-full rounded-2xl border px-3 py-2 text-left transition"
                    style={{
                      borderColor: active ? "#c9b4f0" : "#e2e8f0",
                      background: active ? "#f7f3ff" : "#ffffff",
                    }}
                  >
                    <p className="text-sm font-semibold text-slate-900 truncate">{list.title}</p>
                    <p className="mt-1 text-xs text-slate-500 inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {list.members_count}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm min-h-[clamp(360px,50dvh,720px)]">
            {!selected ? (
              <div className="h-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                {safeT("lists.selectOne", "Selecciona una lista para ver sus puntos.")}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={selected.title}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const next = e.target.value;
                      setLists((prev) => prev.map((x) => (x.id === selected.id ? { ...x, title: next } : x)));
                    }}
                    onBlur={async (e) => {
                      const value = e.target.value.trim();
                      if (!value || value === selected.title) return;
                      try {
                        await updateSharedListTitle(selected.id, value);
                        await loadLists();
                      } catch (err) {
                        console.error(err);
                        toast.error(safeT("lists.renameError", "No se pudo cambiar el título."));
                      }
                    }}
                    className="h-10 min-w-0 flex-[1_1_100%] sm:flex-1 rounded-full border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-violet-300 disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex h-10 shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-700"
                  >
                    <Share2 className="h-4 w-4" /> {safeT("lists.share", "Compartir")}
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleMyNotifications}
                    className="inline-flex h-10 shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-700"
                  >
                    <Copy className="h-4 w-4" />
                    {selected.my_notification_enabled
                      ? safeT("lists.notificationsOnShort", "Noti ON")
                      : safeT("lists.notificationsOffShort", "Noti OFF")}
                  </button>

                  <button
                    type="button"
                    onClick={selected.my_role === "owner" ? handleDeleteList : handleLeaveList}
                    className="inline-flex h-10 shrink-0 items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 text-sm text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    {selected.my_role === "owner"
                      ? safeT("lists.delete", "Eliminar")
                      : safeT("lists.leave", "Salir")}
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder={safeT("lists.newItemPlaceholder", "Añadir punto...")}
                    disabled={!canEdit}
                    className="h-10 min-w-0 flex-1 rounded-full border border-slate-200 px-3 text-sm outline-none focus:border-violet-300 disabled:bg-slate-50"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleCreateItem();
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateItem}
                    disabled={!canEdit}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#7d59c9] text-white disabled:opacity-40"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-3 space-y-2 max-h-[clamp(220px,36dvh,520px)] overflow-auto pr-1 lg:max-h-[calc(100dvh-410px)]">
                  {items.length === 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                      {safeT("lists.itemsEmpty", "No hay puntos todavía.")}
                    </div>
                  )}

                  {items.map((item) => {
                    const mine = item.assigned_to_user_id === user?.id;
                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 flex flex-wrap items-center gap-2 min-w-0 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => void handleToggleDone(item)}
                          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                            item.done
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : "border-slate-300 bg-white text-slate-600"
                          }`}
                        >
                          <Check className="h-4 w-4" />
                        </button>

                        <input
                          value={item.text}
                          onChange={(e) => {
                            const next = e.target.value;
                            setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, text: next } : x)));
                          }}
                          onBlur={async (e) => {
                            const value = e.target.value.trim();
                            if (!value || value === item.text) return;
                            if (!user) return;
                            try {
                              await updateSharedListItem(item.id, { text: value }, user.id);
                              await loadItems();
                            } catch (err) {
                              console.error(err);
                              toast.error(safeT("lists.itemUpdateError", "No se pudo actualizar el punto."));
                            }
                          }}
                          disabled={!canEdit}
                          className={`h-8 min-w-0 flex-[1_1_140px] rounded-lg border px-2 text-sm outline-none ${
                            item.done ? "line-through text-slate-500" : "text-slate-800"
                          } ${canEdit ? "border-slate-200" : "border-slate-100 bg-slate-50"}`}
                        />

                        <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap">
                          <button
                            type="button"
                            onClick={() => void handleAssignMe(item)}
                            className={`inline-flex h-8 max-w-full shrink-0 items-center gap-1 rounded-full border px-2 text-xs ${
                              mine
                                ? "border-violet-200 bg-violet-50 text-violet-700"
                                : "border-slate-200 bg-white text-slate-600"
                            }`}
                          >
                            <UserRoundCheck className="h-3.5 w-3.5" />
                            <span className="truncate">
                              {mine ? safeT("lists.assignedMe", "Me encargo") : safeT("lists.assignMe", "Asignarme")}
                            </span>
                          </button>

                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => void handleDeleteItem(item)}
                              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}



