import React from 'react';
import {
  Layers, Zap, Globe, Triangle, Code2, Database,
  Check, type LucideProps
} from 'lucide-react';
import { type StackOption, STACK_OPTIONS } from '../types';

type LucideIcon = React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;

const ICON_MAP: Record<string, LucideIcon> = {
  layers: Layers, zap: Zap, globe: Globe, triangle: Triangle,
  'code-2': Code2, database: Database,
};

interface StackSelectorProps {
  value: string;
  onChange: (id: string) => void;
}

export const StackSelector: React.FC<StackSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {STACK_OPTIONS.map((option) => {
        const Icon = ICON_MAP[option.icon] ?? Layers;
        const isSelected = value === option.id;

        return (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`
              relative flex flex-col items-start gap-3 p-4 rounded-xl text-left
              border transition-all duration-150
              ${isSelected
                ? 'border-forge-400 bg-forge-50 shadow-glow-sm ring-2 ring-forge-200'
                : 'border-surface-200 bg-white hover:border-surface-300 hover:bg-surface-50 shadow-card hover:shadow-card-hover'}
            `}
          >
            {/* Selected check */}
            {isSelected && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-forge-600 flex items-center justify-center animate-fade-in">
                <Check size={11} className="text-white" strokeWidth={3} />
              </div>
            )}

            {/* Icon */}
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              ${isSelected ? 'bg-forge-600 text-white' : 'bg-surface-100 text-surface-500'}
              transition-all duration-150
            `}>
              <Icon size={18} />
            </div>

            {/* Content */}
            <div>
              <h3 className={`text-sm font-semibold mb-1 ${isSelected ? 'text-forge-800' : 'text-surface-800'}`}>
                {option.label}
              </h3>
              <p className="text-xs text-surface-500 leading-relaxed">{option.description}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mt-auto">
              {option.tags.map((tag) => (
                <span
                  key={tag}
                  className={`
                    text-[10px] font-medium px-2 py-0.5 rounded-md
                    ${isSelected ? 'bg-forge-100 text-forge-700' : 'bg-surface-100 text-surface-500'}
                  `}
                >
                  {tag}
                </span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default StackSelector;
