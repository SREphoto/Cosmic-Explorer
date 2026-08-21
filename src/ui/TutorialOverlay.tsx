import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../core/AudioEngine';
import { 
  Rocket, 
  Orbit, 
  Zap, 
  Compass, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Star, 
  Flame
} from 'lucide-react';

interface TutorialOverlayProps {
  onComplete: (dontShowAgain: boolean) => void;
  onClose: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(true);

  // Interactive Practice Pad State for Step 2
  const [isPracticingCharge, setIsPracticingCharge] = useState<boolean>(false);
  const [practiceChargeRatio, setPracticeChargeRatio] = useState<number>(0);
  const [practiceLaunchSuccess, setPracticeLaunchSuccess] = useState<boolean>(false);
  const practiceIntervalRef = useRef<number | null>(null);

  const steps = [
    {
      id: 'ORBIT',
      title: 'Orbital Running & Rotation',
      subtitle: 'You are an intrepid cosmic explorer',
      icon: Orbit,
      badgeColor: 'from-sky-500 to-blue-600',
      description:
        'When you land on a celestial planet, you automatically lock to its surface and start running in orbit. Observe the planet’s rotational speed to time your next move.',
      tip: 'Completing a full 360° orbit rewards bonus stars and score multipliers!'
    },
    {
      id: 'CHARGE',
      title: 'Hold-to-Charge Launch Power',
      subtitle: 'Control your flight velocity with precision',
      icon: Zap,
      badgeColor: 'from-amber-500 to-orange-600',
      description:
        'Touch & hold anywhere on screen (or hold Spacebar / Mouse) to build launch power. Release at peak charge to catapult across deep space!',
      tip: 'Try the interactive simulator below to feel the charge curve.'
    },
    {
      id: 'TIMING',
      title: 'Aiming & Orbital Slingshots',
      subtitle: 'Master the planetary trajectory',
      icon: Compass,
      badgeColor: 'from-emerald-500 to-teal-600',
      description:
        'The glowing trajectory line reveals your flight path. Release your hold when your trajectory points directly at your next target planet or celestial sun.',
      tip: 'The longer your perfect jump streak, the higher your score combo multiplier!'
    },
    {
      id: 'GRAVITY',
      title: 'Cosmic Gravity Wells',
      subtitle: 'Harness planetary pull to bend your course',
      icon: Rocket,
      badgeColor: 'from-purple-500 to-indigo-600',
      description:
        'Massive planets exert intense gravitational attraction! Gravitational fields curve your trajectory into dramatic slingshots and effortless orbital captures.',
      tip: 'If you drift into deep space, trigger your Jetpack Rescue before freezing!'
    },
    {
      id: 'VOID_AND_LOOT',
      title: 'Outrun the Dark Void',
      subtitle: 'Ascend to the stars and gather cosmic loot',
      icon: ShieldAlert,
      badgeColor: 'from-rose-500 to-red-600',
      description:
        'A dark cosmic void ascends from below. Landing on new unvisited planets or grabbing Comet Power-Ups pushes the void back down and buys you time.',
      tip: 'Collect Stars & Diamonds to unlock aviator suits, rocket boots, and cosmic upgrades in the Shop.'
    }
  ];

  // Step 2 interactive charge simulator handler
  const handlePracticeStart = () => {
    if (practiceLaunchSuccess) setPracticeLaunchSuccess(false);
    setIsPracticingCharge(true);
    setPracticeChargeRatio(0.1);
    audioEngine.playChargeSound(0.2);

    if (practiceIntervalRef.current) clearInterval(practiceIntervalRef.current);
    practiceIntervalRef.current = window.setInterval(() => {
      setPracticeChargeRatio((prev) => {
        const next = Math.min(1.0, prev + 0.08);
        audioEngine.playChargeSound(next);
        return next;
      });
    }, 40);
  };

  const handlePracticeRelease = () => {
    if (!isPracticingCharge) return;
    setIsPracticingCharge(false);
    if (practiceIntervalRef.current) {
      clearInterval(practiceIntervalRef.current);
      practiceIntervalRef.current = null;
    }

    audioEngine.playJump();
    setPracticeLaunchSuccess(true);
    setTimeout(() => {
      setPracticeChargeRatio(0);
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (practiceIntervalRef.current) {
        clearInterval(practiceIntervalRef.current);
      }
    };
  }, []);

  const handleNext = () => {
    audioEngine.playClick();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    audioEngine.playClick();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    audioEngine.playPowerUpCollect();
    onComplete(dontShowAgain);
  };

  const stepData = steps[currentStep];
  const StepIcon = stepData.icon;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none text-white overflow-y-auto">
      <div className="bg-slate-900/95 border border-sky-500/40 rounded-3xl w-full max-w-md p-5 sm:p-6 flex flex-col items-center text-center shadow-2xl shadow-sky-500/10 relative my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header & Progress Pills */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-sky-400 tracking-wider uppercase">
              Flight Academy
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] font-mono text-slate-400">
              {currentStep + 1} / {steps.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all duration-200 px-2 py-1 rounded-lg hover:bg-slate-800 btn-grow-sm glow-subtle-hover"
          >
            Skip
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="w-full grid grid-cols-5 gap-1.5 mb-5">
          {steps.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => {
                audioEngine.playClick();
                setCurrentStep(idx);
              }}
              className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                idx === currentStep
                  ? 'bg-sky-400 shadow-sm shadow-sky-400/50'
                  : idx < currentStep
                  ? 'bg-sky-700'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Main Step Graphic & Icon */}
        <div className="relative mb-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stepData.badgeColor} flex items-center justify-center shadow-lg shadow-sky-500/20 ring-4 ring-slate-800/80`}>
            <StepIcon className="w-8 h-8 text-white stroke-[2.2]" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
          {stepData.title}
        </h3>
        <p className="text-xs font-medium text-sky-300/90 mb-3">
          {stepData.subtitle}
        </p>

        {/* Visual Animated Interactive Graphic for each step */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-4 flex flex-col items-center justify-center min-h-[135px]">
          {currentStep === 0 && (
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Mini Orbit Planet Canvas Simulation */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-sky-400 shadow-inner flex items-center justify-center border border-emerald-300/40">
                  <div className="w-3 h-3 rounded-full bg-emerald-300/30" />
                </div>
                {/* Orbiting Player Indicator */}
                <div className="absolute inset-0 rounded-full border border-dashed border-sky-400/50 animate-spin" style={{ animationDuration: '4s' }}>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-400 border-2 border-slate-950 shadow-md flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-slate-950" />
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Automatic Orbital Rotation</span>
            </div>
          )}

          {currentStep === 1 && (
            <div className="w-full flex flex-col items-center gap-2 py-1">
              <span className="text-[11px] text-slate-300 font-medium">
                Hold button below to test charge:
              </span>

              {/* Power Charge Bar */}
              <div className="w-full max-w-[220px] bg-slate-900 rounded-full h-4 p-0.5 border border-slate-700 overflow-hidden relative">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-75"
                  style={{ width: `${Math.round(practiceChargeRatio * 100)}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white drop-shadow">
                  {Math.round(practiceChargeRatio * 100)}% POWER
                </span>
              </div>

              {/* Interactive Practice Button */}
              <button
                onMouseDown={handlePracticeStart}
                onMouseUp={handlePracticeRelease}
                onTouchStart={handlePracticeStart}
                onTouchEnd={handlePracticeRelease}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all duration-150 flex items-center gap-1.5 shadow-lg select-none ${
                  isPracticingCharge
                    ? 'bg-amber-400 text-slate-950 scale-95 ring-4 ring-amber-400/40'
                    : practiceLaunchSuccess
                    ? 'bg-emerald-500 text-white animate-bounce'
                    : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                }`}
              >
                {isPracticingCharge ? (
                  <>
                    <Flame className="w-3.5 h-3.5 animate-pulse" /> CHARGING...
                  </>
                ) : practiceLaunchSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> LAUNCHED!
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" /> HOLD TO CHARGE
                  </>
                )}
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="relative w-48 h-16 flex items-center justify-between px-2">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold border border-emerald-400/40 shadow">
                  HOME
                </div>
                {/* Trajectory dotted line */}
                <div className="flex-1 flex items-center justify-center relative">
                  <div className="w-full h-0.5 border-t-2 border-dashed border-sky-400 animate-pulse" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-sky-400" />
                </div>
                <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-[10px] font-bold border border-sky-400/40 shadow">
                  NEXT
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Release along the trajectory line</span>
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="relative w-48 h-16 flex items-center justify-center">
                {/* Gravity Curve Visualization */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-500 border border-purple-300/50 shadow flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border border-purple-400/30 border-dotted animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div className="absolute top-2 left-2 text-[10px] text-amber-300 font-bold flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" /> Gravity Slingshot!
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Heavy planets bend flight into orbit</span>
            </div>
          )}

          {currentStep === 4 && (
            <div className="flex items-center justify-around w-full px-2 py-1">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 shadow">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <span className="text-[10px] text-amber-300 font-bold">Stars</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-rose-950/60 border border-rose-500 flex items-center justify-center text-rose-400 shadow animate-pulse">
                  <Flame className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-rose-400 font-bold">Dark Void</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-300 shadow">
                  <Rocket className="w-4 h-4 text-sky-400" />
                </div>
                <span className="text-[10px] text-sky-300 font-bold">Jetpack</span>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Explanation Text */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
          {stepData.description}
        </p>

        {/* Pro Tip Box */}
        <div className="w-full bg-sky-950/50 border border-sky-500/20 rounded-xl px-3 py-2 text-left flex items-start gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-sky-200/90 leading-tight">
            <strong className="text-amber-300">Tip:</strong> {stepData.tip}
          </p>
        </div>

        {/* Checkbox: Don't show again */}
        <label className="flex items-center gap-2 mb-4 cursor-pointer text-xs text-slate-400 hover:text-slate-200 select-none">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500 cursor-pointer"
          />
          <span>Don't show tutorial automatically again</span>
        </label>

        {/* Action Button Controls */}
        <div className="w-full flex items-center gap-2">
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-all duration-200 flex items-center gap-1 btn-grow-sm glow-subtle-hover text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-slate-950 font-black py-2.5 sm:py-3 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide btn-grow glow-sky-hover"
          >
            {currentStep < steps.length - 1 ? (
              <>
                <span>NEXT STEP</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 fill-current" />
                <span>START VOYAGE!</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
