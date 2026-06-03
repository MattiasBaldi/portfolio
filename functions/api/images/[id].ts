interface Env {
  DB: D1Database;
  R2: R2Bucket;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== 'DELETE') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const id = context.params.id as string;

    // Get image metadata
    const imageResult = await context.env.DB.prepare('SELECT * FROM images WHERE id = ?').bind(id).first();

    if (!imageResult) {
      return new Response(JSON.stringify({ error: 'Image not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const r2Key = (imageResult as { r2_key: string }).r2_key;

    // Delete from R2
    await context.env.R2.delete(r2Key);

    // Delete from D1
    await context.env.DB.prepare('DELETE FROM images WHERE id = ?').bind(id).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Delete image error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
