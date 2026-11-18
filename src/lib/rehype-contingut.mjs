// Converteix el Markdown que s'escriu des del panell en blocs del web:
//
//  · Un enllaç de YouTube sol en un paràgraf  → vídeo que no carrega res de
//    YouTube fins que es prem el botó. El text de l'enllaç fa de títol, i el
//    que va darrere de « · » surt com a autoria:
//      [Eleccions sense candidatura 2026 · Resilience Earth](https://www.youtube.com/watch?v=…)
//    Dos o més vídeos seguits es posen l'un al costat de l'altre.
//  · Una imatge sola en un paràgraf → figura. El «títol» de la imatge, si n'hi
//    ha, surt a sota com a peu:  ![descripció](/imatges/x.webp "Fotografia: …")
//  · Les taules queden dins un requadre que es pot desplaçar al mòbil.
//
// No depèn de cap paquet: recorre l'arbre a mà.

const h = (tagName, properties = {}, children = []) => ({ type: 'element', tagName, properties, children });
const t = (value) => ({ type: 'text', value });
const esBuit = (n) => n.type === 'text' && !n.value.trim();
const textDe = (n) => (n.type === 'text' ? n.value : (n.children ?? []).map(textDe).join(''));

export function idYoutube(href) {
  try {
    const u = new URL(href);
    const host = u.hostname.replace(/^(www|m)\./, '');
    let id = null;
    if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (u.pathname === '/watch') id = u.searchParams.get('v');
      else id = (u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/) ?? [])[1] ?? null;
    }
    return id && /^[\w-]{6,20}$/.test(id) ? id : null;
  } catch { return null; }
}

function video(id, titol, font) {
  const enllac = `https://www.youtube.com/watch?v=${id}`;
  return h('figure', { className: ['video'] }, [
    h('div', { className: ['video__marc'], dataId: id, dataTitol: titol }, [
      h('button', { type: 'button', className: ['video__play'], ariaLabel: `Reprodueix el vídeo: ${titol}` }, [
        h('svg', { className: ['video__icona'], viewBox: '0 0 68 48', ariaHidden: 'true', focusable: 'false' }, [
          h('rect', { width: '68', height: '48', rx: '12', fill: 'currentColor' }),
          h('path', { d: 'M27 14 L47 24 L27 34 Z', fill: 'var(--blau-fosc, #21384A)' }),
        ]),
        h('span', { className: ['video__titol'] }, [t(titol)]),
        h('span', { className: ['video__avis'] }, [t('En prémer, el vídeo es carrega des de YouTube')]),
      ]),
    ]),
    h('figcaption', {}, [
      ...(font ? [t(`${font} · `)] : []),
      h('a', { href: enllac, target: '_blank', rel: ['noopener'] }, [t("Mira'l a YouTube")]),
    ]),
  ]);
}

function converteixParagraf(p) {
  const fills = p.children.filter((n) => !esBuit(n));
  if (fills.length !== 1 || fills[0].type !== 'element') return null;
  const n = fills[0];

  if (n.tagName === 'a') {
    const id = idYoutube(String(n.properties?.href ?? ''));
    if (!id) return null;
    let text = textDe(n).trim();
    if (!text || /^https?:\/\//.test(text)) text = 'Vídeo';
    const [titol, ...resta] = text.split(' · ');
    return video(id, titol.trim(), resta.join(' · ').trim());
  }

  if (n.tagName === 'img') {
    const peu = n.properties?.title;
    const img = h('img', { ...n.properties, title: undefined, loading: 'lazy', decoding: 'async' });
    return h('figure', { className: ['imatge'] }, peu ? [img, h('figcaption', {}, [t(String(peu))])] : [img]);
  }
  return null;
}

const esVideo = (n) => n.type === 'element' && n.tagName === 'figure' && (n.properties?.className ?? []).includes('video');

function recorre(pare) {
  if (!pare.children) return;
  pare.children = pare.children.map((n) => {
    if (n.type === 'element' && n.tagName === 'p') return converteixParagraf(n) ?? n;
    if (n.type === 'element' && n.tagName === 'table') return h('div', { className: ['taula'] }, [n]);
    return n;
  });

  // Vídeos seguits → un grup
  const nous = [];
  for (let i = 0; i < pare.children.length; i++) {
    const n = pare.children[i];
    if (!esVideo(n)) { nous.push(n); continue; }
    const grup = [n];
    let j = i + 1;
    while (j < pare.children.length) {
      const s = pare.children[j];
      if (esBuit(s)) { j++; continue; }
      if (esVideo(s)) { grup.push(s); j++; continue; }
      break;
    }
    if (grup.length > 1) { nous.push(h('div', { className: ['videos-parell'] }, grup)); i = j - 1; }
    else nous.push(n);
  }
  pare.children = nous;

  for (const n of pare.children) {
    if (n.type !== 'element' || ['figure', 'table', 'pre'].includes(n.tagName)) continue;
    const classes = n.properties?.className ?? [];
    if (classes.includes('taula') || classes.includes('videos-parell')) continue; // ja fets
    recorre(n);
  }
}

export default function rehypeContingut() {
  return (arbre) => recorre(arbre);
}
