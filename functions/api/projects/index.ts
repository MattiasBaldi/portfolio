interface Env {
  DB: D1Database;
}

interface Project {
  id: string;
  name: string;
  description: string;
  disclaimer?: string | null;
  thumbnail?: string | null;
  thumbnail_position?: string;
  category?: string | null;
  year?: number | null;
  links?: string | null;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/').filter(Boolean);
  const projectId = pathSegments[pathSegments.length - 1];
  const isListEndpoint = projectId === 'projects';

  try {
    if (request.method === 'GET') {
      // GET single project or list
      if (!isListEndpoint && projectId) {
        const result = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(projectId).first<Project>();
        if (!result) {
          return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      // GET all projects
      const result = await env.DB.prepare('SELECT * FROM projects ORDER BY sort_order, id').all<Project>();
      return new Response(JSON.stringify(result.results || []), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (request.method === 'POST') {
      // CREATE project
      const body = await request.json<Omit<Project, 'id'>>();
      const id = `project-${Date.now()}`;

      const result = await env.DB.prepare(
        `INSERT INTO projects (id, name, description, disclaimer, thumbnail, thumbnail_position, category, year, links, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, body.name, body.description, body.disclaimer, body.thumbnail, body.thumbnail_position, body.category, body.year, body.links, 0).run();

      if (!result.success) {
        return new Response(JSON.stringify({ error: 'Failed to create project' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ id, ...body }), { status: 201, headers: { 'Content-Type': 'application/json' } });
    }

    if (request.method === 'PUT') {
      // UPDATE project
      if (!projectId || isListEndpoint) {
        return new Response(JSON.stringify({ error: 'Project ID required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      const body = await request.json<Partial<Project>>();
      const fields = Object.keys(body).filter(k => k !== 'id');
      const values = fields.map(k => body[k as keyof typeof body]);
      values.push(projectId);

      const query = `UPDATE projects SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`;
      const result = await env.DB.prepare(query).bind(...values).run();

      if (!result.success) {
        return new Response(JSON.stringify({ error: 'Failed to update project' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ id: projectId, ...body }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (request.method === 'DELETE') {
      // DELETE project
      if (!projectId || isListEndpoint) {
        return new Response(JSON.stringify({ error: 'Project ID required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      await env.DB.prepare('DELETE FROM project_media WHERE project_id = ?').bind(projectId).run();
      const result = await env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(projectId).run();

      if (!result.success) {
        return new Response(JSON.stringify({ error: 'Failed to delete project' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response('Method not allowed', { status: 405 });
  } catch (error) {
    console.error('Project error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: String(error) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
