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
  paymentOption: 'deposit' | 'commitment' | 'full' | 'studio';
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
  const endMin = startMin + (ticket.totalMinutes || 45);
  const endTimeStr = minutesToTime(endMin);

  const startICS = toICSDateTime(ticket.date, ticket.time);
  const endICS = toICSDateTime(ticket.date, endTimeStr);

  const title = `Turno Sastrería Capilar · ${ticket.studioTitle} (${ticket.services.join(' + ')})`;
  const location = `${ticket.address}, ${ticket.neighborhood}`;
  const details =
    `Boleto Oficial #${ticket.id} — Cliente: ${ticket.clientName}\n` +
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
  const endMin = startMin + (ticket.totalMinutes || 45);
  const endTimeStr = minutesToTime(endMin);

  const dtStart = toICSDateTime(ticket.date, ticket.time);
  const dtEnd = toICSDateTime(ticket.date, endTimeStr);
  const summary = `Turno en ${ticket.studioTitle} · ${ticket.services.join(' + ')}`;
  const location = `${ticket.address}, ${ticket.neighborhood}`;
  const description = `Boleto: #${ticket.id}\\nCliente: ${ticket.clientName}\\nServicios: ${ticket.services.join(', ')}\\nDirección: ${location}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rodrigo Cutsss//Sastreria Capilar//ES',
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
 * Renders a bespoke, high-resolution "Boleto Oficial de Sastrería Capilar · Rodrigo Cutsss"
 * onto an HTML5 Canvas with aged ivory cardstock (#FAF6EE), subtle River Plate carmine diagonal
 * sash (#9E2A2B), antique brass frame (#B89146), circular side perforations, and barcode.
 */
export function downloadThermalTicketPNG(ticket: ExportableTicketData): void {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 1120;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Outer Dark Ink Backdrop
  ctx.fillStyle = '#181512';
  ctx.fillRect(0, 0, width, height);

  // 2. Aged Ivory Cardstock Body
  const cardX = 36;
  const cardY = 36;
  const cardW = width - 72;
  const cardH = height - 72;

  ctx.fillStyle = '#FAF6EE';
  ctx.fillRect(cardX, cardY, cardW, cardH);

  // Subtle Diagonal River Plate Heritage Sash across top-right corner
  ctx.save();
  ctx.beginPath();
  ctx.rect(cardX, cardY, cardW, cardH);
  ctx.clip();

  ctx.fillStyle = 'rgba(158, 42, 43, 0.12)';
  ctx.beginPath();
  ctx.moveTo(width - 260, cardY);
  ctx.lineTo(width - 140, cardY);
  ctx.lineTo(cardX + cardW, 260);
  ctx.lineTo(cardX + cardW, 140);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#9E2A2B';
  ctx.beginPath();
  ctx.moveTo(width - 185, cardY);
  ctx.lineTo(width - 135, cardY);
  ctx.lineTo(cardX + cardW, 185);
  ctx.lineTo(cardX + cardW, 135);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 3. Double Hairline Editorial Frame (Charcoal + Antique Brass)
  ctx.strokeStyle = '#C8BBA4';
  ctx.lineWidth = 2;
  ctx.strokeRect(cardX + 16, cardY + 16, cardW - 32, cardH - 32);

  ctx.strokeStyle = '#9E2A2B';
  ctx.lineWidth = 3;
  ctx.strokeRect(cardX + 24, cardY + 24, cardW - 48, cardH - 48);

  // 4. Circular Ticket Stub Side Notch Cutouts
  const notchY = 740;
  ctx.fillStyle = '#181512';
  ctx.beginPath();
  ctx.arc(cardX, notchY, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cardX + cardW, notchY, 22, 0, Math.PI * 2);
  ctx.fill();

  // 5. Crest Shield Emblem at Top Center
  ctx.fillStyle = '#181512';
  ctx.beginPath();
  ctx.arc(width / 2, 118, 34, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#B89146';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(width / 2, 118, 30, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#FAF6EE';
  ctx.font = 'bold 22px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('RC', width / 2, 126);

  // 6. Kicker & Studio Header
  ctx.fillStyle = '#9E2A2B';
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.fillText('BOLETO OFICIAL DE RESERVA · ATENCIÓN 1 A 1', width / 2, 182);

  ctx.fillStyle = '#181512';
  ctx.font = 'bold 42px "Playfair Display", Georgia, serif';
  ctx.fillText(ticket.studioTitle.toUpperCase(), width / 2, 232);

  ctx.fillStyle = '#5C5346';
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.fillText(
    `${ticket.address.toUpperCase()} · ${ticket.neighborhood.toUpperCase()}`,
    width / 2,
    264
  );

  // Ticket Number Pill
  ctx.fillStyle = '#F3ECE0';
  ctx.strokeStyle = '#C8BBA4';
  ctx.lineWidth = 1.5;
  ctx.fillRect(width / 2 - 130, 284, 260, 38);
  ctx.strokeRect(width / 2 - 130, 284, 260, 38);

  ctx.fillStyle = '#9E2A2B';
  ctx.font = 'bold 17px "JetBrains Mono", monospace';
  ctx.fillText(`COMPROBANTE #${ticket.id}`, width / 2, 309);

  // 7. Divider Line
  ctx.strokeStyle = '#D5C9B4';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(92, 348);
  ctx.lineTo(width - 92, 348);
  ctx.stroke();

  // 8. Primary Date & Time Highlight Box
  ctx.fillStyle = '#F3ECE0';
  ctx.fillRect(92, 368, width - 184, 96);
  ctx.strokeStyle = '#C8BBA4';
  ctx.strokeRect(92, 368, width - 184, 96);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#6E6355';
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.fillText('FECHA RESERVADA', 118, 400);
  ctx.fillStyle = '#181512';
  ctx.font = 'bold 26px "JetBrains Mono", monospace';
  ctx.fillText(ticket.date, 118, 438);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#6E6355';
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.fillText('HORARIO EXACTO', width - 118, 400);
  ctx.fillStyle = '#9E2A2B';
  ctx.font = 'bold 28px "JetBrains Mono", monospace';
  ctx.fillText(`${ticket.time} HS`, width - 118, 438);

  // 9. Client & Session Metadata Rows
  const drawDetailRow = (label: string, value: string, y: number, isAccent = false) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6E6355';
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.fillText(label, 96, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = isAccent ? '#9E2A2B' : '#181512';
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillText(value, width - 96, y);
  };

  drawDetailRow('CLIENTE:', ticket.clientName.toUpperCase(), 510);
  drawDetailRow('WHATSAPP:', ticket.whatsapp, 550);
  drawDetailRow('BLOQUE EXCLUSIVO:', `${ticket.totalMinutes || 45} MINUTOS`, 590);

  // Services Breakdown
  ctx.textAlign = 'left';
  ctx.fillStyle = '#6E6355';
  ctx.font = 'bold 15px "JetBrains Mono", monospace';
  ctx.fillText('SERVICIOS SELECCIONADOS:', 96, 636);

  ctx.fillStyle = '#181512';
  ctx.font = 'bold 19px "Playfair Display", Georgia, serif';
  ticket.services.slice(0, 3).forEach((srv, idx) => {
    ctx.fillText(`• ${srv}`, 96, 668 + idx * 28);
  });

  // 10. Perforated Tear Line at notchY (740)
  ctx.setLineDash([10, 8]);
  ctx.strokeStyle = '#B8AA93';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cardX + 36, notchY);
  ctx.lineTo(cardX + cardW - 36, notchY);
  ctx.stroke();
  ctx.setLineDash([]);

  // 11. Total & Payment Modality Box
  ctx.fillStyle = '#181512';
  ctx.fillRect(92, 770, width - 184, 86);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#C8BBA4';
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.fillText('VALOR TOTAL DEL SERVICIO', 120, 804);
  ctx.fillStyle = '#E06D6E';
  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillText(
    ticket.paymentOption === 'deposit'
      ? `Modalidad: Seña 30% · Alias ${ticket.transferAlias}`
      : 'Modalidad: Abono en el estudio al finalizar',
    120,
    834
  );

  ctx.textAlign = 'right';
  ctx.fillStyle = '#FAF6EE';
  ctx.font = 'bold 30px "JetBrains Mono", monospace';
  ctx.fillText(
    typeof ticket.totalPrice === 'number'
      ? `${formatPriceARS(ticket.totalPrice)} ARS`
      : '$12.000 ARS',
    width - 120,
    825
  );

  // 12. Authentic Barcode & Verification Footer
  const barcodeY = 890;
  ctx.fillStyle = '#181512';
  for (let i = 0; i < 48; i++) {
    const barW = i % 4 === 0 ? 5 : i % 2 === 0 ? 3 : 1.5;
    ctx.fillRect(185 + i * 9, barcodeY, barW, 44);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#4F463B';
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.fillText(`* ${ticket.id} · RODRIGO CUTSSS VENADO TUERTO *`, width / 2, 956);

  ctx.fillStyle = '#6E6355';
  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillText(
    'Tolerancia de cortesía: 10 minutos · Presentar este boleto al llegar al estudio',
    width / 2,
    992
  );

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `boleto-rodrigo-cutsss-${ticket.id.toLowerCase()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
