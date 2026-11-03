"use client";

import Image from "next/image";
import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { cropStyle, type SlotImage } from "@/lib/images";

type CropToolProps = {
  image: SlotImage;
  /** The frame's width divided by its height on the page. */
  aspect: number;
  focal: { x: number; y: number };
  onChange: (change: { focal?: { x: number; y: number }; zoom?: number }) => void;
};

const clamp = (value: number) => Math.round(Math.min(100, Math.max(0, value)) * 10) / 10;

/**
 * Pick the part of the photo that matters most. Tap or drag on the whole photo
 * to move the focal point, and zoom in if needed. The preview shows the exact
 * shape the page will crop to.
 */
export function CropTool({ image, aspect, focal, onChange }: CropToolProps) {
  const surface = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  if (!image.src) return null;
  const ratio = image.width / image.height;

  const moveTo = (event: PointerEvent<HTMLDivElement>) => {
    const rect = surface.current?.getBoundingClientRect();
    if (!rect) return;
    onChange({
      focal: {
        x: clamp(((event.clientX - rect.left) / rect.width) * 100),
        y: clamp(((event.clientY - rect.top) / rect.height) * 100),
      },
    });
  };

  const nudge = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 2;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    onChange({ focal: { x: clamp(focal.x + move[0]), y: clamp(focal.y + move[1]) } });
  };

  const preview = { ...image, focal };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-medium">Focal point</p>
        <div
          ref={surface}
          role="slider"
          tabIndex={0}
          aria-label="Focal point. Use the arrow keys to move it."
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(focal.x)}
          aria-valuetext={`${Math.round(focal.x)}% across, ${Math.round(focal.y)}% down`}
          className="relative mx-auto touch-none select-none overflow-hidden rounded-md bg-neutral-200"
          style={{ aspectRatio: `${image.width} / ${image.height}`, width: `min(100%, calc(32dvh * ${ratio}))` }}
          onPointerDown={(event) => {
            dragging.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            moveTo(event);
          }}
          onPointerMove={(event) => dragging.current && moveTo(event)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          onKeyDown={nudge}
        >
          <Image src={image.src} alt="" fill sizes="400px" className="pointer-events-none object-contain" draggable={false} />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_0_0_2px_#2f6fed,0_2px_8px_rgb(0_0_0/0.4)]"
            style={{ left: `${focal.x}%`, top: `${focal.y}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-neutral-600">Tap or drag on the photo to choose what stays in view.</p>
      </div>

      <label className="block">
        <span className="flex justify-between text-sm font-medium">
          Zoom <span className="font-normal text-neutral-600">{Math.round(image.zoom * 100)}%</span>
        </span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={image.zoom}
          onChange={(event) => onChange({ zoom: Number(event.target.value) })}
          className="mt-1 h-11 w-full accent-[#2f6fed]"
        />
      </label>

      <div>
        <p className="mb-2 text-sm font-medium">How it will look</p>
        <div
          className="relative mx-auto overflow-hidden rounded-md bg-neutral-200"
          style={{ aspectRatio: String(aspect), width: `min(100%, calc(26dvh * ${aspect}))` }}
        >
          <Image src={image.src} alt="" fill sizes="400px" className="object-cover" style={cropStyle(preview)} />
        </div>
      </div>
    </div>
  );
}
