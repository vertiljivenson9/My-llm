import React from 'react';
import { AlertTriangle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorViewProps {
  error: string;
  onRetry: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ error, onRetry }) => {
  const [expanded, setExpanded] = React.useState(false);

  const isTokenError = /401|403|unauthorized|forbidden|token/i.test(error);
  const isRateLimitError = /rate.?limit|429/i.test(error);
  const isAIError = /ai|model|generate/i.test(error);

  const hint = isTokenError
    ? 'Verify your GitHub personal access token has the "repo" scope and has not expired.'
    : isRateLimitError
    ? 'GitHub API rate limit reached. Wait a few minutes and try again.'
    : isAIError
    ? 'The AI model encountered an issue. Try simplifying your project description or try again in a moment.'
    : 'An unexpected error occurred. Please try again.';

  return (
    <div className="w-full max-w-lg mx-auto animate-slide-up">
      <div className="card p-8 text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-red-500" strokeWidth={1.5} />
        </div>

        <h2 className="text-xl font-bold text-surface-900 mb-3">Something went wrong</h2>
        <p className="text-surface-500 text-sm leading-relaxed mb-6">{hint}</p>

        {/* Error detail toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="btn-ghost text-xs mx-auto mb-3"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? 'Hide' : 'Show'} error details
        </button>

        {expanded && (
          <div className="text-left mb-6 animate-slide-down">
            <pre className="text-xs font-mono bg-red-50 border border-red-100 text-red-800 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap break-words">
              {error}
            </pre>
          </div>
        )}

        <button onClick={onRetry} className="btn-primary mx-auto">
          <RotateCcw size={15} />
          Try again
        </button>
      </div>
    </div>
  );
};

export default ErrorView;
