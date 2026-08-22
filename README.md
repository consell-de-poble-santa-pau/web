# Web del Consell de Poble de Santa Pau

Lloc estàtic fet amb **Astro 5**, pensat per allotjar-se a **Cloudflare Pages**.

## Posar-lo en marxa

```bash
npm install
npm run dev      # servidor local a http://localhost:4321
npm run build    # genera dist/ i l'índex de cerca
```

Requereix **Node 22** (fixat a `.nvmrc` i a `package.json`).

## Com està organitzat

```
src/content/       ← TOT el contingut, en Markdown. És l'arxiu del Consell.
   actes/            una acta = un fitxer
   noticies/
   cercles/
src/content.config.ts  ← quins camps té cada tipus de contingut
src/layouts/Base.astro ← capçalera, navegació i peu
src/styles/tokens.css  ← paleta i tipografia. Tot el color surt d'aquí
src/pages/         ← les pàgines i com es generen
public/identitat/  ← logo, isotip, icones dels cercles, QR
public/admin/      ← Sveltia CMS (interfície d'edició)
```

**Principi:** el contingut no depèn d'Astro. Si algun dia es canvia de generador, els fitxers
de `src/content/` es poden endur tal com són.

## Publicació a Cloudflare Pages

- Ordre de compilació: `npm run build`
- Carpeta de sortida: `dist`
- Variable d'entorn: `NODE_VERSION = 22`

Mentre no hi hagi domini propi, el web viu a `*.pages.dev`. Quan n'hi hagi, només cal
canviar la línia `site:` d'`astro.config.mjs` i connectar el domini al panell de Cloudflare.

## El CMS

A `/admin/` hi ha Sveltia CMS. Abans no funcioni cal:

1. Crear el repositori i posar-ne el nom a `public/admin/config.yml` (camp `repo`).
2. Configurar l'autenticació de GitHub per al CMS.

Fins llavors, el contingut s'edita directament als fitxers Markdown.

## Fotografies

Totes són de **Jacint Garrigolas Coll**. Els originals no són al repositori; a
`public/imatges/` hi ha versions optimitzades en WebP a tres amplades (700, 1200 i 1800 px)
que el navegador tria segons la pantalla.

Per afegir-ne una de nova, generar les tres mides amb el mateix patró de nom
(`nom-700.webp`, `nom-1200.webp`, `nom-1800.webp`) i fer servir el component:

```astro
<Foto nom="nom-de-la-imatge" alt="Descripció del que s'hi veu." proporcio="16/9" />
```

- `alt` és **obligatori** i ha de descriure la imatge, no repetir el títol de la pàgina.
- `proporcio` retalla la imatge a la forma indicada. Si s'omet, es respecta la proporció
  original (recomanat per a les verticals, combinant-ho amb `ample="30rem"`).
- El crèdit de l'autor surt sol al peu de cada imatge.

Les fotografies del poble són majoritàriament nocturnes. Convé no encadenar-ne massa:
el logotip és lluminós i el conjunt ha de mantenir-ne el to.

## Crear i tancar cercles

Els cercles són contingut, no codi. Cada cercle és un fitxer a `src/content/cercles/`.

**Crear-ne un:** al CMS, "Cercles" → nou. Nom, tipus (estratègic o operatiu), una frase,
color i data de creació. Ja apareix a la portada i al llistat.

**Tancar-ne un:** posar-hi una **data de tancament** i el motiu. El cercle passa a la
secció "Cercles tancats" amb la pàgina i les actes intactes.

**Mai s'esborra un cercle.** El CMS té l'esborrat desactivat a propòsit (`delete: false`).
Esborrar el fitxer trencaria els enllaços existents i, sobretot, faria desaparèixer el
rastre del que aquell cercle va fer. Un Cercle Operatiu que es dissol no és feina que
s'esborra: és feina acabada.

## El mapa

El mapa viu a `/mapa/` i es construeix amb MapLibre sobre cartografia d'OpenStreetMap,
sense clau d'API ni cost.

**Els punts són dades, no codi:** `public/dades/punts.geojson`. Per afegir-ne un, es copia
un objecte de `features`, se li canvia el nom, la categoria i les coordenades. Van en ordre
`[longitud, latitud]` i es poden treure d'OpenStreetMap amb el botó dret sobre el lloc.

Categories previstes: `font`, `equipament`, `patrimoni`, `natura`, `cercle-aigua`.
Cada categoria té el seu color, definit a `src/components/Mapa.astro`.

Falta el **límit del terme municipal**. Es pot obtenir de l'ICGC o de la relació
d'OpenStreetMap del municipi i desar-lo com a `public/dades/terme.geojson`.

## Pendent

- [ ] Contingut real de les tres pàgines de cercle
- [ ] Esborrar `src/content/cercles/exemple-operatiu.md`
- [ ] Enquestes 2022 i 2023 a `/documents/`
- [ ] Fotografies reals i optimització d'imatges
- [ ] Cercador Pagefind integrat a la interfície
- [ ] Límit del terme municipal al mapa
- [ ] Revisió completa d'accessibilitat abans de publicar
- [ ] Tauler d'anuncis (fase 2)
