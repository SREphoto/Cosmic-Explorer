import React, { useState } from 'react';
import {
  Rocket,
  Compass,
  Zap,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ShieldAlert,
  Flame,
  MousePointer,
  Fingerprint
} from 'lucide-react';
import { audioEngine } from '../core/AudioEngine';

interface OnboardingTutorialOverlayProps {
  onComplete: () => void;
}

interface TutorialStep {
  title: string;
  subtitle: string;
  description: string;
  highlightIcon: React.ReactNode;
  tip: string;
  demoVisual: 'CHARGE' | 'AIM' | 'GRAVITY' | 'HAZARD' | 'JETPACK';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: '1. Hold Screen to Charge Jump',
    subtitle: 'Orbital Propulsion System',
    description:
      'Touch and HOLD down anywhere on the screen (or hold Space / Mouse Click). Watch your power meter rise and boots ignite with energy!',
    highlightIcon: <MousePointer className="w-8 h-8 text-amber-400 animate-bounce" />,
    tip: 'Longer hold gives higher velocity and longer orbital leap distance.',
    demoVisual: 'CHARGE'
  },
  {
    title: '2. Align Your Orbital Angle',
    subtitle: 'Trajectory Prediction',
    description:
      'As Leo rotates around the planet, the white trajectory prediction line sweeps across space. Watch for the path to intersect your next planet!',
    highlightIcon: <Compass className="w-8 h-8 text-sky-400 animate-spin-slow" />,
    tip: 'Timing is everything! Leap when the trajectory dots touch the target planet.',
    demoVisual: 'AIM'
  },
  {
    title: '3. Release to Launch & Feel Gravity',
    subtitle: 'Realistic Planetary Gravitation',
    description:
      'RELEASE your hold to leap into space! Nearby planets will bend your flight path with strong gravitational pull and slingshot physics.',
    highlightIcon: <Rocket className="w-8 h-8 text-emerald-400 animate-pulse" />,
    tip: 'Slingshot around large planets for massive speed boosts and bonus stars!',
    demoVisual: 'GRAVITY'
  },
  {
    title: '4. Checkpoint Goals & Dark Planet Curse',
    subtitle: 'Constellation Expedition',
    description:
      'Land on large golden Checkpoint Planets to unlock permanent fast-travel bases. Beware of mysterious Dark Planets—staying on them too long will turn Leo to stone!',
    highlightIcon: <ShieldAlert className="w-8 h-8 text-purple-400" />,
    tip: 'If you land on a Dark Planet, leap away immediately before the stone curse completes!',
    demoVisual: 'HAZARD'
  },
  {
    title: '5. Emergency Jetpack Thruster',
    subtitle: 'Deep Space Recovery',
    description:
      'If you overshoot into deep freezing space, TAP the screen once while airborne to ignite your emergency Jetpack Thruster toward the nearest world.',
    highlightIcon: <Flame className="w-8 h-8 text-amber-500 animate-pulse" />,
    tip: 'Upgrade Jetpack capacity in the Lab to carry up to 5 emergency rescue charges.',
    demoVisual: 'JETPACK'
  }
];

export const OnboardingTutorialOverlay: React.FC<OnboardingTutorialOverlayProps> = ({ onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = TUTORIAL_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    audioEngine.playMenuClick();
    if (isLastStep) {
      audioEngine.playPowerUpCollect();
      onComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    audioEngine.playMenuClick();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in select-none text-white">
      <div className="relative w-full max-w-lg bg-slate-900/95 border border-sky-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-amber-200 to-sky-400">
                ASTRONAUT ACADEMY
              </h3>
              <p className="text-[10px] text-slate-400">Flight Manual & Orbital Controls</p>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="text-xs text-slate-400 hover:text-slate-200 font-bold px-2.5 py-1 rounded-lg bg-slate-800/80 transition-all duration-200 btn-grow-sm glow-subtle-hover"
          >
            Skip Manual
          </button>
        </div>

        {/* Step Indicator Dots */}
        <div className="flex items-center justify-center gap-2 py-3">
          {TUTORIAL_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStepIndex
                  ? 'w-8 bg-gradient-to-r from-sky-400 to-amber-400 shadow-md shadow-sky-500/30'
                  : idx < currentStepIndex
                  ? 'w-2.5 bg-emerald-400'
                  : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Dynamic Visual Demo Canvas / Graphic Card */}
        <div className="my-2 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[140px] shadow-inner">
          {/* Animated visual representation */}
          <div className="relative flex items-center justify-center w-full">
            {currentStep.demoVisual === 'CHARGE' && (
              <div className="flex flex-col items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-400/80 bg-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-pulse">
                    <Fingerprint className="w-8 h-8 text-amber-300" />
                  </div>
                  <div className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black tracking-wider animate-bounce">
                    HOLD SCREEN
                  </div>
                </div>
                <div className="w-48 h-3 rounded-full bg-slate-800 overflow-hidden border border-amber-500/40">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 w-3/4 rounded-full animate-pulse" />
                </div>
              </div>
            )}

            {currentStep.demoVisual === 'AIM' && (
              <div className="flex items-center justify-center gap-6">
                <div className="w-14 h-14 rounded-full bg-emerald-700 border-2 border-emerald-400 flex items-center justify-center shadow-md relative">
                  <div className="w-4 h-4 rounded-full bg-amber-300 absolute -top-2 left-1/2 -translate-x-1/2 border border-slate-950 animate-ping" />
                  <span className="text-[10px] font-bold">Orbit</span>
                </div>
                <div className="flex items-center gap-1.5 text-sky-400">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                  <span className="w-2 h-2 rounded-full bg-sky-300" />
                  <span className="w-2 h-2 rounded-full bg-sky-200" />
                  <ArrowRight className="w-5 h-5 text-sky-400" />
                </div>
                <div className="w-12 h-12 rounded-full bg-sky-700 border-2 border-sky-400 flex items-center justify-center shadow-md">
                  <span className="text-[10px] font-bold">Target</span>
                </div>
              </div>
            )}

            {currentStep.demoVisual === 'GRAVITY' && (
              <div className="flex flex-col items-center gap-2">
                <div className="relative flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-indigo-900 border-2 border-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <span className="text-xs font-bold text-indigo-200">Gravity Field</span>
                  </div>
                  <div className="absolute w-28 h-28 rounded-full border border-dashed border-sky-400/40 animate-spin-slow" />
                  <Rocket className="w-6 h-6 text-amber-300 absolute -top-4 -right-1 rotate-45 animate-bounce" />
                </div>
                <span className="text-[10px] font-bold text-sky-300">Curved Slingshot Flight Path</span>
              </div>
            )}

            {currentStep.demoVisual === 'HAZARD' && (
              <div className="flex items-center justify-center gap-6">
                <div className="w-14 h-14 rounded-full bg-amber-500/30 border-2 border-amber-400 flex flex-col items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span className="text-[8px] font-black text-amber-300">GOAL</span>
                </div>
                <span className="text-xs font-black text-slate-400">VS</span>
                <div className="w-14 h-14 rounded-full bg-purple-950 border-2 border-purple-500 flex flex-col items-center justify-center shadow-md relative">
                  <ShieldAlert className="w-5 h-5 text-purple-400 animate-pulse" />
                  <span className="text-[8px] font-black text-purple-300">DARK</span>
                </div>
              </div>
            )}

            {currentStep.demoVisual === 'JETPACK' && (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500 text-amber-400 shadow-md">
                    <Flame className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-amber-300">TAP IN AIR</span>
                    <p className="text-[10px] text-slate-400">Emergency Booster Ignition</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 py-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-400 bg-sky-950/70 px-2 py-0.5 rounded-full border border-sky-500/30">
                {currentStep.subtitle}
              </span>
            </div>
            <h4 className="text-lg sm:text-xl font-black text-slate-100">{currentStep.title}</h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Pro-Tip Box */}
          <div className="mt-3 bg-sky-950/40 border border-sky-500/30 rounded-xl p-2.5 flex items-start gap-2 text-xs text-sky-200">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="leading-snug">{currentStep.tip}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          {currentStepIndex > 0 ? (
            <button
              onClick={() => {
                audioEngine.playMenuClick();
                setCurrentStepIndex((prev) => prev - 1);
              }}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all duration-200 btn-grow-sm glow-subtle-hover border border-slate-700/60"
            >
              Previous
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="flex-1 max-w-[200px] bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-black text-sm py-2.5 rounded-2xl shadow-lg flex items-center justify-center gap-1.5 transition-all duration-200 ml-auto btn-grow glow-sky-hover"
          >
            <span>{isLastStep ? "Launch Now!" : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
