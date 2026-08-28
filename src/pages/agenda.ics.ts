import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const DURADA_PER_DEFECTE = 2; // hores, si no s'indica hora d'acabament
const ARREL_PER_DEFECTE = new URL('https://consell-de-poble-santa-pau.pages.dev/');

// Les hores del fitxer són hora local de Santa Pau. Cal declarar la zona
// perquè els calendaris de fora la interpretin bé i s'ajustin sols al canvi
// d'hora.
const VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/Madrid',
  'X-LIC-LOCATION:Europe/Madrid',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'TZNAME:CEST',
  'DTSTART:19700329T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'TZNAME:CET',
  'DTSTART:19701025T030000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
];

const escapa = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

// L'RFC 5545 limita les línies a 75 octets; les llargues es parteixen amb un
// espai al començament de la continuació.
function plega(linia: string): string {
  const codificador = new TextEncoder();
  if (codificador.encode(linia).length <= 75) return linia;
  const trossos: string[] = [];
  let actual = '';
  let mida = 0;
  for (const car of linia) {
    const n = codificador.encode(car).length;
    if (mida + n > (trossos.length === 0 ? 75 : 74)) {
      trossos.push(actual);
      actual = '';
      mida = 0;
    }
    actual += car;
    mida += n;
  }
  trossos.push(actual);
  return trossos.join('\r\n ');
}

const sumaHores = (hora: string, hores: number) => {
  const [h, m] = hora.split(':').map(Number);
  const total = h * 60 + m + hores * 60;
  if (total >= 24 * 60) return '235900'; // no passem de mitjanit
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(total / 60))}${p(total % 60)}00`;
};

const nomesDigits = (s: string) => s.replace(/-/g, '');

export const GET: APIRoute = async ({ site }) => {
  const arrel = site ?? ARREL_PER_DEFECTE;

  const esdeveniments = (await getCollection('agenda')).sort((a, b) =>
    `${a.data.data}${a.data.hora ?? ''}`.localeCompare(`${b.data.data}${b.data.hora ?? ''}`)
  );

  const ara = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const linies: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Consell de Poble de Santa Pau//Agenda//CA',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Consell de Poble de Santa Pau',
    'X-WR-TIMEZONE:Europe/Madrid',
    'X-WR-CALDESC:Reunions\\, trobades i activitats del Consell de Poble de Santa Pau.',
    ...VTIMEZONE,
  ];

  for (const e of esdeveniments) {
    const d = e.data;
    const dia = nomesDigits(d.data);

    linies.push('BEGIN:VEVENT');
    linies.push(`UID:${e.id}@${arrel.hostname}`);
    linies.push(`DTSTAMP:${ara}`);

    if (d.hora) {
      const fi = d.horaFi ? `${d.horaFi.replace(':', '')}00` : sumaHores(d.hora, DURADA_PER_DEFECTE);
      linies.push(`DTSTART;TZID=Europe/Madrid:${dia}T${d.hora.replace(':', '')}00`);
      linies.push(`DTEND;TZID=Europe/Madrid:${dia}T${fi}`);
    } else {
      const seguent = new Date(`${d.data}T00:00:00Z`);
      seguent.setUTCDate(seguent.getUTCDate() + 1);
      linies.push(`DTSTART;VALUE=DATE:${dia}`);
      linies.push(`DTEND;VALUE=DATE:${nomesDigits(seguent.toISOString().slice(0, 10))}`);
    }

    linies.push(`SUMMARY:${escapa(d.titol)}`);
    if (d.lloc) linies.push(`LOCATION:${escapa(d.lloc)}`);

    const descripcio = [
      d.oberta ? 'Trobada oberta a tothom.' : 'Trobada interna del cercle.',
      d.nota,
      e.body?.trim(),
    ]
      .filter(Boolean)
      .join('\n\n');
    if (descripcio) linies.push(`DESCRIPTION:${escapa(descripcio)}`);

    linies.push(`URL:${new URL(`/agenda/#esd-${e.id}`, arrel).href}`);
    linies.push(`STATUS:${d.cancellada ? 'CANCELLED' : 'CONFIRMED'}`);
    linies.push('END:VEVENT');
  }

  linies.push('END:VCALENDAR');

  return new Response(linies.map(plega).join('\r\n') + '\r\n', {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="agenda-consell-de-poble-santa-pau.ics"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
