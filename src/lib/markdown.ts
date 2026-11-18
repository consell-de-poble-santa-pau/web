// Converteix a HTML els camps de text llarg del panell (els que no són el
// cos principal d'una pàgina), amb les mateixes regles que el cos.
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import rehypeContingut from './rehype-contingut.mjs';

let processador: Awaited<ReturnType<typeof createMarkdownProcessor>> | undefined;

export async function markdown(text?: string): Promise<string> {
  if (!text?.trim()) return '';
  processador ??= await createMarkdownProcessor({ rehypePlugins: [rehypeContingut] });
  return (await processador.render(text)).code;
}
