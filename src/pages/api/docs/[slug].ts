import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { marked } from 'marked';

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false,
});

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;
  
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const docs = await getCollection('docs');
  const doc = docs.find(d => d.slug === slug);

  if (!doc) {
    return new Response(JSON.stringify({ error: 'Document not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Convert markdown to HTML
  const content = await marked(doc.body);

  return new Response(
    JSON.stringify({
      slug: doc.slug,
      title: doc.data.title,
      content,
      category: doc.data.category,
      order: doc.data.order,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};

// Generate static paths for all docs
export async function getStaticPaths() {
  const docs = await getCollection('docs');
  return docs.map(doc => ({
    params: { slug: doc.slug },
  }));
}