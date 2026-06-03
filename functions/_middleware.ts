interface Env {
  CF_ACCESS_AUD: string;
}

interface JWTPayload {
  iss: string;
  sub: string;
  aud: string[];
  iat: number;
  exp: number;
  email?: string;
  [key: string]: unknown;
}

async function verifyJWT(token: string, env: Env): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const headerB64 = parts[0];
    const payloadB64 = parts[1];
    const signatureB64 = parts[2];

    const header = JSON.parse(atob(headerB64));
    const payload = JSON.parse(atob(payloadB64)) as JWTPayload;

    const teamDomain = header.kid?.split('/')[0] || 'login.cloudflareaccess.com';

    const certsRes = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
    if (!certsRes.ok) {
      console.error('Failed to fetch certs:', certsRes.status);
      return null;
    }

    const certsData = (await certsRes.json()) as {
      keys: { kid: string; [key: string]: unknown }[];
    };
    const kid = header.kid;
    const key = certsData.keys.find((k) => k.kid === kid);

    if (!key) {
      console.error('Key not found:', kid);
      return null;
    }

    // Verify AUD claim
    if (!payload.aud.includes(env.CF_ACCESS_AUD)) {
      console.error('Invalid AUD:', payload.aud);
      return null;
    }

    // Verify expiration
    if (payload.exp < Date.now() / 1000) {
      console.error('Token expired');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

export const onRequest: PagesFunction<
  { DB: D1Database; R2: R2Bucket },
  '',
  unknown
> = async (context) => {
  if (!context.request.url.includes('/api/')) {
    return context.next();
  }

  const token = context.request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized: missing token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payload = await verifyJWT(token, context.env as Env);
  if (!payload) {
    return new Response(JSON.stringify({ error: 'Unauthorized: invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return context.next();
};
