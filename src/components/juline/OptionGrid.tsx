import { cn } from '@/lib/utils';
import type { NailShape, ColorOption, DesignOption } from '@/data/juline-options';

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
