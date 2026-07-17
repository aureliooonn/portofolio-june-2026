import { memo } from 'react';

const PROJECTS = [
  {
    marker: 'Commerce',
    title: 'E-commerce',
    desc: 'Toko online dengan alur belanja yang bersih, sistem navigasi intuitif, dan tata letak yang punya rasa modern.',
    live: 'https://aureliooon.github.io/e-commerce/',
    code: 'https://github.com/aureliooon/e-commerce',
  },
  {
    marker: 'Interaktif',
    title: 'Cek Khodam',
    desc: 'Website interaktif ringan dengan pengalaman yang langsung, playful, dan mudah dibagikan.',
    live: 'https://aureliooon.github.io/Cek-khodam/',
    code: 'https://github.com/aureliooon/Cek-khodam',
  },
  {
    marker: 'Landing',
    title: 'Flower',
    desc: 'Website toko bunga dengan komposisi lembut, navigasi sederhana, dan struktur responsif yang elegan.',
    live: 'https://aureliooon.github.io/Flower/',
    code: 'https://github.com/aureliooon/Flower',
  },
];

export default memo(function Projects() {
  return (
    <section id="karya" className="section projects">
      <div className="section__header reveal">
        <span className="spectral-label">SPECTRAL TYPE · M3III</span>
        <h2>Proyek yang sudah mengudara di jalur visual saya.</h2>
        <p className="section__intro">
          Setiap karya adalah stasiun baru: terstruktur, memorable, dan dibingkai
          dengan nuansa astronomi yang lembut.
        </p>
      </div>

      <div className="projects__grid">
        <div className="card card--summary reveal reveal--delay-1">
          <span className="card__chip">Ringkasan orbit</span>
          <h3>Mengumpulkan proyek dengan jejak visual yang kuat</h3>
          <p>
            Proyek-proyek ini menunjukkan bagaimana saya menggabungkan antarmuka
            rapi, narasi visual, dan konsep gelap yang berkelas.
          </p>
          <ul className="card__list">
            <li>Desain antarmuka dengan mood astronomi</li>
            <li>Komposisi warna hangat dan aksen cahaya</li>
            <li>Fokus pada detail, pengalaman, dan kejelasan</li>
          </ul>
        </div>

        {PROJECTS.map((p, i) => (
          <article key={p.title} className={`card card--project reveal reveal--delay-${i + 2}`}>
            <div className="card__orbit-ring" aria-hidden="true" />
            <span className="card__marker">{p.marker}</span>
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
            <div className="card__actions">
              <a className="btn btn--small" href={p.live} target="_blank" rel="noopener noreferrer">
                Live
              </a>
              <a className="btn btn--small btn--outline" href={p.code} target="_blank" rel="noopener noreferrer">
                Code
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
});
