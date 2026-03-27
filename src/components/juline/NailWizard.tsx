import { useState, useCallback, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { NailDesign } from '@/data/juline-options';
import {
  STEPS,
  nailShapes,
  baseColors,
  designElements,
  styles,
  accents,
  finishes,
} from '@/data/juline-options';
import { ShapeGrid, ColorGrid, PillGrid } from './OptionGrid';
import SharePanel from './SharePanel';
import AIPreview from './AIPreview';

interface NailWizardProps {
  design: NailDesign;
  setDesign: React.Dispatch<React.SetStateAction<NailDesign>>;
}

export default function NailWizard({ design, setDesign }: NailWizardProps) {
  const [step, setStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch swipe handling
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 60) {
      // RTL: swipe right = next, swipe left = back
      if (deltaX > 0 && step < STEPS.length - 1) setStep(s => s + 1);
      if (deltaX < 0 && step > 0) setStep(s => s - 1);
    }
  };

  const handleSingleSelect = useCallback(
    (field: keyof NailDesign, id: string) => {
      setDesign(prev => ({ ...prev, [field]: id }));
    },
    [setDesign]
  );

  const handleMultiSelect = useCallback(
    (field: 'designElements' | 'accents', id: string) => {
      setDesign(prev => {
        const current = prev[field];
        if (id === 'none') return { ...prev, [field]: ['none'] };
        const without = current.filter(x => x !== 'none');
        return {
          ...prev,
          [field]: without.includes(id)
            ? without.filter(x => x !== id)
            : [...without, id],
        };
      });
    },
    [setDesign]
  );

  const goNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep(s => Math.max(s - 1, 0));

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <StepHeader title="באיזו צורה את רוצה?" subtitle="בחרי את צורת הציפורן" />
            <ShapeGrid
              shapes={nailShapes}
              selected={design.shape}
              onSelect={(id) => handleSingleSelect('shape', id)}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <StepHeader title="איזה צבע בסיס?" subtitle="בחרי את הצבע הראשי" />
            <ColorGrid
              colors={baseColors}
              selected={design.baseColor}
              onSelect={(id) => handleSingleSelect('baseColor', id)}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <StepHeader title="אלמנטים עיצוביים" subtitle="בחרי אחד או יותר (או דלגי)" />
            <PillGrid
              options={designElements}
              selected={design.designElements}
              onSelect={(id) => handleMultiSelect('designElements', id)}
              multiSelect
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <StepHeader title="באיזה סגנון?" subtitle="בחרי את הוייב הכללי" />
            <PillGrid
              options={styles}
              selected={design.style}
              onSelect={(id) => handleSingleSelect('style', id)}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <StepHeader title="פרטי הדגשה" subtitle="בחרי תוספות מיוחדות (אפשר כמה!)" />
            <PillGrid
              options={accents}
              selected={design.accents}
              onSelect={(id) => handleMultiSelect('accents', id)}
              multiSelect
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <StepHeader title="פיניש" subtitle="איך תרצי שזה ירגיש?" />
            <PillGrid
              options={finishes}
              selected={design.finish}
              onSelect={(id) => handleSingleSelect('finish', id)}
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-5">
            <StepHeader title="סיכום העיצוב שלך" subtitle="בדקי שהכל נראה טוב" />
            <SummaryView design={design} onGoToStep={setStep} />
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#555]">הערות נוספות</label>
              <Textarea
                placeholder="יש לך בקשה מיוחדת? כתבי כאן..."
                value={design.notes}
                onChange={(e) =>
                  setDesign(prev => ({ ...prev, notes: e.target.value }))
                }
                className="border-[#E8D5D5] focus:border-[#B76E79] resize-none bg-white"
                rows={3}
                dir="rtl"
              />
            </div>
            <AIPreview design={design} />
            <SharePanel design={design} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="space-y-4"
    >
      {/* Progress bar */}
      <ProgressBar currentStep={step} totalSteps={STEPS.length} />

      {/* Step content with animation */}
      <div key={step} className="juline-step-enter">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        {step > 0 && (
          <Button
            onClick={goBack}
            variant="outline"
            className="flex-1 border-[#E8D5D5] text-[#888] hover:bg-[#FFF8F9] gap-1"
            size="lg"
          >
            <ChevronRight className="w-4 h-4" />
            חזרה
          </Button>
        )}
        {step < STEPS.length - 1 && (
          <Button
            onClick={goNext}
            className="flex-1 bg-[#B76E79] hover:bg-[#A05D67] text-white gap-1"
            size="lg"
          >
            הבא
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ===== Sub-components =====

function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const progress = ((currentStep) / (totalSteps - 1)) * 100;

  return (
    <div className="space-y-2">
      {/* Step indicators - mobile shows simplified */}
      <div className="flex justify-between items-center px-1">
        <span className="text-xs text-[#B76E79] font-semibold">
          {STEPS[currentStep].nameHe}
        </span>
        <span className="text-xs text-gray-400">
          {currentStep + 1} / {totalSteps}
        </span>
      </div>

      {/* Bar */}
      <div className="w-full h-2 bg-[#F5E6E8] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #F4A3B5, #B76E79)',
          }}
        />
      </div>

      {/* Step dots - hidden on mobile */}
      <div className="hidden sm:flex justify-between px-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-col items-center gap-1">
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i <= currentStep
                  ? 'bg-[#B76E79]'
                  : 'bg-[#E8D5D5]'
              }`}
            />
            <span className={`text-[10px] ${
              i === currentStep ? 'text-[#B76E79] font-semibold' : 'text-gray-400'
            }`}>
              {s.nameHe}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center space-y-1">
      <h3 className="text-lg font-bold text-[#333]">{title}</h3>
      <p className="text-sm text-gray-400">{subtitle}</p>
    </div>
  );
}

function SummaryView({
  design,
  onGoToStep,
}: {
  design: NailDesign;
  onGoToStep: (step: number) => void;
}) {
  const findName = (
    arr: Array<{ id: string; nameHe: string }>,
    id: string
  ) => arr.find(x => x.id === id)?.nameHe || '-';

  const findNames = (
    arr: Array<{ id: string; nameHe: string }>,
    ids: string[]
  ) => ids.map(id => findName(arr, id)).join(', ') || '-';

  const rows = [
    { label: 'צורה', value: findName(nailShapes, design.shape), step: 0 },
    { label: 'צבע בסיס', value: findName(baseColors, design.baseColor), step: 1 },
    { label: 'עיצוב', value: findNames(designElements, design.designElements), step: 2 },
    { label: 'סגנון', value: findName(styles, design.style), step: 3 },
    { label: 'הדגשות', value: findNames(accents, design.accents), step: 4 },
    { label: 'פיניש', value: findName(finishes, design.finish), step: 5 },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#F0E0E2] divide-y divide-[#F5EAEB]">
      {rows.map(row => (
        <div
          key={row.label}
          className="flex items-center justify-between px-4 py-3"
        >
          <div className="flex-1 min-w-0">
            <span className="text-xs text-gray-400 block">{row.label}</span>
            <span className="text-sm font-medium text-[#333] truncate block">
              {row.value}
            </span>
          </div>
          <button
            onClick={() => onGoToStep(row.step)}
            className="text-xs text-[#B76E79] hover:text-[#8B4D57] font-medium shrink-0 mr-3"
          >
            שנה
          </button>
        </div>
      ))}
    </div>
  );
}
