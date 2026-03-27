import React from 'react';
import type { NailDesign } from '@/data/juline-options';
import { getShapePath, getColorHex, nailShapes } from '@/data/juline-options';

interface NailPreviewProps {
  design: NailDesign;
  compact?: boolean;
}

// Finger dimensions: [width, height, rotation, translateY]
const FINGERS = [
  { w: 36, h: 48, rot: -15, ty: 18, label: 'thumb' },
  { w: 40, h: 62, rot: -3, ty: 6, label: 'index' },
  { w: 42, h: 68, rot: 0, ty: 0, label: 'middle' },
  { w: 40, h: 64, rot: 3, ty: 4, label: 'ring' },
  { w: 34, h: 48, rot: 7, ty: 16, label: 'pinky' },
];

const FINGERS_COMPACT = [
  { w: 26, h: 34, rot: -12, ty: 12, label: 'thumb' },
  { w: 28, h: 44, rot: -2, ty: 4, label: 'index' },
  { w: 30, h: 48, rot: 0, ty: 0, label: 'middle' },
  { w: 28, h: 46, rot: 2, ty: 2, label: 'ring' },
  { w: 24, h: 34, rot: 5, ty: 10, label: 'pinky' },
];

function DesignOverlay({ designIds, nailIdx }: { designIds: string[]; nailIdx: number }) {
  const overlays: React.ReactElement[] = [];

  for (const id of designIds) {
    switch (id) {
      case 'french-tip':
        overlays.push(
          <rect key="french" x="0" y="58" width="60" height="32" fill="white" opacity="0.85" rx="0" />
        );
        break;
      case 'ombre':
        overlays.push(
          <rect key="ombre" x="0" y="0" width="60" height="90" fill={`url(#ombre-${nailIdx})`} />
        );
        break;
      case 'dots':
        overlays.push(
          <g key="dots" opacity="0.4">
            <circle cx="15" cy="25" r="3" fill="white" />
            <circle cx="30" cy="15" r="3" fill="white" />
            <circle cx="45" cy="25" r="3" fill="white" />
            <circle cx="20" cy="45" r="3" fill="white" />
            <circle cx="40" cy="45" r="3" fill="white" />
          </g>
        );
        break;
      case 'stripes':
        overlays.push(
          <g key="stripes" opacity="0.25">
            <line x1="15" y1="0" x2="15" y2="90" stroke="white" strokeWidth="2" />
            <line x1="30" y1="0" x2="30" y2="90" stroke="white" strokeWidth="2" />
            <line x1="45" y1="0" x2="45" y2="90" stroke="white" strokeWidth="2" />
          </g>
        );
        break;
      case 'marble':
        overlays.push(
          <g key="marble" opacity="0.2">
            <path d="M 5 20 Q 20 10 35 30 Q 50 50 55 70" stroke="white" strokeWidth="1.5" fill="none" />
            <path d="M 10 50 Q 25 40 40 55 Q 55 70 50 85" stroke="white" strokeWidth="1" fill="none" />
          </g>
        );
        break;
      case 'geometric':
        overlays.push(
          <g key="geo" opacity="0.25">
            <line x1="0" y1="30" x2="60" y2="30" stroke="white" strokeWidth="1" />
            <line x1="0" y1="60" x2="60" y2="60" stroke="white" strokeWidth="1" />
            <line x1="30" y1="0" x2="30" y2="90" stroke="white" strokeWidth="1" />
          </g>
        );
        break;
      case 'stars':
        overlays.push(
          <g key="stars" opacity="0.35">
            <text x="12" y="30" fontSize="10" fill="white">*</text>
            <text x="35" y="20" fontSize="8" fill="white">*</text>
            <text x="25" y="55" fontSize="12" fill="white">*</text>
          </g>
        );
        break;
      case 'hearts':
        overlays.push(
          <g key="hearts" opacity="0.3">
            <text x="20" y="35" fontSize="12" fill="white" fontFamily="serif">&hearts;</text>
          </g>
        );
        break;
    }
  }

  return <>{overlays}</>;
}

function FinishOverlay({ finishId, nailIdx }: { finishId: string; nailIdx: number }) {
  switch (finishId) {
    case 'glossy':
      return (
        <ellipse cx="18" cy="28" rx="10" ry="22" fill="white" opacity="0.2" />
      );
    case 'matte':
      return <rect x="0" y="0" width="60" height="90" fill="black" opacity="0.06" />;
    case 'chrome':
    case 'mirror':
      return (
        <>
          <defs>
            <linearGradient id={`chrome-${nailIdx}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0.35" />
              <stop offset="40%" stopColor="white" stopOpacity="0" />
              <stop offset="60%" stopColor="white" stopOpacity="0.15" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="60" height="90" fill={`url(#chrome-${nailIdx})`} />
        </>
      );
    case 'shimmer':
      return (
        <>
          <defs>
            <linearGradient id={`shimmer-${nailIdx}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="45%" stopColor="white" stopOpacity="0.3" />
              <stop offset="55%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="60" height="90" fill={`url(#shimmer-${nailIdx})`} className="animate-shimmer" />
        </>
      );
    case 'velvet':
    case 'sugar-texture':
      return <rect x="0" y="0" width="60" height="90" fill="white" opacity="0.08" />;
    case 'glitter-top':
      return (
        <g opacity="0.35">
          {Array.from({ length: 12 }).map((_, i) => (
            <circle
              key={i}
              cx={8 + (i * 17) % 50}
              cy={5 + (i * 23) % 80}
              r={0.8 + (i % 3) * 0.4}
              fill="white"
            />
          ))}
        </g>
      );
    default:
      return null;
  }
}

export default function NailPreview({ design, compact = false }: NailPreviewProps) {
  const fingers = compact ? FINGERS_COMPACT : FINGERS;
  const shapePath = getShapePath(design.shape);
  const colorHex = getColorHex(design.baseColor);

  const hasDesign = design.baseColor || design.shape;

  const skinTone = '#F5D5C8';

  return (
    <div className={`flex items-end justify-center ${compact ? 'gap-0.5' : 'gap-1'} py-4`}>
      {fingers.map((finger, idx) => (
        <div
          key={finger.label}
          className="flex flex-col items-center transition-all duration-500"
          style={{
            transform: `rotate(${finger.rot}deg) translateY(${finger.ty}px)`,
          }}
        >
          {/* Nail + finger as single SVG */}
          <svg
            viewBox="0 0 60 130"
            width={finger.w}
            height={compact ? finger.h * 1.35 : finger.h * 1.4}
            className="transition-all duration-500"
            style={{ filter: hasDesign ? 'none' : 'saturate(0.3)' }}
          >
            <defs>
              <clipPath id={`nail-clip-${idx}`}>
                <path d={shapePath} />
              </clipPath>
              <clipPath id={`finger-clip-${idx}`}>
                <rect x="4" y="85" width="52" height="45" rx="10" />
              </clipPath>
              {design.designElements.includes('ombre') && (
                <linearGradient id={`ombre-${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="white" stopOpacity="0" />
                  <stop offset="100%" stopColor="white" stopOpacity="0.4" />
                </linearGradient>
              )}
            </defs>

            {/* Finger body (behind nail) */}
            <rect x="4" y="85" width="52" height="45" rx="10" fill={skinTone} />
            <rect x="4" y="85" width="52" height="45" rx="10"
              fill="none" stroke="#E8CDBE" strokeWidth="1" />

            {/* Nail */}
            <g clipPath={`url(#nail-clip-${idx})`}>
              <rect x="0" y="0" width="60" height="90" fill={colorHex} />
              <DesignOverlay designIds={design.designElements} nailIdx={idx} />
              <FinishOverlay finishId={design.finish} nailIdx={idx} />
            </g>

            {/* Nail outline */}
            <path
              d={shapePath}
              fill="none"
              stroke={hasDesign ? '#D4A9B0' : '#CCC'}
              strokeWidth="1.5"
            />

            {/* Cuticle line */}
            <path
              d="M 6 88 Q 30 82 54 88"
              fill="none"
              stroke="#E0BFB5"
              strokeWidth="1.2"
              opacity="0.7"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
