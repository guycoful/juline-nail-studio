import { useEffect, useRef, useState, useCallback } from 'react';
import { X, SwitchCamera, Hand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NailDesign } from '@/data/juline-options';
import { getColorHex } from '@/data/juline-options';

type ARState = 'loading' | 'camera' | 'running' | 'error' | 'no-support';

interface ARNailViewProps {
  design: NailDesign;
  onClose: () => void;
}

// MediaPipe landmark indices
const FINGERS = [
  { tip: 4, dip: 3, pip: 2, mcp: 1, name: 'thumb' },
  { tip: 8, dip: 7, pip: 6, mcp: 5, name: 'index' },
  { tip: 12, dip: 11, pip: 10, mcp: 9, name: 'middle' },
  { tip: 16, dip: 15, pip: 14, mcp: 13, name: 'ring' },
  { tip: 20, dip: 19, pip: 18, mcp: 17, name: 'pinky' },
];

// ===== Math helpers =====

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

// Convert hex color to rgba string
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ===== Temporal smoothing =====
// Averages landmark positions over multiple frames to reduce jitter

interface SmoothPoint { x: number; y: number }

class LandmarkSmoother {
  private buffers = new Map<string, SmoothPoint[]>();
  private bufferSize: number;

  constructor(bufferSize = 4) {
    this.bufferSize = bufferSize;
  }

  smooth(key: string, x: number, y: number): SmoothPoint {
    let buf = this.buffers.get(key);
    if (!buf) { buf = []; this.buffers.set(key, buf); }
    buf.push({ x, y });
    if (buf.length > this.bufferSize) buf.shift();

    const sx = buf.reduce((s, p) => s + p.x, 0) / buf.length;
    const sy = buf.reduce((s, p) => s + p.y, 0) / buf.length;
    return { x: sx, y: sy };
  }

  clear() { this.buffers.clear(); }
}

// ===== Nail geometry =====

interface NailGeo {
  cx: number; cy: number;
  angle: number;
  w: number; h: number;
}

function calculateNailGeo(
  tip: SmoothPoint, dip: SmoothPoint, pip: SmoothPoint,
  fingerName: string,
  tipZ: number, dipZ: number,
): NailGeo | null {
  const phalanxLen = dist(tip.x, tip.y, dip.x, dip.y);
  if (phalanxLen < 10) return null;

  // Z-depth: skip if nail faces away (palm up)
  if (tipZ - dipZ > 0.035) return null;

  // Direction from DIP to TIP
  const angle = Math.atan2(tip.y - dip.y, tip.x - dip.x);

  // Nail center: 42% from TIP toward DIP (center of nail plate)
  const cx = lerp(tip.x, dip.x, 0.42);
  const cy = lerp(tip.y, dip.y, 0.42);

  // Nail size based on phalanx length
  const h = phalanxLen * 0.50;
  let wRatio = 0.70;
  if (fingerName === 'thumb') wRatio = 0.95;
  if (fingerName === 'pinky') wRatio = 0.62;
  const w = h * wRatio;

  return { cx, cy, angle, w, h };
}

// ===== Professional nail rendering =====
// Uses 'color' blend mode to preserve real nail texture/lighting
// and concentric shapes for soft feathered edges

// Feathering passes: from outside (transparent) to inside (opaque)
const FEATHER_PASSES = [
  { scale: 1.15, alpha: 0.10 },
  { scale: 1.08, alpha: 0.20 },
  { scale: 1.02, alpha: 0.35 },
  { scale: 0.96, alpha: 0.55 },
  { scale: 0.90, alpha: 0.72 },
  { scale: 0.84, alpha: 0.85 },
];

function renderNailPro(
  ctx: CanvasRenderingContext2D,
  geo: NailGeo,
  colorHex: string,
  shape: string,
) {
  const { cx, cy, angle, w, h } = geo;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle + Math.PI / 2);

  // === Main color: 'color' blend mode ===
  // Preserves the real nail's luminosity (lighting, shadows, texture)
  // while replacing hue/saturation with our chosen color
  ctx.globalCompositeOperation = 'color';

  for (const pass of FEATHER_PASSES) {
    ctx.globalAlpha = pass.alpha;
    ctx.beginPath();
    traceNailShape(ctx, shape, w * pass.scale, h * pass.scale);
    ctx.closePath();
    ctx.fillStyle = colorHex;
    ctx.fill();
  }

  // === Saturation boost: 'multiply' pass ===
  // Adds color density, especially for vivid colors
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.12;
  ctx.beginPath();
  traceNailShape(ctx, shape, w * 0.85, h * 0.85);
  ctx.closePath();
  ctx.fillStyle = colorHex;
  ctx.fill();

  // === Glossy highlight: 'screen' pass ===
  // Simulates the curved reflective surface of nail polish
  ctx.globalCompositeOperation = 'screen';
  const hw = w / 2;
  const hh = h / 2;
  const gloss = ctx.createLinearGradient(-hw * 0.4, -hh * 0.8, hw * 0.3, hh * 0.4);
  gloss.addColorStop(0, 'rgba(255,255,255,0.35)');
  gloss.addColorStop(0.2, 'rgba(255,255,255,0.12)');
  gloss.addColorStop(0.5, 'rgba(255,255,255,0)');
  gloss.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  traceNailShape(ctx, shape, w * 0.78, h * 0.78);
  ctx.closePath();
  ctx.fillStyle = gloss;
  ctx.fill();

  // === Subtle specular dot (the "wet gel" shine) ===
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.25;
  const specGrad = ctx.createRadialGradient(
    -hw * 0.2, -hh * 0.35, 0,
    -hw * 0.2, -hh * 0.35, w * 0.25
  );
  specGrad.addColorStop(0, 'rgba(255,255,255,0.7)');
  specGrad.addColorStop(0.4, 'rgba(255,255,255,0.15)');
  specGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  traceNailShape(ctx, shape, w * 0.7, h * 0.7);
  ctx.closePath();
  ctx.fill();

  // Reset
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ===== Nail shape paths =====

function traceNailShape(ctx: CanvasRenderingContext2D, shape: string, w: number, h: number) {
  const hw = w / 2;
  const hh = h / 2;

  switch (shape) {
    case 'almond':
      ctx.moveTo(0, -hh);
      ctx.bezierCurveTo(hw * 0.85, -hh * 0.55, hw, hh * 0.15, hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.bezierCurveTo(-hw, hh * 0.15, -hw * 0.85, -hh * 0.55, 0, -hh);
      break;

    case 'oval':
      ctx.moveTo(0, -hh);
      ctx.bezierCurveTo(hw * 1.1, -hh * 0.4, hw, hh * 0.2, hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.bezierCurveTo(-hw, hh * 0.2, -hw * 1.1, -hh * 0.4, 0, -hh);
      break;

    case 'square': {
      const r = Math.min(hw * 0.15, 4);
      ctx.moveTo(-hw + r, -hh);
      ctx.lineTo(hw - r, -hh);
      ctx.arcTo(hw, -hh, hw, -hh + r, r);
      ctx.lineTo(hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.lineTo(-hw, -hh + r);
      ctx.arcTo(-hw, -hh, -hw + r, -hh, r);
      break;
    }

    case 'coffin': {
      const flat = hw * 0.52;
      ctx.moveTo(-flat, -hh);
      ctx.lineTo(flat, -hh);
      ctx.bezierCurveTo(hw * 0.85, -hh * 0.2, hw, hh * 0.4, hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.bezierCurveTo(-hw, hh * 0.4, -hw * 0.85, -hh * 0.2, -flat, -hh);
      break;
    }

    case 'stiletto':
      ctx.moveTo(0, -hh);
      ctx.bezierCurveTo(hw * 0.5, -hh * 0.35, hw, hh * 0.15, hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.bezierCurveTo(-hw, hh * 0.15, -hw * 0.5, -hh * 0.35, 0, -hh);
      break;

    case 'short-natural':
    default:
      ctx.ellipse(0, hh * 0.1, hw, hh * 0.9, 0, 0, Math.PI * 2);
      break;
  }
}

// ===== Main Component =====

export default function ARNailView({ design, onClose }: ARNailViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const handLandmarkerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const smootherRef = useRef(new LandmarkSmoother(4));

  const [state, setState] = useState<ARState>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [handDetected, setHandDetected] = useState(false);

  const colorHex = getColorHex(design.baseColor);
  const nailShape = design.shape || 'oval';

  const initMediaPipe = useCallback(async () => {
    try {
      setState('loading');
      const vision = await import('@mediapipe/tasks-vision');
      const { HandLandmarker, FilesetResolver } = vision;

      const wasmFileset = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      );

      handLandmarkerRef.current = await HandLandmarker.createFromOptions(wasmFileset, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
          delegate: 'GPU',
        },
        numHands: 2,
        runningMode: 'VIDEO',
      });

      setState('camera');
    } catch (err) {
      console.error('MediaPipe init error:', err);
      setErrorMsg('לא הצלחנו לטעון את מנוע הזיהוי. נסי לרענן.');
      setState('error');
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      smootherRef.current.clear();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setState('running');
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setErrorMsg('צריך לאשר גישה למצלמה כדי להשתמש בתכונה הזו');
      } else if (err.name === 'NotFoundError') {
        setErrorMsg('לא נמצאה מצלמה במכשיר');
      } else {
        setErrorMsg('שגיאה בפתיחת המצלמה');
      }
      setState('error');
    }
  }, [facingMode]);

  const renderLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const hl = handLandmarkerRef.current;

    if (!video || !canvas || !hl || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const isFront = facingMode === 'user';
    const smoother = smootherRef.current;

    // Draw camera frame
    ctx.save();
    if (isFront) {
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    ctx.restore();

    // Detect hands
    const results = hl.detectForVideo(video, performance.now());

    if (results.landmarks && results.landmarks.length > 0) {
      setHandDetected(true);

      for (let hi = 0; hi < results.landmarks.length; hi++) {
        const hand = results.landmarks[hi];

        for (const finger of FINGERS) {
          const rawTip = hand[finger.tip];
          const rawDip = hand[finger.dip];
          const rawPip = hand[finger.pip];

          // Convert to pixel coords (mirror X for front camera)
          const toX = (v: number) => (isFront ? 1 - v : v) * canvas.width;
          const toY = (v: number) => v * canvas.height;

          // Apply temporal smoothing
          const tipKey = `${hi}-${finger.name}-tip`;
          const dipKey = `${hi}-${finger.name}-dip`;
          const pipKey = `${hi}-${finger.name}-pip`;

          const tip = smoother.smooth(tipKey, toX(rawTip.x), toY(rawTip.y));
          const dip = smoother.smooth(dipKey, toX(rawDip.x), toY(rawDip.y));
          const pip = smoother.smooth(pipKey, toX(rawPip.x), toY(rawPip.y));

          const geo = calculateNailGeo(tip, dip, pip, finger.name, rawTip.z, rawDip.z);

          if (geo) {
            renderNailPro(ctx, geo, colorHex, nailShape);
          }
        }
      }
    } else {
      setHandDetected(false);
    }

    animFrameRef.current = requestAnimationFrame(renderLoop);
  }, [colorHex, nailShape, facingMode]);

  // Lifecycle
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) { setState('no-support'); return; }
    initMediaPipe();
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      handLandmarkerRef.current?.close?.();
    };
  }, [initMediaPipe]);

  useEffect(() => { if (state === 'camera') startCamera(); }, [state, startCamera]);

  useEffect(() => {
    if (state === 'running') animFrameRef.current = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [state, renderLoop]);

  const handleFlipCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setState('camera');
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <Button onClick={onClose} variant="ghost" size="icon"
          className="text-white hover:bg-white/20 rounded-full w-10 h-10">
          <X className="w-6 h-6" />
        </Button>
        <div className="text-white text-center">
          <span className="text-sm font-bold">Juline AR</span>
          <span className="text-xs block opacity-70">נסי את העיצוב על היד שלך</span>
        </div>
        <Button onClick={handleFlipCamera} variant="ghost" size="icon"
          className="text-white hover:bg-white/20 rounded-full w-10 h-10"
          disabled={state !== 'running'}>
          <SwitchCamera className="w-5 h-5" />
        </Button>
      </div>

      {/* Camera */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="w-full h-full object-contain" />

        {state === 'loading' && <Overlay text="טוענת את מנוע ה-AR..." />}
        {state === 'camera' && <Overlay text="פותחת מצלמה..." />}
        {state === 'error' && (
          <ErrorOverlay msg={errorMsg} onRetry={() => initMediaPipe()} onClose={onClose} />
        )}
        {state === 'no-support' && (
          <ErrorOverlay msg="הדפדפן לא תומך במצלמה. נסי בכרום." onClose={onClose} />
        )}

        {state === 'running' && !handDetected && (
          <div className="absolute bottom-24 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-black/50 backdrop-blur-sm text-white px-5 py-3 rounded-full flex items-center gap-2 animate-pulse">
              <Hand className="w-5 h-5" />
              <span className="text-sm">הראי את היד שלך למצלמה</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom */}
      {state === 'running' && design.baseColor && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex justify-center">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
              <div className="w-4 h-4 rounded-full border border-white/40"
                style={{ backgroundColor: colorHex }} />
              <span className="text-white text-xs">{design.shape || 'oval'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Overlay({ text }: { text: string }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a10] to-[#2a1020] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-[#B76E79]/30 rounded-full" />
        <div className="w-16 h-16 border-4 border-[#B76E79] border-t-transparent rounded-full absolute inset-0 animate-spin" />
      </div>
      <p className="text-white/80 text-sm">{text}</p>
      <p className="text-white/40 text-xs">זה לוקח כמה שניות בפעם הראשונה</p>
    </div>
  );
}

function ErrorOverlay({ msg, onRetry, onClose }: { msg: string; onRetry?: () => void; onClose: () => void }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a10] to-[#2a1020] flex flex-col items-center justify-center gap-4 px-8">
      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
        <X className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-white/80 text-sm text-center">{msg}</p>
      <div className="flex gap-3">
        {onRetry && <Button onClick={onRetry} className="bg-[#B76E79] hover:bg-[#A05D67] text-white">נסי שוב</Button>}
        <Button onClick={onClose} variant="outline" className="border-white/30 text-white hover:bg-white/10">חזרה</Button>
      </div>
    </div>
  );
}
