import React from 'react';
import { Navbar } from './components/Navbar';
import { Stepper } from './components/Stepper';
import { InputView } from './components/InputView';
import { GeneratingView } from './components/GeneratingView';
import { PreviewView } from './components/PreviewView';
import { DeployingView, SuccessView } from './components/DeployViews';
import { ErrorView } from './components/ErrorView';
import type { AppStep, GeneratedProject, GenerateRequest } from './types';
import { STACK_OPTIONS } from './types';

const STEPS = [
  { id: 1, label: 'Describe', sublabel: 'Your project' },
  { id: 2, label: 'Generate', sublabel: 'With AI' },
  { id: 3, label: 'Preview', sublabel: 'Review files' },
  { id: 4, label: 'Deploy', sublabel: 'To GitHub' },
];

const STEP_NUMBER: Record<AppStep, number> = {
  input: 1,
  generating: 2,
  preview: 3,
  deploying: 4,
  success: 4,
  error: 1,
};

function App() {
  const [step, setStep] = React.useState<AppStep>('input');
  const [projectId, setProjectId] = React.useState<string>('');
  const [project, setProject] = React.useState<GeneratedProject | null>(null);
  const [repoUrl, setRepoUrl] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const [githubToken, setGithubToken] = React.useState<string>('');
  const [generatingMeta, setGeneratingMeta] = React.useState({ name: '', stack: '' });
  const [deployingName, setDeployingName] = React.useState('');
  const [fileCount, setFileCount] = React.useState(0);

  const handleGenerate = async (data: GenerateRequest) => {
    setGithubToken(data.githubToken);
    setGeneratingMeta({ name: data.projectName, stack: data.stack });
    setStep('generating');
    setError('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
        throw new Error(errData.error ?? `HTTP ${res.status}`);
      }

      const result = await res.json() as { projectId: string; projectType: string; name: string; fileCount: number };
      setProjectId(result.projectId);

      // Fetch project details for preview
      const projectRes = await fetch(`/api/project/${result.projectId}`);
      if (!projectRes.ok) {
        const errData = await projectRes.json().catch(() => ({ error: projectRes.statusText })) as { error?: string };
        throw new Error(errData.error ?? `HTTP ${projectRes.status}`);
      }
      const projectData = await projectRes.json() as GeneratedProject;
      setProject(projectData);
      setFileCount(projectData.files?.length ?? 0);
      setStep('preview');
    } catch (err: any) {
      setError(err.message ?? 'Unknown error occurred');
      setStep('error');
    }
  };

  const handleDeploy = async (opts: { repoName: string; isPrivate: boolean; description: string }) => {
    if (!projectId || !githubToken) return;
    setDeployingName(opts.repoName);
    setStep('deploying');

    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          githubToken,
          repoName: opts.repoName,
          repoDescription: opts.description,
          isPrivate: opts.isPrivate,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
        throw new Error(errData.error ?? `HTTP ${res.status}`);
      }

      const result = await res.json() as { repoUrl: string; repoName: string; fullName: string };
      setRepoUrl(result.repoUrl);
      setStep('success');
    } catch (err: any) {
      setError(err.message ?? 'Unknown error occurred');
      setStep('error');
    }
  };

  const handleReset = () => {
    setStep('input');
    setProjectId('');
    setProject(null);
    setRepoUrl('');
    setError('');
    setGithubToken('');
    setGeneratingMeta({ name: '', stack: '' });
    setDeployingName('');
    setFileCount(0);
  };

  const currentStepNum = STEP_NUMBER[step] ?? 1;
  const showStepper = !['success', 'error'].includes(step);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Stepper */}
        {showStepper && (
          <div className="border-b border-surface-200 bg-white/60 backdrop-blur-sm py-5">
            <div className="max-w-2xl mx-auto px-4">
              <Stepper steps={STEPS} current={currentStepNum} />
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 py-10 px-4">
          {step === 'input' && (
            <InputView onSubmit={handleGenerate} />
          )}

          {step === 'generating' && (
            <GeneratingView
              projectName={generatingMeta.name}
              stack={STACK_OPTIONS.find(s => s.id === generatingMeta.stack)?.label ?? generatingMeta.stack}
            />
          )}

          {step === 'preview' && project && (
            <PreviewView
              project={project}
              onDeploy={handleDeploy}
              onBack={() => setStep('input')}
            />
          )}

          {step === 'deploying' && (
            <DeployingView repoName={deployingName} />
          )}

          {step === 'success' && (
            <SuccessView
              repoUrl={repoUrl}
              repoName={deployingName}
              fileCount={fileCount}
              onReset={handleReset}
            />
          )}

          {step === 'error' && (
            <ErrorView error={error} onRetry={handleReset} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-200 bg-white/60 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-surface-600">GitForge AI</span>
            <span>—</span>
            <span>Powered by Cloudflare Workers AI and R2</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Model: glm-4.7-flash</span>
            <span>Edge runtime</span>
            <span>Zero token storage</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
