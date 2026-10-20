import { useEffect, useState } from 'react';

// Scale factor that fits a fixed-size element into its container's width and
// the viewport's height. Never scales up; never below `min`.
export function useFitScale(containerRef, { width, height, verticalReserve = 96, min = 0.55 }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const compute = () => {
      const byWidth = el.clientWidth / width;
      const byHeight = (window.innerHeight - verticalReserve) / height;
      setScale(Math.max(min, Math.min(1, byWidth, byHeight)));
    };

    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(el);
    window.addEventListener('resize', compute);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [containerRef, width, height, verticalReserve, min]);

  return scale;
}
