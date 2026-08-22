import { defineCollection, z } from 'astro:content';
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
    dataInici: z.coerce.date().optional(),
    // Tancar un cercle = posar-hi data de fi. MAI esborrar el fitxer:
    // la pàgina i les seves actes queden a l'arxiu.
    dataFi: z.coerce.date().optional(),
    motiuTancament: z.string().optional(),
    ordre: z.number().default(99),
  }),
});

export const collections = { actes, noticies, cercles };
