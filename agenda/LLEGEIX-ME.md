# Agenda — Consell de Poble de Santa Pau

Esborra la carpeta `agenda\` anterior, descomprimeix aquesta al seu lloc
(`<repositori>\agenda\`), obre PowerShell a l'arrel del repositori i executa:

```powershell
powershell -ExecutionPolicy Bypass -File .\agenda\instal-la-agenda.ps1
npm run dev
```

Després obre `http://localhost:4321/agenda/`. La carpeta `agenda\` no cal
committejar-la; un cop instal·lat es pot esborrar.

## Què fa l'script

Escriu sis fitxers nous i **insereix** el que falta a tres que ja existeixen.
No en substitueix cap sencer. Si de l'intent anterior hi ha quedat un
`content.config.ts` que no és el teu, el recupera de la còpia `.bak`.

| Fitxer | Què hi passa |
|---|---|
| `src/components/EsdevenimentAgenda.astro` | nou |
| `src/pages/agenda/index.astro` | nou — la pàgina |
| `src/pages/agenda.ics.ts` | nou — el calendari subscribible |
| `src/content/agenda/*.md` | tres trobades d'exemple |
| `src/content.config.ts` | hi insereix la col·lecció `agenda` |
| `src/layouts/Base.astro` | hi afegeix `Agenda` al menú, abans de Reunions |
| `public/admin/config.yml` | hi afegeix la col·lecció Agenda, abans de Notícies |

Es pot tornar a executar: si ja hi és, no ho duplica. Fa una còpia `.bak` de
cada fitxer que toca, i mai no en sobreescriu una d'existent.

## Com s'hi afegeix una trobada

Des de `/admin/` → **Agenda** → *Trobada o activitat*. Camps: dia, hora,
lloc, cercle que la convoca, si és oberta o interna, i un cos de text per a
l'ordre del dia. Un cop publicada l'acta, el camp *Acta publicada* l'enllaça
des de l'agenda.

## Com funciona

- La pàgina té calendari mensual, filtre per cercle, la llista del que ve i
  l'històric plegat.
- El camp `cercle` és l'identificador d'un fitxer de `src/content/cercles/`.
  D'allà en surt el nom i el color de l'etiqueta. Si no coincideix amb cap,
  l'esdeveniment simplement surt sense etiqueta de cercle.
- Les dates es desen com a text (`2026-09-15`), no com a `Date`, perquè
  Cloudflare compila en UTC i una trobada de nit sortiria el dia equivocat.
- El repartiment entre "el que ve ara" i l'històric el refà el navegador amb
  la data real, així la pàgina no queda desfasada entre desplegaments.
- El calendari i els filtres necessiten JavaScript i per això arrenquen
  amagats. Sense JS es veuen les dues llistes senceres, amb tota la informació.
- L'adreça del `.ics` surt de `site:` d'`astro.config.mjs`. Quan hi hagi el
  domini `.cat`, es canvia allà i la pàgina i el fitxer s'hi adapten sols.
  Compte: qui ja estigui subscrit amb l'adreça `.pages.dev` deixarà de rebre
  actualitzacions, o sigui que val més tenir el domini abans de difondre
  l'enllaç.
- Si una trobada no té hora d'acabament, al calendari de la gent hi consten
  dues hores.

## Abans de publicar

Esborra els tres fitxers d'exemple de `src/content/agenda/`.
