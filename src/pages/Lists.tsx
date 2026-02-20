import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Check, ChevronLeft, Copy, ListPlus, Menu, Pencil, RotateCcw, SendHorizontal, Share2, Trash2, UserRoundCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { useModalUi } from "@/contexts/ModalUiContext";
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
  updateSharedListIcon,
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
  const { setModalOpen } = useModalUi();

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
  const [viewMode, setViewMode] = useState<"cards" | "detail">("cards");
  const [progressByList, setProgressByList] = useState<Record<string, { done: number; total: number }>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const lastHandledInviteTokenRef = useRef<string | null>(null);
  const newItemInputRef = useRef<HTMLTextAreaElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const toMs = useCallback((value?: string | null) => {
    if (!value) return 0;
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : 0;
  }, []);

  const getListActivityMs = useCallback(
    (list: SharedList, listItems?: SharedListItem[]) => {
      const listMs = Math.max(toMs(list.created_at), toMs(list.updated_at));
      if (!listItems || listItems.length === 0) return listMs;
      const itemsMs = listItems.reduce(
        (max, item) => Math.max(max, toMs(item.created_at), toMs(item.updated_at)),
        0,
      );
      return Math.max(listMs, itemsMs);
    },
    [toMs],
  );

  const sortListsByRecentActivity = useCallback(
    (source: SharedList[], activityByList?: Record<string, number>) =>
      [...source].sort((a, b) => {
        const aMs = activityByList?.[a.id] ?? getListActivityMs(a);
        const bMs = activityByList?.[b.id] ?? getListActivityMs(b);
        return bMs - aMs;
      }),
    [getListActivityMs],
  );

  const toProgress = useCallback((listItems: SharedListItem[]) => {
    const total = listItems.length;
    const done = listItems.reduce((acc, row) => acc + (row.done ? 1 : 0), 0);
    return { done, total };
  }, []);

  const loadProgressForLists = useCallback(
    async (nextLists: SharedList[]) => {
      if (nextLists.length === 0) {
        setProgressByList({});
        return;
      }
      const listRows = await Promise.all(
        nextLists.map(async (list) => {
          const listItems = await fetchSharedListItems(list.id);
          return [list.id, listItems] as const;
        }),
      );
      const progressRows = listRows.map(([listId, listItems]) => [listId, toProgress(listItems)] as const);
      const activityByList = Object.fromEntries(
        listRows.map(([listId, listItems]) => {
          const list = nextLists.find((row) => row.id === listId);
          const activityMs = list ? getListActivityMs(list, listItems) : 0;
          return [listId, activityMs] as const;
        }),
      );
      setProgressByList(Object.fromEntries(progressRows));
      setLists(sortListsByRecentActivity(nextLists, activityByList));
    },
    [getListActivityMs, sortListsByRecentActivity, toProgress],
  );

  const openListDetail = useCallback((listId: string, pushHistory = true) => {
    setSelectedListId(listId);
    setViewMode("detail");
    if (pushHistory && typeof window !== "undefined") {
      window.history.pushState({ remiListsDetail: true }, "", window.location.href);
    }
  }, []);

  const selected = useMemo(
    () => lists.find((l) => l.id === selectedListId) ?? null,
    [lists, selectedListId],
  );
  const listIdsSignature = useMemo(() => lists.map((list) => list.id).join("|"), [lists]);

  const loadLists = useCallback(async () => {
    if (!user) return;
    const next = await fetchSharedLists(user.id);
    const sorted = sortListsByRecentActivity(next);
    setLists(sorted);
    void loadProgressForLists(next).catch((err) => {
      console.error(err);
    });
    setSelectedListId((prev) => {
      if (prev && sorted.some((l) => l.id === prev)) return prev;
      return sorted[0]?.id ?? null;
    });
    if (next.length === 0) {
      setViewMode("cards");
    }
  }, [loadProgressForLists, sortListsByRecentActivity, user]);

  const loadItems = useCallback(async () => {
    if (!selectedListId) {
      setItems([]);
      return;
    }
    const next = await fetchSharedListItems(selectedListId);
    setItems(next);
    setProgressByList((prev) => ({
      ...prev,
      [selectedListId]: toProgress(next),
    }));
  }, [selectedListId, toProgress]);

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
    const listFromQuery = (params.get("list") ?? "").trim();
    if (!listFromQuery) return;
    if (!lists.some((l) => l.id === listFromQuery)) return;
    openListDetail(listFromQuery, false);
  }, [lists, openListDetail, params]);

  useEffect(() => {
    void loadItems().catch((err) => {
      console.error(err);
      toast.error(safeT("lists.itemsLoadError", "No se pudieron cargar los puntos."));
    });
  }, [loadItems, safeT]);

  const syncSharedState = useCallback(async () => {
    await loadLists();
    if (viewMode === "detail" && selectedListId) {
      await loadItems();
    }
  }, [loadItems, loadLists, selectedListId, viewMode]);

  useEffect(() => {
    if (!user || lists.length === 0) return;
    const unsubs = lists.map((list) =>
      subscribeToSharedList(list.id, () => {
        void syncSharedState();
      }),
    );
    return () => {
      unsubs.forEach((off) => off());
    };
  }, [listIdsSignature, lists, syncSharedState, user]);

  useEffect(() => {
    if (!user) return;
    const handleFocusOrVisible = () => {
      if (document.visibilityState !== "hidden") {
        void syncSharedState();
      }
    };
    window.addEventListener("focus", handleFocusOrVisible);
    document.addEventListener("visibilitychange", handleFocusOrVisible);
    return () => {
      window.removeEventListener("focus", handleFocusOrVisible);
      document.removeEventListener("visibilitychange", handleFocusOrVisible);
    };
  }, [syncSharedState, user]);

  useEffect(() => {
    setModalOpen(viewMode === "detail");
    return () => setModalOpen(false);
  }, [setModalOpen, viewMode]);

  useEffect(() => {
    const onPopState = () => {
      setViewMode((prev) => (prev === "detail" ? "cards" : prev));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!menuOpen) return;
      if (!target) return;
      if (menuRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [menuOpen]);

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
        openListDetail(listId);
      } catch (err) {
        console.error(err);
        toast.error(safeT("lists.inviteError", "No se pudo aceptar la invitaci?n."));
      }
    })();
  }, [inviteToken, loadLists, navigate, openListDetail, params, safeT, setParams, user]);

  const handleCreateList = async () => {
    if (!user) return;
    const title = newListTitle.trim();
    if (!title) return;

    setSaving(true);
    try {
      const created = await createSharedList(user.id, title);
      setNewListTitle("");
      await loadLists();
      openListDetail(created.id);
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
      setViewMode("cards");
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
      setViewMode("cards");
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
  const selectedProgress = selectedListId
    ? progressByList[selectedListId] ?? { done: 0, total: 0 }
    : { done: 0, total: 0 };
  const pendingItems = items.filter((item) => !item.done);
  const doneItems = items.filter((item) => item.done);
  const pendingLists = lists.filter((list) => {
    const stats = progressByList[list.id] ?? { done: 0, total: 0 };
    const percent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
    return percent < 100;
  });
  const completedLists = lists.filter((list) => {
    const stats = progressByList[list.id] ?? { done: 0, total: 0 };
    const percent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
    return percent === 100;
  });

  const renderItemRow = (item: SharedListItem) => {
    const mine = item.assigned_to_user_id === user?.id;
    const assignedToOther = !!item.assigned_to_user_id && item.assigned_to_user_id !== user?.id;
    const assignedMember =
      assignedToOther && selected
        ? selected.member_profiles.find((member) => member.user_id === item.assigned_to_user_id) ?? null
        : null;
    return (
      <div
        key={item.id}
        className={`flex min-w-0 flex-wrap items-center gap-2 px-3 py-2 ${
          item.done ? "bg-[#f8f7fc]" : "bg-[#fcfcfe]"
        }`}
      >
        <button
          type="button"
          onClick={() => void handleToggleDone(item)}
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
            item.done
              ? "border-[#cfd8c7] bg-[#eef5e8] text-[#4f6b3d]"
              : "border-[#cfc9e7] bg-[#f7f6fc] text-slate-500"
          }`}
        >
          {item.done ? <RotateCcw className="h-4 w-4" /> : <Check className="h-4 w-4 opacity-70" />}
        </button>

        {item.done ? (
          <p className="min-w-0 flex-1 truncate text-sm text-slate-500 line-through">{item.text}</p>
        ) : (
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
            className="h-8 min-w-0 flex-[1_1_140px] bg-transparent px-1 text-sm text-slate-800 outline-none"
          />
        )}

        {!item.done && (
          <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap">
            <button
              type="button"
              onClick={() => {
                if (assignedToOther) return;
                void handleAssignMe(item);
              }}
              disabled={assignedToOther}
              className={`inline-flex h-8 max-w-full shrink-0 items-center gap-1 rounded-full border px-2 text-xs ${
                mine
                  ? "border-[#d4cdee] bg-[#f2eefc] text-[#5d4d8b]"
                  : assignedToOther
                    ? "border-[#d8d8e4] bg-[#f1f1f6] text-slate-500"
                    : "border-[#d9d4eb] bg-white text-slate-600"
              }`}
            >
              <UserRoundCheck className="h-3.5 w-3.5" />
              {!assignedToOther && (
                <span className="truncate">
                  {mine ? safeT("lists.assignedMe", "Me encargo") : safeT("lists.assignMe", "Asignarme")}
                </span>
              )}
              {assignedToOther && (
                <span
                  className="inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border border-white bg-[#ece9f6] text-[10px] font-semibold text-[#4f4a69]"
                  title={assignedMember?.display_name ?? safeT("lists.assignedOther", "Asignado")}
                >
                  {assignedMember?.avatar_url ? (
                    <img src={assignedMember.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (assignedMember?.display_name?.trim()?.slice(0, 1) ??
                      assignedMember?.user_id?.slice(0, 1) ??
                      "U"
                    ).toUpperCase()
                  )}
                </span>
              )}
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
        )}

        {item.done && canEdit && (
          <div className="ml-auto flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => void handleDeleteItem(item)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleDeleteListById = async (list: SharedList) => {
    if (list.my_role !== "owner") {
      toast.error(safeT("lists.onlyOwnerDelete", "Solo el owner puede eliminar la lista."));
      return;
    }
    const ok = window.confirm(safeT("lists.confirmDelete", "¿Eliminar esta lista compartida?"));
    if (!ok) return;
    try {
      await deleteSharedList(list.id);
      toast.success(safeT("lists.deleted", "Lista eliminada."));
      await loadLists();
    } catch (err) {
      console.error(err);
      toast.error(safeT("lists.deleteError", "No se pudo eliminar la lista."));
    }
  };

  const handleReuseList = async (list: SharedList) => {
    if (!user) return;
    const canReuse = list.my_role === "owner" || list.my_role === "editor";
    if (!canReuse) {
      toast.error(safeT("lists.itemUpdateError", "No se pudo actualizar el punto."));
      return;
    }
    try {
      const listItems = await fetchSharedListItems(list.id);
      const doneRows = listItems.filter((row) => row.done);
      if (doneRows.length === 0) {
        openListDetail(list.id);
        return;
      }
      await Promise.all(
        doneRows.map((row) => updateSharedListItem(row.id, { done: false }, user.id)),
      );
      toast.success(safeT("lists.reused", "Lista reutilizada."));
      await loadLists();
      if (selectedListId === list.id) {
        await loadItems();
      }
    } catch (err) {
      console.error(err);
      toast.error(safeT("lists.reuseError", "No se pudo reutilizar la lista."));
    }
  };

  const handleSetListIcon = async (list: SharedList) => {
    const editable = list.my_role === "owner" || list.my_role === "editor";
    if (!editable) return;
    const raw = window.prompt(
      safeT("lists.iconPrompt", "Elige un emoji para esta lista (vacío para quitarlo):"),
      list.icon_emoji ?? "",
    );
    if (raw == null) return;
    const next = raw.trim();
    try {
      await updateSharedListIcon(list.id, next || null);
      await loadLists();
      toast.success(safeT("lists.iconUpdated", "Icono actualizado."));
    } catch (err) {
      console.error(err);
      toast.error(safeT("lists.iconUpdateError", "No se pudo actualizar el icono."));
    }
  };

  const handleRenameList = async () => {
    if (!selected || !canEdit) return;
    const nextTitle = window.prompt(
      safeT("lists.renamePrompt", "Nuevo nombre de la lista:"),
      selected.title,
    );
    if (nextTitle == null) return;
    const value = nextTitle.trim();
    if (!value || value === selected.title) return;
    try {
      await updateSharedListTitle(selected.id, value);
      await loadLists();
    } catch (err) {
      console.error(err);
      toast.error(safeT("lists.renameError", "No se pudo cambiar el título."));
    }
  };

  const renderListActionsMenu = () => {
    if (!selected) return null;
    return (
      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex cursor-pointer list-none items-center justify-center p-1 text-slate-700 hover:text-slate-900"
          aria-expanded={menuOpen}
          aria-label={safeT("common.menu", "Menu")}
        >
          <Menu className="h-5 w-5" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 z-50 mt-2 min-w-48 rounded-xl border border-[#d7d2e8] bg-white p-1.5 shadow-[0_10px_24px_rgba(32,24,61,0.12)]">
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void handleRenameList();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-[#f4f2fa]"
              >
                <Pencil className="h-4 w-4" /> {safeT("common.edit", "Editar")}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                void handleShare();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-[#f4f2fa]"
            >
              <Share2 className="h-4 w-4" /> {safeT("lists.share", "Compartir")}
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                void handleToggleMyNotifications();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-[#f4f2fa]"
            >
              <Copy className="h-4 w-4" />
              {selected.my_notification_enabled
                ? safeT("lists.notificationsOnShort", "Noti ON")
                : safeT("lists.notificationsOffShort", "Noti OFF")}
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                void (selected.my_role === "owner" ? handleDeleteList() : handleLeaveList());
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
              {selected.my_role === "owner"
                ? safeT("lists.delete", "Eliminar")
                : safeT("lists.leave", "Salir")}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="remi-page overflow-x-hidden text-slate-900"
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg, #f5f4fb 0%, #f8f7fc 58%, #fbfbfe 100%)",
        paddingBottom: "calc(96px + env(safe-area-inset-bottom))",
      }}
    >
      <div
        className={`relative ${viewMode === "detail" ? "overflow-visible" : "overflow-hidden"}`}
        style={{
          paddingTop: "calc(14px + env(safe-area-inset-top))",
          paddingBottom: 10,
          paddingLeft: "calc(16px + env(safe-area-inset-left))",
          paddingRight: "calc(16px + env(safe-area-inset-right))",
          minHeight: 96,
          background: "#f8f7fc",
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          borderBottom: "1px solid #e5e1f2",
          boxShadow: "0 2px 10px rgba(80, 74, 112, 0.06)",
        }}
      >
        <div className="mx-auto mt-0.5 w-full" style={{ maxWidth: "1120px" }}>
          {viewMode === "detail" && selected ? (
            <div className="flex items-center gap-2 pl-3">
              <div
                onClick={() => void handleSetListIcon(selected)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    void handleSetListIcon(selected);
                  }
                }}
                role="button"
                tabIndex={0}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold uppercase text-[#3f7f99]"
                title={safeT("lists.iconAction", "Cambiar icono")}
              >
                {selected.icon_emoji ? (
                  <span className="text-xl leading-none">{selected.icon_emoji}</span>
                ) : (
                  selected.title.slice(0, 1)
                )}
              </div>
              <h2 className="h-12 min-w-0 flex-1 truncate px-1 text-2xl font-extrabold leading-[48px] text-[#1f2436]">
                {selected.title}
              </h2>
              {renderListActionsMenu()}
            </div>
          ) : (
            <>
              <h1 className="leading-tight font-extrabold text-slate-900" style={{ fontSize: "clamp(19px, 1.3vw, 28px)" }}>
                {safeT("lists.title", "Listas")}
              </h1>
              <p className="mt-0.5 font-semibold text-slate-500" style={{ fontSize: "clamp(13px, 0.9vw, 18px)" }}>
                {safeT("lists.subtitle", "Coordina en tiempo real con familia y equipo.")}
              </p>
            </>
          )}
        </div>
      </div>

      <main
        className="pb-24"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "16px 16px 12px",
          maxWidth: "980px",
          margin: "0 auto",
        }}
      >
        {viewMode === "cards" && (
          <>
            <div className="flex items-center gap-2">
              <input
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder={safeT("lists.newPlaceholder", "Nueva lista (ej: Comprar)")}
                className="h-11 flex-1 rounded-full border border-[#d9d3ea] bg-[#f4f2fa] px-4 text-sm outline-none transition focus:border-[#59a5c9] focus:shadow-[0_0_0_3px_rgba(89,165,201,0.22)]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleCreateList();
                }}
              />
              <button
                type="button"
                onClick={handleCreateList}
                disabled={saving}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#59a5c9] text-white transition hover:bg-[#4b95b8] disabled:opacity-60"
                title={safeT("lists.create", "Crear")}
              >
                <ListPlus className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {loading && (
                <div className="rounded-2xl border border-[#dfdbea] bg-[#f4f2fa] px-3 py-2 text-sm text-slate-500 sm:col-span-2">
                  {safeT("lists.loading", "Cargando listas...")}
                </div>
              )}

              {!loading && lists.length === 0 && (
                <div className="rounded-2xl border border-[#dfdbea] bg-[#f4f2fa] px-3 py-2 text-sm text-slate-500 sm:col-span-2">
                  {safeT("lists.empty", "Aún no tienes listas compartidas.")}
                </div>
              )}
              {!loading && pendingLists.length > 0 && (
                <div>
                  <p className="mb-2 px-1 text-sm font-semibold text-[#5a5f74]">
                    {safeT("lists.opened", "Pendientes")} ({pendingLists.length})
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {pendingLists.map((list) => {
                      const stats = progressByList[list.id] ?? { done: 0, total: 0 };
                      const percent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
                      return (
                        <button
                          key={list.id}
                          type="button"
                          onClick={() => openListDetail(list.id)}
                          className="group relative overflow-hidden rounded-[20px] border border-[#59a5c9] bg-white p-3 text-left transition hover:border-[#4b95b8]"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleSetListIcon(list);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  void handleSetListIcon(list);
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold uppercase text-[#3f7f99]"
                              title={safeT("lists.iconAction", "Cambiar icono")}
                            >
                              {list.icon_emoji ? (
                                <span className="text-2xl leading-none">{list.icon_emoji}</span>
                              ) : (
                                list.title.slice(0, 1)
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-base font-semibold text-[#2f3240]">{list.title}</p>
                              <p className="mt-0.5 text-xs font-medium text-[#8b8fa6]">
                                {list.my_role === "owner"
                                  ? safeT("lists.roleOwner", "Owner")
                                  : list.my_role === "editor"
                                    ? safeT("lists.roleEditor", "Editor")
                                    : safeT("lists.roleViewer", "Viewer")}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <div className="flex -space-x-2">
                                  {list.member_previews.slice(0, 4).map((member) => (
                                    <div
                                      key={`${list.id}-${member.user_id}`}
                                      className="inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-white bg-[#ece9f6] text-[10px] font-semibold text-[#4f4a69]"
                                    >
                                      {member.avatar_url ? (
                                        <img src={member.avatar_url} alt="" className="h-full w-full object-cover" />
                                      ) : (
                                        (member.display_name?.trim()?.slice(0, 1) ||
                                          member.user_id?.slice(0, 1) ||
                                          "U").toUpperCase()
                                      )}
                                    </div>
                                  ))}
                                  {list.members_count > 4 && (
                                    <div className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-white bg-[#e7e3f4] px-1 text-[10px] font-semibold text-[#4f4a69]">
                                      +{list.members_count - 4}
                                    </div>
                                  )}
                                </div>
                                <p className="inline-flex items-center gap-1 text-xs text-[#8b8fa6]">
                                  <Users className="h-3.5 w-3.5" />
                                  {list.members_count}
                                </p>
                              </div>
                              <p className="mt-2 text-sm font-medium text-[#5c6073]">
                                {safeT("lists.learnedTo", "Completado")} <span className="text-[#59a5c9]">{percent}%</span>
                              </p>
                              <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#dbeef6]">
                                <div
                                  className="h-1.5 rounded-full bg-[#59a5c9] transition-all"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!loading && completedLists.length > 0 && (
                <div>
                  <p className="mb-2 px-1 text-sm font-semibold text-[#5a5f74]">
                    {safeT("lists.completed", "Completado")} ({completedLists.length})
                  </p>
                  <div className="overflow-hidden rounded-2xl border border-[#ddd9ee] divide-y divide-[#e6e3ef] bg-white">
                    {completedLists.map((list) => {
                      const canReuse = list.my_role === "owner" || list.my_role === "editor";
                      return (
                        <div
                          key={list.id}
                          className="flex items-center gap-2 px-2 py-2"
                        >
                          <button
                            type="button"
                            onClick={() => openListDetail(list.id)}
                            className="min-w-0 flex-1 px-1 text-left text-sm text-slate-500 line-through"
                            title={list.title}
                          >
                            <span className="block truncate">{list.title}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleReuseList(list)}
                            disabled={!canReuse}
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#cfd8c7] bg-[#eef5e8] text-[#4f6b3d] disabled:opacity-45"
                            title={safeT("lists.reuse", "Reutilizar")}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteListById(list)}
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700"
                            title={safeT("lists.delete", "Eliminar")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {viewMode === "detail" && (
          <>
            {!selected ? (
              <div className="rounded-2xl border border-[#dfdbea] bg-[#f4f2fa] px-3 py-4 text-sm text-slate-500">
                {safeT("lists.selectOne", "Selecciona una lista para ver sus puntos.")}
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined" && window.history.length > 1) {
                        navigate(-1);
                        return;
                      }
                      setViewMode("cards");
                    }}
                    className="inline-flex items-center gap-1 px-1 text-sm text-slate-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {safeT("common.back", "Volver")}
                  </button>
                  <p className="text-xs font-medium text-[#8b8fa6]">
                    {safeT("lists.doneOfTotal", "Completados")}: {selectedProgress.done}/{selectedProgress.total}
                  </p>
                </div>

                <div className="mt-3 border-t border-[#e3dfef] pt-4 max-h-[calc(100dvh-300px)] space-y-5 overflow-auto pb-[150px] pr-1">
                  {items.length === 0 && (
                    <div className="rounded-2xl border border-[#dfdbea] bg-[#f4f2fa] px-3 py-3 text-sm text-slate-500">
                      {safeT("lists.itemsEmpty", "No hay puntos todavía.")}
                    </div>
                  )}

                  {pendingItems.length > 0 && (
                    <div>
                      <p className="mb-2 px-1 text-sm font-semibold text-[#5a5f74]">
                        {safeT("lists.opened", "Abierto")} ({pendingItems.length})
                      </p>
                      <div className="divide-y divide-[#e6e3ef]">
                        {pendingItems.map((item) => renderItemRow(item))}
                      </div>
                    </div>
                  )}

                  {doneItems.length > 0 && (
                    <div>
                      <p className="mb-2 px-1 text-sm font-semibold text-[#5a5f74]">
                        {safeT("lists.completed", "Completado")} ({doneItems.length})
                      </p>
                      <div className="divide-y divide-[#e6e3ef]">
                        {doneItems.map((item) => renderItemRow(item))}
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className="fixed bottom-[max(10px,env(safe-area-inset-bottom))] left-0 right-0 z-20 mx-auto flex w-full max-w-[980px] items-end gap-2 px-4"
                  style={{ pointerEvents: "none" }}
                >
                  <div
                    className="flex w-full items-end gap-2 rounded-2xl border border-[#dcd7ea] bg-[#f8f7fc] p-2"
                    style={{ pointerEvents: "auto" }}
                  >
                    <textarea
                      ref={newItemInputRef}
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      placeholder={safeT("lists.newItemPlaceholder", "Añadir punto...")}
                      disabled={!canEdit}
                      rows={1}
                      className="max-h-28 min-h-[42px] flex-1 resize-none rounded-[14px] border border-[#d9d3ea] bg-[#f4f2fa] px-4 py-2 text-sm outline-none transition focus:border-[#7d59c9] focus:shadow-[0_0_0_3px_rgba(125,89,201,0.18)] disabled:bg-slate-50"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void handleCreateItem();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleCreateItem}
                      disabled={!canEdit}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#59a5c9] text-white transition hover:bg-[#4b95b8] disabled:opacity-40"
                    >
                      <SendHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}



