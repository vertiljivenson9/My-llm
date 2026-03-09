import React from 'react';
import {
  CheckCircle2, Github, ExternalLink, Copy, Check,
  GitBranch, Clock, ArrowRight, RotateCcw, Star
} from 'lucide-react';

interface DeployingViewProps {
  repoName: string;
}

interface DeployStep {
  id: string;
  label: string;
  sublabel: string;
  durationMs: number;
}

const DEPLOY_STEPS: DeployStep[] = [
  {
    id: 'fetch',
    label: 'Fetching project from R2',
    sublabel: 'Retrieving generated files from temporary storage...',
    durationMs: 1200,
  },
  {
    id: 'create',
    label: 'Creating GitHub repository',
    sublabel: `Calling GitHub API to initialize repository...`,
    durationMs: 2500,
  },
  {
    id: 'push',
    label: 'Pushing files to GitHub',
    sublabel: 'Uploading all files maintaining directory structure...',
    durationMs: 6000,
  },
  {
    id: 'cleanup',
    label: 'Cleaning up temporary files',
    sublabel: 'Deleting R2 object to free storage...',
    durationMs: 800,
  },
];

export const DeployingView: React.FC<DeployingViewProps> = ({ repoName }) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());
  const [dots, setDots] = React.useState('');

  React.useEffect(() => {
    let stepIdx = 0;
    let cancelled = false;

    const advance = () => {
      if (cancelled || stepIdx >= DEPLOY_STEPS.length) return;
      setCurrentStep(stepIdx);
      setTimeout(() => {
        if (cancelled) return;
        setCompletedSteps(prev => new Set([...prev, stepIdx]));
        stepIdx++;
        advance();
      }, DEPLOY_STEPS[stepIdx].durationMs);
    };

    advance();
    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    const i = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(i);
  }, []);

  const progress = (completedSteps.size / DEPLOY_STEPS.length) * 100;

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="relative inline-flex mb-6">
          <div className="w-20 h-20 rounded-full border-4 border-green-100 animate-pulse-slow" />
          <svg className="absolute inset-0 w-20 h-20 animate-spin-slow" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="36" stroke="url(#deploy-grad)" strokeWidth="4" strokeLinecap="round" strokeDasharray="56 170" />
            <defs>
              <linearGradient id="deploy-grad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22c55e" />
                <stop offset="1" stopColor="#22c55e" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Github size={28} className="text-surface-800 animate-pulse-slow" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-surface-900 mb-2">
          Deploying <span className="text-green-600">{repoName}</span>{dots}
        </h2>
        <p className="text-surface-500 text-sm">
          Pushing your generated project to GitHub
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-surface-600">Deployment progress</span>
          <span className="text-xs font-semibold text-green-600">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="card divide-y divide-surface-100 overflow-hidden">
        {DEPLOY_STEPS.map((step, idx) => {
          const isComplete = completedSteps.has(idx);
          const isActive = currentStep === idx && !isComplete;
          const isPending = idx > currentStep;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 transition-all duration-300 ${isActive ? 'bg-green-50/60' : ''}`}
            >
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300
                ${isComplete ? 'bg-green-500 text-white' : isActive ? 'bg-green-600 text-white shadow-sm' : 'bg-surface-100 text-surface-400'}
              `}>
                {isComplete ? (
                  <CheckCircle2 size={18} />
                ) : isActive ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                  </svg>
                ) : (
                  <span className="text-sm font-bold">{idx + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${isComplete ? 'text-green-700' : isActive ? 'text-green-800' : 'text-surface-400'}`}>
                  {step.label}
                </p>
                {(isActive || isComplete) && (
                  <p className={`text-xs mt-0.5 ${isComplete ? 'text-green-600' : 'text-surface-500'}`}>
                    {isActive ? step.sublabel : 'Complete'}
                  </p>
                )}
              </div>
              {isComplete && <div className="badge-success text-[10px] shrink-0">Done</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────

interface SuccessViewProps {
  repoUrl: string;
  repoName: string;
  fileCount: number;
  onReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ repoUrl, repoName, fileCount, onReset }) => {
  const [copiedUrl, setCopiedUrl] = React.useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(repoUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {}
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-slide-up text-center">
      {/* Success icon */}
      <div className="relative inline-flex mb-8">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 size={48} className="text-green-500" strokeWidth={1.5} />
        </div>
        {/* Decorative rings */}
        <div className="absolute inset-0 rounded-full border-2 border-green-200 animate-ping opacity-30" />
        <div className="absolute -inset-3 rounded-full border border-green-100 opacity-50" />
      </div>

      <h2 className="text-3xl font-bold text-surface-900 mb-3">
        Repository deployed!
      </h2>
      <p className="text-surface-500 text-base mb-8 max-w-sm mx-auto">
        Your project <span className="font-semibold text-surface-700">{repoName}</span> is live on GitHub with {fileCount} files ready to use.
      </p>

      {/* Repo URL card */}
      <div className="card p-5 mb-8 text-left">
        <div className="flex items-center gap-2 mb-3">
          <Github size={16} className="text-surface-700" />
          <span className="text-sm font-semibold text-surface-800">Repository URL</span>
        </div>
        <div className="flex items-center gap-2 bg-surface-50 rounded-xl px-4 py-3 border border-surface-200">
          <span className="flex-1 text-sm font-mono text-surface-700 truncate">{repoUrl}</span>
          <button
            onClick={handleCopyUrl}
            className="btn-ghost py-1.5 px-2.5 text-xs shrink-0"
          >
            {copiedUrl ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
          </button>
        </div>

        <div className="flex gap-3 mt-4">
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 justify-center"
          >
            <Github size={16} />
            Open on GitHub
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Files pushed', value: fileCount, icon: GitBranch },
          { label: 'Temp files', value: 'Cleaned', icon: Clock, green: true },
          { label: 'Edge AI', value: 'Workers AI', icon: Star },
        ].map(({ label, value, icon: Icon, green }) => (
          <div key={label} className="card p-4 text-center">
            <Icon size={18} className={`mx-auto mb-2 ${green ? 'text-green-500' : 'text-forge-500'}`} />
            <p className={`text-base font-bold ${green ? 'text-green-600' : 'text-surface-900'}`}>{value}</p>
            <p className="text-xs text-surface-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Next steps */}
      <div className="card p-5 text-left mb-8">
        <h3 className="text-sm font-bold text-surface-900 mb-4">Next steps</h3>
        <div className="space-y-3">
          {[
            { step: '1', label: 'Clone the repository', cmd: `git clone ${repoUrl}.git` },
            { step: '2', label: 'Install dependencies', cmd: 'npm install' },
            { step: '3', label: 'Start development server', cmd: 'npm run dev' },
            { step: '4', label: 'Deploy to Cloudflare', cmd: 'npx wrangler pages deploy' },
          ].map(({ step, label, cmd }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-forge-100 text-forge-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {step}
              </div>
              <div>
                <p className="text-xs font-semibold text-surface-700 mb-1">{label}</p>
                <code className="text-xs font-mono text-surface-500 bg-surface-50 px-2 py-1 rounded-md border border-surface-100">
                  {cmd}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onReset} className="btn-secondary mx-auto">
        <RotateCcw size={15} />
        Generate another project
      </button>
    </div>
  );
};

export default SuccessView;
