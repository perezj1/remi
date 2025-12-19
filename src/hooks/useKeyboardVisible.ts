import { useEffect, useState } from "react";

export function useKeyboardVisible(thresholdPx = 140) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;

    const getDiff = () => {
      const h = vv?.height ?? window.innerHeight;
      return window.innerHeight - h;
    };

    const update = () => setVisible(getDiff() > thresholdPx);

    update();

    if (!vv) {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [thresholdPx]);

  return visible;
}
