import { memo } from 'react';

const EDUCATION = [
  'SD Negeri Jemurwonosari 1 Surabaya',
  'SMP Negeri 57 Surabaya',
  'SMA Muhammadiyah 2 Surabaya',
];

const HIGHLIGHTS = [
  {
    label: 'Visi',
    title: 'Menemukan harmonisasi visual',
    desc: 'Mendesain antarmuka yang punya struktur kuat dan estetika atmosferik, seperti langit yang rapi di antara bintang.',
  },
  {
    label: 'Pendekatan',
    title: 'Proyek dengan sentuhan narasi',
    desc: 'Setiap karya diposisikan sebagai perjalanan visual yang mudah dicerna dan berkesan.',
  },
];

export default memo(function Profile() {
  return (
    <section id="profil" className="section profile">
      <div className="section__header reveal">
        <span className="spectral-label">SPECTRAL TYPE · K2III</span>
        <h2>Membangun karya digital dengan arah visual yang jelas.</h2>
      </div>

      <div className="profile__grid">
        <div className="profile__content reveal reveal--delay-1">
          <p className="profile__intro">
            Saya Arrafi, kreator web dan visual yang senang menggabungkan detail
            teknis dengan komposisi yang terasa hidup. Portofolio ini adalah stasiun
            pengamatan: setiap elemen menempatkan ide, gaya, dan keahlian saya pada
            jalur yang jelas.
          </p>

          <div className="profile__cards">
            {HIGHLIGHTS.map((h, i) => (
              <article key={h.label} className={`card card--highlight reveal reveal--delay-${i + 2}`}>
                <span className="card__chip">{h.label}</span>
                <h3>{h.title}</h3>
                <p>{h.desc}</p>
              </article>
            ))}
          </div>

          <div className="profile__edu">
            <span className="profile__edu-label">Jejak pendidikan</span>
            <ol>
              {EDUCATION.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="profile__aside reveal reveal--delay-2">
          <figure className="profile__photo">
            <div className="profile__photo-ring" aria-hidden="true" />
            <img
              src="img/mboh.jpeg"
              alt="Arrafi Izzaputra Febriansyah"
              loading="lazy"
            />
          </figure>

          <dl className="profile__stats">
            {[
              { label: 'Fokus utama', value: 'Web, desain, fotografi' },
              { label: 'Lokasi', value: 'Surabaya, Indonesia' },
              { label: 'Mode', value: 'Eksplorasi visual' },
              { label: 'Inti', value: 'HTML, CSS, JS, Figma' },
            ].map((s) => (
              <div key={s.label} className="profile__stat">
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
});
