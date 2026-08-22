import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const noticies = (await getCollection('noticies')).sort((a, b) => b.data.data - a.data.data);
  return rss({
    title: 'Consell de Poble de Santa Pau',
    description: "Notícies del Consell de Poble de Santa Pau, l'òrgan principal de participació del municipi.",
    site: context.site,
    customData: '<language>ca</language>',
    items: noticies.map(n => ({
      title: n.data.titol,
      description: n.data.entradeta,
      pubDate: n.data.data,
      link: `/noticies/${n.id}/`,
    })),
  });
}
