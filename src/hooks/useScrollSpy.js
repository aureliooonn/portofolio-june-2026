import { useState, useEffect } from 'react';

const SECTIONS = ['beranda', 'profil', 'karya', 'visual', 'kontak'];

export default function useScrollSpy() {
  const [activeId, setActiveId] = useState('beranda');
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY + 120;
        setAtTop(y < 30);

        for (const id of SECTIONS) {
          const el = document.getElementById(id);
          if (!el) continue;
          const top = el.offsetTop;
          const bottom = top + el.offsetHeight;
          if (y >= top && y < bottom) {
            setActiveId(id);
            break;
          }
        }
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { activeId, atTop, sections: SECTIONS };
}
