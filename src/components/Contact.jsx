import { memo } from 'react';

const CONTACTS = [
  {
    label: 'Email',
    value: 'arafiizzaputra@gmail.com',
    href: 'mailto:arafiizzaputra@gmail.com',
  },
  {
    label: 'WhatsApp',
    value: '+62 812-4371-3524',
    href: 'https://wa.me/6281243713524',
  },
  {
    label: 'Instagram',
    value: '@ARF.VX',
    href: 'https://www.instagram.com/arf.vx',
  },
];

export default memo(function Contact() {
  return (
    <section id="kontak" className="section contact">
      <div className="section__header reveal">
        <span className="spectral-label">SPECTRAL TYPE · M5V</span>
        <h2>Mari buat sesuatu yang punya gravitasi visual.</h2>
        <p className="section__intro">
          Terbuka untuk kolaborasi, proyek web, desain visual, dan eksplorasi
          kreatif lainnya.
        </p>
      </div>

      <div className="contact__grid">
        {CONTACTS.map((c, i) => (
          <a
            key={c.label}
            className={`card card--contact reveal reveal--delay-${i + 1}`}
            href={c.href}
            target={c.href.startsWith('http') ? '_blank' : undefined}
            rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            <span className="card__label">{c.label}</span>
            <strong className="card__value">{c.value}</strong>
            <span className="card__arrow" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
});
