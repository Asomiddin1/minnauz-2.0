'use client';

import * as React from 'react';
import {
  RotateCcw,
  Undo2,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Palette,
  Eraser,
  PenTool,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

interface KanjiDrawingCanvasProps {
  character: string;
  size?: number;
}

export function KanjiDrawingCanvas({ character, size = 280 }: KanjiDrawingCanvasProps) {
  const { t } = useLang();
  const kDict = t?.kanji;
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [strokes, setStrokes] = React.useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = React.useState<Stroke | null>(null);

  // Styling controls
  const [strokeColor, setStrokeColor] = React.useState('#0f172a'); // Default sumi black
  const [strokeWidth, setStrokeWidth] = React.useState(10); // Calligraphy brush
  const [showOutline, setShowOutline] = React.useState(true); // Faint background hint
  const [completed, setCompleted] = React.useState(false);

  // Canvas context redraw
  const redrawCanvas = React.useCallback(
    (allStrokes: Stroke[], ongoingStroke: Stroke | null) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render all completed strokes
      const strokesToDraw = ongoingStroke ? [...allStrokes, ongoingStroke] : allStrokes;

      strokesToDraw.forEach((stroke) => {
        if (stroke.points.length < 1) return;

        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        if (stroke.points.length === 1) {
          // Single dot
          const p = stroke.points[0];
          ctx.arc(p.x, p.y, stroke.width / 2, 0, Math.PI * 2);
          ctx.fillStyle = stroke.color;
          ctx.fill();
        } else {
          // Smooth curve
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            const p1 = stroke.points[i - 1];
            const p2 = stroke.points[i];
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
          }
          const lastPoint = stroke.points[stroke.points.length - 1];
          ctx.lineTo(lastPoint.x, lastPoint.y);
          ctx.stroke();
        }
      });
    },
    [],
  );

  React.useEffect(() => {
    redrawCanvas(strokes, currentStroke);
  }, [strokes, currentStroke, redrawCanvas]);

  // Pointer coordinate calculation relative to canvas
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const point = getCoordinates(e);
    if (!point) return;

    setIsDrawing(true);
    setCurrentStroke({
      points: [point],
      color: strokeColor,
      width: strokeWidth,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke) return;
    const point = getCoordinates(e);
    if (!point) return;

    setCurrentStroke((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, point],
      };
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    setIsDrawing(false);
    if (currentStroke && currentStroke.points.length > 0) {
      setStrokes((prev) => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, prev.length - 1));
    setCompleted(false);
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke(null);
    setCompleted(false);
  };

  const handleFinish = () => {
    if (strokes.length > 0) {
      setCompleted(true);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 select-none">
      {/* Drawing Board Container */}
      <div
        className="relative rounded-3xl border-2 border-border/80 bg-card overflow-hidden shadow-inner flex items-center justify-center touch-none"
        style={{ width: size, height: size }}
      >
        {/* Traditional Japanese 4-Quadrant Guideline ("田" Grid) */}
        <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-15">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] border-t-2 border-dashed border-foreground" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] border-l-2 border-dashed border-foreground" />
          <div className="absolute inset-4 rounded-2xl border border-dashed border-foreground/50" />
        </div>

        {/* Faint Ghost Outline (Shablon) if toggled ON */}
        {showOutline && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15 dark:opacity-12 select-none">
            <span className="text-8xl sm:text-9xl font-black font-japanese text-foreground">
              {character}
            </span>
          </div>
        )}

        {/* Interactive Drawing Canvas */}
        <canvas
          ref={canvasRef}
          width={size * 2} // Retina 2x scale
          height={size * 2}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative z-10 w-full h-full cursor-crosshair touch-none"
        />

        {/* Finished Congratulation Pulse */}
        {completed && (
          <div className="absolute inset-0 z-20 bg-emerald-500/15 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg mb-2 animate-bounce">
              <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
            </div>
            <p className="text-sm font-black text-foreground">
              {kDict?.canvasCongrats || 'Ajoyib mashq! 🎉'}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {(kDict?.canvasStrokesDrawn || 'Siz {count} ta chiziq bilan chizib koʻrdingiz').replace('{count}', String(strokes.length))}
            </p>
            <button
              type="button"
              onClick={() => setCompleted(false)}
              className="mt-3 px-3 py-1 rounded-xl bg-card border border-border text-[11px] font-bold text-foreground hover:bg-secondary cursor-pointer shadow-xs"
            >
              {kDict?.canvasClose || 'Yopish'}
            </button>
          </div>
        )}
      </div>

      {/* Toolbar & Controls */}
      <div className="flex flex-col items-center gap-3 w-full max-w-[280px]">
        {/* Main Action Buttons */}
        <div className="flex items-center justify-between w-full p-1.5 rounded-2xl bg-secondary/60 border border-border/60 shadow-2xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card disabled:opacity-40 transition-colors cursor-pointer"
              title={kDict?.canvasUndo || 'Oxirgi chiziqni bekor qilish (Undo)'}
            >
              <Undo2 className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={strokes.length === 0}
              className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-40 transition-colors cursor-pointer"
              title={kDict?.canvasClear || 'Tozalash (Clear)'}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Shablon (Ghost Outline) Toggle */}
          <button
            type="button"
            onClick={() => setShowOutline(!showOutline)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              showOutline
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={showOutline ? (kDict?.canvasOutlineOn || 'Shablon: Bor') : (kDict?.canvasOutlineOff || 'Yoddan')}
          >
            {showOutline ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{showOutline ? (kDict?.canvasOutlineOn || 'Shablon: Bor') : (kDict?.canvasOutlineOff || 'Yoddan')}</span>
          </button>

          {/* Finish & Compare */}
          <button
            type="button"
            onClick={handleFinish}
            disabled={strokes.length === 0}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black transition-all cursor-pointer shadow-xs disabled:opacity-40 active:scale-95"
            title={kDict?.canvasCheck || 'Tekshirish'}
          >
            {kDict?.canvasCheck || 'Tekshirish'}
          </button>
        </div>

        {/* Color Palette & Brush Size */}
        <div className="flex items-center justify-between w-full px-1 text-xs">
          {/* Colors */}
          <div className="flex items-center gap-1.5">
            {[
              { color: '#0f172a', label: kDict?.canvasInkBlack || 'Qora siyoh (Sumi)' },
              { color: '#2563eb', label: kDict?.canvasInkBlue || 'Moviy' },
              { color: '#dc2626', label: kDict?.canvasInkRed || 'Qizil' },
            ].map((c) => (
              <button
                key={c.color}
                type="button"
                onClick={() => setStrokeColor(c.color)}
                className={`h-6 w-6 rounded-full border-2 transition-transform cursor-pointer ${
                  strokeColor === c.color ? 'scale-115 border-primary shadow-xs' : 'border-transparent'
                }`}
                style={{ backgroundColor: c.color }}
                title={c.label}
              />
            ))}
          </div>

          {/* Width pills */}
          <div className="flex items-center gap-1">
            {[
              { val: 6, label: kDict?.canvasWidthThin || 'Yupqa' },
              { val: 10, label: kDict?.canvasWidthMedium || 'Oʻrtacha' },
              { val: 14, label: kDict?.canvasWidthThick || 'Kalin' },
            ].map((w) => (
              <button
                key={w.val}
                type="button"
                onClick={() => setStrokeWidth(w.val)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  strokeWidth === w.val
                    ? 'bg-foreground text-background shadow-2xs'
                    : 'bg-secondary/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
