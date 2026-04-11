import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Clock, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEMO_KEY = 'juline-demo-start';
const DEMO_DURATION_MS = 5 * 60 * 1000; // 5 minutes

function isDemoMode(): boolean {
  return new URLSearchParams(window.location.search).has('demo');
}

function getDemoStart(): number | null {
  const stored = localStorage.getItem(DEMO_KEY);
  return stored ? Number(stored) : null;
}

function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

interface DemoGateProps {
  children: React.ReactNode;
}

export default function DemoGate({ children }: DemoGateProps) {
  const [remaining, setRemaining] = useState<number>(DEMO_DURATION_MS);
  const [expired, setExpired] = useState(false);

  const demo = isDemoMode();

  const initDemo = useCallback(() => {
    if (!demo) return;
    let start = getDemoStart();
    if (!start) {
      start = Date.now();
      localStorage.setItem(DEMO_KEY, String(start));
    }
    const elapsed = Date.now() - start;
    if (elapsed >= DEMO_DURATION_MS) {
      setExpired(true);
      setRemaining(0);
    } else {
      setRemaining(DEMO_DURATION_MS - elapsed);
    }
  }, [demo]);

  useEffect(() => {
    initDemo();
  }, [initDemo]);

  useEffect(() => {
    if (!demo || expired) return;

    const interval = setInterval(() => {
      const start = getDemoStart();
      if (!start) return;

      const left = DEMO_DURATION_MS - (Date.now() - start);
      if (left <= 0) {
        setExpired(true);
        setRemaining(0);
        clearInterval(interval);
      } else {
        setRemaining(left);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [demo, expired]);

  // Not demo mode - render normally
  if (!demo) return <>{children}</>;

  // Expired - lock screen
  if (expired) {
    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#FFF8F9] to-[#FFF0F2] flex items-center justify-center p-6" dir="rtl">
        <div className="bg-white rounded-3xl border border-[#F0E0E2] shadow-2xl p-8 max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-[#FFF0F2] rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-[#B76E79]" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#333]">הדמו הסתיים</h2>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              נהנית ? תארי לעצמך את זה אצלך בסטודיו -
              <br />
              הלקוחות בוחרות עיצוב ורואות הדמיה תוך שניות
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => window.open('https://wa.me/972533982552?text=' + encodeURIComponent('היי, ניסיתי את הדמו של AI Nail Studio ואני מתעניינת!'), '_blank')}
              className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white gap-2 h-12 text-base font-semibold"
              size="lg"
            >
              <Sparkles className="w-5 h-5" />
              דברי איתי בוואטסאפ
            </Button>
            <p className="text-xs text-gray-400">ג'ולין - AI Nail Studio</p>
          </div>
        </div>
      </div>
    );
  }

  // Active demo - show timer + content
  const isWarning = remaining < 60_000;

  return (
    <div className="relative">
      {/* Timer badge */}
      <div className="fixed bottom-4 left-4 z-[90]">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg text-sm font-medium transition-colors ${
          isWarning
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-white/90 backdrop-blur-sm border border-[#F0E0E2] text-[#B76E79]'
        }`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTime(remaining)}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
