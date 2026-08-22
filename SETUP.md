# Posada en marxa

Guia per passar dels fitxers a un web en línia. Una hora llarga la primera vegada.

Ordre recomanat: **GitHub → Cloudflare Pages → seguretat → CMS → domini**. Cada pas
depèn de l'anterior.

---

## Pas 1 · Crear l'organització a GitHub

No cal cap coneixement tècnic per a aquest pas, però sí decidir bé el nom.

1. Crear un compte a [github.com](https://github.com) si encara no se'n té.
2. Anar a **Settings → Organizations → New organization** i triar el pla **Free**.
3. Nom suggerit: `consell-de-poble-santa-pau`. Ha de ser únic a tot GitHub.
4. Correu de contacte de l'organització: millor `conselldepoble@santapau.cat` que no pas
   un correu personal.

**Per què una organització i no un compte personal:** el repositori passa a ser de
l'entitat, no d'una persona. Si demà canvies de poble, de feina o d'humor, el web del
Consell no se'n va amb tu.

## Pas 2 · Crear el repositori i pujar-hi el codi

Al panell de l'organització: **New repository**.

- Nom: `web`
- Visibilitat: **Public**. El contingut ja és públic per definició (actes, reglaments),
  i un repositori públic permet que qualsevol vegi l'historial de canvis. Això és
  transparència, no un risc.
- **No** marcar cap de les caselles d'inicialització (README, .gitignore, llicència):
  el projecte ja les porta.

**Abans de res**, si és el primer cop que fas servir Git en aquest ordinador, cal dir-li
qui ets. Sense això el `commit` falla:

```bash
git config --global user.name "El teu nom"
git config --global user.email "correu@exemple.cat"
```

> **Compte amb quin correu hi poses.** En un repositori públic, l'adreça de cada commit
> queda visible per sempre. Per no exposar la teva, GitHub en dona una d'anònima: la
> trobaràs a `Settings → Emails → Keep my email addresses private`, i té la forma
> `12345678+usuari@users.noreply.github.com`. Fes servir aquesta.

Després, des de la carpeta del projecte al teu ordinador:

```bash
git init
git add .
git commit -m "Primera versió del web del Consell de Poble"
git branch -M main
git remote add origin https://github.com/ORGANITZACIO/web.git
git push -u origin main
```

Substituint `ORGANITZACIO` pel nom real.

> Els avisos de tipus *"LF will be replaced by CRLF"* són normals a Windows i no
> trenquen res. El fitxer `.gitattributes` que porta el projecte els fa desaparèixer
> a partir del primer commit.

> Si `git` demana usuari i contrasenya, GitHub ja no accepta contrasenyes: cal un
> *personal access token*. La manera més còmoda d'evitar-ho és instal·lar
> [GitHub CLI](https://cli.github.com) i fer `gh auth login` una vegada.

### On tenir la carpeta del projecte

**No la posis dins d'una carpeta sincronitzada** amb Nextcloud, Dropbox o OneDrive.
Git i els sincronitzadors de fitxers es porten malament: el sincronitzador copia i
bloqueja fitxers de dins de `.git` mentre Git hi escriu, i això acaba en conflictes o
en un repositori corromput. A més, `node_modules` són desenes de milers de fitxers
petits que el faran anar de bòlit.

Un lloc net com `C:\dev\web-consell-de-poble` va bé. La còpia de seguretat ja la fa
GitHub: aquesta és precisament la gràcia.

## Pas 3 · Connectar Cloudflare Pages

1. Crear compte a [dash.cloudflare.com](https://dash.cloudflare.com).
2. **Compute (Workers & Pages) → Create → Pages → Connect to Git**.
3. Autoritzar GitHub i seleccionar el repositori `web`.
4. Configuració de compilació:

   | Camp | Valor |
   |---|---|
   | Framework preset | Astro |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | *(buit)* |

5. A **Environment variables**, afegir: `NODE_VERSION` = `22`
6. **Save and Deploy**.

Al cap d'un parell de minuts el web és a `https://NOM-DEL-PROJECTE.pages.dev`.

A partir d'aquí, **cada canvi que es pugi a GitHub es publica sol**. No cal tornar a
tocar Cloudflare.

## Pas 4 · Seguretat (no saltar-se aquest pas)

És el pas que menys ganes fa i el que més falta fa. Vint minuts.

1. **Verificació en dos passos** a GitHub i a Cloudflare.
2. **Desar els codis de recuperació** dels dos serveis. Impresos, en un sobre tancat,
   en mans d'una segona persona del Cercle de Coordinació. No en un ordinador.
3. **Afegir un segon *owner*** a l'organització de GitHub, encara que no editi mai.
   `Settings → People → Invite member → Role: Owner`.
4. Escriure un full A4 amb: quins comptes existeixen, a nom de qui, i com es recuperen.
   Guardar-lo amb la documentació del Consell.

Sense això, una malaltia o una discrepància deixen el Consell sense web i sense arxiu.

## Pas 5 · Activar el CMS

Editar `public/admin/config.yml` i posar-hi el repositori real:

```yaml
backend:
  name: github
  repo: consell-de-poble-santa-pau/web
  branch: main
```

Pujar el canvi. El CMS ja és a `https://EL-TEU-WEB/admin/`.

**Amb un sol editor** (ara mateix): s'hi entra amb un *personal access token* de GitHub.
Es genera a `Settings → Developer settings → Personal access tokens`, amb permís sobre el
repositori, i s'enganxa a la pantalla d'entrada del CMS. No cal muntar res més.

**Quan hi hagi més editors**: cal un client OAuth perquè cadascú entri amb el seu compte
sense manejar tokens. Es desplega el
[Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth) com a Cloudflare
Worker (gratuït), es registra una OAuth App a GitHub, i s'afegeix la línia `base_url` al
`config.yml`. Mitja hora de feina, però no cal fer-la ara.

## Pas 6 · El domini

Quan el `.cat` estigui registrat:

1. A Cloudflare Pages: **Custom domains → Set up a domain**.
2. Canviar la línia `site:` d'`astro.config.mjs` pel domini definitiu i pujar el canvi.
3. Comprovar que el `rss.xml` i el sitemap apunten al domini nou.

Fins llavors, **no difondre l'adreça `.pages.dev`**, per no haver de reeducar ningú.

---

## Abans de fer públic el web

- [ ] Esborrar `src/content/cercles/exemple-operatiu.md`
- [ ] Esborrar l'acta i la notícia d'exemple de `src/content/`
- [ ] Repositori posat al `config.yml` del CMS
- [ ] Contingut real de les tres pàgines de cercle
- [ ] Revisió d'accessibilitat i actualització de la declaració
- [ ] Comprovar que tots els enllaços del menú i el peu funcionen
- [ ] Segon *owner* a GitHub i codis de recuperació desats
- [ ] El Cercle de Coordinació ha designat aquest web com a plataforma de publicació
      d'actes (article 43 del reglament), en acta

## Manteniment

| Cada quan | Què |
|---|---|
| Cada reunió | Publicar l'ordre del dia 3 dies abans i l'acta dins del mes següent |
| Trimestral | Revisar cercles inactius, enllaços trencats i contingut caducat |
| Anual | Actualitzar dependències (`npm outdated`), revisar comptes i claus |
