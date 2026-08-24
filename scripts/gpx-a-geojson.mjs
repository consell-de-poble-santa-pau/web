#!/usr/bin/env node
// Converteix tots els .gpx de gpx/ en dos fitxers:
//   public/dades/punts.geojson  (els waypoints, amb la seva categoria)
//   public/dades/rutes.geojson  (els tracks, simplificats)
//
// Ús:  node scripts/gpx-a-geojson.mjs
//
// D'ON SURT LA CATEGORIA D'UN PUNT
// 1r  del <type> del waypoint, si n'hi ha i el coneixem
// 2n  del NOM DEL FITXER: SantaPau-Coves.gpx → tots els punts són "cova"
//
// El <sym> NO es fa servir: és el dibuix del GPS (valors com "Square, Red"
// o "Residence") i no diu res del que és el punt en realitat.
//
// Si un fitxer no es pot classificar pel nom i els punts no porten <type>,
// l'script s'atura. És volgut: val més que falli la compilació que no pas
// que 200 punts acabin silenciosament al calaix de sastre.

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { DOMParser } from '@xmldom/xmldom';
import { gpx } from '@tmcw/togeojson';
import { CATEGORIES, SINONIMS } from '../src/dades/categories.js';

const ENTRADA = 'gpx';
const SORTIDA = 'public/dades';
const TOLERANCIA = 0.00004; // ≈ 4 m de tolerància en aprimar els tracks

// Fitxers que hi són però NO s'han de processar (recopilatoris, còpies
// velles, proves). Es comparen en minúscules.
const IGNORA = [
  'santapau-tot.gpx',
];
// Fitxers dels quals només volem el traçat, no els waypoints.
// Els GPX de rutes solen portar aparcaments, lavabos i senyals de camí
// que no pertanyen a l'inventari del terme.
const NOMES_TRACKS = [
  'r1 - la fageda i els volcans (b).gpx',
];
// ---------------------------------------------------------------- utilitats

// "Volcà Croscat" → "volca croscat"
const normalitza = (t) =>
  String(t ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const resol = (t) => {
  const n = normalitza(t);
  return SINONIMS[n] ?? (CATEGORIES[n] ? n : null);
};

// SantaPau-Coves.gpx → "cova"   ·   fonts.gpx → "font"
const categoriaDelNom = (fitxer) => {
  const tros = basename(fitxer, extname(fitxer)).split(/[-_ ]+/).pop();
  return resol(tros);
};

const arrodoneix = (c) => [Number(c[0].toFixed(5)), Number(c[1].toFixed(5))];

// Douglas-Peucker: treu els vèrtexs que no canvien la forma de la línia.
function simplifica(punts, tol) {
  if (punts.length < 3) return punts;
  const dist2 = (p, a, b) => {
    let [x, y] = a;
    const dx = b[0] - x, dy = b[1] - y;
    if (dx || dy) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) [x, y] = b;
      else if (t > 0) { x += dx * t; y += dy * t; }
    }
    return (p[0] - x) ** 2 + (p[1] - y) ** 2;
  };
  const marca = (ini, fi, guarda) => {
    let max = tol * tol, idx = 0;
    for (let i = ini + 1; i < fi; i++) {
      const d = dist2(punts[i], punts[ini], punts[fi]);
      if (d > max) { idx = i; max = d; }
    }
    if (idx) { guarda[idx] = true; marca(ini, idx, guarda); marca(idx, fi, guarda); }
  };
  const guarda = { 0: true, [punts.length - 1]: true };
  marca(0, punts.length - 1, guarda);
  return punts.filter((_, i) => guarda[i]);
}

// ------------------------------------------------------------------ procés

const tots = readdirSync(ENTRADA).filter((f) => f.toLowerCase().endsWith('.gpx'));
const omesos = tots.filter((f) => IGNORA.includes(f.toLowerCase()));
const fitxers = tots.filter((f) => !IGNORA.includes(f.toLowerCase()));

if (!fitxers.length) {
  console.error(`Cap fitxer .gpx per processar dins de ${ENTRADA}/`);
  process.exit(1);
}

const punts = [];
const rutes = [];
const errors = [];
const avisos = [];
const compte = {};
const perFitxer = {};
const vistos = new Map();
let vertexOriginals = 0, vertexFinals = 0;

for (const fitxer of fitxers) {
  const categoriaFitxer = categoriaDelNom(fitxer);
  const nomesTracks = NOMES_TRACKS.includes(fitxer.toLowerCase());
  const xml = new DOMParser().parseFromString(readFileSync(join(ENTRADA, fitxer), 'utf8'), 'text/xml');
  const dades = gpx(xml);
  perFitxer[fitxer] = { categoria: categoriaFitxer, punts: 0, rutes: 0 };

  for (const f of dades.features) {
    const p = f.properties ?? {};
    const nom = p.name?.trim() || '(sense nom)';

      if (f.geometry?.type === 'Point' && !nomesTracks) {
      const categoria = resol(p.type) ?? categoriaFitxer;

      if (!categoria) {
        errors.push(fitxer);
        break; // un error per fitxer n'hi ha prou; no cal repetir-ho 400 cops
      }

      // Avís (no fatal) si un punt ja hi era exactament al mateix lloc
      const clau = `${nom}|${f.geometry.coordinates.map((n) => n.toFixed(4)).join()}`;
      if (vistos.has(clau)) avisos.push(`"${nom}" surt a ${vistos.get(clau)} i a ${fitxer}`);
      else vistos.set(clau, fitxer);

      compte[categoria] = (compte[categoria] ?? 0) + 1;
      perFitxer[fitxer].punts++;
      punts.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: arrodoneix(f.geometry.coordinates) },
        properties: {
          nom,
          categoria,
          ...(p.desc?.trim() ? { descripcio: p.desc.trim() } : {}),
        },
      });
    }

    if (f.geometry?.type === 'LineString' || f.geometry?.type === 'MultiLineString') {
      const linies = f.geometry.type === 'LineString'
        ? [f.geometry.coordinates] : f.geometry.coordinates;
      for (const linia of linies) {
        const plana = linia.map(arrodoneix); // fora altitud i marques de temps
        vertexOriginals += plana.length;
        const prima = simplifica(plana, TOLERANCIA);
        vertexFinals += prima.length;
        perFitxer[fitxer].rutes++;
        rutes.push({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: prima },
          properties: { nom },
        });
      }
    }
  }
}

if (errors.length) {
  console.error('\nNo sé de quina categoria són aquests fitxers:\n');
  for (const e of [...new Set(errors)]) console.error(`  · ${e}`);
  console.error(`
El nom del fitxer ha d'acabar amb una categoria coneguda, per exemple
SantaPau-Coves.gpx o SantaPau-Ponts.gpx. Categories disponibles:

  ${Object.keys(CATEGORIES).join(', ')}

Tens tres sortides: reanomenar el fitxer, afegir el nom que fas servir
a SINONIMS dins de src/dades/categories.js, o posar-lo a la llista
IGNORA de dalt de tot d'aquest script.
`);
  process.exit(1);
}

mkdirSync(SORTIDA, { recursive: true });
writeFileSync(join(SORTIDA, 'punts.geojson'), JSON.stringify({ type: 'FeatureCollection', features: punts }));
writeFileSync(join(SORTIDA, 'rutes.geojson'), JSON.stringify({ type: 'FeatureCollection', features: rutes }));

// ------------------------------------------------------------------ informe

console.log('');
for (const [fitxer, d] of Object.entries(perFitxer)) {
  const què = d.rutes ? `${d.punts} punts, ${d.rutes} rutes` : `${d.punts} punts`;
  console.log(`  ${fitxer.padEnd(30)} → ${String(d.categoria ?? 'segons <type>').padEnd(12)} ${què}`);
}
for (const o of omesos) console.log(`  ${o.padEnd(30)} → omès (és a la llista IGNORA)`);

console.log(`\n  TOTAL: ${punts.length} punts i ${rutes.length} rutes\n`);
for (const clau of Object.keys(CATEGORIES)) {
  console.log(`  ${String(compte[clau] ?? 0).padStart(5)}  ${CATEGORIES[clau].etiqueta}`);
}
if (vertexOriginals) {
  console.log(`\n  Tracks aprimats: ${vertexOriginals} → ${vertexFinals} vèrtexs ` +
              `(−${Math.round((1 - vertexFinals / vertexOriginals) * 100)}%)`);
}
if (avisos.length) {
  console.log(`\n  ${avisos.length} punts repetits (no és cap error, però mira-t'ho):`);
  for (const a of avisos.slice(0, 12)) console.log(`    · ${a}`);
  if (avisos.length > 12) console.log(`    · ...i ${avisos.length - 12} més`);
}
console.log('');
