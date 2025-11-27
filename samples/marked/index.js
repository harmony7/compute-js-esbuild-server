import { marked } from 'marked';
export default async function(req) {
    const text = await req.text();
    const parsed = marked.parse("# Heading\n\n\n\n" + text);
    return new Response(parsed, { headers: { 'content-type': 'text/html' } });
}
