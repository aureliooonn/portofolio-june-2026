import { memo } from 'react';

const LABELS = {
  beranda: 'Beranda',
  profil: 'Profil',
  karya: 'Karya',
  visual: 'Visual',
  kontak: 'Kontak',
};

export default memo(function Navbar({ activeId, atTop, sections }) {
  return (
    <nav
      className={`nav${atTop ? ' nav--top' : ''}`}
      aria-label="Navigasi utama"
    >
      <div className="nav__line" aria-hidden="true" />

      <a className="nav__brand" href="#beranda" aria-label="Ke beranda">
        <span className="nav__logo">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
            <circle cx="10" cy="10" r="3" fill="currentColor" opacity="0.8" />
            <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.3" />
          </svg>
        </span>
        <span className="nav__brand-text">
          <strong>Arrafi</strong>
          <small>Desain · Web · Foto</small>
        </span>
      </a>

      <ul className="nav__links" role="list">
        {sections.map((id) => (
          <li key={id} className={`nav__item${activeId === id ? ' nav__item--active' : ''}`}>
            <a href={`#${id}`} data-active={activeId === id}>
              {LABELS[id]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
});
