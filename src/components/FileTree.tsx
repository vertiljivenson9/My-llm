import React from 'react';
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen } from 'lucide-react';
import type { DirectoryNode, ProjectFile } from '../types';
import { detectLanguage } from '../types';

interface FileTreeProps {
  nodes: DirectoryNode[];
  files: ProjectFile[];
  selectedPath?: string;
  onSelect: (path: string) => void;
  depth?: number;
}

const EXTENSION_COLORS: Record<string, string> = {
  ts: 'text-blue-500', tsx: 'text-cyan-500', js: 'text-yellow-500', jsx: 'text-yellow-400',
  json: 'text-amber-500', toml: 'text-orange-500', md: 'text-purple-500',
  html: 'text-red-400', css: 'text-pink-500', scss: 'text-pink-600',
  py: 'text-green-500', rs: 'text-orange-600', go: 'text-teal-500',
  sql: 'text-indigo-400', sh: 'text-lime-500', env: 'text-yellow-600',
  yaml: 'text-rose-400', yml: 'text-rose-400', svg: 'text-violet-400',
};

function getFileColor(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return EXTENSION_COLORS[ext] ?? 'text-surface-400';
}

const FileTreeNode: React.FC<{
  node: DirectoryNode;
  files: ProjectFile[];
  selectedPath?: string;
  onSelect: (path: string) => void;
  depth: number;
}> = ({ node, files, selectedPath, onSelect, depth }) => {
  const [open, setOpen] = React.useState(depth < 2);

  if (node.type === 'file') {
    const isSelected = selectedPath === node.path;
    return (
      <button
        onClick={() => onSelect(node.path)}
        className={`
          w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left
          transition-all duration-100 group
          ${isSelected
            ? 'bg-forge-50 text-forge-700 font-medium'
            : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'}
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <FileText size={13} className={`shrink-0 ${isSelected ? 'text-forge-500' : getFileColor(node.name)}`} />
        <span className="text-xs truncate">{node.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left hover:bg-surface-50 transition-colors duration-100 group"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {open ? (
          <ChevronDown size={12} className="shrink-0 text-surface-400" />
        ) : (
          <ChevronRight size={12} className="shrink-0 text-surface-400" />
        )}
        {open ? (
          <FolderOpen size={13} className="shrink-0 text-forge-400" />
        ) : (
          <Folder size={13} className="shrink-0 text-forge-400" />
        )}
        <span className="text-xs font-medium text-surface-700 truncate">{node.name}</span>
      </button>
      {open && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              files={files}
              selectedPath={selectedPath}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileTree: React.FC<FileTreeProps> = ({
  nodes,
  files,
  selectedPath,
  onSelect,
  depth = 0,
}) => {
  return (
    <div className="py-1">
      {nodes.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          files={files}
          selectedPath={selectedPath}
          onSelect={onSelect}
          depth={depth}
        />
      ))}
    </div>
  );
};

export default FileTree;
