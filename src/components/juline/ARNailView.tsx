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

// MediaPipe landmark indices per finger
// MCP = base knuckle, PIP = middle joint, DIP = last joint, TIP = fingertip
const FINGERS = [
  { tip: 4, dip: 3, pip: 2, mcp: 1, name: 'thumb' },
  { tip: 8, dip: 7, pip: 6, mcp: 5, name: 'index' },
  { tip: 12, dip: 11, pip: 10, mcp: 9, name: 'middle' },
  { tip: 16, dip: 15, pip: 14, mcp: 13, name: 'ring' },
  { tip: 20, dip: 19, pip: 18, mcp: 17, name: 'pinky' },
];

// ===== Nail geometry calculation =====

interface Point { x: number; y: number; z: number }

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function dist2d(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

/**
 * Calculate nail position, size, and angle from finger landmarks.
 *
 * The nail plate sits on the dorsal (back) surface of the last phalanx.
 * It starts just past the DIP joint and extends to slightly before the fingertip.
 *
 * We use TIP, DIP, and PIP to determine:
 * - Direction of the finger (angle)
 * - Position of the nail center
 * - Approximate nail size based on phalanx length
 */
function calculateNailGeometry(
  tip: Point, dip: Point, pip: Point,
  canvasW: number, canvasH: number,
  isMirrored: boolean,
  fingerName: string,
) {
  // Convert normalized landmarks to pixel coordinates
  const tx = (isMirrored ? 1 - tip.x : tip.x) * canvasW;
  const ty = tip.y * canvasH;
  const dx = (isMirrored ? 1 - dip.x : dip.x) * canvasW;
  const dy = dip.y * canvasH;
  const px = (isMirrored ? 1 - pip.x : pip.x) * canvasW;
  const py = pip.y * canvasH;

  // Phalanx length (TIP to DIP in pixels)
  const phalanxLen = dist2d(tx, ty, dx, dy);
  if (phalanxLen < 8) return null; // too small

  // Finger direction (from DIP toward TIP)
  const dirX = tx - dx;
  const dirY = ty - dy;
  const angle = Math.atan2(dirY, dirX);

  // --- Nail center ---
  // The nail center sits about 40% from TIP toward DIP
  // (slightly past the midpoint of the nail plate, which runs from ~DIP to ~TIP)
  const centerX = lerp(tx, dx, 0.40);
  const centerY = lerp(ty, dy, 0.40);

  // --- Nail size ---
  // Real nail plate is about 55% of the last phalanx length
  // and has a width:height ratio of roughly 1:1 to 1:1.2
  const nailLength = phalanxLen * 0.52;

  // Width based on finger type (thumb is wider)
  let widthRatio = 0.72; // default nail aspect ratio
  if (fingerName === 'thumb') widthRatio = 1.0;
  if (fingerName === 'pinky') widthRatio = 0.65;
  const nailWidth = nailLength * widthRatio;

  // --- Z-depth check: skip if nail is facing away ---
  // When palm is up (fingers curl toward camera), tip.z > dip.z significantly
  // This means the nail is on the far side and shouldn't be shown
  const zDiff = tip.z - dip.z;
  if (zDiff > 0.04) return null; // nail facing away from camera

  return { centerX, centerY, angle, nailLength, nailWidth };
}

// ===== Nail rendering =====

function renderNail(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  angle: number,
  nailW: number, nailH: number,
  colorHex: string,
  shape: string,
) {
  ctx.save();
  ctx.translate(cx, cy);
  // Rotate so the nail long axis aligns with finger direction
  // +PI/2 because finger direction is along X-axis but nail is drawn along Y-axis
  ctx.rotate(angle + Math.PI / 2);

  // === Layer 1: Base color ===
  ctx.beginPath();
  traceNailShape(ctx, shape, nailW, nailH);
  ctx.closePath();

  // Soft shadow under the nail for depth
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  ctx.globalAlpha = 0.78;
  ctx.fillStyle = colorHex;
  ctx.fill();

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // === Layer 2: Glossy highlight ===
  ctx.beginPath();
  traceNailShape(ctx, shape, nailW, nailH);
  ctx.closePath();

  const hw = nailW / 2;
  const hh = nailH / 2;
  // Diagonal highlight from top-left
  const glossGrad = ctx.createLinearGradient(-hw * 0.6, -hh * 0.6, hw * 0.4, hh * 0.6);
  glossGrad.addColorStop(0, 'rgba(255,255,255,0.45)');
  glossGrad.addColorStop(0.25, 'rgba(255,255,255,0.12)');
  glossGrad.addColorStop(0.6, 'rgba(255,255,255,0)');
  glossGrad.addColorStop(1, 'rgba(0,0,0,0.05)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = glossGrad;
  ctx.fill();

  // === Layer 3: Edge highlight (thin white line along top edge) ===
  ctx.beginPath();
  traceNailShape(ctx, shape, nailW * 0.85, nailH * 0.85);
  ctx.closePath();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;
  ctx.stroke();

  // === Layer 4: Outer contour ===
  ctx.beginPath();
  traceNailShape(ctx, shape, nailW, nailH);
  ctx.closePath();
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = 'rgba(60,30,30,0.5)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.restore();
}

/**
 * Trace nail shape path on canvas.
 * Coordinates: y = -h/2 is the free edge (tip), y = +h/2 is cuticle (base).
 * All shapes have the cuticle (base) edge straight/flat.
 */
function traceNailShape(ctx: CanvasRenderingContext2D, shape: string, w: number, h: number) {
  const hw = w / 2;
  const hh = h / 2;

  switch (shape) {
    case 'almond':
      // Gently tapered to a soft point at the free edge
      ctx.moveTo(0, -hh);
      ctx.bezierCurveTo(hw * 0.85, -hh * 0.55, hw, hh * 0.15, hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.bezierCurveTo(-hw, hh * 0.15, -hw * 0.85, -hh * 0.55, 0, -hh);
      break;

    case 'oval':
      // Rounded top, straight sides merging to base
      ctx.moveTo(0, -hh);
      ctx.bezierCurveTo(hw * 1.1, -hh * 0.4, hw, hh * 0.2, hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.bezierCurveTo(-hw, hh * 0.2, -hw * 1.1, -hh * 0.4, 0, -hh);
      break;

    case 'square': {
      // Flat free edge with slight corner rounding
      const r = Math.min(hw * 0.18, 4);
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
      // Tapered sides then flat top
      const flat = hw * 0.52; // flat portion width at top
      ctx.moveTo(-flat, -hh);
      ctx.lineTo(flat, -hh);
      // Smooth taper from flat top to full width at base
      ctx.bezierCurveTo(hw * 0.85, -hh * 0.2, hw, hh * 0.4, hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.bezierCurveTo(-hw, hh * 0.4, -hw * 0.85, -hh * 0.2, -flat, -hh);
      break;
    }

    case 'stiletto':
      // Very pointed free edge
      ctx.moveTo(0, -hh);
      ctx.bezierCurveTo(hw * 0.5, -hh * 0.35, hw, hh * 0.15, hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.bezierCurveTo(-hw, hh * 0.15, -hw * 0.5, -hh * 0.35, 0, -hh);
      break;

    case 'short-natural':
    default:
      // Short, wide, barely protruding past fingertip
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

  const [state, setState] = useState<ARState>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [handDetected, setHandDetected] = useState(false);

  const colorHex = getColorHex(design.baseColor);
  const nailShape = design.shape || 'oval';

  // Initialize MediaPipe HandLandmarker
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

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
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

  // Detection + render loop
  const renderLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const handLandmarker = handLandmarkerRef.current;

    if (!video || !canvas || !handLandmarker || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const isFront = facingMode === 'user';

    // Draw video frame (mirrored for front camera)
    ctx.save();
    if (isFront) {
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    ctx.restore();

    // Hand detection
    const results = handLandmarker.detectForVideo(video, performance.now());

    if (results.landmarks && results.landmarks.length > 0) {
      setHandDetected(true);

      for (const hand of results.landmarks) {
        for (const finger of FINGERS) {
          const tip = hand[finger.tip];
          const dip = hand[finger.dip];
          const pip = hand[finger.pip];

          const geo = calculateNailGeometry(
            tip, dip, pip,
            canvas.width, canvas.height,
            isFront,
            finger.name,
          );

          if (geo) {
            renderNail(
              ctx,
              geo.centerX, geo.centerY,
              geo.angle,
              geo.nailWidth, geo.nailLength,
              colorHex,
              nailShape,
            );
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
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('no-support');
      return;
    }
    initMediaPipe();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (handLandmarkerRef.current?.close) {
        handLandmarkerRef.current.close();
      }
    };
  }, [initMediaPipe]);

  useEffect(() => {
    if (state === 'camera') startCamera();
  }, [state, startCamera]);

  useEffect(() => {
    if (state === 'running') {
      animFrameRef.current = requestAnimationFrame(renderLoop);
    }
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
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 rounded-full w-10 h-10"
        >
          <X className="w-6 h-6" />
        </Button>

        <div className="text-white text-center">
          <span className="text-sm font-bold">Juline AR</span>
          <span className="text-xs block opacity-70">נסי את העיצוב על היד שלך</span>
        </div>

        <Button
          onClick={handleFlipCamera}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 rounded-full w-10 h-10"
          disabled={state !== 'running'}
        >
          <SwitchCamera className="w-5 h-5" />
        </Button>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="w-full h-full object-contain" />

        {state === 'loading' && <LoadingOverlay text="טוענת את מנוע ה-AR..." />}
        {state === 'camera' && <LoadingOverlay text="פותחת מצלמה..." />}
        {state === 'error' && (
          <ErrorOverlay message={errorMsg} onRetry={() => initMediaPipe()} onClose={onClose} />
        )}
        {state === 'no-support' && (
          <ErrorOverlay message="הדפדפן לא תומך במצלמה. נסי בכרום." onClose={onClose} />
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

      {/* Bottom bar */}
      {state === 'running' && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex justify-center">
            {design.baseColor && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                <div
                  className="w-4 h-4 rounded-full border border-white/40"
                  style={{ backgroundColor: colorHex }}
                />
                <span className="text-white text-xs">{design.shape || 'oval'}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Sub-components =====

function LoadingOverlay({ text }: { text: string }) {
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

function ErrorOverlay({
  message, onRetry, onClose,
}: {
  message: string;
  onRetry?: () => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a10] to-[#2a1020] flex flex-col items-center justify-center gap-4 px-8">
      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
        <X className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-white/80 text-sm text-center">{message}</p>
      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry} className="bg-[#B76E79] hover:bg-[#A05D67] text-white">
            נסי שוב
          </Button>
        )}
        <Button onClick={onClose} variant="outline" className="border-white/30 text-white hover:bg-white/10">
          חזרה
        </Button>
      </div>
    </div>
  );
}
