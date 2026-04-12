import { useState } from 'react';
import { Sparkles, Wrench, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { NailDesign } from '@/data/juline-options';
import { DEFAULT_DESIGN } from '@/data/juline-options';
import NailPreview from '@/components/juline/NailPreview';
import NailWizard from '@/components/juline/NailWizard';
import StudioMode from '@/components/juline/StudioMode';
import AIPreview from '@/components/juline/AIPreview';

type Mode = 'client' | 'studio';

export default function JulineStudio() {
  const [mode, setMode] = useState<Mode>('client');
  const [design, setDesign] = useState<NailDesign>({ ...DEFAULT_DESIGN });

  const handleReset = () => {
    setDesign({ ...DEFAULT_DESIGN });
  };

  const hasSelections = design.shape || design.baseColor;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-[#FFF0F2]" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#F0E0E2]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#B76E79]" />
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-l from-[#B76E79] to-[#D4A3B0] bg-clip-text text-transparent">
              Likjulim AI Nail Studio
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-gray-400 hover:text-[#B76E79] gap-1 hidden sm:flex"
            >
              <RotateCcw className="w-4 h-4" />
              איפוס
            </Button>

            {/* Mode toggle */}
            <div className="flex items-center gap-2">
              <span className={`text-xs ${mode === 'client' ? 'text-[#B76E79] font-semibold' : 'text-gray-400'}`}>
                לקוחה
              </span>
              <Switch
                checked={mode === 'studio'}
                onCheckedChange={(checked) => setMode(checked ? 'studio' : 'client')}
                className="data-[state=checked]:bg-[#B76E79]"
              />
              <span className={`text-xs flex items-center gap-1 ${mode === 'studio' ? 'text-[#B76E79] font-semibold' : 'text-gray-400'}`}>
                <Wrench className="w-3 h-3" />
                סטודיו
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-4 sm:py-6">
        {/* Mobile layout: preview on top, wizard/studio below */}
        <div className="md:hidden space-y-4">
          {/* Sticky preview for mobile */}
          <div className="sticky top-[57px] z-40 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#F0E0E2] shadow-sm p-2">
            <NailPreview design={design} compact />
          </div>

          {/* Wizard or Studio */}
          <div className="bg-white rounded-2xl border border-[#F0E0E2] shadow-sm p-4">
            {mode === 'client' ? (
              <NailWizard design={design} setDesign={setDesign} onReset={handleReset} />
            ) : (
              <StudioMode design={design} setDesign={setDesign} />
            )}
          </div>
        </div>

        {/* Desktop layout: side-by-side */}
        <div className="hidden md:grid md:grid-cols-[1fr_340px] gap-6">
          {/* Left: wizard/studio (scrollable) */}
          <div className="bg-white rounded-2xl border border-[#F0E0E2] shadow-sm p-6 min-h-[600px]">
            {mode === 'client' ? (
              <NailWizard design={design} setDesign={setDesign} onReset={handleReset} />
            ) : (
              <StudioMode design={design} setDesign={setDesign} />
            )}
          </div>

          {/* Right: preview (sticky) */}
          <div className="space-y-4">
            <div className="sticky top-[73px]">
              <div className="bg-white rounded-2xl border border-[#F0E0E2] shadow-sm p-6">
                <h3 className="text-sm font-semibold text-[#B76E79] text-center mb-2">
                  תצוגה מקדימה
                </h3>
                <NailPreview design={design} />

                {/* Quick info under preview */}
                <div className="mt-4 pt-4 border-t border-[#F5EAEB] space-y-1">
                  {design.shape && (
                    <QuickInfo label="צורה" value={design.shape} />
                  )}
                  {design.length && (
                    <QuickInfo label="אורך" value={design.length} />
                  )}
                  {design.baseColor && (
                    <QuickInfo label="צבע" value={design.baseColor} />
                  )}
                  {design.style && (
                    <QuickInfo label="סגנון" value={design.style} />
                  )}
                  {design.finish && (
                    <QuickInfo label="פיניש" value={design.finish} />
                  )}
                </div>
              </div>

              {/* AI Preview for desktop */}
              {hasSelections && (
                <div className="mt-3">
                  <AIPreview design={design} />
                </div>
              )}

              {/* Reset button for desktop */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="w-full mt-2 text-gray-400 hover:text-[#B76E79] gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                התחלה מחדש
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function QuickInfo({ label, value }: { label: string; value: string }) {
  const displayValue = value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-400">{label}</span>
      <span className="text-[#555] font-medium">{displayValue}</span>
    </div>
  );
}
