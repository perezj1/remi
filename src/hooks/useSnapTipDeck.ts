// src/hooks/useSnapTipDeck.ts
import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  /** ms para considerar que el scroll “terminó” */
  settleMs?: number;
  /** máximo de tarjetas permitidas por gesto (1 = solo siguiente/anterior) */
  maxStep?: number;
  /** ms para liberar flag después de un snap programático */
  programmaticSnapMs?: number;
};

export function useSnapTipDeck(
  deckRef: React.RefObject<HTMLDivElement | null>,
  itemCount: number,
  opts: Options = {}
) {
  const settleMs = opts.settleMs ?? 120;
  const maxStep = opts.maxStep ?? 1;
  const programmaticSnapMs = opts.programmaticSnapMs ?? 260;

  const [activeIndex, setActiveIndex] = useState(0);

  const rafRef = useRef<number | null>(null);
  const scrollEndTimerRef = useRef<number | null>(null);

  const gestureStartIndexRef = useRef<number | null>(null);
  const isPointerDownRef = useRef(false);
  const isSnappingRef = useRef(false);

  const getNearestIndex = useCallback(() => {
    const el = deckRef.current;
    if (!el) return 0;

    const children = Array.from(el.children) as HTMLElement[];
    if (children.length === 0) return 0;

    const centerX = el.scrollLeft + el.clientWidth / 2;

    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      const nodeCenter = node.offsetLeft + node.offsetWidth / 2;
      const dist = Math.abs(nodeCenter - centerX);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    return bestIdx;
  }, [deckRef]);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const el = deckRef.current;
      if (!el) return;

      const clamped = Math.max(0, Math.min(index, itemCount - 1));
      const child = el.children.item(clamped) as HTMLElement | null;
      if (!child) return;

      const target = child.offsetLeft - (el.clientWidth / 2 - child.clientWidth / 2);
      el.scrollTo({ left: target, behavior });
    },
    [deckRef, itemCount]
  );

  // mantener activeIndex dentro de rango si cambia itemCount
  useEffect(() => {
    setActiveIndex((i) => Math.max(0, Math.min(i, Math.max(0, itemCount - 1))));
  }, [itemCount]);

  useEffect(() => {
    const el = deckRef.current;
    if (!el) return;

    const onScroll = () => {
      // 1) actualizar índice (suave)
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setActiveIndex(getNearestIndex());
      });

      // 2) “scroll end” debounce
      if (scrollEndTimerRef.current) window.clearTimeout(scrollEndTimerRef.current);
      scrollEndTimerRef.current = window.setTimeout(() => {
        const endIdx = getNearestIndex();
        setActiveIndex(endIdx);

        // 3) al terminar, limitar a 1 tarjeta por gesto
        const startIdx = gestureStartIndexRef.current;

        if (
          startIdx != null &&
          !isPointerDownRef.current &&
          !isSnappingRef.current &&
          itemCount > 0
        ) {
          const limitedIdx = Math.max(startIdx - maxStep, Math.min(startIdx + maxStep, endIdx));

          if (limitedIdx !== endIdx) {
            isSnappingRef.current = true;
            scrollToIndex(limitedIdx, "smooth");
            setActiveIndex(limitedIdx);

            window.setTimeout(() => {
              isSnappingRef.current = false;
            }, programmaticSnapMs);
          }

          gestureStartIndexRef.current = null;
        }
      }, settleMs);
    };

    el.addEventListener("scroll", onScroll, { passive: true });

    // init
    setActiveIndex(getNearestIndex());

    return () => {
      el.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;

      if (scrollEndTimerRef.current) window.clearTimeout(scrollEndTimerRef.current);
      scrollEndTimerRef.current = null;
    };
  }, [deckRef, getNearestIndex, itemCount, maxStep, programmaticSnapMs, scrollToIndex, settleMs]);

  const bind = {
    onPointerDown: () => {
      isPointerDownRef.current = true;
      gestureStartIndexRef.current = activeIndex;
    },
    onPointerUp: () => {
      isPointerDownRef.current = false;
    },
    onPointerCancel: () => {
      isPointerDownRef.current = false;
    },
    onTouchStart: () => {
      isPointerDownRef.current = true;
      gestureStartIndexRef.current = activeIndex;
    },
    onTouchEnd: () => {
      isPointerDownRef.current = false;
    },
  } as const;

  return { activeIndex, scrollToIndex, bind };
}
