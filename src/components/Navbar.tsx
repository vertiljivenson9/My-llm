import React from 'react';
import { Github, ExternalLink, Menu, X } from 'lucide-react';
import { Logo } from './Logo';

interface NavbarProps {
  currentStep?: number;
  totalSteps?: number;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Logo size={32} variant="full" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="nav-link">How it works</a>
          <a href="https://developers.cloudflare.com/workers-ai/" target="_blank" rel="noopener noreferrer" className="nav-link flex items-center gap-1.5">
            Workers AI
            <ExternalLink size={11} className="opacity-60" />
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="nav-link flex items-center gap-1.5">
            GitHub
            <ExternalLink size={11} className="opacity-60" />
          </a>
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold text-green-700">Workers AI active</span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary py-2 px-3"
          >
            <Github size={15} />
            <span className="text-sm">GitHub</span>
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden btn-ghost p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-surface-200 bg-white animate-slide-down">
          <nav className="flex flex-col p-4 gap-1">
            {[
              { label: 'How it works', href: '#how-it-works' },
              { label: 'Workers AI docs', href: 'https://developers.cloudflare.com/workers-ai/' },
              { label: 'GitHub', href: 'https://github.com' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-surface-700 hover:bg-surface-50 hover:text-surface-900 transition-colors"
                onClick={() => setMenuOpen(false)}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
