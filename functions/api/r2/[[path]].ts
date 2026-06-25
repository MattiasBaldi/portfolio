interface Env {
  R2: R2Bucket;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(context.request.url);
  const key = url.pathname.replace('/api/r2/', '');

  if (!key) {
    return new Response('Missing key', { status: 400 });
  }

  const object = await context.env.R2.get(key);

  if (!object) {
    return new Response('Not found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000');

  return new Response(object.body, { headers });
};
