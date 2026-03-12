export function calculateLeadScore(data: {
  interes: string;
  telefono?: string;
  utm_source?: string;
  utm_campaign?: string;
}): number {
  let score = 0;

  // Interés
  switch (data.interes) {
    case 'Carrera CDMX':
      score += 30;
      break;
    case 'Carrera Querétaro':
      score += 25;
      break;
    case 'Cursos Online':
      score += 15;
      break;
    case 'Actuación':
      score += 10;
      break;
  }

  // Fuente Meta
  if (data.utm_source === 'facebook' || data.utm_source === 'instagram') {
    score += 20;
  }

  // Campaña nombrada
  if (data.utm_campaign) {
    score += 10;
  }

  // Teléfono proporcionado
  if (data.telefono && data.telefono.length >= 10) {
    score += 15;
  }

  return Math.min(score, 100);
}
