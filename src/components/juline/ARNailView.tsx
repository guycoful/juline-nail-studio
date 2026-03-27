import { useEffect, useRef, useState, useCallback } from 'react';
import { X, SwitchCamera, Hand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NailDesign } from '@/data/juline-options';
import { getColorHex, getShapePath } from '@/data/juline-options';

// ===== Types =====

type ARState = 'loading' | 'camera' | 'running' | 'error' | 'no-support';

interface ARNailViewProps {
  design: NailDesign;
  onClose: () => void;
}

// MediaPipe hand landmarks: tip and one-below-tip (DIP) for each finger
const FINGERS = [
  { tip: 4, dip: 3, pip: 2, name: 'thumb' },
  { tip: 8, dip: 7, pip: 6, name: 'index' },
  { tip: 12, dip: 11, pip: 10, name: 'middle' },
  { tip: 16, dip: 15, pip: 14, name: 'ring' },
  { tip: 20, dip: 19, pip: 18, name: 'pinky' },
];

// ===== Nail drawing on canvas =====

function drawNailOverlay(
  ctx: CanvasRenderingContext2D,
  tipX: number, tipY: number,
  dipX: number, dipY: number,
  pipX: number, pipY: number,
  colorHex: string,
  nailShape: string,
  fingerName: string,
) {
  const dx = tipX - dipX;
  const dy = tipY - dipY;
  const segmentLen = Math.sqrt(dx * dx + dy * dy);

  if (segmentLen < 5) return; // too small to draw

  // Finger direction angle
  const angle = Math.atan2(dy, dx);

  // Nail center: sits on top of the last phalanx, closer to the tip
  // The nail starts right below the tip and extends ~50% toward DIP
  const cx = tipX - dx * 0.32;
  const cy = tipY - dy * 0.32;

  // Nail dimensions - compact, proportional to finger segment
  // Real nails are roughly 45% of the tip-to-DIP distance in length
  // and about 80% of the finger width
  const nailH = segmentLen * 0.48;
  const nailW = segmentLen * (fingerName === 'thumb' ? 0.52 : 0.40);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle + Math.PI / 2); // align Y axis with finger direction

  // Draw nail shape
  ctx.beginPath();
  drawShape(ctx, nailShape, nailW, nailH);

  // Fill with base color - semi-transparent for natural look
  ctx.fillStyle = colorHex;
  ctx.globalAlpha = 0.7;
  ctx.fill();

  // Glossy highlight - subtle shine on top-left
  ctx.beginPath();
  drawShape(ctx, nailShape, nailW, nailH);
  ctx.globalAlpha = 0.2;
  const gradient = ctx.createLinearGradient(
    -nailW * 0.3, -nailH * 0.4,
    nailW * 0.2, nailH * 0.2
  );
  gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.2)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fill();

  // Thin outline for definition
  ctx.beginPath();
  drawShape(ctx, nailShape, nailW, nailH);
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

function drawShape(ctx: CanvasRenderingContext2D, shape: string, w: number, h: number) {
  // y: -h/2 = free edge (tip), +h/2 = cuticle (base)
  const hw = w / 2;
  const hh = h / 2;

  switch (shape) {
    case 'almond':
      // Smooth taper to rounded point
      ctx.moveTo(0, -hh);
      ctx.bezierCurveTo(hw * 0.9, -hh * 0.5, hw, hh * 0.1, hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.bezierCurveTo(-hw, hh * 0.1, -hw * 0.9, -hh * 0.5, 0, -hh);
      break;

    case 'oval':
      // Classic rounded oval
      ctx.ellipse(0, hh * 0.1, hw, hh * 0.9, 0, 0, Math.PI * 2);
      break;

    case 'square': {
      // Flat top with slight corner rounding
      const r = hw * 0.15;
      ctx.moveTo(-hw + r, -hh);
      ctx.lineTo(hw - r, -hh);
      ctx.arcTo(hw, -hh, hw, -hh + r, r);
      ctx.lineTo(hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.lineTo(-hw, -hh + r);
      ctx.arcTo(-hw, -hh, -hw + r, -hh, r);
      break;
    }

    case 'coffin':
      // Tapered sides with flat top - smooth curves
      ctx.moveTo(-hw * 0.5, -hh);
      ctx.lineTo(hw * 0.5, -hh);
      ctx.bezierCurveTo(hw * 0.7, -hh * 0.3, hw, hh * 0.3, hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.bezierCurveTo(-hw, hh * 0.3, -hw * 0.7, -hh * 0.3, -hw * 0.5, -hh);
      break;

    case 'stiletto':
      // Sharp pointed tip
      ctx.moveTo(0, -hh);
      ctx.bezierCurveTo(hw * 0.6, -hh * 0.3, hw, hh * 0.2, hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.bezierCurveTo(-hw, hh * 0.2, -hw * 0.6, -hh * 0.3, 0, -hh);
      break;

    case 'short-natural':
    default:
      // Short, wide, barely curved
      ctx.ellipse(0, hh * 0.15, hw, hh * 0.85, 0, 0, Math.PI * 2);
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
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
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

    // Match canvas to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const isFront = facingMode === 'user';

    // Draw mirrored video for front camera
    ctx.save();
    if (isFront) {
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    ctx.restore();

    // Run hand detection
    const results = handLandmarker.detectForVideo(video, performance.now());

    if (results.landmarks && results.landmarks.length > 0) {
      setHandDetected(true);

      for (const hand of results.landmarks) {
        for (const finger of FINGERS) {
          const tip = hand[finger.tip];
          const dip = hand[finger.dip];
          const pip = hand[finger.pip];

          // Convert normalized coords to canvas pixels, mirror X for front camera
          const tipX = isFront ? (1 - tip.x) * canvas.width : tip.x * canvas.width;
          const tipY = tip.y * canvas.height;
          const dipX = isFront ? (1 - dip.x) * canvas.width : dip.x * canvas.width;
          const dipY = dip.y * canvas.height;
          const pipX = isFront ? (1 - pip.x) * canvas.width : pip.x * canvas.width;
          const pipY = pip.y * canvas.height;

          drawNailOverlay(ctx, tipX, tipY, dipX, dipY, pipX, pipY, colorHex, nailShape, finger.name);
        }
      }
    } else {
      setHandDetected(false);
    }

    animFrameRef.current = requestAnimationFrame(renderLoop);
  }, [colorHex, nailShape, facingMode]);

  // Lifecycle
  useEffect(() => {
    // Check browser support
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('no-support');
      return;
    }
    initMediaPipe();

    return () => {
      // Cleanup
      cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (handLandmarkerRef.current?.close) {
        handLandmarkerRef.current.close();
      }
    };
  }, [initMediaPipe]);

  // Start camera when model is ready
  useEffect(() => {
    if (state === 'camera') {
      startCamera();
    }
  }, [state, startCamera]);

  // Start render loop when running
  useEffect(() => {
    if (state === 'running') {
      animFrameRef.current = requestAnimationFrame(renderLoop);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [state, renderLoop]);

  // Camera flip
  const handleFlipCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setState('camera'); // triggers re-start
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
        <video
          ref={videoRef}
          className="hidden"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
        />

        {/* State overlays */}
        {state === 'loading' && (
          <LoadingOverlay text="טוענת את מנוע ה-AR..." />
        )}

        {state === 'camera' && (
          <LoadingOverlay text="פותחת מצלמה..." />
        )}

        {state === 'error' && (
          <ErrorOverlay message={errorMsg} onRetry={() => initMediaPipe()} onClose={onClose} />
        )}

        {state === 'no-support' && (
          <ErrorOverlay
            message="הדפדפן לא תומך במצלמה. נסי בכרום."
            onClose={onClose}
          />
        )}

        {/* Hand detection hint */}
        {state === 'running' && !handDetected && (
          <div className="absolute bottom-24 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-black/50 backdrop-blur-sm text-white px-5 py-3 rounded-full flex items-center gap-2 animate-pulse">
              <Hand className="w-5 h-5" />
              <span className="text-sm">הראי את היד שלך למצלמה</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom info bar */}
      {state === 'running' && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex justify-center gap-3">
            {design.baseColor && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                <div
                  className="w-4 h-4 rounded-full border border-white/40"
                  style={{ backgroundColor: colorHex }}
                />
                <span className="text-white text-xs">
                  {design.shape || 'oval'}
                </span>
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
  message,
  onRetry,
  onClose,
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
          <Button
            onClick={onRetry}
            className="bg-[#B76E79] hover:bg-[#A05D67] text-white"
          >
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
