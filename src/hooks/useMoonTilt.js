import { useEffect, useRef } from 'react';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function useMoonTilt(moonRef) {
  const frameRef = useRef(0);

  useEffect(() => {
    const el = moonRef.current;
    if (!el || REDUCED) return;

    let tx = 0, ty = 0, mx = 0, my = 0;

    function onMove(e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    window.addEventListener('pointermove', onMove, { passive: true });

    function tick() {
      mx += (tx - mx) * 0.06;
      my += (ty - my) * 0.06;
      el.style.setProperty('--tilt-x', (-my * 15).toFixed(1) + 'deg');
      el.style.setProperty('--tilt-y', (mx * 20).toFixed(1) + 'deg');
      frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, [moonRef]);
}
