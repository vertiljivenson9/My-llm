// Cloudflare Pages Function — /api/generate
// Generates a complete project using Workers AI

export interface Env {
  AI: Ai;
  PROJECTS_BUCKET: R2Bucket;
}

interface GenerateBody {
  description: string;
  stack: string;
  projectName: string;
  githubToken: string;
}

const STACK_CONTEXT: Record<string, string> = {
  'react-pages': 'React 18 + TypeScript + Vite + Tailwind CSS deployed on Cloudflare Pages with Pages Functions for API routes. Include wrangler.toml, vite.config.ts, tailwind.config.js, tsconfig.json, package.json with correct scripts, public/_redirects for SPA routing, and src/main.tsx, src/App.tsx, src/index.css.',
  'worker-api': 'Cloudflare Worker REST API using Hono framework with TypeScript. Include wrangler.toml with routes, src/index.ts with Hono app, package.json, tsconfig.json, and example route handlers with D1 and KV usage.',
  'astro-pages': 'Astro 4 site deployed on Cloudflare Pages. Include astro.config.mjs with cloudflare adapter, src/pages/index.astro, src/layouts/Layout.astro, src/pages/blog/[slug].astro, src/content/config.ts, package.json, tsconfig.json, wrangler.toml.',
  'nextjs-pages': 'Next.js 14 with App Router deployed on Cloudflare Pages via @cloudflare/next-on-pages. Include next.config.mjs, wrangler.toml, package.json, app/page.tsx, app/layout.tsx, app/api/route.ts.',
  'python-worker': 'Cloudflare Worker with Python workers runtime. Include wrangler.toml with python compatibility_flags, src/index.py as entry point with fetch handler, requirements.txt if needed, and proper Python patterns for Workers.',
  'fullstack-d1': 'Full-stack app: React 18 frontend (Vite + Tailwind) + Hono API as Pages Functions + D1 SQLite database. Include wrangler.toml with d1_databases binding, functions/api/[[route]].ts with Hono, src/App.tsx, migrations/0001_init.sql schema, package.json, tsconfig.json.',
};

const SYSTEM_PROMPT = `You are an expert Cloudflare developer and software architect. Your job is to generate complete, production-ready project files.

Rules:
1. Always respond with ONLY valid JSON — no markdown, no code fences, no extra text.
2. The JSON must match exactly: { "name": string, "description": string, "projectType": "pages"|"worker"|"fullstack", "files": [{ "path": string, "content": string }] }
3. Generate REAL, functional code — not placeholders or TODOs.
4. Include ALL necessary config files (package.json, tsconfig.json, wrangler.toml, .gitignore, README.md, etc.).
5. File paths use forward slashes, no leading slash, e.g. "src/App.tsx".
6. Content must be complete — every file fully implemented.
7. Code must follow modern best practices: TypeScript strict mode, ESM imports, proper error handling.
8. For Cloudflare projects, always include wrangler.toml with appropriate settings.
9. README.md must include setup instructions, environment variables, and deployment steps.
10. .gitignore must include node_modules, dist, .wrangler, .env, etc.`;

function buildUserPrompt(body: GenerateBody): string {
  const stackCtx = STACK_CONTEXT[body.stack] ?? `${body.stack} project on Cloudflare`;
  return `Generate a complete project named "${body.projectName}" with the following requirements:

DESCRIPTION: ${body.description}

TECHNOLOGY STACK: ${stackCtx}

Generate a minimum of 8-15 files covering:
- Main application code
- Configuration files (wrangler.toml, tsconfig.json, package.json)
- Styling/CSS
- At least 2-3 meaningful components or modules
- README.md with clear setup and deployment instructions
- .gitignore
- Any Cloudflare-specific configuration files

Ensure the code is fully functional, not placeholder. Each file should be complete and ready to use.

Respond with ONLY the JSON object, no other text.`;
}

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders() });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    let body: GenerateBody;
    try {
      body = await request.json() as GenerateBody;
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders() });
    }

    const { description, stack, projectName, githubToken } = body;

    if (!description?.trim() || description.length < 10) {
      return Response.json({ error: 'Description must be at least 10 characters' }, { status: 400, headers: corsHeaders() });
    }
    if (!stack?.trim()) {
      return Response.json({ error: 'Stack is required' }, { status: 400, headers: corsHeaders() });
    }
    if (!projectName?.trim()) {
      return Response.json({ error: 'Project name is required' }, { status: 400, headers: corsHeaders() });
    }
    if (!githubToken?.trim()) {
      return Response.json({ error: 'GitHub token is required' }, { status: 400, headers: corsHeaders() });
    }

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: buildUserPrompt(body) },
    ];

    // Call Workers AI
    let aiResult: any;
    try {
      aiResult = await env.AI.run('@cf/zai-org/glm-4.7-flash' as any, {
        messages,
        response_format: { type: 'json_object' },
        max_tokens: 8192,
      } as any);
    } catch (aiErr: any) {
      console.error('Workers AI error:', aiErr);
      return Response.json(
        { error: `AI generation failed: ${aiErr?.message ?? 'Unknown AI error'}` },
        { status: 502, headers: corsHeaders() }
      );
    }

    const rawContent: string =
      aiResult?.response ??
      aiResult?.result?.response ??
      aiResult?.choices?.[0]?.message?.content ??
      '';

    if (!rawContent) {
      return Response.json(
        { error: 'AI returned empty response' },
        { status: 502, headers: corsHeaders() }
      );
    }

    // Parse JSON from AI response (strip any accidental markdown)
    let project: any;
    try {
      // Remove possible markdown code fences
      const cleaned = rawContent
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .trim();
      project = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr, 'Raw:', rawContent.slice(0, 500));
      return Response.json(
        { error: 'AI returned malformed JSON. Please try again.' },
        { status: 502, headers: corsHeaders() }
      );
    }

    // Validate structure
    if (!project.files || !Array.isArray(project.files) || project.files.length === 0) {
      return Response.json(
        { error: 'AI did not return a valid files array. Please try again.' },
        { status: 502, headers: corsHeaders() }
      );
    }

    // Normalize project data
    const normalized = {
      name: project.name ?? projectName,
      description: project.description ?? description,
      projectType: project.projectType ?? 'pages',
      stack,
      files: (project.files as Array<{ path: string; content: string }>)
        .filter(f => f.path && typeof f.content === 'string')
        .map(f => ({
          path: f.path.replace(/^\/+/, ''),
          content: f.content,
        })),
    };

    // Store in R2
    const projectId = crypto.randomUUID();
    const storageKey = `temp/${projectId}.json`;

    try {
      await env.PROJECTS_BUCKET.put(storageKey, JSON.stringify(normalized), {
        httpMetadata: { contentType: 'application/json' },
        customMetadata: {
          createdAt: new Date().toISOString(),
          projectName,
          stack,
        },
      });
    } catch (r2Err: any) {
      console.error('R2 storage error:', r2Err);
      return Response.json(
        { error: `Failed to store project: ${r2Err?.message ?? 'R2 error'}` },
        { status: 502, headers: corsHeaders() }
      );
    }

    return Response.json(
      {
        success: true,
        projectId,
        projectType: normalized.projectType,
        name: normalized.name,
        fileCount: normalized.files.length,
      },
      { headers: corsHeaders() }
    );

  } catch (err: any) {
    console.error('Unhandled error in /api/generate:', err);
    return Response.json(
      { error: err?.message ?? 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
};
