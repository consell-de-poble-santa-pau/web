import { defineCollection, z, reference } from 'astro:content';
import { glob } from 'astro/loaders';

// El panell desa els camps opcionals que es deixen en blanc com a text buit
// (''). Aquí es tracten com si no hi fossin; si no, un camp buit amb format
// (una hora, una data, una referència) atura tota la compilació del web.
const buit = <T extends z.ZodTypeAny>(esquema: T) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), esquema);

const actes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/actes' }),
  schema: z.object({
    titol: z.string(),
    data: z.coerce.date(),
    // Identificador d'un fitxer de src/content/cercles/ (el panell només
    // deixa triar cercles que existeixen).
    cercle: z.string().default('coordinacio'),
    estat: z.enum(['esborrany', 'aprovada']).default('aprovada'),
    assistents: z.array(z.string()).optional(),
    pdf: buit(z.string().optional()),
  }),
});

const noticies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/noticies' }),
  schema: z.object({
    titol: z.string(),
    data: z.coerce.date(),
    entradeta: z.string(),
    imatge: buit(z.string().optional()),
    imatgeAlt: buit(z.string().optional()),
    credit: z.string().default('Jacint Garrigolas Coll'),
  }),
});

const cercles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cercles' }),
  schema: z.object({
    nom: z.string(),
    // constant = hi és mentre calgui; efimer = neix per a una acció concreta
    tipus: z.enum(['coordinacio', 'estrategic', 'operatiu']).default('estrategic'),
    entradeta: z.string(),
    icona: z.string().default('/identitat/isotip-consell-de-poble.svg'),
    color: z.string().default('#30A860'),
    imatge: z.string().optional(),
    imatgeAlt: z.string().optional(),
    dataInici: buit(z.coerce.date().optional()),
    // Tancar un cercle = posar-hi data de fi. MAI esborrar el fitxer:
    // la pàgina i les seves actes queden a l'arxiu.
    dataFi: buit(z.coerce.date().optional()),
    motiuTancament: z.string().optional(),
    ordre: z.number().default(99),
  }),
});

// ── Agenda de reunions, trobades i activitats ──────────────────────────
//
// La data acaba sempre sent text (2026-09-08), no un objecte Date. És
// deliberat: així no depèn de la zona horària de la màquina que compila el
// web, que a Cloudflare és UTC. El YAML converteix les dates sense cometes
// en Date, i aquí es desfà la conversió.
const dataDelDia = z
  .union([z.string(), z.date()])
  .transform((v) => (typeof v === 'string' ? v.trim().slice(0, 10) : v.toISOString().slice(0, 10)))
  .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), 'La data ha de ser AAAA-MM-DD');

const agenda = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/agenda' }),
  schema: z.object({
    titol: z.string(),
    data: dataDelDia,
    hora: buit(z.string().regex(/^\d{2}:\d{2}$/).optional()),
    horaFi: buit(z.string().regex(/^\d{2}:\d{2}$/).optional()),
    tipus: z.enum(['reunio', 'activitat']).default('reunio'),
    // Identificador d'un fitxer de src/content/cercles/. Si no hi és o no
    // coincideix, l'esdeveniment surt sense etiqueta de cercle.
    cercle: buit(z.string().optional()),
    lloc: buit(z.string().optional()),
    oberta: z.boolean().default(true),
    cancellada: z.boolean().default(false),
    nota: buit(z.string().optional()),
    ordreDia: buit(z.string().optional()),
    acta: buit(reference('actes').optional()),
  }),
});

// ── Textos de les pàgines (al panell: «Pàgines») ───────────────────────
// Un fitxer per pàgina. Els camps comuns són els de la capçalera; la resta
// només els fa servir la pàgina que els necessita.
const pagines = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pagines' }),
  schema: z.object({
    titol: z.string(),
    sobre: z.string().optional(),
    entrada: z.string().optional(),
    descripcio: z.string().optional(),
    to: z.enum(['verd', 'blau', 'terra']).default('verd'),
    // Segon bloc de text, per a les pàgines que tenen un llistat al mig
    textFinal: z.string().optional(),
    // Portada
    boto1Text: z.string().optional(),
    boto1Enllac: z.string().optional(),
    boto2Text: z.string().optional(),
    boto2Enllac: z.string().optional(),
    cerclesSobre: z.string().optional(),
    cerclesTitol: z.string().optional(),
    cerclesIntro: z.string().optional(),
    idees: z.array(z.object({ titol: z.string(), text: z.string() })).optional(),
    noticiesSobre: z.string().optional(),
    noticiesTitol: z.string().optional(),
    // El Consell: Cercle de Coordinació
    coordinacioTitol: z.string().optional(),
    coordinacioNota: z.string().optional(),
    membres: z.array(z.string()).optional(),
    ajuntament: z.array(z.string()).optional(),
    coordinacioPeu: z.string().optional(),
    // Cercles
    notaEstrategics: z.string().optional(),
    notaOperatius: z.string().optional(),
    notaTancats: z.string().optional(),
    // Participa-hi
    canalsTitol: z.string().optional(),
    canalsNota: z.string().optional(),
  }),
});

// ── Documents (al panell: «Documents») ─────────────────────────────────
const documents = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/documents' }),
  schema: z.object({
    titol: z.string(),
    tipus: z.string().default('Altres'),
    fitxer: z.string(),
    quan: z.string().optional(),
    descripcio: z.string().optional(),
    ordre: z.number().default(99),
  }),
});

// ── Dades generals: contacte i xarxes (al panell: «Dades generals») ────
const general = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/general' }),
  schema: z.object({
    correu: z.string(),
    whatsapp: z.string().optional(),
    whatsappText: z.string().optional(),
    instagram: z.string().optional(),
    instagramUsuari: z.string().optional(),
    lema: z.string().optional(),
    creditFotos: z.string().optional(),
  }),
});

export const collections = { actes, noticies, cercles, agenda, pagines, documents, general };
