import { v4 as uuidv4 } from 'uuid';

interface Env {
  DB: D1Database;
  R2: R2Bucket;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await context.request.formData();
    const file = formData.get('file') as File;
    const projectSlug = formData.get('projectSlug') as string;
    const caption = (formData.get('caption') as string) || '';

    if (!file || !projectSlug) {
      return new Response(JSON.stringify({ error: 'Missing file or projectSlug' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const imageId = uuidv4();
    const ext = file.name.split('.').pop() || 'jpg';
    const r2Key = `${projectSlug}/${imageId}.${ext}`;

    // Upload to R2
    const buffer = await file.arrayBuffer();
    await context.env.R2.put(r2Key, buffer, {
      customMetadata: {
        'original-name': file.name,
        'content-type': file.type,
      },
    });

    // Store metadata in D1
    const result = await context.env.DB.prepare(
      `INSERT INTO images (id, project_slug, filename, r2_key, caption)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(imageId, projectSlug, file.name, r2Key, caption).run();

    if (!result.success) {
      await context.env.R2.delete(r2Key);
      return new Response(JSON.stringify({ error: 'Failed to store image metadata' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        id: imageId,
        r2_key: r2Key,
        filename: file.name,
        url: `/cdn-cgi/image/width=1200,quality=85/https://${new URL(context.request.url).hostname}/${r2Key}`,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
