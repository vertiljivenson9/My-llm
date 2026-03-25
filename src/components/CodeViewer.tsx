import React from 'react';
import { Copy, Check } from 'lucide-react';
import { detectLanguage } from '../types';

interface CodeViewerProps {
  path: string;
  content: string;
}

const KEYWORD_PATTERNS: Array<[RegExp, string]> = [
  [/\b(import|export|from|default|const|let|var|function|return|async|await|if|else|for|while|class|extends|new|this|typeof|instanceof|void|null|undefined|true|false|of|in|try|catch|finally|throw|type|interface|enum|namespace|declare|abstract|readonly|static|public|private|protected|override)\b/g, 'text-violet-400'],
  [/"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`/g, 'text-green-400'],
  [/\/\/[^\n]*/g, 'text-surface-500 italic'],
  [/\/\*[\s\S]*?\*\//g, 'text-surface-500 italic'],
  [/\b([A-Z][A-Za-z0-9_]*)\b/g, 'text-yellow-400'],
  [/\b(\d+(?:\.\d+)?)\b/g, 'text-orange-400'],
];

function highlightCode(code: string, lang: string): string {
  if (['json', 'toml', 'yaml', 'yml', 'markdown', 'plaintext'].includes(lang)) {
    return escapeHtml(code);
  }
  let escaped = escapeHtml(code);
  return escaped;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getLineCount(content: string): number {
  return content.split('\n').length;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ path, content }) => {
  const [copied, setCopied] = React.useState(false);
  const lang = detectLanguage(path);
  const lines = content.split('\n');
  const lineCount = lines.length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const ext = path.split('.').pop()?.toUpperCase() ?? 'TXT';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100 bg-surface-50 rounded-t-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-surface-700">{path}</span>
            <span className="badge-neutral text-[10px] px-1.5 py-0.5">{ext}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-surface-400">{lineCount} lines</span>
          <button
            onClick={handleCopy}
            className="btn-ghost py-1.5 px-3 text-xs"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check size={13} className="text-green-500" />
                <span className="text-green-600">Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code body */}
      <div className="flex-1 overflow-auto bg-surface-900 rounded-b-xl">
        <div className="flex min-w-0">
          {/* Line numbers */}
          <div className="select-none py-4 pl-4 pr-3 text-right border-r border-surface-700 shrink-0">
            {lines.map((_, i) => (
              <div key={i} className="text-xs font-mono leading-6 text-surface-600">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code content */}
          <pre className="flex-1 py-4 pl-4 pr-4 overflow-x-auto">
            <code className="text-xs font-mono leading-6 text-surface-200">
              {lines.map((line, i) => (
                <div key={i} className="hover:bg-surface-800 transition-colors duration-75 px-1 -mx-1 rounded">
                  {renderLine(line, lang)}
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

function renderLine(line: string, lang: string): React.ReactNode {
  if (lang === 'typescript' || lang === 'tsx' || lang === 'javascript' || lang === 'jsx') {
    return <ColorizedLine line={line} />;
  }
  if (lang === 'json') {
    return <JsonLine line={line} />;
  }
  if (lang === 'toml') {
    return <TomlLine line={line} />;
  }
  return <span>{line || '\u200B'}</span>;
}

const ColorizedLine: React.FC<{ line: string }> = ({ line }) => {
  const empty = line.trim() === '';
  if (empty) return <span>{'\u200B'}</span>;

  const isComment = /^\s*(\/\/|\/\*|\*)/.test(line);
  const isImport = /^\s*(import|export)\s/.test(line);
  const isConst = /^\s*(const|let|var|type|interface|enum)\s/.test(line);
  const isReturn = /^\s*return\s/.test(line);

  let color = 'text-surface-200';
  if (isComment) color = 'text-surface-500 italic';
  else if (isImport) color = 'text-violet-300';
  else if (isConst) color = 'text-surface-200';

  return (
    <span className={color}>
      {line.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g).map((part, i) => {
        if (i % 2 === 1) return <span key={i} className="text-green-400">{part}</span>;
        return (
          <span key={i}>
            {part.split(/\b(import|export|from|const|let|var|type|interface|return|async|await|function|class|extends|new|if|else|for|while|true|false|null|undefined|void)\b/g).map((seg, j) => {
              if (j % 2 === 1) return <span key={j} className="text-violet-400">{seg}</span>;
              return <span key={j}>{seg}</span>;
            })}
          </span>
        );
      })}
    </span>
  );
};

const JsonLine: React.FC<{ line: string }> = ({ line }) => {
  if (!line.trim()) return <span>{'\u200B'}</span>;
  const isKey = /^\s*"[^"]+"\s*:/.test(line);
  if (isKey) {
    return (
      <span>
        {line.split(/^(\s*"[^"]+")(\s*:\s*)(.*)$/).map((part, i) => {
          if (i === 1) return <span key={i} className="text-blue-400">{part}</span>;
          if (i === 3) {
            const isStr = /^"/.test(part.trim());
            const isNum = /^\d/.test(part.trim());
            const isBool = /^(true|false|null)/.test(part.trim());
            return (
              <span key={i} className={isStr ? 'text-green-400' : isNum ? 'text-orange-400' : isBool ? 'text-violet-400' : 'text-surface-200'}>
                {part}
              </span>
            );
          }
          return <span key={i} className="text-surface-400">{part}</span>;
        })}
      </span>
    );
  }
  return <span className="text-surface-200">{line}</span>;
};

const TomlLine: React.FC<{ line: string }> = ({ line }) => {
  if (!line.trim()) return <span>{'\u200B'}</span>;
  if (/^\s*#/.test(line)) return <span className="text-surface-500 italic">{line}</span>;
  if (/^\s*\[/.test(line)) return <span className="text-yellow-400 font-semibold">{line}</span>;
  if (/^\s*\w+\s*=/.test(line)) {
    const parts = line.split('=');
    return (
      <span>
        <span className="text-blue-400">{parts[0]}</span>
        <span className="text-surface-400">=</span>
        <span className="text-green-400">{parts.slice(1).join('=')}</span>
      </span>
    );
  }
  return <span className="text-surface-200">{line}</span>;
};

export default CodeViewer;
