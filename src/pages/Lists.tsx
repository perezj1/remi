import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Check, ChevronDown, ChevronLeft, ChevronUp, CirclePlus, ListPlus, LogOut, Menu, MoreVertical, Pencil, RotateCcw, Share2, Trash2, UserRoundCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { useModalUi } from "@/contexts/ModalUiContext";
import { suggestSharedListEmoji } from "@/lib/sharedListEmojiAuto";
import RemiAvatar from "@/components/RemiAvatar";
import RemiShareLoader from "@/components/RemiShareLoader";
import {
  acceptSharedListInvite,
  createSharedList,
  createSharedListInviteShare,
  createSharedListItem,
  deleteSharedList,
  deleteSharedListItem,
  fetchSharedListItemStats,
  fetchSharedListItems,
  fetchSharedLists,
  leaveSharedList,
  subscribeToSharedList,
  updateSharedListIcon,
  updateSharedListItem,
  updateSharedListTitle,
  type SharedList,
  type SharedListItem,
} from "@/lib/sharedListsApi";
import { queryKeys } from "@/lib/queryKeys";
import { buildSharedListSummaries } from "@/lib/sharedListSummary";
import { invalidateSharedListQueries } from "@/lib/sharedListQueryCache";
import { shareTextOrCopy } from "@/lib/shareInvitesApi";

export default function SharedListsPage() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const { inviteToken } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const [newListTitle, setNewListTitle] = useState("");
  const [newListManualEmoji, setNewListManualEmoji] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");
  const [saving, setSaving] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "detail">("cards");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cardMenuOpenId, setCardMenuOpenId] = useState<string | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [showCompletedLists, setShowCompletedLists] = useState(false);
  const lastHandledInviteTokenRef = useRef<string | null>(null);
  const newItemInputRef = useRef<HTMLTextAreaElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const sharedListsQuery = useQuery({
    queryKey: user ? queryKeys.sharedLists(user.id) : ["shared", "lists", "anonymous"],
    queryFn: () => fetchSharedLists(user!.id),
    enabled: !!user,
    staleTime: 60_000,
  });

  const listIds = useMemo(
    () => (sharedListsQuery.data ?? []).map((list) => list.id),
    [sharedListsQuery.data],
  );
  const listIdsSignature = useMemo(() => listIds.join("|"), [listIds]);

  const openListDetail = useCallback((listId: string, pushHistory = true) => {
    setSelectedListId(listId);
    setViewMode("detail");
    if (pushHistory && typeof window !== "undefined") {
      window.history.pushState({ remiListsDetail: true }, "", window.location.href);
    }
  }, []);

  const sharedListItemStatsQuery = useQuery({
    queryKey: user
      ? queryKeys.sharedListItemStats(user.id, listIds)
      : ["shared", "list-item-stats", "anonymous"],
    queryFn: () => fetchSharedListItemStats(listIds),
    enabled: !!user && listIds.length > 0,
    staleTime: 60_000,
  });

  const listSummaries = useMemo(
    () =>
      buildSharedListSummaries(
        sharedListsQuery.data ?? [],
        sharedListItemStatsQuery.data ?? {},
      ),
    [sharedListItemStatsQuery.data, sharedListsQuery.data],
  );
  const lists = useMemo(() => listSummaries.map((row) => row.list), [listSummaries]);
  const progressByList = useMemo(
    () =>
      Object.fromEntries(
        listSummaries.map((row) => [row.list.id, row.progress] as const),
      ),
    [listSummaries],
  );
  const selected = useMemo(
    () => lists.find((list) => list.id === selectedListId) ?? null,
    [lists, selectedListId],
  );
  const liveSuggestedListEmoji = useMemo(
    () => suggestSharedListEmoji(newListTitle),
    [newListTitle],
  );
  const newListEmojiPreview = newListManualEmoji ?? liveSuggestedListEmoji;
  const selectedListItemsQuery = useQuery({
    queryKey: selectedListId
      ? queryKeys.sharedListItems(selectedListId)
      : ["shared", "list-items", "none"],
    queryFn: () => fetchSharedListItems(selectedListId!),
    enabled: !!selectedListId && viewMode === "detail",
    staleTime: 30_000,
  });
  const items = selectedListItemsQuery.data ?? [];
  const loading =
    !!user &&
    (sharedListsQuery.isLoading ||
      (listIds.length > 0 && sharedListItemStatsQuery.isLoading) ||
      (viewMode === "detail" && !!selectedListId && selectedListItemsQuery.isLoading));

  const loadLists = useCallback(async () => {
    if (!user) return;
    await invalidateSharedListQueries(queryClient, user.id);
  }, [queryClient, user]);

  const loadItems = useCallback(async () => {
    if (!selectedListId) return;
    await queryClient.invalidateQueries({
      queryKey: queryKeys.sharedListItems(selectedListId),
    });
  }, [queryClient, selectedListId]);

  useEffect(() => {
    if (!sharedListsQuery.error) return;
    console.error(sharedListsQuery.error);
    toast.error(safeT("lists.loadError", "No se pudieron cargar las listas."));
  }, [safeT, sharedListsQuery.error]);

  useEffect(() => {
    if (!selectedListItemsQuery.error) return;
    console.error(selectedListItemsQuery.error);
    toast.error(safeT("lists.itemsLoadError", "No se pudieron cargar los puntos."));
  }, [safeT, selectedListItemsQuery.error]);

  useEffect(() => {
    setSelectedListId((prev) => {
      if (prev && lists.some((list) => list.id === prev)) return prev;
      return lists[0]?.id ?? null;
    });
    if (lists.length === 0) {
      setViewMode("cards");
    }
  }, [lists]);

  useEffect(() => {
    const listFromQuery = (params.get("list") ?? "").trim();
    if (!listFromQuery) return;
    if (!lists.some((l) => l.id === listFromQuery)) return;
    openListDetail(listFromQuery, false);
  }, [lists, openListDetail, params]);

  useEffect(() => {
    setExpandedItemId((prev) => {
      if (!prev) return null;
      return items.some((item) => item.id === prev) ? prev : null;
    });
  }, [items, selectedListId]);

  const syncSharedState = useCallback(async () => {
    if (!user) return;
    await loadLists();
    if (viewMode === "detail" && selectedListId) {
      await loadItems();
    }
  }, [loadItems, loadLists, selectedListId, user, viewMode]);

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
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Element | null;
      if (!cardMenuOpenId) return;
      if (!target) return;
      if (target.closest("[data-list-card-menu-root='true']")) return;
      setCardMenuOpenId(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [cardMenuOpenId]);

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
    const manualEmoji = newListManualEmoji?.trim() ?? "";

    setSaving(true);
    try {
      const created = await createSharedList(user.id, title);
      if (manualEmoji) {
        await updateSharedListIcon(created.id, manualEmoji);
      }
      setNewListTitle("");
      setNewListManualEmoji(null);
      await loadLists();
      await queryClient.invalidateQueries({
        queryKey: queryKeys.sharedListItems(created.id),
      });
      openListDetail(created.id);
      toast.success(safeT("lists.created", "Lista creada."));
    } catch (err) {
      console.error(err);
      toast.error(safeT("lists.createError", "No se pudo crear la lista."));
    } finally {
      setSaving(false);
    }
  };

  const handlePickNewListEmoji = () => {
    const nextRaw = window.prompt(
      safeT("lists.iconPrompt", "Elige un emoji para esta lista (vacío para quitarlo):"),
      newListEmojiPreview ?? "",
    );
    if (nextRaw == null) return;
    const next = nextRaw.trim();
    setNewListManualEmoji(next.length > 0 ? next : null);
  };

  const handleDeleteList = async () => {
    if (!selected) return;
    if (selected.my_role !== "owner") {
      toast.error(safeT("lists.onlyOwnerDelete", "Solo el owner puede eliminar la lista."));
      return;
    }

    const ok = window.confirm(safeT("lists.confirmDelete", "¿Eliminar esta lista?"));
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

    const ok = window.confirm(safeT("lists.confirmLeave", "Salir de esta lista?"));
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
    if (shareLoading) return;
    if (!selected) return;
    try {
      setShareLoading(true);
      const invite = await createSharedListInviteShare(selected.id, "editor", lang);
      const result = await shareTextOrCopy(invite.shareMessage);
      if (result === "shared") {
        toast.success(safeT("shareInvite.sharedOk", "Listo. Enlace copiado/compartido."));
      } else {
        toast.success(safeT("lists.linkCopied", "Enlace copiado."));
      }
    } catch (err) {
      console.error(err);
      toast.error(safeT("lists.shareError", "No se pudo crear el enlace."));
    } finally {
      setShareLoading(false);
    }
  };

  const handleShareListById = async (list: SharedList) => {
    if (shareLoading) return;
    try {
      setShareLoading(true);
      const invite = await createSharedListInviteShare(list.id, "editor", lang);
      const result = await shareTextOrCopy(invite.shareMessage);
      if (result === "shared") {
        toast.success(safeT("shareInvite.sharedOk", "Listo. Enlace copiado/compartido."));
      } else {
        toast.success(safeT("lists.linkCopied", "Enlace copiado."));
      }
    } catch (err) {
      console.error(err);
      toast.error(safeT("lists.shareError", "No se pudo crear el enlace."));
    } finally {
      setShareLoading(false);
    }
  };

  const handleRenameListById = async (list: SharedList) => {
    const editable = list.my_role === "owner" || list.my_role === "editor";
    if (!editable || !user) return;
    const nextTitle = window.prompt(
      safeT("lists.renamePrompt", "Nuevo nombre de la lista:"),
      list.title,
    );
    if (nextTitle == null) return;
    const value = nextTitle.trim();
    if (!value || value === list.title) return;
    try {
      await updateSharedListTitle(list.id, value, { actorUserId: user.id });
      await loadLists();
    } catch (err) {
      console.error(err);
      toast.error(safeT("lists.renameError", "No se pudo cambiar el título."));
    }
  };

  const handleCreateItem = async () => {
    if (!selected || !user) return;
    const text = newItemText.trim();
    if (!text) return;

    const normalizeItemKey = (value: string) =>
      String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    const newKey = normalizeItemKey(text);
    const duplicateExists = items.some((item) => normalizeItemKey(item.text) === newKey);
    if (duplicateExists) {
      const shouldAddDuplicate = window.confirm(
        safeT("lists.duplicateConfirm", "Punto duplicado, ¿agregar de todas formas?"),
      );
      if (!shouldAddDuplicate) return;
    }

    try {
      await createSharedListItem(selected.id, text, user.id, items.length);
      setNewItemText("");
      await syncSharedState();
    } catch (err) {
      console.error(err);
      toast.error(safeT("lists.itemCreateError", "No se pudo crear el punto."));
    }
  };

  const handleToggleDone = async (item: SharedListItem) => {
    if (!user) return;
    try {
      await updateSharedListItem(item.id, { done: !item.done }, user.id);
      await syncSharedState();
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
      await syncSharedState();
    } catch (err) {
      console.error(err);
      toast.error(safeT("lists.assignError", "No se pudo actualizar asignación."));
    }
  };

  const handleDeleteItem = async (item: SharedListItem) => {
    const ok = window.confirm(safeT("lists.confirmDeleteItem", "¿Seguro que quieres eliminar este punto?"));
    if (!ok) return;

    try {
      await deleteSharedListItem(item.id, { actorUserId: user?.id });
      await syncSharedState();
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

  const renderListCard = (list: SharedList) => {
    const stats = progressByList[list.id] ?? { done: 0, total: 0 };
    const percent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

    return (
      <div
        key={list.id}
        onClick={() => openListDetail(list.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openListDetail(list.id);
          }
        }}
        role="button"
        tabIndex={0}
        className="group relative cursor-pointer overflow-visible rounded-[20px] border border-[#59a5c9] bg-white p-3 text-left transition hover:border-[#4b95b8]"
      >
        <div
          data-list-card-menu-root="true"
          className="absolute right-2 top-2 z-10"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setCardMenuOpenId((prev) => (prev === list.id ? null : list.id))}
            className="inline-flex h-7 w-7 items-center justify-center text-slate-600 hover:text-slate-900"
            aria-expanded={cardMenuOpenId === list.id}
            aria-label={safeT("common.menu", "Menu")}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {cardMenuOpenId === list.id && (
            <div className="absolute right-0 z-50 mt-1 min-w-40 rounded-xl border border-[#d7d2e8] bg-white p-1.5 shadow-[0_10px_24px_rgba(32,24,61,0.12)]">
              <button
                type="button"
                onClick={() => {
                  setCardMenuOpenId(null);
                  void handleRenameListById(list);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-[#f4f2fa]"
              >
                <Pencil className="h-4 w-4" /> {safeT("common.edit", "Editar")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCardMenuOpenId(null);
                  void handleShareListById(list);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-[#f4f2fa]"
              >
                <Share2 className="h-4 w-4" /> {safeT("lists.share", "Compartir")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCardMenuOpenId(null);
                  void (list.my_role === "owner"
                    ? handleDeleteListById(list)
                    : handleLeaveListById(list));
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
              >
                {list.my_role === "owner" ? <Trash2 className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
                {list.my_role === "owner"
                  ? safeT("lists.delete", "Borrar")
                  : safeT("lists.leave", "Salir")}
              </button>
            </div>
          )}
        </div>

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

          <div className="min-w-0 flex-1 pr-8">
            <p
              className="line-clamp-2 break-words text-base font-semibold leading-tight text-[#2f3240]"
              style={{ minHeight: "2.2em" }}
            >
              {list.title}
            </p>
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
                    <RemiAvatar
                      avatarUrl={member.avatar_url}
                      fallback={(
                        member.display_name?.trim()?.slice(0, 1) ||
                        member.user_id?.slice(0, 1) ||
                        "U"
                      ).toUpperCase()}
                    />
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
      </div>
    );
  };

  const renderItemRow = (item: SharedListItem) => {
    const mine = item.assigned_to_user_id === user?.id;
    const assignedToOther = !!item.assigned_to_user_id && item.assigned_to_user_id !== user?.id;
    const assignedMember =
      assignedToOther && selected
        ? selected.member_profiles.find((member) => member.user_id === item.assigned_to_user_id) ?? null
        : null;
    const isExpandable = item.text.trim().length > 38;
    const isExpanded = expandedItemId === item.id;
    const toggleExpandedCard = () => {
      if (!isExpandable) return;
      setExpandedItemId((prev) => (prev === item.id ? null : item.id));
    };
    const textClassName = `text-sm leading-relaxed ${
      item.done ? "text-slate-500 line-through" : "text-slate-800"
    } ${isExpanded ? "whitespace-normal break-words" : "truncate"}`;

    if (item.done) {
      return (
        <div
          key={item.id}
          onClick={toggleExpandedCard}
          onKeyDown={(e) => {
            if (!isExpandable) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleExpandedCard();
            }
          }}
          role={isExpandable ? "button" : undefined}
          tabIndex={isExpandable ? 0 : undefined}
          aria-expanded={isExpandable ? isExpanded : undefined}
          className={`min-w-0 bg-[#f8f7fc] px-3 py-3 outline-none transition ${
            isExpandable
              ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-[#59a5c9] focus-visible:ring-offset-2"
              : ""
          }`}
        >
          <div className="flex items-center gap-3">
            {canEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleDeleteItem(item);
                }}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            <div className="min-w-0 flex-1">
              <p className={textClassName} title={item.text}>
                {item.text}
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handleToggleDone(item);
              }}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#cfd8c7] bg-[#eef5e8] text-[#4f6b3d]"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={item.id}
        onClick={toggleExpandedCard}
        onKeyDown={(e) => {
          if (!isExpandable) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleExpandedCard();
          }
        }}
        role={isExpandable ? "button" : undefined}
        tabIndex={isExpandable ? 0 : undefined}
        aria-expanded={isExpandable ? isExpanded : undefined}
        className={`min-w-0 bg-[#fcfcfe] px-3 py-3 outline-none transition ${
          isExpandable
            ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-[#59a5c9] focus-visible:ring-offset-2"
            : ""
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className={textClassName} title={item.text}>
              {item.text}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void handleToggleDone(item);
            }}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#cfc9e7] bg-[#f7f6fc] text-slate-500"
          >
            <Check className="h-4 w-4 opacity-70" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-start">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
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
                <RemiAvatar
                  avatarUrl={assignedMember?.avatar_url}
                  fallback={(
                    assignedMember?.display_name?.trim()?.slice(0, 1) ??
                    assignedMember?.user_id?.slice(0, 1) ??
                    "U"
                  ).toUpperCase()}
                />
              </span>
            )}
          </button>
        </div>
      </div>
    );
  };

  const handleDeleteListById = async (list: SharedList) => {
    if (list.my_role !== "owner") {
      toast.error(safeT("lists.onlyOwnerDelete", "Solo el owner puede eliminar la lista."));
      return;
    }
    const ok = window.confirm(safeT("lists.confirmDelete", "¿Eliminar esta lista?"));
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

  const handleLeaveListById = async (list: SharedList) => {
    if (!user) return;
    if (list.my_role === "owner") return;

    const ok = window.confirm(safeT("lists.confirmLeave", "Salir de esta lista?"));
    if (!ok) return;

    try {
      await leaveSharedList(list.id, user.id);
      toast.success(safeT("lists.left", "Has salido de la lista."));
      await loadLists();
      if (selectedListId === list.id) {
        setViewMode("cards");
      }
    } catch (err) {
      console.error(err);
      toast.error(safeT("lists.leaveError", "No se pudo salir de la lista."));
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
        doneRows.map((row) =>
          updateSharedListItem(row.id, { done: false }, user.id, { skipEventLog: true }),
        ),
      );
      toast.success(safeT("lists.reused", "Lista reutilizada."));
      await syncSharedState();
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
    if (!selected || !canEdit || !user) return;
    const nextTitle = window.prompt(
      safeT("lists.renamePrompt", "Nuevo nombre de la lista:"),
      selected.title,
    );
    if (nextTitle == null) return;
    const value = nextTitle.trim();
    if (!value || value === selected.title) return;
    try {
      await updateSharedListTitle(selected.id, value, { actorUserId: user.id });
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
          minHeight: 100,
          background: "#ffffff",
          borderBottomLeftRadius: 22,
          borderBottomRightRadius: 22,
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
        }}
      >
        <div className="mx-auto mt-0.5 w-full" style={{ maxWidth: "min(96vw, 1440px)" }}>
          {viewMode === "detail" && selected ? (
            <div className="flex items-center gap-2 pl-3 pt-2 pb-1">
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
              <h2
                className="min-w-0 flex-1 px-1 text-2xl font-extrabold leading-tight text-[#1f2436] line-clamp-2 break-words"
              >
                {selected.title}
              </h2>
            </div>
          ) : (
            <>
              <h1 className="leading-tight font-extrabold text-slate-900" style={{ fontSize: "clamp(19px, 1.3vw, 28px)" }}>
                {safeT("lists.title", "Listas")}
              </h1>
              <p className="mt-0.5 font-semibold text-slate-500" style={{ fontSize: "clamp(13px, 0.9vw, 18px)" }}>
                {safeT("lists.subtitle", "Crea listas y compartelas para coordinarte con los demas.")}
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
              <div className="h-11 min-w-0 flex-[1_1_auto] rounded-full border border-[#d9d3ea] bg-white transition focus-within:border-[#59a5c9] focus-within:shadow-[0_0_0_3px_rgba(89,165,201,0.22)]">
                <div className="flex h-full items-center">
                  <button
                    type="button"
                    onClick={handlePickNewListEmoji}
                    className="ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg"
                    title={safeT("lists.iconAction", "Cambiar icono")}
                  >
                    {newListEmojiPreview ?? <span className="text-sm text-[#8b8fa6]">•</span>}
                  </button>
                  <span className="h-5 w-px shrink-0 bg-[#d5d8e1]" />
                  <input
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder={safeT("lists.newPlaceholder", "Nueva lista (ej: Comprar)")}
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-base md:text-sm outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleCreateList();
                    }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleCreateList}
                disabled={saving}
                className="inline-flex h-11 w-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-[#59a5c9] text-white transition hover:bg-[#4b95b8] disabled:opacity-60"
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
                  {safeT("lists.empty", "Aun no tienes listas.")}
                </div>
              )}
              {!loading && pendingLists.length > 0 && (
                <div>
                  <p className="mb-2 px-1 text-sm font-semibold text-[#5a5f74]">
                    {safeT("lists.activeOwnedTitle", "Activas")} ({pendingLists.length})
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {pendingLists.map((list) => renderListCard(list))}
                  </div>
                </div>
              )}

              {!loading && completedLists.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowCompletedLists((value) => !value)}
                    className="mb-2 flex w-full items-center justify-between rounded-2xl border border-[#ddd9ee] bg-white px-4 py-3 text-left"
                  >
                    <span className="text-sm font-semibold text-[#5a5f74]">
                      {safeT("lists.completed", "Completado")} ({completedLists.length})
                    </span>
                    {showCompletedLists ? (
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    )}
                  </button>

                  {showCompletedLists && (
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
                              onClick={() =>
                                void (list.my_role === "owner"
                                  ? handleDeleteListById(list)
                                  : handleLeaveListById(list))}
                              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700"
                              title={list.my_role === "owner"
                                ? safeT("lists.delete", "Eliminar")
                                : safeT("lists.leave", "Salir")}
                            >
                              {list.my_role === "owner"
                                ? <Trash2 className="h-4 w-4" />
                                : <LogOut className="h-4 w-4" />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
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

                <div className="mt-3 border-t border-[#e3dfef] pt-4 max-h-[calc(100dvh-260px)] space-y-5 overflow-auto pb-[124px] pr-1">
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
                      className="max-h-28 min-h-[42px] flex-1 resize-none rounded-[14px] border border-[#d9d3ea] bg-white px-4 py-2 text-base md:text-sm outline-none transition focus:border-[#59a5c9] focus:shadow-[0_0_0_3px_rgba(89,165,201,0.22)] disabled:bg-slate-50"
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
                      <CirclePlus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
      <RemiShareLoader
        active={shareLoading}
        label={safeT("common.preparingLink", "Preparando enlace...")}
      />
    </div>
  );
}




