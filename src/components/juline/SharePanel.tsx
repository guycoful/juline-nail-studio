import { Copy, Share2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NailDesign } from '@/data/juline-options';
import { buildPrompt, buildSummaryHe } from '@/data/juline-options';
import { useToast } from '@/hooks/use-toast';

interface SharePanelProps {
  design: NailDesign;
  showPrompt?: boolean;
}

export default function SharePanel({ design, showPrompt = false }: SharePanelProps) {
  const { toast } = useToast();

  const handleWhatsAppShare = () => {
    const summary = buildSummaryHe(design);
    const encoded = encodeURIComponent(summary);
    window.open(`https://wa.me/972533982552?text=${encoded}`, '_blank');
  };

  const handleCopyPrompt = async () => {
    const prompt = buildPrompt(design);
    try {
      await navigator.clipboard.writeText(prompt);
      toast({
        title: 'הועתק!',
        description: 'ה-prompt הועתק ללוח',
      });
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = prompt;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: 'הועתק!',
        description: 'ה-prompt הועתק ללוח',
      });
    }
  };

  const handleCopySummary = async () => {
    const summary = buildSummaryHe(design);
    try {
      await navigator.clipboard.writeText(summary);
      toast({
        title: 'הועתק!',
        description: 'הסיכום הועתק ללוח',
      });
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleWhatsAppShare}
          className="flex-1 min-w-[140px] bg-[#25D366] hover:bg-[#20BD5A] text-white font-medium gap-2"
          size="lg"
        >
          <MessageCircle className="w-5 h-5" />
          שלחי בוואטסאפ
        </Button>

        <Button
          onClick={handleCopySummary}
          variant="outline"
          className="flex-1 min-w-[140px] border-[#B76E79] text-[#B76E79] hover:bg-[#FFF0F2] gap-2"
          size="lg"
        >
          <Copy className="w-5 h-5" />
          העתיקי סיכום
        </Button>
      </div>

      {showPrompt && (
        <div className="space-y-2">
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 font-mono leading-relaxed border max-h-32 overflow-auto" dir="ltr">
            {buildPrompt(design)}
          </div>
          <Button
            onClick={handleCopyPrompt}
            variant="outline"
            className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 gap-2"
            size="sm"
          >
            <Copy className="w-4 h-4" />
            העתק prompt למחולל תמונות
          </Button>
        </div>
      )}
    </div>
  );
}
