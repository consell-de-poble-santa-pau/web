// Llegeix el text d'una pàgina de src/content/pagines/ (el que s'edita des
// del panell, a «Pàgines») i el deixa a punt per mostrar-lo.
import { getEntry, render } from 'astro:content';

export async function pagina(id: string) {
  const entrada = await getEntry('pagines', id);
  if (!entrada) throw new Error(`Falta el fitxer src/content/pagines/${id}.md`);
  const { Content } = await render(entrada);
  return { d: entrada.data, Content, teText: !!entrada.body?.trim() };
}

export async function general() {
  const g = await getEntry('general', 'general');
  if (!g) throw new Error('Falta el fitxer src/content/general/general.md');
  return g.data;
}
