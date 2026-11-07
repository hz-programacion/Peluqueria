import { formatPriceARS, timeToMinutes, minutesToTime } from './bookingEngine';

export interface ExportableTicketData {
  id: string;
  clientName: string;
  whatsapp: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  services: string[];
  totalMinutes: number;
  totalPrice?: number;
  paymentOption: 'deposit' | 'commitment';
  studioTitle: string;
  address: string;
  neighborhood: string;
  transferAlias: string;
}

function toICSDateTime(dateISO: string, timeHHMM: string): string {
  const cleanDate = dateISO.replace(/-/g, '');
  const [hh, mm] = timeHHMM.split(':');
  return `${cleanDate}T${(hh || '11').padStart(2, '0')}${(mm || '00').padStart(2, '0')}00`;
}

/**
 * Generates a direct Google Calendar template link for the confirmed appointment.
 */
export function generateGoogleCalendarUrl(ticket: ExportableTicketData): string {
  const startMin = timeToMinutes(ticket.time);
  const endMin = startMin + (ticket.totalMinutes || 40);
  const endTimeStr = minutesToTime(endMin);

  const startICS = toICSDateTime(ticket.date, ticket.time);
  const endICS = toICSDateTime(ticket.date, endTimeStr);

  const title = `Turno Barbería 1 a 1 · ${ticket.studioTitle} (${ticket.services.join(' + ')})`;
  const location = `${ticket.address}, ${ticket.neighborhood}`;
  const details =
    `Ticket #${ticket.id} — Cliente: ${ticket.clientName}\n` +
    `Servicios: ${ticket.services.join(', ')}\n` +
    `Dirección: ${ticket.address}, ${ticket.neighborhood}\n` +
    `Modalidad: ${ticket.paymentOption === 'deposit' ? `Seña a alias ${ticket.transferAlias}` : 'Compromiso de asistencia en estudio'}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startICS}/${endICS}`,
    details,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates RFC-5545 .ics file content for Apple Calendar, Google Calendar, and Outlook.
 */
export function generateICSContent(ticket: ExportableTicketData): string {
  const startMin = timeToMinutes(ticket.time);
  const endMin = startMin + (ticket.totalMinutes || 40);
  const endTimeStr = minutesToTime(endMin);

  const dtStart = toICSDateTime(ticket.date, ticket.time);
  const dtEnd = toICSDateTime(ticket.date, endTimeStr);
  const summary = `Turno en ${ticket.studioTitle} · ${ticket.services.join(' + ')}`;
  const location = `${ticket.address}, ${ticket.neighborhood}`;
  const description = `Ticket: #${ticket.id}\\nCliente: ${ticket.clientName}\\nServicios: ${ticket.services.join(', ')}\\nDirección: ${location}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rodrigo Cutsss//Atelier Urbano//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${ticket.id}@rodrigocutsss.ar`,
    `DTSTAMP:${dtStart}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Downloads a .ics calendar file in the browser.
 */
export function downloadAppointmentICS(ticket: ExportableTicketData): void {
  const icsContent = generateICSContent(ticket);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `turno-rodrigo-cutsss-${ticket.id.toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Renders an authentic high-resolution Thermal Barber Receipt onto an HTML5 Canvas
 * and downloads it as a crisp PNG image (`ticket-rodrigo-cutsss-<id>.png`).
 */
export function downloadThermalTicketPNG(ticket: ExportableTicketData): void {
  const canvas = document.createElement('canvas');
  const width = 760;
  const height = 1020;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background paper
  ctx.fillStyle = '#FAF8F5';
  ctx.fillRect(0, 0, width, height);

  // Top urban caution bar
  ctx.fillStyle = '#090A0F';
  ctx.fillRect(0, 0, width, 24);
  ctx.fillStyle = '#F59E0B';
  for (let x = 0; x < width; x += 40) {
    ctx.fillRect(x, 0, 20, 24);
  }

  // Border frame
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 4;
  ctx.strokeRect(28, 48, width - 56, height - 76);

  // Header badge
  ctx.fillStyle = '#18181B';
  ctx.fillRect(210, 78, width - 420, 38);
  ctx.fillStyle = '#F59E0B';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('TURNO CONFIRMADO · ATENCIÓN 1 A 1', width / 2, 103);

  // Studio Title & Address
  ctx.fillStyle = '#090A0F';
  ctx.font = '900 38px "Outfit", sans-serif';
  ctx.fillText(ticket.studioTitle.toUpperCase(), width / 2, 165);

  ctx.fillStyle = '#3F3F46';
  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.fillText(`${ticket.address.toUpperCase()} · ${ticket.neighborhood.toUpperCase()}`, width / 2, 198);

  // Barcode simulation
  const barcodeY = 225;
  ctx.fillStyle = '#090A0F';
  for (let i = 0; i < 44; i++) {
    const barW = i % 3 === 0 ? 5 : i % 2 === 0 ? 3 : 2;
    ctx.fillRect(190 + i * 8.6, barcodeY, barW, 48);
  }

  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.fillText(`* ${ticket.id} *`, width / 2, 298);

  // Dashed divider
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = '#71717A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 324);
  ctx.lineTo(width - 60, 324);
  ctx.stroke();
  ctx.setLineDash([]);

  // Details rows
  const drawRow = (label: string, value: string, y: number, highlight = false) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#52525B';
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillText(label, 68, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = highlight ? '#D97706' : '#090A0F';
    ctx.font = 'bold 21px "JetBrains Mono", monospace';
    ctx.fillText(value, width - 68, y);
  };

  drawRow('FECHA DEL TURNO:', ticket.date, 378);
  drawRow('HORARIO EXACTO:', `${ticket.time} HS`, 426, true);
  drawRow('CLIENTE:', ticket.clientName.toUpperCase(), 474);
  drawRow('WHATSAPP:', ticket.whatsapp, 522);
  drawRow('DURACIÓN SESIÓN:', `${ticket.totalMinutes || 40} MIN`, 570);

  // Dashed divider
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(60, 606);
  ctx.lineTo(width - 60, 606);
  ctx.stroke();
  ctx.setLineDash([]);

  // Services list
  ctx.textAlign = 'left';
  ctx.fillStyle = '#52525B';
  ctx.font = 'bold 17px "JetBrains Mono", monospace';
  ctx.fillText('SERVICIOS RESERVADOS:', 68, 648);

  ctx.fillStyle = '#090A0F';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ticket.services.slice(0, 3).forEach((srv, idx) => {
    ctx.fillText(`• ${srv}`, 68, 686 + idx * 34);
  });

  // Total box
  ctx.fillStyle = '#090A0F';
  ctx.fillRect(60, 795, width - 120, 76);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#F59E0B';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.fillText('VALOR ESTIMADO:', 88, 841);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 28px "JetBrains Mono", monospace';
  ctx.fillText(
    typeof ticket.totalPrice === 'number' ? `${formatPriceARS(ticket.totalPrice)} ARS` : '$12.000 ARS',
    width - 88,
    842
  );

  // Footer instructions
  ctx.textAlign = 'center';
  ctx.fillStyle = '#27272A';
  ctx.font = 'bold 15px "JetBrains Mono", monospace';
  ctx.fillText(
    `MODALIDAD: ${ticket.paymentOption === 'deposit' ? `SEÑA · ALIAS ${ticket.transferAlias}` : 'COMPROMISO DE ASISTENCIA EN ESTUDIO'}`,
    width / 2,
    915
  );
  ctx.fillStyle = '#52525B';
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillText('Tolerancia máxima de cortesía: 10 minutos · Presentar este ticket al llegar', width / 2, 948);

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `ticket-rodrigo-cutsss-${ticket.id.toLowerCase()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
