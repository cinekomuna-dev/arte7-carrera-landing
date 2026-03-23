export interface Lead {
  id: number;
  created_at: string;
  nombre: string;
  email: string;
  telefono: string | null;
  interes: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  score: number;
  estado: LeadEstado;
  notas: string | null;
}

export type LeadEstado = 'nuevo' | 'contactado' | 'en_seguimiento' | 'caliente' | 'inscrito' | 'perdido';

export const ESTADO_LABELS: Record<LeadEstado, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  en_seguimiento: 'En seguimiento',
  caliente: 'Caliente',
  inscrito: 'Inscrito',
  perdido: 'Perdido',
};

export const ESTADO_COLORS: Record<LeadEstado, string> = {
  nuevo: '#038B96',
  contactado: '#EE9628',
  en_seguimiento: '#EE9628',
  caliente: '#FF492F',
  inscrito: '#2ECC71',
  perdido: '#666',
};

export const INTERES_OPTIONS = ['Carrera CDMX', 'Carrera Querétaro', 'Diplomado CDMX', 'Diplomado QRO', 'Cursos Online', 'Actuación'] as const;
