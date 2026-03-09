// Cloudflare Pages Function — /api/project/[id]
// Retrieves a stored project from R2 by ID

export interface Env {
  PROJECTS_BUCKET: R2Bucket;
}

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders() });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { params, env } = context;

  const id = params.id as string;

  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return Response.json(
      { error: 'Invalid project ID format' },
      { status: 400, headers: corsHeaders() }
    );
  }

  try {
    const storageKey = `temp/${id}.json`;
    const object = await env.PROJECTS_BUCKET.get(storageKey);

    if (!object) {
      return Response.json(
        { error: 'Project not found. It may have expired or been deleted.' },
        { status: 404, headers: corsHeaders() }
      );
    }

    const project = await object.json();

    return Response.json(project, {
      headers: {
        ...corsHeaders(),
        'Cache-Control': 'no-store',
      },
    });

  } catch (err: any) {
    console.error('Error fetching project from R2:', err);
    return Response.json(
      { error: err?.message ?? 'Failed to retrieve project' },
      { status: 500, headers: corsHeaders() }
    );
  }
};
