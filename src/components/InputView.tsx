import React from 'react';
import {
  Sparkles, Github, Eye, EyeOff, ArrowRight, Info,
  Wand2, ChevronDown, ChevronUp
} from 'lucide-react';
import { StackSelector } from './StackSelector';
import type { GenerateRequest } from '../types';
import { STACK_OPTIONS } from '../types';

interface InputViewProps {
  onSubmit: (data: GenerateRequest) => void;
  loading?: boolean;
}

const EXAMPLE_PROMPTS = [
  'A personal blog with Astro, MDX posts, comments via Workers and D1',
  'REST API for a task manager with Hono, TypeScript, D1 and JWT auth',
  'Real-time chat application with WebSockets on Cloudflare Workers and Durable Objects',
  'E-commerce storefront with React, product catalog in KV, and Stripe payments',
  'URL shortener with analytics dashboard, Workers and KV storage',
];

export const InputView: React.FC<InputViewProps> = ({ onSubmit, loading }) => {
  const [description, setDescription] = React.useState('');
  const [stack, setStack] = React.useState('react-pages');
  const [projectName, setProjectName] = React.useState('');
  const [githubToken, setGithubToken] = React.useState('');
  const [showToken, setShowToken] = React.useState(false);
  const [showExamples, setShowExamples] = React.useState(false);
  const [showStackSelector, setShowStackSelector] = React.useState(true);

  const selectedStack = STACK_OPTIONS.find(s => s.id === stack);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !stack || !projectName.trim() || !githubToken.trim()) return;
    onSubmit({ description: description.trim(), stack, projectName: projectName.trim(), githubToken });
  };

  const canSubmit = description.trim().length > 20 && projectName.trim().length > 1 && githubToken.trim().length > 10;

  const slugify = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 40);

  const handleDescriptionChange = (v: string) => {
    setDescription(v);
    if (!projectName) {
      const words = v.trim().split(/\s+/).slice(0, 4);
      if (words.length >= 2) setProjectName(slugify(words.join(' ')));
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-up">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 badge-forge mb-5 py-1.5 px-4 text-sm">
          <Sparkles size={13} />
          Powered by Workers AI — glm-4.7-flash
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-surface-900 leading-[1.15] tracking-tight mb-4">
          Describe your project,
          <br />
          <span className="forge-gradient-text">ship in seconds</span>
        </h1>
        <p className="text-surface-500 text-lg leading-relaxed max-w-lg mx-auto">
          GitForge AI generates complete, production-ready repositories from a natural language description and deploys them straight to GitHub.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-6">
        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-surface-800">
              Project description
            </label>
            <button
              type="button"
              onClick={() => setShowExamples(!showExamples)}
              className="btn-ghost py-1 px-2 text-xs text-forge-600 hover:text-forge-700"
            >
              {showExamples ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showExamples ? 'Hide' : 'Examples'}
            </button>
          </div>

          {showExamples && (
            <div className="mb-3 p-3 bg-forge-50 rounded-xl border border-forge-100 animate-slide-down">
              <p className="text-xs text-forge-700 font-semibold mb-2">Click to use an example:</p>
              <div className="space-y-1.5">
                {EXAMPLE_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setDescription(p);
                      handleDescriptionChange(p);
                      setShowExamples(false);
                    }}
                    className="w-full text-left text-xs text-surface-600 hover:text-forge-700 hover:bg-forge-100 px-3 py-2 rounded-lg transition-colors duration-100"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <textarea
            className="textarea-field"
            rows={4}
            placeholder="Describe what you want to build in detail. For example: 'A personal blog with Astro, MDX post support, comments powered by Cloudflare Workers and D1 database, with an admin panel to manage posts...'"
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            required
            minLength={20}
          />
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${description.length < 20 ? 'text-surface-400' : 'text-green-500'}`}>
              {description.length} chars {description.length < 20 ? `(min 20)` : ''}
            </span>
          </div>
        </div>

        {/* Project name */}
        <div>
          <label className="text-sm font-semibold text-surface-800 block mb-2">
            Repository name
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-surface-400 font-mono select-none">
              your-org /
            </span>
            <input
              type="text"
              className="input-field pl-[90px]"
              placeholder="my-awesome-project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
              required
              minLength={2}
              maxLength={100}
              pattern="[a-z0-9_-]+"
            />
          </div>
          <p className="text-xs text-surface-400 mt-1.5">Lowercase letters, numbers, hyphens and underscores only.</p>
        </div>

        {/* Stack */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-surface-800">
              Technology stack
            </label>
            {selectedStack && (
              <div className="flex gap-1">
                {selectedStack.tags.slice(0, 3).map(t => (
                  <span key={t} className="badge-neutral text-[10px]">{t}</span>
                ))}
              </div>
            )}
          </div>
          <StackSelector value={stack} onChange={setStack} />
        </div>

        {/* GitHub Token */}
        <div>
          <label className="text-sm font-semibold text-surface-800 block mb-2">
            GitHub personal access token
          </label>
          <div className="relative">
            <Github size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type={showToken ? 'text' : 'password'}
              className="input-field pl-9 pr-10"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              required
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
            >
              {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <div className="flex items-start gap-2 mt-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <Info size={13} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-amber-700 font-medium">Token scope required: <code className="font-mono bg-amber-100 px-1 rounded">repo</code></p>
              <p className="text-xs text-amber-600 mt-0.5">
                Your token is sent directly to Cloudflare Functions and used only once to create the repository. It is never stored.
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="btn-primary w-full justify-center py-3 text-base"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                </svg>
                Generating project...
              </>
            ) : (
              <>
                <Wand2 size={17} />
                Generate repository
                <ArrowRight size={15} />
              </>
            )}
          </button>
          {!canSubmit && (description.length > 0 || projectName.length > 0 || githubToken.length > 0) && (
            <p className="text-xs text-surface-400 text-center mt-2">
              {description.length < 20 ? 'Description needs at least 20 characters. ' : ''}
              {!projectName.trim() ? 'Repository name is required. ' : ''}
              {!githubToken.trim() ? 'GitHub token is required.' : ''}
            </p>
          )}
        </div>
      </form>

      {/* Footer trust */}
      <div className="flex items-center justify-center gap-6 mt-8 text-xs text-surface-400">
        {['Token never stored', 'Cloudflare edge AI', 'Open source'].map((item) => (
          <div key={item} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InputView;
