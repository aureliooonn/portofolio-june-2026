import { useEffect, useRef, useState } from 'react';
import useScrollSpy from './hooks/useScrollSpy.js';
import Nebula from './components/Nebula.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Profile from './components/Profile.jsx';
import Projects from './components/Projects.jsx';
import Visual from './components/Visual.jsx';
import Contact from './components/Contact.jsx';

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('reveal--visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function App() {
  const { activeId, atTop, sections } = useScrollSpy();
  const [loaded, setLoaded] = useState(false);

  useScrollReveal();

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div className={`loader${loaded ? ' loader--done' : ''}`} aria-hidden="true">
        <div className="loader__ring" />
      </div>

      <Nebula />
      <Navbar activeId={activeId} atTop={atTop} sections={sections} />

      <main>
        <Hero />
        <Profile />
        <Projects />
        <Visual />
        <Contact />
      </main>
    </>
  );
}
