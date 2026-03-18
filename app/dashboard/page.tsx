'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '../../lib/supabase-browser';
import { Lead, LeadEstado, ESTADO_LABELS, ESTADO_COLORS, INTERES_OPTIONS } from '../../lib/types';

const ESTADOS: LeadEstado[] = ['nuevo', 'contactado', 'en_seguimiento', 'caliente', 'inscrito', 'perdido'];
const PAGE_SIZE = 20;

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
function exportToCSV(leads: Lead[]) {
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
  a.download = `arte7-leads-${new Date().toISOString().split('T')[0]}.csv`;
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

  async function updateLead(id: number, updates: Partial<Lead>) {
    await supabase.from('leads').update(updates).eq('id', id);
    loadLeads();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
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
          onClick={() => exportToCSV(filtered)}
          title={`Exportar ${filtered.length} leads a CSV`}
        >
          ↓ Exportar CSV
        </button>
      </div>

      {/* RESULTS COUNT */}
      <p className="dash-count">
        {filtered.length} lead{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        {totalPages > 1 && ` — página ${page} de ${totalPages}`}
      </p>

      {/* LEADS GRID */}
      <div className="dash-grid">
        {paginated.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onUpdate={updateLead} />
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
function LeadCard({ lead, onUpdate }: { lead: Lead; onUpdate: (id: number, u: Partial<Lead>) => void }) {
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
    <div className="lcard">
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
      </div>
    </div>
  );
}
