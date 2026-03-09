import React from 'react';
import {
  FileText, GitBranch, Github, Lock, Globe, Upload,
  ChevronLeft, Eye, Package, Settings, AlertTriangle, ArrowRight, Shield
} from 'lucide-react';
import type { GeneratedProject } from '../types';
import { buildDirectoryTree } from '../types';
import { FileTree } from './FileTree';
import { CodeViewer } from './CodeViewer';

interface PreviewViewProps {
  project: GeneratedProject;
  onDeploy: (opts: { repoName: string; isPrivate: boolean; description: string }) => void;
  onBack: () => void;
  loading?: boolean;
}

export const PreviewView: React.FC<PreviewViewProps> = ({ project, onDeploy, onBack, loading }) => {
  const [selectedPath, setSelectedPath] = React.useState<string>(project.files[0]?.path ?? '');
  const [repoName, setRepoName] = React.useState(project.name);
  const [repoDescription, setRepoDescription] = React.useState(project.description ?? '');
  const [isPrivate, setIsPrivate] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'preview' | 'deploy'>('preview');

  const tree = buildDirectoryTree(project.files);
  const selectedFile = project.files.find(f => f.path === selectedPath);

  const handleDeploy = () => {
    onDeploy({ repoName, isPrivate, description: repoDescription });
  };

  const canDeploy = repoName.trim().length >= 2;

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="btn-ghost py-2">
            <ChevronLeft size={16} />
            Back
          </button>
          <div className="h-5 w-px bg-surface-200" />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-surface-900">{project.name}</h2>
              <span className="badge-forge">{project.projectType}</span>
            </div>
            <p className="text-sm text-surface-500 mt-0.5">{project.files.length} files generated</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 text-xs text-surface-500">
            <span className="flex items-center gap-1.5">
              <FileText size={12} />
              {project.files.length} files
            </span>
            <span className="flex items-center gap-1.5">
              <Package size={12} />
              {project.stack}
            </span>
          </div>
          <button
            onClick={() => setActiveTab('deploy')}
            className="btn-primary"
          >
            <Github size={16} />
            Deploy to GitHub
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-surface-100 p-1 rounded-xl w-fit">
        {(['preview', 'deploy'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
              ${activeTab === tab
                ? 'bg-white text-surface-900 shadow-card'
                : 'text-surface-500 hover:text-surface-700'}
            `}
          >
            {tab === 'preview' ? <Eye size={14} /> : <Upload size={14} />}
            {tab === 'preview' ? 'File preview' : 'Deploy'}
          </button>
        ))}
      </div>

      {activeTab === 'preview' ? (
        /* CODE PREVIEW PANEL */
        <div className="card overflow-hidden" style={{ height: '620px' }}>
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-56 shrink-0 border-r border-surface-100 overflow-y-auto bg-surface-50/60">
              <div className="px-3 pt-3 pb-1">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch size={12} className="text-forge-500" />
                  <span className="text-xs font-semibold text-surface-600 uppercase tracking-wide">
                    Files
                  </span>
                </div>
              </div>
              <FileTree
                nodes={tree}
                files={project.files}
                selectedPath={selectedPath}
                onSelect={setSelectedPath}
              />
            </div>

            {/* Code viewer */}
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
              {selectedFile ? (
                <CodeViewer path={selectedFile.path} content={selectedFile.content} />
              ) : (
                <div className="flex-1 flex items-center justify-center text-surface-400 text-sm">
                  Select a file to view its contents
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* DEPLOY PANEL */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Deploy form */}
          <div className="lg:col-span-3 card p-6 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-surface-900 mb-1">Deploy to GitHub</h3>
              <p className="text-sm text-surface-500">Configure the repository settings and push your generated code.</p>
            </div>

            {/* Repo name */}
            <div>
              <label className="text-sm font-semibold text-surface-800 block mb-2">
                Repository name
              </label>
              <input
                type="text"
                className="input-field"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-semibold text-surface-800 block mb-2">
                Description <span className="text-surface-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                className="input-field"
                value={repoDescription}
                onChange={(e) => setRepoDescription(e.target.value)}
                placeholder="Short description for this repository"
                maxLength={200}
              />
            </div>

            {/* Visibility */}
            <div>
              <label className="text-sm font-semibold text-surface-800 block mb-3">
                Visibility
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: false, label: 'Public', sub: 'Visible to everyone', icon: Globe },
                  { value: true, label: 'Private', sub: 'Only you can see it', icon: Lock },
                ].map(({ value, label, sub, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setIsPrivate(value)}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150
                      ${isPrivate === value
                        ? 'border-forge-400 bg-forge-50 shadow-glow-sm'
                        : 'border-surface-200 hover:border-surface-300 bg-white'}
                    `}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPrivate === value ? 'bg-forge-600 text-white' : 'bg-surface-100 text-surface-500'}`}>
                      <Icon size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-surface-800">{label}</p>
                      <p className="text-xs text-surface-500">{sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-start gap-3 p-4 bg-surface-50 border border-surface-200 rounded-xl">
              <Shield size={16} className="text-forge-500 shrink-0 mt-0.5" />
              <div className="text-xs text-surface-500 space-y-1">
                <p className="font-semibold text-surface-700">Your token is secure</p>
                <p>The GitHub token is forwarded directly to the edge function and used only to create this repository. It is never logged or stored anywhere.</p>
              </div>
            </div>

            <button
              onClick={handleDeploy}
              disabled={!canDeploy || loading}
              className="btn-primary w-full justify-center py-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                  </svg>
                  Creating repository...
                </>
              ) : (
                <>
                  <Github size={17} />
                  Create repository and push files
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5">
              <h4 className="text-sm font-bold text-surface-900 mb-4 flex items-center gap-2">
                <Settings size={14} className="text-forge-500" />
                Project summary
              </h4>
              <div className="space-y-3">
                {[
                  { label: 'Type', value: project.projectType },
                  { label: 'Stack', value: project.stack },
                  { label: 'Files', value: `${project.files.length} files` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-surface-500">{label}</span>
                    <span className="font-semibold text-surface-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* File list summary */}
            <div className="card p-5">
              <h4 className="text-sm font-bold text-surface-900 mb-4 flex items-center gap-2">
                <FileText size={14} className="text-forge-500" />
                Generated files
              </h4>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {project.files.map((f) => (
                  <button
                    key={f.path}
                    onClick={() => { setSelectedPath(f.path); setActiveTab('preview'); }}
                    className="w-full flex items-center gap-2 text-left hover:bg-surface-50 px-2 py-1.5 rounded-lg transition-colors duration-100 group"
                  >
                    <FileText size={11} className="text-surface-400 shrink-0" />
                    <span className="text-xs font-mono text-surface-600 group-hover:text-forge-700 truncate">
                      {f.path}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewView;
