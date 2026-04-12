import { useState, useEffect } from 'react';
import { Copy, Save, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { NailDesign } from '@/data/juline-options';
import {
  nailShapes,
  nailLengths,
  baseColors,
  designElements,
  styles,
  accents,
  finishes,
  buildPrompt,
  resolveColor,
} from '@/data/juline-options';
import { ShapeGrid, ColorGrid, ColorWheelPicker, PillGrid, FingerPicker } from './OptionGrid';
import SharePanel from './SharePanel';
import AIPreview from './AIPreview';
import { useToast } from '@/hooks/use-toast';

interface StudioModeProps {
  design: NailDesign;
  setDesign: React.Dispatch<React.SetStateAction<NailDesign>>;
}

interface NotebookEntry {
  id: string;
  text: string;
  date: string;
}

const NOTEBOOK_KEY = 'juline-notebook';

function loadNotebook(): NotebookEntry[] {
  try {
    return JSON.parse(localStorage.getItem(NOTEBOOK_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveNotebook(entries: NotebookEntry[]) {
  localStorage.setItem(NOTEBOOK_KEY, JSON.stringify(entries));
}

export default function StudioMode({ design, setDesign }: StudioModeProps) {
  const { toast } = useToast();
  const prompt = buildPrompt(design);
  const [notebook, setNotebook] = useState<NotebookEntry[]>(loadNotebook);
  const [noteText, setNoteText] = useState('');
  const [showNotebook, setShowNotebook] = useState(false);

  useEffect(() => {
    saveNotebook(notebook);
  }, [notebook]);

  const handleSingleSelect = (field: keyof NailDesign, id: string) => {
    setDesign(prev => ({ ...prev, [field]: id }));
  };

  const handleMultiSelect = (field: 'designElements' | 'accents', id: string) => {
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
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast({ title: 'הועתק!', description: 'Prompt הועתק ללוח' });
    } catch {
      // fallback
    }
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    const entry: NotebookEntry = {
      id: Date.now().toString(),
      text: noteText.trim(),
      date: new Date().toLocaleDateString('he-IL'),
    };
    setNotebook(prev => [entry, ...prev]);
    setNoteText('');
    toast({ title: 'נשמר!', description: 'הרעיון נשמר למחברת' });
  };

  const handleDeleteNote = (id: string) => {
    setNotebook(prev => prev.filter(n => n.id !== id));
  };

  const handleSaveDesignAsNote = () => {
    const summary = [
      design.shape && `צורה: ${nailShapes.find(s => s.id === design.shape)?.nameHe}`,
      design.length && `אורך: ${nailLengths.find(l => l.id === design.length)?.nameHe}`,
      design.baseColor && `צבע: ${resolveColor(design.baseColor)?.nameHe}`,
      design.designElements.length > 0 && `עיצוב: ${design.designElements.map(id => designElements.find(e => e.id === id)?.nameHe).join(', ')}`,
      design.style && `סגנון: ${styles.find(s => s.id === design.style)?.nameHe}`,
      design.accents.length > 0 && `הדגשות: ${design.accents.map(id => accents.find(a => a.id === id)?.nameHe).join(', ')}`,
      design.finish && `פיניש: ${finishes.find(f => f.id === design.finish)?.nameHe}`,
      design.notes && `הערות: ${design.notes}`,
    ].filter(Boolean).join(' | ');

    if (summary) {
      const entry: NotebookEntry = {
        id: Date.now().toString(),
        text: summary,
        date: new Date().toLocaleDateString('he-IL'),
      };
      setNotebook(prev => [entry, ...prev]);
      toast({ title: 'נשמר!', description: 'העיצוב נשמר למחברת' });
    }
  };

  return (
    <div className="space-y-6">
      {/* All sections open */}
      <Section title="צורת ציפורן">
        <ShapeGrid
          shapes={nailShapes}
          selected={design.shape}
          onSelect={(id) => handleSingleSelect('shape', id)}
        />
      </Section>

      <Section title="אורך ציפורן">
        <PillGrid
          options={nailLengths}
          selected={design.length}
          onSelect={(id) => handleSingleSelect('length', id)}
        />
      </Section>

      <Section title="צבע בסיס">
        <ColorGrid
          colors={baseColors}
          selected={design.baseColor}
          onSelect={(id) => handleSingleSelect('baseColor', id)}
        />
        <ColorWheelPicker
          selected={design.baseColor}
          onSelect={(id) => handleSingleSelect('baseColor', id)}
        />
      </Section>

      <Section title="שילוב צבעים (אופציונלי)">
        <button
          onClick={() => {
            if (design.secondaryColor) {
              setDesign(prev => ({ ...prev, secondaryColor: '', accentFingers: [3] }));
            } else {
              setDesign(prev => ({ ...prev, secondaryColor: prev.baseColor === 'black' ? 'hot-pink' : 'black' }));
            }
          }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full border-2 text-sm transition-all ${
            design.secondaryColor
              ? 'border-[#B76E79] bg-[#FFF0F2] text-[#8B4D57] font-semibold'
              : 'border-gray-200 text-gray-500 hover:border-[#D4A9B0]'
          }`}
        >
          <span>🎨</span>
          {design.secondaryColor ? 'הסירי צבע שני' : 'הוסיפי צבע שני'}
        </button>
        {design.secondaryColor && (
          <div className="space-y-3 mt-3">
            <ColorGrid
              colors={baseColors.filter(c => c.id !== design.baseColor)}
              selected={design.secondaryColor}
              onSelect={(id) => handleSingleSelect('secondaryColor', id)}
            />
            <p className="text-sm text-[#555] text-center font-medium">על איזה אצבעות?</p>
            <FingerPicker
              selected={design.accentFingers}
              onChange={(fingers) => setDesign(prev => ({ ...prev, accentFingers: fingers }))}
            />
          </div>
        )}
      </Section>

      <Section title="אלמנטים עיצוביים">
        <PillGrid
          options={designElements}
          selected={design.designElements}
          onSelect={(id) => handleMultiSelect('designElements', id)}
          multiSelect
        />
      </Section>

      <Section title="סגנון">
        <PillGrid
          options={styles}
          selected={design.style}
          onSelect={(id) => handleSingleSelect('style', id)}
        />
      </Section>

      <Section title="הדגשות">
        <PillGrid
          options={accents}
          selected={design.accents}
          onSelect={(id) => handleMultiSelect('accents', id)}
          multiSelect
        />
      </Section>

      <Section title="פיניש">
        <PillGrid
          options={finishes}
          selected={design.finish}
          onSelect={(id) => handleSingleSelect('finish', id)}
        />
      </Section>

      {/* Notes */}
      <Section title="הערות">
        <Textarea
          placeholder="הערות נוספות..."
          value={design.notes}
          onChange={(e) =>
            setDesign(prev => ({ ...prev, notes: e.target.value }))
          }
          className="border-[#E8D5D5] focus:border-[#B76E79] bg-white resize-none"
          rows={2}
          dir="rtl"
        />
      </Section>

      {/* Prompt card */}
      <div className="bg-white rounded-xl border border-[#E8D5D5] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#333] flex items-center gap-2">
            <span className="text-lg">🤖</span>
            Prompt
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveDesignAsNote}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-[#B76E79] gap-1"
            >
              <Save className="w-4 h-4" />
              שמור למחברת
            </Button>
            <Button
              onClick={handleCopyPrompt}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-[#B76E79] gap-1"
            >
              <Copy className="w-4 h-4" />
              העתק
            </Button>
          </div>
        </div>
        <div
          className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 font-mono leading-relaxed max-h-40 overflow-auto"
          dir="ltr"
        >
          {prompt}
        </div>
      </div>

      {/* AI Preview */}
      <AIPreview design={design} />

      {/* Share */}
      <SharePanel design={design} showPrompt={false} />

      {/* Notebook */}
      <div className="bg-white rounded-xl border border-[#E8D5D5] p-4 space-y-3">
        <button
          onClick={() => setShowNotebook(!showNotebook)}
          className="flex items-center justify-between w-full"
        >
          <h3 className="font-bold text-[#333] flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            מחברת רעיונות
            {notebook.length > 0 && (
              <span className="text-xs bg-[#FFF0F2] text-[#B76E79] px-2 py-0.5 rounded-full">
                {notebook.length}
              </span>
            )}
          </h3>
          <ChevronIcon open={showNotebook} />
        </button>

        {showNotebook && (
          <div className="space-y-3 pt-2">
            {/* Add new note */}
            <div className="flex gap-2">
              <Textarea
                placeholder="רשום רעיון..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="border-[#E8D5D5] focus:border-[#B76E79] bg-gray-50 resize-none flex-1"
                rows={2}
                dir="rtl"
              />
              <Button
                onClick={handleSaveNote}
                disabled={!noteText.trim()}
                className="bg-[#B76E79] hover:bg-[#A05D67] text-white self-end"
                size="sm"
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>

            {/* Saved notes */}
            {notebook.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-2">
                עדיין אין רעיונות שמורים
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-auto">
                {notebook.map(entry => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-2 bg-[#FFFBFC] rounded-lg p-3 border border-[#F5EAEB]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#333] whitespace-pre-wrap break-words">
                        {entry.text}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {entry.date}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(entry.id)}
                      className="text-gray-300 hover:text-red-400 shrink-0 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Helpers =====

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="font-bold text-[#333] text-sm border-b border-[#F0E0E2] pb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
}
