import React from 'react';
import { Cpu, BrainCircuit, GitBranch, Package, Wrench, CheckCircle2 } from 'lucide-react';

interface GeneratingViewProps {
  projectName: string;
  stack: string;
}

interface ProgressStep {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  durationMs: number;
}

const STEPS: ProgressStep[] = [
  {
    id: 'analyze',
    label: 'Analyzing requirements',
    sublabel: 'Parsing project description and stack constraints...',
    icon: <BrainCircuit size={18} />,
    durationMs: 1800,
  },
  {
    id: 'generate',
    label: 'Generating with Workers AI',
    sublabel: 'Running glm-4.7-flash on Cloudflare edge...',
    icon: <Cpu size={18} />,
    durationMs: 12000,
  },
  {
    id: 'structure',
    label: 'Building project structure',
    sublabel: 'Creating files, configs and Cloudflare bindings...',
    icon: <GitBranch size={18} />,
    durationMs: 2500,
  },
  {
    id: 'deps',
    label: 'Resolving dependencies',
    sublabel: 'Configuring package.json and wrangler.toml...',
    icon: <Package size={18} />,
    durationMs: 1500,
  },
  {
    id: 'finalize',
    label: 'Finalizing and storing',
    sublabel: 'Saving to Cloudflare R2 temporary storage...',
    icon: <Wrench size={18} />,
    durationMs: 1200,
  },
];

export const GeneratingView: React.FC<GeneratingViewProps> = ({ projectName, stack }) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());
  const [dots, setDots] = React.useState('');

  React.useEffect(() => {
    let stepIdx = 0;
    let cancelled = false;

    const advance = () => {
      if (cancelled || stepIdx >= STEPS.length) return;
      setCurrentStep(stepIdx);
      const duration = STEPS[stepIdx].durationMs;
      setTimeout(() => {
        if (cancelled) return;
        setCompletedSteps(prev => new Set([...prev, stepIdx]));
        stepIdx++;
        advance();
      }, duration);
    };

    advance();
    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const progress = (completedSteps.size / STEPS.length) * 100;

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="relative inline-flex mb-6">
          {/* Outer ring */}
          <div className="w-20 h-20 rounded-full border-4 border-forge-100 animate-pulse-slow" />
          {/* Spinning arc */}
          <svg className="absolute inset-0 w-20 h-20 animate-spin-slow" viewBox="0 0 80 80" fill="none">
            <circle
              cx="40" cy="40" r="36"
              stroke="url(#spin-grad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="56 170"
            />
            <defs>
              <linearGradient id="spin-grad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6272f1" />
                <stop offset="1" stopColor="#6272f1" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Cpu size={28} className="text-forge-600 animate-pulse-slow" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-surface-900 mb-2">
          Generating <span className="forge-gradient-text">{projectName}</span>{dots}
        </h2>
        <p className="text-surface-500 text-sm">
          Workers AI is crafting your {stack} project on Cloudflare edge infrastructure
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-surface-600">Progress</span>
          <span className="text-xs font-semibold text-forge-600">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-forge rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="card divide-y divide-surface-100 overflow-hidden">
        {STEPS.map((step, idx) => {
          const isComplete = completedSteps.has(idx);
          const isActive = currentStep === idx && !isComplete;
          const isPending = idx > currentStep;

          return (
            <div
              key={step.id}
              className={`
                flex items-center gap-4 p-4 transition-all duration-300
                ${isActive ? 'bg-forge-50' : ''}
                ${isComplete ? 'bg-green-50/50' : ''}
              `}
            >
              {/* Icon/status */}
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                transition-all duration-300
                ${isComplete ? 'bg-green-500 text-white' : ''}
                ${isActive ? 'bg-forge-600 text-white shadow-glow-sm' : ''}
                ${isPending ? 'bg-surface-100 text-surface-400' : ''}
              `}>
                {isComplete ? (
                  <CheckCircle2 size={18} />
                ) : isActive ? (
                  <div className="animate-spin-slow">{step.icon}</div>
                ) : (
                  step.icon
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${
                  isComplete ? 'text-green-700' : isActive ? 'text-forge-800' : 'text-surface-400'
                }`}>
                  {step.label}
                </p>
                {(isActive || isComplete) && (
                  <p className={`text-xs mt-0.5 ${isComplete ? 'text-green-600' : 'text-surface-500'}`}>
                    {isActive ? step.sublabel : 'Complete'}
                  </p>
                )}
              </div>

              {/* Time indicator */}
              {isActive && (
                <div className="flex gap-1 shrink-0">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1.5 h-4 bg-forge-400 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              )}
              {isComplete && (
                <div className="badge-success text-[10px] shrink-0">Done</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Note */}
      <p className="text-center text-xs text-surface-400 mt-6">
        Generation typically takes 15–30 seconds depending on project complexity
      </p>
    </div>
  );
};

export default GeneratingView;
