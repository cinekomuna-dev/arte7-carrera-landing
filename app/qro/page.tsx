'use client';

import { useState, useEffect } from 'react';

export default function QROPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    interes: 'Carrera Querétaro',
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
      setFormData({ nombre: '', email: '', telefono: '', interes: 'Carrera Querétaro' });

      // Meta Pixel: evento Lead
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead', {
          content_name: 'Carrera Querétaro',
          content_category: 'Carrera QRO',
        });
      }

      // Redirigir a WhatsApp después de 2.5 segundos
      setTimeout(() => {
        window.location.href = `https://wa.me/524422810663?text=${encodeURIComponent(
          `Hola Arte7 Querétaro, soy ${formData.nombre}. Acabo de registrar mi interés en la Carrera de Cine. Quiero más información.`
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
          <span className="nav-tag">// Escuela de Cine · Querétaro</span>
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
            Arte7 Escuela de Cine &nbsp;&middot;&nbsp; Fundada 1999 &nbsp;&middot;&nbsp; Querétaro
          </div>

          <h1 className="hero-h1">
            CARRERA
            <span className="accent">DE CINE</span>
          </h1>

          <p className="hero-location">QUERÉTARO &nbsp;&middot;&nbsp; CENTRO CULTURAL LA FÁBRICA</p>

          <div className="hero-stats">
            <div className="hstat">
              <span className="hstat-n">03</span>
              <span className="hstat-l">Años de formación</span>
            </div>
            <div className="hstat">
              <span className="hstat-n">07</span>
              <span className="hstat-l">Semestres</span>
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
            <a href="mailto:ferluna@arte7.net" className="btn-ghost">ESCRÍBENOS</a>
          </div>

          <div className="scroll-hint">
            <div className="scroll-line" />
            <span>Explora el programa</span>
          </div>

          <div className="hero-ghost" aria-hidden="true">A7</div>

          <div className="hero-badge" aria-hidden="true">
            <span className="hbadge-n">AGO</span>
            <span className="hbadge-l">Inicio<br />2026</span>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          <span className="ti">CARRERA DE CINE</span><span className="ti ti-sep">///</span>
          <span className="ti">QUERÉTARO</span><span className="ti ti-sep">///</span>
          <span className="ti">3 AÑOS · 7 SEMESTRES</span><span className="ti ti-sep">///</span>
          <span className="ti">ÓPERA PRIMA FINANCIADA</span><span className="ti ti-sep">///</span>
          <span className="ti">CANON OFFICIAL PARTNER</span><span className="ti ti-sep">///</span>
          <span className="ti">DESDE 1999</span><span className="ti ti-sep">///</span>
          <span className="ti">HACEMOS EL CINE POSIBLE</span><span className="ti ti-sep">///</span>
          <span className="ti">INICIO AGOSTO 2026</span><span className="ti ti-sep">///</span>
          {/* duplicate for seamless loop */}
          <span className="ti">CARRERA DE CINE</span><span className="ti ti-sep">///</span>
          <span className="ti">QUERÉTARO</span><span className="ti ti-sep">///</span>
          <span className="ti">3 AÑOS · 7 SEMESTRES</span><span className="ti ti-sep">///</span>
          <span className="ti">ÓPERA PRIMA FINANCIADA</span><span className="ti ti-sep">///</span>
          <span className="ti">CANON OFFICIAL PARTNER</span><span className="ti ti-sep">///</span>
          <span className="ti">DESDE 1999</span><span className="ti ti-sep">///</span>
          <span className="ti">HACEMOS EL CINE POSIBLE</span><span className="ti ti-sep">///</span>
          <span className="ti">INICIO AGOSTO 2026</span><span className="ti ti-sep">///</span>
        </div>
      </div>

      {/* MANIFESTO */}
      <section className="manifesto">
        <div className="label">// 001 — Filosofía del programa</div>
        <blockquote className="manifesto-quote">
          DEL CONCEPTO A LA PANTALLA GRANDE. TEORÍA, PRÁCTICA Y REFLEXIÓN PARA CINEASTAS REALES.
        </blockquote>

        <div className="manifesto-body">
          <p className="manifesto-p">
            Arte7 te da las herramientas técnicas y el pensamiento autoral para convertirte en un cineasta profesional. No sólo aprendes cine — <strong>haces cine</strong>, desde el primer día. Con un enfoque teórico-práctico continuo que va de la idea a la realización, el programa construye cineastas con voz propia.
          </p>

          <div className="manifesto-facts">
            <div className="mfact">
              <span className="mfact-icon">01</span>
              <div className="mfact-text">
                <strong>Formación Intensiva</strong>
                4 horas diarias, lunes a viernes. Presencial. Sin atajos.
              </div>
            </div>
            <div className="mfact">
              <span className="mfact-icon">02</span>
              <div className="mfact-text">
                <strong>Práctica desde el Día 1</strong>
                Cada semestre termina con una pieza cinematográfica real.
              </div>
            </div>
            <div className="mfact">
              <span className="mfact-icon">03</span>
              <div className="mfact-text">
                <strong>Ópera Prima Financiada</strong>
                Tu tesis es un largometraje. Arte7 Producciones lo financia.
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
            <h2 className="cur-title">7 SEM.<br /><em>UN CINEASTA.</em></h2>
          </div>
          <p className="cur-note">Modalidad presencial<br />Inicio: Agosto 2026<br />Lunes — Viernes 10–14h</p>
        </div>

        <div className="sem-grid">
          {[
            { n: '01', tag: 'Semestre 01', title: 'BASES DEL LENGUAJE', desc: 'Fundamentos de la imagen en movimiento. Historia del cine como herramienta. Aprendes a leer y construir una imagen con intención.', del: 'Cortometraje de ficción sin diálogo + ensayo de historia del cine' },
            { n: '02', tag: 'Semestre 02', title: 'VOZ AUTORAL', desc: 'Desarrolla tu punto de vista como cineasta. El experimento como método de aprendizaje. Tu cine, no el de alguien más.', del: 'Cortometraje experimental + ensayo de análisis cinematográfico' },
            { n: '03', tag: 'Semestre 03', title: 'CINE DE NO FICCIÓN', desc: 'La realidad como material cinematográfico. El documental como práctica política y estética a la vez.', del: 'Cortometraje documental + carpeta de producción' },
            { n: '04', tag: 'Semestre 04', title: 'PRODUCCIÓN INDEPENDIENTE', desc: 'Modelos reales de producción y desarrollo de largometraje. Cómo funciona la industria sin ilusiones.', del: 'Ficción menor a 30 min + argumento de largometraje' },
            { n: '05', tag: 'Semestre 05', title: 'ESCRITURA DE LARGO', desc: 'Guion de tu ópera prima. Estructura, personajes, mundo. Construyes la película antes de filmarla.', del: 'Primera versión del tratamiento de ficción o documental' },
            { n: '06', tag: 'Semestre 06', title: 'RODAJE DE TESIS', desc: 'Cámaras, locaciones, equipo técnico. Tu largometraje empieza a existir en la realidad.', del: 'Corte rough de la ópera prima' },
            { n: '07', tag: 'Semestre 07', title: 'DISTRIBUCIÓN Y EXHIBICIÓN', desc: 'Post-producción, festivales, circuito de exhibición. Tu película llega a los ojos del mundo.', del: 'Ópera prima terminada + estrategia de festivales' },
          ].map((sem) => (
            <div className="sc" key={sem.n}>
              <span className="sc-n" aria-hidden="true">{sem.n}</span>
              <div className="sc-tag">// {sem.tag}</div>
              <h3 className="sc-title">{sem.title}</h3>
              <p className="sc-desc">{sem.desc}</p>
              <div className="sc-del">
                <div className="sc-del-lbl">&#9654; Entregable</div>
                <p className="sc-del-txt">{sem.del}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OPERA PRIMA */}
      <section className="opera">
        <div className="opera-left">
          <div className="label">// 003 — Proyecto final de carrera</div>
          <h2 className="opera-title">
            ÓPERA
            <em>PRIMA</em>
          </h2>
          <p className="opera-desc">
            Tu tesis no es un trabajo escolar. Es tu primera película. Con tu generación, creas un largometraje — ficción, documental o piloto de TV. Arte7 Producciones lo financia. Tú lo diriges.
          </p>
          <p className="opera-desc" style={{ marginTop: 20, fontSize: '0.88rem', opacity: 0.65 }}>
            &ldquo;De la idea a la pantalla grande&rdquo; no es un slogan.<br />
            Es el plan de estudios completo.
          </p>
        </div>

        <div className="opera-right">
          <div className="ofact">
            <span className="ofact-n">100%</span>
            <span className="ofact-l">Financiado por Arte7 Producciones</span>
          </div>
          <div className="ofact">
            <span className="ofact-n">3</span>
            <span className="ofact-l">Formatos: Ficción · Documental · Piloto TV</span>
          </div>
          <div className="ofact">
            <span className="ofact-n">26</span>
            <span className="ofact-l">Años haciendo esto posible</span>
          </div>
        </div>
      </section>

      {/* SCHOLARSHIP */}
      <section className="scholarship">
        <div className="schol-number" aria-hidden="true">20<em>%</em></div>
        <div className="schol-content">
          <div className="label" style={{ color: 'var(--black)' }}>// 004 — Apoyo económico</div>
          <h2>BECA POR<br />RENDIMIENTO</h2>
          <p>
            Una beca académica por generación, a partir del segundo semestre. Reducción del 20% en colegiatura para el alumno que demuestre excelencia académica y compromiso real con el programa.
          </p>
          <ul className="req-list">
            <li>Promedio mínimo de 8.5</li>
            <li>Asistencia mínima del 80%</li>
            <li>Aplica a partir del segundo semestre</li>
            <li>Un lugar disponible por generación</li>
          </ul>
        </div>
        <div className="schol-ghost" aria-hidden="true">BECA</div>
      </section>

      {/* ADMISSION */}
      <section className="admission" id="admision">
        <div className="label">// 005 — Proceso de admisión</div>
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
              Entregas la documentación requerida y cubres el primer mes de colegiatura. A partir de ahí, eres parte de Arte7. Empieza agosto 2026.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT STRIP */}
      <div className="contact-strip">
        <div className="cs-left">
          <h3>¿TIENES DUDAS?<br />ESCRÍBENOS AHORA.</h3>
          <p>// ferluna@arte7.net — respuesta garantizada</p>
        </div>
        <div className="cs-phones">
          <span className="cs-label">// Querétaro — Centro Cultural La Fábrica</span>
          <a href="tel:+524421291736">(442) 129–1736</a>
          <a href="tel:+524422810663">(442) 281–0663</a>
        </div>
        <div>
          <a
            href="https://wa.me/524422810663?text=Hola,%20quiero%20informaci%C3%B3n%20sobre%20la%20Carrera%20de%20Cine%20en%20Quer%C3%A9taro"
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
              Mayo 2026. Lugares limitados. Querétaro.<br />
              Regístrate hoy — sin costo, sin compromiso.
            </p>
          </div>

          {status === 'success' ? (
            <div className="lead-form" style={{ justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '3rem' }}>&#10003;</div>
              <p className="form-message form-success" style={{ fontSize: '1.1rem' }}>
                ¡Gracias! Fer se pondrá en contacto contigo pronto.
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
                placeholder="+52 442 123 4567"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
              <select
                name="interes"
                required
                value={formData.interes}
                onChange={(e) => setFormData({ ...formData, interes: e.target.value })}
              >
                <option value="">— ¿Cuál es tu interés? —</option>
                <option value="Carrera CDMX">Carrera de Cine CDMX</option>
                <option value="Carrera Querétaro">Carrera Querétaro</option>
                <option value="Cursos Online">Cursos Online (A7D)</option>
                <option value="Actuación">Actuación (FAC)</option>
              </select>

              <button type="submit" className="btn-cta1" disabled={status === 'sending'}>
                {status === 'sending' ? 'ENVIANDO...' : 'REGÍSTRATE AHORA →'}
              </button>

              {status === 'error' && (
                <p className="form-message form-error">{errorMsg}</p>
              )}

              <a
                href="mailto:ferluna@arte7.net?subject=Informes%20Carrera%20de%20Cine%20Quer%C3%A9taro"
                className="btn-cta2"
              >
                ESCRIBE A FERLUNA@ARTE7.NET
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
            <h4>// Contacto Querétaro</h4>
            <a href="tel:+524421291736">(442) 129–1736</a>
            <a href="tel:+524422810663">(442) 281–0663</a>
            <a href="mailto:ferluna@arte7.net">ferluna@arte7.net</a>
            <address>
              Centro Cultural La Fábrica<br />
              Av. Industrialización 4<br />
              Álamos 2da sección<br />
              Querétaro, Qro. 76160
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
          <p>&copy; 2026 Arte7 Escuela de Cine · Todos los derechos reservados · arte7.net</p>
          <p>Partner oficial: CANON &nbsp;&middot;&nbsp; Landing diseñada por Estrategia Digital Arte7</p>
        </div>
      </footer>
    </>
  );
}
