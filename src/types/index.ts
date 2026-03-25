export interface ProjectFile {
  path: string;
  content: string;
  language?: string;
}

export interface GeneratedProject {
  projectType: 'pages' | 'worker' | 'fullstack';
  name: string;
  description: string;
  stack: string;
  files: ProjectFile[];
  structure?: DirectoryNode[];
}

export interface DirectoryNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: DirectoryNode[];
}

export interface GenerateRequest {
  description: string;
  stack: string;
  projectName: string;
  githubToken: string;
}

export interface GenerateResponse {
  projectId: string;
  projectType: string;
  name: string;
  fileCount: number;
  success: boolean;
}

export interface DeployRequest {
  projectId: string;
  githubToken: string;
  repoName: string;
  repoDescription?: string;
  isPrivate?: boolean;
}

export interface DeployResponse {
  repoUrl: string;
  success: boolean;
  repoName: string;
  fullName: string;
}

export type AppStep = 'input' | 'generating' | 'preview' | 'deploying' | 'success' | 'error';

export interface AppState {
  step: AppStep;
  projectId?: string;
  project?: GeneratedProject;
  repoUrl?: string;
  error?: string;
}

export interface StackOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  tags: string[];
}

export const STACK_OPTIONS: StackOption[] = [
  {
    id: 'react-pages',
    label: 'React + Cloudflare Pages',
    description: 'SPA with Vite, TypeScript, Tailwind, Pages Functions',
    icon: 'layers',
    tags: ['React', 'Vite', 'TypeScript', 'Tailwind'],
  },
  {
    id: 'worker-api',
    label: 'Cloudflare Worker API',
    description: 'REST API with Hono, TypeScript, D1 and KV',
    icon: 'zap',
    tags: ['Hono', 'TypeScript', 'D1', 'KV'],
  },
  {
    id: 'astro-pages',
    label: 'Astro + Pages',
    description: 'Content-first site with Astro, MDX, Islands arch',
    icon: 'globe',
    tags: ['Astro', 'MDX', 'TypeScript'],
  },
  {
    id: 'nextjs-pages',
    label: 'Next.js + Pages',
    description: 'Full-stack with Next.js App Router and edge runtime',
    icon: 'triangle',
    tags: ['Next.js', 'React', 'Edge'],
  },
  {
    id: 'python-worker',
    label: 'Python Worker',
    description: 'Python API with FastAPI style handlers on Workers',
    icon: 'code-2',
    tags: ['Python', 'Workers', 'API'],
  },
  {
    id: 'fullstack-d1',
    label: 'Full-Stack + D1',
    description: 'React frontend with Worker API and D1 SQLite database',
    icon: 'database',
    tags: ['React', 'Hono', 'D1', 'SQLite'],
  },
];

export function detectLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'tsx', js: 'javascript', jsx: 'jsx',
    json: 'json', toml: 'toml', yaml: 'yaml', yml: 'yaml',
    md: 'markdown', html: 'html', css: 'css', scss: 'scss',
    py: 'python', rs: 'rust', go: 'go', sh: 'bash',
    sql: 'sql', env: 'bash', gitignore: 'bash',
  };
  return map[ext ?? ''] ?? 'plaintext';
}

export function buildDirectoryTree(files: ProjectFile[]): DirectoryNode[] {
  const root: DirectoryNode[] = [];
  const map: Record<string, DirectoryNode> = {};

  for (const file of files) {
    const parts = file.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const fullPath = parts.slice(0, i + 1).join('/');
      const isFile = i === parts.length - 1;

      if (!map[fullPath]) {
        const node: DirectoryNode = {
          name: part,
          type: isFile ? 'file' : 'directory',
          path: fullPath,
          children: isFile ? undefined : [],
        };
        map[fullPath] = node;
        current.push(node);
      }
      if (!isFile) {
        current = map[fullPath].children!;
      }
    }
  }

  return root;
}
