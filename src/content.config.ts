import { defineCollection, z, reference } from 'astro:content';
import { glob } from 'astro/loaders';

const actes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/actes' }),
  schema: z.object({
    titol: z.string(),
    data: z.coerce.date(),
    cercle: z.enum(['coordinacio', 'comunicacio', 'gent-gran', 'aigua']).default('coordinacio'),
    estat: z.enum(['esborrany', 'aprovada']).default('aprovada'),
    assistents: z.array(z.string()).optional(),
    pdf: z.string().optional(),
  }),
});

const noticies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/noticies' }),
  schema: z.object({
    titol: z.string(),
    data: z.coerce.date(),
    entradeta: z.string(),
    imatge: z.string().optional(),
    imatgeAlt: z.string().optional(),
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
    dataInici: z.coerce.date().optional(),
    // Tancar un cercle = posar-hi data de fi. MAI esborrar el fitxer:
    // la pàgina i les seves actes queden a l'arxiu.
    dataFi: z.coerce.date().optional(),
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
    hora: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    horaFi: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    tipus: z.enum(['reunio', 'activitat']).default('reunio'),
    // Identificador d'un fitxer de src/content/cercles/. Si no hi és o no
    // coincideix, l'esdeveniment surt sense etiqueta de cercle.
    cercle: z.string().optional(),
    lloc: z.string().optional(),
    oberta: z.boolean().default(true),
    cancellada: z.boolean().default(false),
    nota: z.string().optional(),
    ordreDia: z.string().optional(),
    acta: reference('actes').optional(),
  }),
});

export const collections = { actes, noticies, cercles, agenda };
