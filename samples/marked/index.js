import { marked } from 'https://unpkg.com/marked';
export default async function(req) {
    const text = await req.text();
    const parsed = marked.parse(text);
    return new Response(parsed, { headers: { 'content-type': 'text/html' } });
}
