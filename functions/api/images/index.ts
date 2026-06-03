interface Env {
  DB: D1Database;
}

interface Image {
  id: string;
  project_slug: string;
  filename: string;
  r2_key: string;
  caption: string;
  sort_order: number;
  uploaded_at: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const url = new URL(context.request.url);
    const projectSlug = url.searchParams.get('project');

    let query = context.env.DB.prepare('SELECT * FROM images ORDER BY sort_order, uploaded_at DESC');

    if (projectSlug) {
      query = context.env.DB.prepare(
        'SELECT * FROM images WHERE project_slug = ? ORDER BY sort_order, uploaded_at DESC'
      ).bind(projectSlug);
    }

    const result = await query.all<Image>();

    if (!result.success) {
      return new Response(JSON.stringify({ error: 'Database query failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        images: result.results || [],
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('List images error:', error);
    return new Response(JSON.stringify({ error: 'Failed to list images' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
