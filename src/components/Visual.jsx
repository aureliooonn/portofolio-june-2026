import { memo } from 'react';

const PHOTOS = [
  { src: 'img/photography/IMG_6080.JPG', alt: 'Fotografi Arrafi', className: 'visual-tall' },
  { src: 'img/design/packaging.png', alt: 'Desain packaging Arrafi' },
  { src: 'img/photography/IMG_2396.JPG', alt: 'Fotografi Arrafi' },
  { src: 'img/design/ig story.png', alt: 'Desain Instagram story Arrafi' },
  { src: 'img/photography/IMG_6090.JPG', alt: 'Fotografi Arrafi', className: 'visual-wide' },
  { src: 'img/design/mario.png', alt: 'Desain ilustrasi Arrafi' },
  { src: 'img/photography/IMG_6110.JPG', alt: 'Fotografi Arrafi' },
  { src: 'img/photography/IMG_6134.JPG', alt: 'Fotografi Arrafi' },
  { src: 'img/photography/IMG_6184.JPG', alt: 'Fotografi Arrafi' },
  { src: 'img/photography/IMG_6238.JPG', alt: 'Fotografi Arrafi', className: 'visual-wide' },
];

export default memo(function Visual() {
  return (
    <section id="visual" className="section visual">
      <div className="section__header reveal">
        <span className="spectral-label">SPECTRAL TYPE · O5V</span>
        <h2>Foto dan desain yang membentuk bahasa visual saya.</h2>
      </div>

      <div className="visual__grid">
        {PHOTOS.map((p, i) => (
          <figure key={i} className={`visual__item reveal reveal--delay-${Math.min(i, 3)}${p.className ? ' ' + p.className : ''}`}>
            <img src={p.src} alt={p.alt} loading="lazy" />
          </figure>
        ))}
      </div>
    </section>
  );
});
