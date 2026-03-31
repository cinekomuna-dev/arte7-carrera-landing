'use client';

import { useState, useEffect } from 'react';

export default function DiplomadoCDMXPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    interes: 'Diplomado CDMX',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [utm, setUtm] = useState({ source: '', medium: '', campaign: '' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtm({
      source: params.get('utm_source') || '',
      medium: params.get('utm_medium') || '',
      campaign: params.get('utm_campaign') || '',
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          utm_source: utm.source,
          utm_medium: utm.medium,
          utm_campaign: utm.campaign,
        }),
      });

      if (!res.ok) throw new Error('Error al enviar');

      setStatus('success');
      setFormData({ nombre: '', email: '', telefono: '', interes: 'Diplomado CDMX' });

      // Meta Pixel: evento Lead
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead', {
          content_name: 'Diplomado CDMX',
          content_category: 'Diplomado CDMX',
        });
      }
      // Google Analytics 4: evento generate_lead
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'generate_lead', {
          event_category: 'Diplomado CDMX',
          event_label: 'Diplomado CDMX',
        });
      }

      // Redirigir a WhatsApp después de 2.5 segundos
      setTimeout(() => {
        window.location.href = `https://wa.me/525527323335?text=${encodeURIComponent(
          `Hola Arte7, soy ${formData.nombre}. Acabo de registrar mi interés en el Diplomado Intensivo de Cine CDMX. Quiero más información.`
        )}`;
      }, 2500);
    } catch {
      setStatus('error');
      setErrorMsg('Hubo un error. Intenta de nuevo o escríbenos directo por WhatsApp.');
    }
  }

  return (
    <>
      {/* NAV */}
      <nav>
        <div className="nav-left">
          <a href="https://arte7.net" className="nav-logo"><img src="/logo-blanco.png" alt="Arte7" className="nav-logo-img" /></a>
          <span className="nav-tag">// Escuela de Cine &middot; CDMX</span>
        </div>
        <div className="nav-right">
          <a href="#curriculum" className="nav-link">Plan de estudios</a>
          <a href="#admision" className="nav-link">Admisión</a>
          <a href="#inscribete" className="nav-cta">INSCRÍBETE →</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-rail" />
        <div className="hero-body">
          <div className="hero-eyebrow">
            Arte7 Escuela de Cine &nbsp;&middot;&nbsp; Fundada 1999 &nbsp;&middot;&nbsp; Coyoacán, CDMX
          </div>

          <h1 className="hero-h1">
            DIPLOMADO INTENSIVO
            <span className="accent">DE CINE</span>
          </h1>

          <p className="hero-location">CDMX &nbsp;&middot;&nbsp; COYOACÁN &nbsp;&middot;&nbsp; SAN DIEGO CHURUBUSCO</p>

          <div className="hero-stats">
            <div className="hstat">
              <span className="hstat-n">06</span>
              <span className="hstat-l">Meses de formación</span>
            </div>
            <div className="hstat">
              <span className="hstat-n">LUN–VIE</span>
              <span className="hstat-l">10:00 — 14:00 hrs</span>
            </div>
            <div className="hstat">
              <span className="hstat-n">26</span>
              <span className="hstat-l">Años en la industria</span>
            </div>
          </div>

          <div className="hero-ctas">
            <a href="#inscribete" className="btn-hero">INSCRÍBETE AHORA →</a>
            <a href="mailto:cary@arte7.net" className="btn-ghost">ESCRÍBENOS</a>
          </div>

          <div className="scroll-hint">
            <div className="scroll-line" />
            <span>Explora el programa</span>
          </div>

          <div className="hero-ghost" aria-hidden="true">A7</div>

          <div className="hero-badge" aria-hidden="true">
            <span className="hbadge-n">MAY</span>
            <span className="hbadge-l">Inicio<br />2026</span>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          <span className="ti">DIPLOMADO INTENSIVO</span><span className="ti ti-sep">///</span>
          <span className="ti">CDMX · COYOACÁN</span><span className="ti ti-sep">///</span>
          <span className="ti">6 MESES</span><span className="ti ti-sep">///</span>
          <span className="ti">CORTOMETRAJE FINAL</span><span className="ti ti-sep">///</span>
          <span className="ti">CANON OFFICIAL PARTNER</span><span className="ti ti-sep">///</span>
          <span className="ti">DESDE 1999</span><span className="ti ti-sep">///</span>
          <span className="ti">HACEMOS EL CINE POSIBLE</span><span className="ti ti-sep">///</span>
          <span className="ti">INICIO MAYO 2026</span><span className="ti ti-sep">///</span>
          {/* duplicate for seamless loop */}
          <span className="ti">DIPLOMADO INTENSIVO</span><span className="ti ti-sep">///</span>
          <span className="ti">CDMX · COYOACÁN</span><span className="ti ti-sep">///</span>
          <span className="ti">6 MESES</span><span className="ti ti-sep">///</span>
          <span className="ti">CORTOMETRAJE FINAL</span><span className="ti ti-sep">///</span>
          <span className="ti">CANON OFFICIAL PARTNER</span><span className="ti ti-sep">///</span>
          <span className="ti">DESDE 1999</span><span className="ti ti-sep">///</span>
          <span className="ti">HACEMOS EL CINE POSIBLE</span><span className="ti ti-sep">///</span>
          <span className="ti">INICIO MAYO 2026</span><span className="ti ti-sep">///</span>
        </div>
      </div>

      {/* MANIFESTO */}
      <section className="manifesto">
        <div className="label">// 001 — Filosofía del programa</div>
        <blockquote className="manifesto-quote">
          FORMACIÓN INTENSIVA EN 6 MESES. TEORÍA, PRÁCTICA Y REALIZACIÓN CINEMATOGRÁFICA PARA QUIENES QUIEREN ENTRAR AL MUNDO DEL CINE SIN COMPROMETER AÑOS.
        </blockquote>

        <div className="manifesto-body">
          <p className="manifesto-p">
            El Diplomado Intensivo de Cine de Arte7 condensa lo esencial de la formación cinematográfica en 6 meses. De lunes a viernes, 4 horas diarias, aprendes haciendo — desde el lenguaje visual hasta la post-producción. No es un curso introductorio. Es una <strong>inmersión real en el oficio del cine</strong>.
          </p>

          <div className="manifesto-facts">
            <div className="mfact">
              <span className="mfact-icon">01</span>
              <div className="mfact-text">
                <strong>Formación Intensiva</strong>
                6 meses, lunes a viernes. Presencial. Sin atajos.
              </div>
            </div>
            <div className="mfact">
              <span className="mfact-icon">02</span>
              <div className="mfact-text">
                <strong>Práctica desde el Día 1</strong>
                Cada módulo termina con una pieza cinematográfica real.
              </div>
            </div>
            <div className="mfact">
              <span className="mfact-icon">03</span>
              <div className="mfact-text">
                <strong>Proyecto Final de Cortometraje</strong>
                Tu proyecto final es un cortometraje terminado listo para festivales.
              </div>
            </div>
            <div className="mfact">
              <span className="mfact-icon">04</span>
              <div className="mfact-text">
                <strong>26 Años de Trayectoria</strong>
                Partner oficial de Canon. Egresados activos en la industria.
              </div>
            </div>
          </div>
        </div>

        <div className="manifesto-ghost" aria-hidden="true">&#10022;</div>
      </section>

      {/* CURRICULUM */}
      <section className="curriculum" id="curriculum">
        <div className="cur-header">
          <div>
            <div className="label">// 002 — Plan de estudios</div>
            <h2 className="cur-title">3 MÓD.<br /><em>UN CORTOMETRAJE.</em></h2>
          </div>
          <p className="cur-note">Modalidad presencial<br />Inicio: 19 de Mayo 2026<br />Lunes — Viernes 10–14h</p>
        </div>

        <div className="sem-grid">
          {[
            {
              n: '01',
              tag: 'Módulo 01 · Mes 1–2',
              title: 'FUNDAMENTOS',
              desc: 'Lenguaje cinematográfico, fotografía y sonido. Construyes las bases técnicas y narrativas para contar historias con imagen y sonido.',
              del: 'Cortometraje de ejercicio',
            },
            {
              n: '02',
              tag: 'Módulo 02 · Mes 3–4',
              title: 'REALIZACIÓN',
              desc: 'Dirección, guion y producción. Desarrollas tu voz autoral y aprendes a llevar un proyecto cinematográfico de la página al set.',
              del: 'Cortometraje de ficción',
            },
            {
              n: '03',
              tag: 'Módulo 03 · Mes 5–6',
              title: 'POST-PRODUCCIÓN Y EXHIBICIÓN',
              desc: 'Edición, corrección de color, diseño sonoro y distribución. Tu proyecto final cobra vida y se prepara para llegar al mundo.',
              del: 'Proyecto final terminado + estrategia de festivales',
            },
          ].map((mod) => (
            <div className="sc" key={mod.n}>
              <span className="sc-n" aria-hidden="true">{mod.n}</span>
              <div className="sc-tag">// {mod.tag}</div>
              <h3 className="sc-title">{mod.title}</h3>
              <p className="sc-desc">{mod.desc}</p>
              <div className="sc-del">
                <div className="sc-del-lbl">&#9654; Entregable</div>
                <p className="sc-del-txt">{mod.del}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ADMISSION */}
      <section className="admission" id="admision">
        <div className="label">// 003 — Proceso de admisión</div>
        <h2 className="adm-title">3 PASOS.<br /><em>EMPIEZA HOY.</em></h2>

        <div className="steps">
          <div className="step">
            <div className="step-bg-n" aria-hidden="true">01</div>
            <span className="step-n">// PASO 01</span>
            <h3 className="step-title">ENTREVISTA CON EL COORDINADOR</h3>
            <p className="step-desc">
              Una conversación directa para conocerte, entender tus intereses y confirmar que Arte7 es el lugar correcto para ti. Sin examen de admisión. Sin trámites innecesarios.
            </p>
          </div>
          <div className="step">
            <div className="step-bg-n" aria-hidden="true">02</div>
            <span className="step-n">// PASO 02</span>
            <h3 className="step-title">CARTA DE ACEPTACIÓN</h3>
            <p className="step-desc">
              Si la entrevista va bien, recibes tu carta de admisión. El proceso es claro, rápido y sin burocracia. Sabemos lo que vale tu tiempo.
            </p>
          </div>
          <div className="step">
            <div className="step-bg-n" aria-hidden="true">03</div>
            <span className="step-n">// PASO 03</span>
            <h3 className="step-title">DOCUMENTACIÓN Y PRIMER MES</h3>
            <p className="step-desc">
              Entregas la documentación requerida y cubres el primer mes de colegiatura. A partir de ahí, eres parte de Arte7. Empieza mayo 2026.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT STRIP */}
      <div className="contact-strip">
        <div className="cs-left">
          <h3>¿TIENES DUDAS?<br />ESCRÍBENOS AHORA.</h3>
          <p>// cary@arte7.net — respuesta garantizada</p>
        </div>
        <div className="cs-phones">
          <span className="cs-label">// CDMX — Coyoacán</span>
          <a href="tel:+525527323335">+52 (55) 2732–3335</a>
          <a href="tel:+525556590075">+52 (55) 5659–0075</a>
        </div>
        <div>
          <a
            href="https://wa.me/525527323335?text=Hola,%20quiero%20informaci%C3%B3n%20sobre%20el%20Diplomado%20Intensivo%20de%20Cine%20CDMX"
            className="btn-ghost"
            style={{ borderColor: 'var(--black)', color: 'var(--black)', padding: '18px 36px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.25rem', letterSpacing: '0.08em' }}
          >
            WHATSAPP DIRECTO →
          </a>
        </div>
      </div>

      {/* CTA SECTION WITH FORM */}
      <section className="cta-section" id="inscribete">
        <div className="cta-ghost" aria-hidden="true">¿?</div>

        <div className="cta-inner">
          <div>
            <h2 className="cta-h">¿LISTO<br />PARA<br />HACER<br />CINE?</h2>
            <p className="cta-sub">
              19 de Mayo 2026. Lugares limitados. Coyoacán, CDMX.<br />
              Regístrate hoy — sin costo, sin compromiso.
            </p>
          </div>

          {status === 'success' ? (
            <div className="lead-form" style={{ justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '3rem' }}>&#10003;</div>
              <p className="form-message form-success" style={{ fontSize: '1.1rem' }}>
                ¡Gracias! Cary se pondrá en contacto contigo pronto.
              </p>
              <p style={{ fontSize: '0.8rem', opacity: 0.6, color: 'var(--black)', textAlign: 'center' }}>
                Redirigiendo a WhatsApp...
              </p>
            </div>
          ) : (
            <form className="lead-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="nombre"
                placeholder="Tu nombre"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
              <input
                type="email"
                name="email"
                placeholder="Tu email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="tel"
                name="telefono"
                placeholder="+52 55 1234 5678"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
              <select
                name="interes"
                required
                value={formData.interes}
                onChange={(e) => setFormData({ ...formData, interes: e.target.value })}
              >
                <option value="Diplomado CDMX">Diplomado CDMX</option>
                <option value="Diplomado QRO">Diplomado QRO</option>
                <option value="Carrera CDMX">Carrera CDMX</option>
                <option value="Carrera QRO">Carrera QRO</option>
              </select>

              <button type="submit" className="btn-cta1" disabled={status === 'sending'}>
                {status === 'sending' ? 'ENVIANDO...' : 'REGÍSTRATE AHORA →'}
              </button>

              {status === 'error' && (
                <p className="form-message form-error">{errorMsg}</p>
              )}

              <a
                href="mailto:cary@arte7.net?subject=Informes%20Diplomado%20Intensivo%20de%20Cine%20CDMX"
                className="btn-cta2"
              >
                ESCRIBE A CARY@ARTE7.NET
              </a>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="fb-logo"><img src="/logo-blanco.png" alt="Arte7" className="footer-logo-img" /></div>
            <span className="fb-slogan">// Hacemos el Cine Posible</span>
            <p className="fb-desc">
              Escuela de Cine y Casa Productora con 26 años formando cineastas en México. Fundada en 1999 en Coyoacán, CDMX. Sedes en Ciudad de México, Querétaro y modalidad online.
            </p>
            <p className="fb-partner">Partner oficial: <em>CANON</em></p>
          </div>

          <div className="fcol">
            <h4>// Contacto CDMX</h4>
            <a href="tel:+525527323335">+52 (55) 2732–3335</a>
            <a href="tel:+525556590075">+52 (55) 5659–0075</a>
            <a href="mailto:cary@arte7.net">cary@arte7.net</a>
            <a href="mailto:info@arte7.net">info@arte7.net</a>
            <address>
              Cerrada Eleuterio Méndez #11<br />
              San Diego Churubusco<br />
              Coyoacán, CDMX
            </address>
          </div>

          <div className="fcol">
            <h4>// Redes Sociales</h4>
            <a href="https://instagram.com/arte7cine" target="_blank" rel="noopener noreferrer">Instagram @arte7cine</a>
            <a href="https://instagram.com/comunidadarte7" target="_blank" rel="noopener noreferrer">Instagram @comunidadarte7</a>
            <a href="https://tiktok.com/@arte7cine" target="_blank" rel="noopener noreferrer">TikTok @arte7cine</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube Arte7 Cine</a>
            <a href="https://vimeo.com" target="_blank" rel="noopener noreferrer">Vimeo Arte7</a>
          </div>

          <div className="fcol">
            <h4>// Programas</h4>
            <a href="https://arte7.net/carrera-de-cine-cdmx">Carrera de Cine CDMX</a>
            <a href="https://arte7.net">Querétaro</a>
            <a href="https://arte7.net">Cursos Online — A7D</a>
            <a href="https://arte7.net">Actuación — FAC</a>
            <a href="https://arte7.net">Arte7 Producciones</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Arte7 Escuela de Cine &middot; Todos los derechos reservados &middot; arte7.net</p>
          <p>Partner oficial: CANON &nbsp;&middot;&nbsp; Landing diseñada por Estrategia Digital Arte7</p>
        </div>
      </footer>
    </>
  );
}
