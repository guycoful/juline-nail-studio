import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { cn } from '@/lib/utils';
import type { NailShape, ColorOption, DesignOption } from '@/data/juline-options';
import { FINGER_NAMES_HE, isCustomColor, getCustomHex } from '@/data/juline-options';

// ===== Shape Cards =====

interface ShapeGridProps {
  shapes: NailShape[];
  selected: string;
  onSelect: (id: string) => void;
}

export function ShapeGrid({ shapes, selected, onSelect }: ShapeGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {shapes.map((shape) => (
        <button
          key={shape.id}
          onClick={() => onSelect(shape.id)}
          className={cn(
            'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
            'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
            selected === shape.id
              ? 'border-[#B76E79] bg-[#FFF5F7] shadow-md ring-1 ring-[#B76E79]/30'
              : 'border-gray-200 bg-white hover:border-[#D4A9B0]'
          )}
        >
          <svg viewBox="0 0 60 90" className="w-12 h-16">
            <path
              d={shape.path}
              fill={selected === shape.id ? '#F4C2C2' : '#F0E8E8'}
              stroke={selected === shape.id ? '#B76E79' : '#CCBBBB'}
              strokeWidth="2"
            />
          </svg>
          <span className="text-sm font-medium text-[#333]">{shape.nameHe}</span>
        </button>
      ))}
    </div>
  );
}

// ===== Color Circles =====

interface ColorGridProps {
  colors: ColorOption[];
  selected: string;
  onSelect: (id: string) => void;
}

export function ColorGrid({ colors, selected, onSelect }: ColorGridProps) {
  const customSelected = isCustomColor(selected);
  const customHex = customSelected ? getCustomHex(selected) : null;

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {colors.map((color) => (
        <button
          key={color.id}
          onClick={() => onSelect(color.id)}
          className="group flex flex-col items-center gap-1.5"
          title={color.nameHe}
        >
          <div
            className={cn(
              'w-12 h-12 rounded-full transition-all duration-200 border-2',
              'hover:scale-110 active:scale-95',
              selected === color.id
                ? 'ring-2 ring-[#B76E79] ring-offset-2 border-[#B76E79] scale-110'
                : 'border-gray-200 hover:border-[#D4A9B0]'
            )}
            style={{ backgroundColor: color.hex }}
          />
          <span className={cn(
            'text-[11px] leading-tight text-center max-w-[56px] transition-colors',
            selected === color.id ? 'text-[#B76E79] font-semibold' : 'text-gray-500'
          )}>
            {color.nameHe}
          </span>
        </button>
      ))}
      {/* Show custom color swatch when selected */}
      {customSelected && customHex && (
        <div className="flex flex-col items-center gap-1.5">
          <div
            className="w-12 h-12 rounded-full border-2 ring-2 ring-[#B76E79] ring-offset-2 border-[#B76E79] scale-110"
            style={{ backgroundColor: customHex }}
          />
          <span className="text-[11px] leading-tight text-center max-w-[56px] text-[#B76E79] font-semibold">
            מותאם
          </span>
        </div>
      )}
    </div>
  );
}

// ===== Color Wheel Picker =====

interface ColorWheelPickerProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function ColorWheelPicker({ selected, onSelect }: ColorWheelPickerProps) {
  const [open, setOpen] = useState(false);
  const currentHex = isCustomColor(selected) ? getCustomHex(selected) : '#B76E79';

  return (
    <div className="space-y-3">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-2.5 rounded-full border-2 text-sm transition-all',
          open || isCustomColor(selected)
            ? 'border-[#B76E79] bg-[#FFF0F2] text-[#8B4D57] font-semibold'
            : 'border-gray-200 text-gray-500 hover:border-[#D4A9B0]'
        )}
      >
        <span className="text-lg">🎨</span>
        {open ? 'סגרי מכחול' : 'בחרי צבע מהמכחול'}
      </button>

      {open && (
        <div className="flex flex-col items-center gap-3 py-3">
          <HexColorPicker
            color={currentHex}
            onChange={(hex) => onSelect(`custom-${hex}`)}
            style={{ width: '100%', maxWidth: 260, height: 200 }}
          />
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full border-2 border-[#B76E79] shadow-inner"
              style={{ backgroundColor: currentHex }}
            />
            <span className="text-sm font-mono text-[#555]" dir="ltr">{currentHex.toUpperCase()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Finger Picker (for accent nails) =====

interface FingerPickerProps {
  selected: number[];
  onChange: (fingers: number[]) => void;
}

export function FingerPicker({ selected, onChange }: FingerPickerProps) {
  const toggle = (idx: number) => {
    if (selected.includes(idx)) {
      if (selected.length > 1) onChange(selected.filter(i => i !== idx));
    } else {
      onChange([...selected, idx]);
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {FINGER_NAMES_HE.map((name, idx) => (
        <button
          key={idx}
          onClick={() => toggle(idx)}
          className={cn(
            'flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 text-xs transition-all',
            'hover:scale-105 active:scale-95',
            selected.includes(idx)
              ? 'border-[#B76E79] bg-[#FFF0F2] text-[#8B4D57] font-semibold'
              : 'border-gray-200 bg-white text-gray-500 hover:border-[#D4A9B0]'
          )}
        >
          <span className="text-base">{['👍', '☝️', '🖕', '💍', '🤙'][idx]}</span>
          <span>{name}</span>
        </button>
      ))}
    </div>
  );
}

// ===== Pill Options (single or multi select) =====

interface PillGridProps {
  options: DesignOption[];
  selected: string | string[];
  onSelect: (id: string) => void;
  multiSelect?: boolean;
}

export function PillGrid({ options, selected, onSelect, multiSelect = false }: PillGridProps) {
  const isSelected = (id: string) =>
    multiSelect
      ? (selected as string[]).includes(id)
      : selected === id;

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border-2 text-sm',
            'transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]',
            isSelected(option.id)
              ? 'border-[#B76E79] bg-[#FFF0F2] text-[#8B4D57] font-semibold shadow-sm'
              : 'border-gray-200 bg-white text-gray-600 hover:border-[#D4A9B0] hover:bg-[#FFFBFC]'
          )}
        >
          <span className="text-base">{option.icon}</span>
          <span>{option.nameHe}</span>
        </button>
      ))}
    </div>
  );
}
