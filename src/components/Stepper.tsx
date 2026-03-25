import React from 'react';
import { Check, Loader2 } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  sublabel?: string;
}

interface StepperProps {
  steps: Step[];
  current: number; // 1-based
}

export const Stepper: React.FC<StepperProps> = ({ steps, current }) => {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, idx) => {
        const num = idx + 1;
        const isComplete = num < current;
        const isActive = num === current;
        const isPending = num > current;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1.5">
              {/* Circle */}
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300
                  ${isComplete ? 'bg-green-500 text-white shadow-sm' : ''}
                  ${isActive ? 'bg-forge-600 text-white shadow-glow-sm ring-4 ring-forge-100' : ''}
                  ${isPending ? 'bg-white border-2 border-surface-200 text-surface-400' : ''}
                `}
              >
                {isComplete ? (
                  <Check size={16} strokeWidth={2.5} />
                ) : isActive ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <span>{num}</span>
                )}
              </div>

              {/* Label */}
              <div className="text-center">
                <p className={`text-xs font-semibold whitespace-nowrap transition-colors duration-200
                  ${isActive ? 'text-forge-700' : isComplete ? 'text-green-600' : 'text-surface-400'}
                `}>
                  {step.label}
                </p>
                {step.sublabel && (
                  <p className="text-[10px] text-surface-400 mt-0.5">{step.sublabel}</p>
                )}
              </div>
            </div>

            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div
                className={`
                  h-0.5 w-12 sm:w-20 mx-1 mb-5 rounded-full transition-all duration-500
                  ${num < current ? 'bg-green-400' : 'bg-surface-200'}
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;
