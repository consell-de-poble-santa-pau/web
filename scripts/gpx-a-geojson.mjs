#!/usr/bin/env node
// Converteix tots els .gpx de gpx/ en dos fitxers:
//   public/dades/punts.geojson  (els waypoints, amb la seva categoria)
//   public/dades/rutes.geojson  (els tracks, simplificats)
//
// Ús:  node scripts/gpx-a-geojson.mjs
//
// Si troba una categoria que no és a categories.js, PETA i diu quina i on.
// És volgut: val més que falli la compilació que no pas que un punt
// desaparegui del mapa sense que ningú se n'adoni.

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DOMParser } from '@xmldom/xmldom';
import { gpx } from '@tmcw/togeojson';
import { CATEGORIES, SINONIMS } from '../src/dades/categories.js';

const ENTRADA = 'gpx';
const SORTIDA = 'public/dades';
const TOLERANCIA = 0.00004; // ≈ 4 m. Puja-ho si els tracks encara pesen massa.

// ---------------------------------------------------------------- utilitats

// "Volcà Croscat" → "volca croscat"
const normalitza = (t) =>
  String(t ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const arrodoneix = (c) => [Number(c[0].toFixed(5)), Number(c[1].toFixed(5))];

// Douglas-Peucker: treu els punts que no canvien la forma de la línia.
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
    if (idx) {
      guarda[idx] = true;
      marca(ini, idx, guarda);
      marca(idx, fi, guarda);
    }
  };
  const guarda = { 0: true, [punts.length - 1]: true };
  marca(0, punts.length - 1, guarda);
  return punts.filter((_, i) => guarda[i]);
}

// ------------------------------------------------------------------ procés

const fitxers = readdirSync(ENTRADA).filter((f) => f.toLowerCase().endsWith('.gpx'));
if (!fitxers.length) {
  console.error(`Cap fitxer .gpx dins de ${ENTRADA}/`);
  process.exit(1);
}

const punts = [];
const rutes = [];
const errors = [];
const compte = {};
let puntsOriginals = 0;
let puntsSimplificats = 0;

for (const fitxer of fitxers) {
  const xml = new DOMParser().parseFromString(readFileSync(join(ENTRADA, fitxer), 'utf8'), 'text/xml');
  const dades = gpx(xml);

  for (const f of dades.features) {
    const p = f.properties ?? {};
    const nom = p.name?.trim() || '(sense nom)';

    if (f.geometry?.type === 'Point') {
      // <type> mana; si no hi és, es prova amb <sym>; si tampoc, "varis".
      const cru = normalitza(p.type || p.sym || 'varis');
      const categoria = SINONIMS[cru] ?? (CATEGORIES[cru] ? cru : null);

      if (!categoria) {
        errors.push(`${fitxer} → "${nom}": categoria desconeguda «${p.type || p.sym}»`);
        continue;
      }

      compte[categoria] = (compte[categoria] ?? 0) + 1;
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
        ? [f.geometry.coordinates]
        : f.geometry.coordinates;

      for (const linia of linies) {
        const plana = linia.map(arrodoneix); // fora altitud i marques de temps
        puntsOriginals += plana.length;
        const prima = simplifica(plana, TOLERANCIA);
        puntsSimplificats += prima.length;
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
  console.error('\nCategories que no consten a src/dades/categories.js:\n');
  for (const e of errors) console.error('  · ' + e);
  console.error('\nO les escrius bé al GPX, o les afegeixes a categories.js.\n');
  process.exit(1);
}

mkdirSync(SORTIDA, { recursive: true });
writeFileSync(join(SORTIDA, 'punts.geojson'), JSON.stringify({ type: 'FeatureCollection', features: punts }));
writeFileSync(join(SORTIDA, 'rutes.geojson'), JSON.stringify({ type: 'FeatureCollection', features: rutes }));

console.log(`\n${punts.length} punts i ${rutes.length} rutes des de ${fitxers.length} fitxers GPX.\n`);
for (const clau of Object.keys(CATEGORIES)) {
  console.log(`  ${String(compte[clau] ?? 0).padStart(4)}  ${CATEGORIES[clau].etiqueta}`);
}
if (puntsOriginals) {
  const estalvi = Math.round((1 - puntsSimplificats / puntsOriginals) * 100);
  console.log(`\n  Tracks: ${puntsOriginals} → ${puntsSimplificats} vèrtexs (−${estalvi}%)\n`);
}
