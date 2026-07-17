import { useRef, memo } from 'react';
import useMoonTilt from '../hooks/useMoonTilt.js';

function ShootingStars() {
  return (
    <div className="hero__shooting" aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`hero__shooting-star hero__shooting-star--${i}`} />
      ))}
    </div>
  );
}

function Moon({ moonRef }) {
  return (
    <div className="moon-scene" aria-hidden="true">
      <div className="moon-ring moon-ring--1" />
      <div className="moon-ring moon-ring--2" />
      <div className="moon-glow" />
      <div ref={moonRef} className="moon" id="moon3d">
        <div className="moon__face">
          <div className="moon__crater moon__crater--1" />
          <div className="moon__crater moon__crater--2" />
          <div className="moon__crater moon__crater--3" />
          <div className="moon__crater moon__crater--4" />
          <div className="moon__mare moon__mare--1" />
          <div className="moon__mare moon__mare--2" />
          <div className="moon__mare moon__mare--3" />
          <div className="moon__highlight" />
        </div>
      </div>
      <div className="moon-orbiter moon-orbiter--1" />
      <div className="moon-orbiter moon-orbiter--2" />
    </div>
  );
}

export default memo(function Hero() {
  const moonRef = useRef(null);
  useMoonTilt(moonRef);

  return (
    <section id="beranda" className="hero">
      <div className="hero__bg" aria-hidden="true" />
      <ShootingStars />

      <div className="hero__layout">
        <div className="hero__text">
          <span className="spectral-label">SPECTRAL TYPE · G2V</span>
          <h1 className="hero__title">
            Arrafi
            <span className="hero__title-sub">Izzaputra Febriansyah</span>
          </h1>
          <p className="hero__desc">
            Merancang pengalaman web, visual desain, dan fotografi dengan rasa
            eksplorasi: rapi secara teknis, kuat secara visual, dan punya atmosfer.
          </p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="#karya">
              Lihat karya
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a className="btn btn--ghost" href="PDF/CV arrafi.pdf" download>
              Unduh CV
            </a>
          </div>
        </div>

        <Moon moonRef={moonRef} />
      </div>
    </section>
  );
});
