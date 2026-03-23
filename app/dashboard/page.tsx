'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '../../lib/supabase-browser';
import { Lead, LeadEstado, ESTADO_LABELS, ESTADO_COLORS, INTERES_OPTIONS } from '../../lib/types';

const ESTADOS: LeadEstado[] = ['nuevo', 'contactado', 'en_seguimiento', 'caliente', 'inscrito', 'perdido'];
const PAGE_SIZE = 20;

// ── Templates de mensajes ────────────────────────────────────────────────────
const WA_TEMPLATES: { label: string; msg: (l: Lead) => string }[] = [
  {
    label: 'Primer contacto',
    msg: (l) => `Hola ${l.nombre}, soy Cary de Arte7 Escuela de Cine. Vi que te interesa ${l.interes}. ¿Te gustaría agendar una charla informativa?`,
  },
  {
    label: 'Seguimiento',
    msg: (l) => `Hola ${l.nombre}, te escribo de Arte7. ¿Pudiste revisar la información sobre ${l.interes}? Estoy para resolver cualquier duda.`,
  },
  {
    label: 'Charla informativa',
    msg: (l) => `Hola ${l.nombre}, te invitamos a nuestra próxima charla informativa sobre ${l.interes} en Arte7. ¿Te gustaría asistir?`,
  },
  {
    label: 'Último aviso',
    msg: (l) => `Hola ${l.nombre}, quedan pocos lugares para ${l.interes} en Arte7. ¿Quieres que te aparte un lugar? Inscripciones abiertas.`,
  },
];

const EMAIL_TEMPLATES: { label: string; subject: (l: Lead) => string; body: (l: Lead) => string }[] = [
  {
    label: 'Bienvenida',
    subject: (l) => `Bienvenido a Arte7 - ${l.interes}`,
    body: (l) => `Hola ${l.nombre},\n\nGracias por tu interés en ${l.interes} en Arte7 Escuela de Cine.\n\nMe encantaría platicar contigo sobre el programa. ¿Tienes disponibilidad esta semana para una llamada o videollamada?\n\nQuedo al pendiente.\n\nSaludos,\nCary\nArte7 Escuela de Cine`,
  },
  {
    label: 'Charla informativa',
    subject: (l) => `Invitación a Charla Informativa - Arte7`,
    body: (l) => `Hola ${l.nombre},\n\nTe invitamos a nuestra próxima charla informativa sobre ${l.interes}.\n\nEs sin costo y sin compromiso. Podrás conocer el plan de estudios, las instalaciones y resolver todas tus dudas.\n\n¿Te gustaría que te aparte un lugar?\n\nSaludos,\nCary\nArte7 Escuela de Cine`,
  },
  {
    label: 'Seguimiento',
    subject: (l) => `¿Sigues interesado en ${l.interes}? - Arte7`,
    body: (l) => `Hola ${l.nombre},\n\n¿Pudiste revisar la información que te enviamos sobre ${l.interes}?\n\nEstoy para resolver cualquier duda que tengas. También podemos agendar una visita a nuestras instalaciones en Coyoacán.\n\nQuedo al pendiente.\n\nSaludos,\nCary\nArte7 Escuela de Cine`,
  },
];

function scoreColor(score: number) {
  if (score >= 61) return '#2ECC71';
  if (score >= 31) return '#EE9628';
  return '#FF492F';
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days}d`;
}

// ── Exportar a CSV ─────────────────────────────────────────────────────────
function exportToCSV(leads: Lead[], label?: string) {
  const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Interés', 'Score', 'Estado', 'Notas', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Fecha'];
  const rows = leads.map((l) => [
    l.id,
    `"${l.nombre.replace(/"/g, '""')}"`,
    l.email,
    l.telefono || '',
    l.interes,
    l.score,
    ESTADO_LABELS[l.estado],
    `"${(l.notas || '').replace(/"/g, '""')}"`,
    l.utm_source || '',
    l.utm_medium || '',
    l.utm_campaign || '',
    new Date(l.created_at).toLocaleDateString('es-MX'),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const suffix = label ? `-${label}` : '';
  a.download = `arte7-leads${suffix}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<LeadEstado | 'todos'>('todos');
  const [interesFilter, setInteresFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showBulk, setShowBulk] = useState(false);
  const [bulkTemplate, setBulkTemplate] = useState(0);
  const [bulkType, setBulkType] = useState<'whatsapp' | 'email'>('whatsapp');

  const supabase = createClient();

  const loadLeads = useCallback(async () => {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setLeads(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { window.location.href = '/login'; return; }
      setUserEmail(user.email || '');
    });

    loadLeads();

    const channel = supabase
      .channel('leads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        loadLeads();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadLeads, supabase]);

  // Resetear página al cambiar filtros
  useEffect(() => { setPage(1); }, [filter, interesFilter, search]);

  // Limpiar selección al cambiar filtros
  useEffect(() => { setSelected(new Set()); }, [filter, interesFilter, search]);

  async function updateLead(id: number, updates: Partial<Lead>) {
    await supabase.from('leads').update(updates).eq('id', id);
    loadLeads();
  }

  async function deleteLead(id: number) {
    if (!confirm('¿Estás seguro de eliminar este lead?')) return;
    await supabase.from('leads').delete().eq('id', id);
    loadLeads();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((l) => l.id)));
    }
  }

  function getSelectedLeads() {
    return leads.filter((l) => selected.has(l.id));
  }

  function handleBulkWhatsApp() {
    const sel = getSelectedLeads().filter((l) => l.telefono);
    if (sel.length === 0) { alert('Ningún lead seleccionado tiene teléfono.'); return; }
    const template = WA_TEMPLATES[bulkTemplate];
    // Open each in a new tab (browsers may block after ~3, but it's the best we can do client-side)
    sel.forEach((l, i) => {
      const msg = template.msg(l);
      const url = `https://wa.me/${l.telefono!.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
      setTimeout(() => window.open(url, '_blank'), i * 500);
    });
  }

  function handleBulkEmail() {
    const sel = getSelectedLeads();
    if (sel.length === 0) { alert('No hay leads seleccionados.'); return; }
    const template = EMAIL_TEMPLATES[bulkTemplate];
    if (sel.length <= 10) {
      // Open mailto with BCC for small batches
      const emails = sel.map((l) => l.email).join(',');
      const subject = encodeURIComponent(template.subject(sel[0]));
      const body = encodeURIComponent(template.body(sel[0]));
      window.open(`mailto:${emails}?subject=${subject}&body=${body}`, '_blank');
    } else {
      // For large batches, copy emails to clipboard
      const emails = sel.map((l) => l.email).join(', ');
      navigator.clipboard.writeText(emails).then(() => {
        alert(`${sel.length} emails copiados al portapapeles. Pégalos en tu cliente de email.`);
      });
    }
  }

  // Leads filtrados
  const filtered = leads.filter((l) => {
    if (filter !== 'todos' && l.estado !== filter) return false;
    if (interesFilter && l.interes !== interesFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!l.nombre.toLowerCase().includes(q) && !l.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const stats = {
    total: leads.length,
    nuevo: leads.filter((l) => l.estado === 'nuevo').length,
    contactado: leads.filter((l) => l.estado === 'contactado').length,
    en_seguimiento: leads.filter((l) => l.estado === 'en_seguimiento').length,
    caliente: leads.filter((l) => l.estado === 'caliente').length,
    inscrito: leads.filter((l) => l.estado === 'inscrito').length,
    perdido: leads.filter((l) => l.estado === 'perdido').length,
    avgScore: leads.length ? Math.round(leads.reduce((a, l) => a + l.score, 0) / leads.length) : 0,
  };

  if (loading) return <div className="dash-loading">Cargando leads...</div>;

  return (
    <div className="dash">
      {/* NAV */}
      <nav className="dash-nav">
        <div className="dash-nav-left">
          <img src="/logo-blanco.png" alt="Arte7" style={{ height: 120 }} />
          <span className="dash-nav-title">// LEADS DASHBOARD</span>
        </div>
        <div className="dash-nav-right">
          <span className="dash-user">{userEmail}</span>
          <button className="dash-logout" onClick={handleLogout}>Salir</button>
        </div>
      </nav>

      {/* STATS */}
      <div className="dash-stats">
        <div className="dstat dstat-total">
          <span className="dstat-n">{stats.total}</span>
          <span className="dstat-l">Total</span>
        </div>
        {ESTADOS.map((e) => (
          <div
            key={e}
            className={`dstat ${filter === e ? 'dstat-active' : ''}`}
            onClick={() => setFilter(filter === e ? 'todos' : e)}
            style={{ cursor: 'pointer', borderColor: ESTADO_COLORS[e] }}
          >
            <span className="dstat-n" style={{ color: ESTADO_COLORS[e] }}>{stats[e]}</span>
            <span className="dstat-l">{ESTADO_LABELS[e]}</span>
          </div>
        ))}
        <div className="dstat">
          <span className="dstat-n" style={{ color: scoreColor(stats.avgScore) }}>{stats.avgScore}</span>
          <span className="dstat-l">Score prom.</span>
        </div>
      </div>

      {/* FILTERS */}
      <div className="dash-filters">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          className="dash-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="dash-select"
          value={interesFilter}
          onChange={(e) => setInteresFilter(e.target.value)}
        >
          <option value="">Todos los intereses</option>
          {INTERES_OPTIONS.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
        {filter !== 'todos' && (
          <button className="dash-clear" onClick={() => setFilter('todos')}>
            Limpiar filtro: {ESTADO_LABELS[filter]} ✕
          </button>
        )}
        <button
          className="dash-export"
          onClick={() => exportToCSV(filtered, filter !== 'todos' ? filter : undefined)}
          title={`Exportar ${filtered.length} leads a CSV`}
        >
          ↓ Exportar CSV ({filtered.length})
        </button>
      </div>

      {/* SELECT ALL + BULK ACTIONS BAR */}
      <div className="dash-bulk-bar">
        <label className="dash-select-all" onClick={selectAll} style={{ cursor: 'pointer' }}>
          <span className={`dash-checkbox ${selected.size === filtered.length && filtered.length > 0 ? 'checked' : ''}`}>
            {selected.size === filtered.length && filtered.length > 0 ? '✓' : ''}
          </span>
          {selected.size > 0 ? `${selected.size} seleccionado${selected.size > 1 ? 's' : ''}` : 'Seleccionar todos'}
        </label>

        {selected.size > 0 && (
          <div className="dash-bulk-actions">
            <button className="dash-bulk-btn dash-bulk-wa" onClick={() => { setBulkType('whatsapp'); setShowBulk(true); }}>
              WhatsApp masivo ({selected.size})
            </button>
            <button className="dash-bulk-btn dash-bulk-email" onClick={() => { setBulkType('email'); setShowBulk(true); }}>
              Email masivo ({selected.size})
            </button>
            <button
              className="dash-bulk-btn dash-bulk-csv"
              onClick={() => exportToCSV(getSelectedLeads(), 'seleccion')}
            >
              ↓ CSV seleccionados ({selected.size})
            </button>
          </div>
        )}
      </div>

      {/* BULK MODAL */}
      {showBulk && (
        <div className="dash-modal-overlay" onClick={() => setShowBulk(false)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3>{bulkType === 'whatsapp' ? 'WhatsApp Masivo' : 'Email Masivo'}</h3>
              <button className="dash-modal-close" onClick={() => setShowBulk(false)}>✕</button>
            </div>
            <p className="dash-modal-count">
              {selected.size} lead{selected.size > 1 ? 's' : ''} seleccionado{selected.size > 1 ? 's' : ''}
              {bulkType === 'whatsapp' && ` (${getSelectedLeads().filter(l => l.telefono).length} con teléfono)`}
            </p>
            <div className="dash-modal-templates">
              <label className="dash-modal-label">Seleccionar template:</label>
              {bulkType === 'whatsapp'
                ? WA_TEMPLATES.map((t, i) => (
                    <div
                      key={i}
                      className={`dash-template ${bulkTemplate === i ? 'active' : ''}`}
                      onClick={() => setBulkTemplate(i)}
                    >
                      <strong>{t.label}</strong>
                      <p>{t.msg({ nombre: 'Juan', interes: 'Carrera CDMX' } as Lead)}</p>
                    </div>
                  ))
                : EMAIL_TEMPLATES.map((t, i) => (
                    <div
                      key={i}
                      className={`dash-template ${bulkTemplate === i ? 'active' : ''}`}
                      onClick={() => setBulkTemplate(i)}
                    >
                      <strong>{t.label}</strong>
                      <p>Asunto: {t.subject({ interes: 'Carrera CDMX' } as Lead)}</p>
                      <p style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: 4 }}>{t.body({ nombre: 'Juan', interes: 'Carrera CDMX' } as Lead).substring(0, 100)}...</p>
                    </div>
                  ))
              }
            </div>
            <div className="dash-modal-footer">
              <button
                className="dash-modal-send"
                onClick={() => {
                  if (bulkType === 'whatsapp') handleBulkWhatsApp();
                  else handleBulkEmail();
                  setShowBulk(false);
                }}
              >
                {bulkType === 'whatsapp' ? `Abrir ${getSelectedLeads().filter(l => l.telefono).length} WhatsApps` : `Enviar a ${selected.size} emails`}
              </button>
              <button className="dash-modal-cancel" onClick={() => setShowBulk(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS COUNT */}
      <p className="dash-count">
        {filtered.length} lead{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        {totalPages > 1 && ` — página ${page} de ${totalPages}`}
      </p>

      {/* LEADS GRID */}
      <div className="dash-grid">
        {paginated.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onUpdate={updateLead}
            onDelete={deleteLead}
            selected={selected.has(lead.id)}
            onToggleSelect={toggleSelect}
          />
        ))}
        {filtered.length === 0 && (
          <div className="dash-empty">No hay leads con estos filtros.</div>
        )}
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="dash-pagination">
          <button
            className="dash-page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`dash-page-btn ${p === page ? 'dash-page-active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="dash-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}

/* ──────────────── LEAD CARD ──────────────── */
function LeadCard({ lead, onUpdate, onDelete, selected, onToggleSelect }: {
  lead: Lead;
  onUpdate: (id: number, u: Partial<Lead>) => void;
  onDelete: (id: number) => void;
  selected: boolean;
  onToggleSelect: (id: number) => void;
}) {
  const [editingNota, setEditingNota] = useState(false);
  const [nota, setNota] = useState(lead.notas || '');

  function saveNota() {
    onUpdate(lead.id, { notas: nota });
    setEditingNota(false);
  }

  const waLink = lead.telefono
    ? `https://wa.me/${lead.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${lead.nombre}, soy Cary de Arte7 Escuela de Cine. Vi que te interesa ${lead.interes}. ¿Te gustaría agendar una entrevista?`)}`
    : null;

  return (
    <div className={`lcard ${selected ? 'lcard-selected' : ''}`}>
      <div className="lcard-select" onClick={() => onToggleSelect(lead.id)}>
        <span className={`dash-checkbox ${selected ? 'checked' : ''}`}>
          {selected ? '✓' : ''}
        </span>
      </div>
      <div className="lcard-header">
        <div>
          <h3 className="lcard-name">{lead.nombre}</h3>
          <p className="lcard-email">{lead.email}</p>
          {lead.telefono && <p className="lcard-tel">{lead.telefono}</p>}
        </div>
        <div className="lcard-score" style={{ background: scoreColor(lead.score) }}>
          {lead.score}
        </div>
      </div>

      <div className="lcard-meta">
        <span className="lcard-interes">{lead.interes}</span>
        <span className="lcard-time">{timeAgo(lead.created_at)}</span>
        {lead.utm_source && <span className="lcard-utm">via {lead.utm_source}</span>}
      </div>

      <div className="lcard-estado">
        <select
          value={lead.estado}
          onChange={(e) => onUpdate(lead.id, { estado: e.target.value as LeadEstado })}
          style={{ borderColor: ESTADO_COLORS[lead.estado] }}
        >
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{ESTADO_LABELS[e]}</option>
          ))}
        </select>
      </div>

      <div className="lcard-notas">
        {editingNota ? (
          <div className="lcard-nota-edit">
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Agregar nota..."
              rows={2}
            />
            <div className="lcard-nota-btns">
              <button onClick={saveNota}>Guardar</button>
              <button onClick={() => { setEditingNota(false); setNota(lead.notas || ''); }}>Cancelar</button>
            </div>
          </div>
        ) : (
          <div className="lcard-nota-display" onClick={() => setEditingNota(true)}>
            {lead.notas || <span className="lcard-nota-placeholder">+ Agregar nota...</span>}
          </div>
        )}
      </div>

      <div className="lcard-actions">
        {waLink && (
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="lcard-wa">
            WhatsApp →
          </a>
        )}
        <a href={`mailto:${lead.email}`} className="lcard-mail">
          Email →
        </a>
        <button className="lcard-delete" onClick={() => onDelete(lead.id)} title="Eliminar lead">
          ✕
        </button>
      </div>
    </div>
  );
}
