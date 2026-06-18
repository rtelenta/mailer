import 'server-only';
import mjml2html from 'mjml';
import Handlebars from 'handlebars';

export async function compileMjml(
  source: string
): Promise<{ html: string } | { error: string }> {
  try {
    // mjml v5 is async; @types/mjml is stale and omits the Promise wrapper
    const result = await (mjml2html as unknown as (s: string, opts: object) => Promise<{ html: string; errors: Array<{ formattedMessage: string }> }>)(source, { validationLevel: 'soft' });
    if (result.errors.length > 0) {
      return { error: result.errors.map((e) => e.formattedMessage).join('; ') };
    }
    return { html: result.html };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export function renderHandlebars(
  html: string,
  content: Record<string, unknown>
): string {
  const template = Handlebars.compile(html, { noEscape: true });
  return template(content);
}
