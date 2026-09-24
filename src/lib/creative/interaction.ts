import {
  CREATIVE_FORMAT_DIMENSIONS,
  type CreativeFormatLayout,
  type CreativeLayerTransform,
  type CreativeTextLayer,
} from "./types.ts";

export type CreativeInteractionLayer = "background" | "athlete" | "logo" | `text:${string}`;

export type CreativeImageDimensions = {
  width: number;
  height: number;
};

export type CreativePixelRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CreativeInteractionPoint = {
  x: number;
  y: number;
};

export type CreativeResizeCorner = "nw" | "ne" | "sw" | "se";

export const INTERACTION_LAYER_LABELS: Record<CreativeInteractionLayer, string> = {
  background: "Background",
  athlete: "Athlete",
  logo: "Logo",
};

export function layerLabel(layer: CreativeInteractionLayer): string {
  if (layer.startsWith("text:")) {
    const id = layer.slice("text:".length);
    return ({
      "event-name": "Event name",
      "event-date": "Date",
      "event-location": "Location",
      "event-cta": "Call to action",
    } as Record<string, string>)[id] ?? id;
  }
  return INTERACTION_LAYER_LABELS[layer];
}

export function layerTransform(layout: CreativeFormatLayout, layer: CreativeInteractionLayer): CreativeLayerTransform | CreativeTextLayer | null {
  if (layer === "background" || layer === "athlete" || layer === "logo") return layout[layer];
  return layout.text.find((candidate) => candidate.id === layer.slice("text:".length)) ?? null;
}

function finite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Keep enough of a layer on the surface to make it selectable again. */
export function clampLayerPosition(transform: CreativeLayerTransform, x: number, y: number): CreativeInteractionPoint {
  const minX = -Math.min(0.8, Math.max(0, transform.width * 0.8));
  const minY = -Math.min(0.8, Math.max(0, transform.height * 0.8));
  const maxX = Math.max(minX, 1 - Math.min(0.2, Math.max(0, transform.width * 0.2)));
  const maxY = Math.max(minY, 1 - Math.min(0.2, Math.max(0, transform.height * 0.2)));
  return {
    x: clamp(finite(x, transform.x), minX, maxX),
    y: clamp(finite(y, transform.y), minY, maxY),
  };
}

export function moveLayer(transform: CreativeLayerTransform, delta: CreativeInteractionPoint): CreativeLayerTransform {
  const position = clampLayerPosition(transform, transform.x + finite(delta.x, 0), transform.y + finite(delta.y, 0));
  return { ...transform, ...position };
}

/** Background bounds always cover the output, so 100% has no room to pan. */
export function normalizeBackgroundTransform(transform: CreativeLayerTransform): CreativeLayerTransform {
  const zoom = clamp(finite(transform.width, 1), 1, 2);
  return {
    ...transform,
    x: clamp(finite(transform.x, (1 - zoom) / 2), 1 - zoom, 0),
    y: clamp(finite(transform.y, (1 - zoom) / 2), 1 - zoom, 0),
    width: zoom,
    height: zoom,
    fit: "cover",
  };
}

export function zoomBackground(transform: CreativeLayerTransform, percent: number): CreativeLayerTransform {
  const current = normalizeBackgroundTransform(transform);
  const zoom = clamp(finite(percent, current.width * 100) / 100, 1, 2);
  const centerX = (0.5 - current.x) / current.width;
  const centerY = (0.5 - current.y) / current.height;
  return normalizeBackgroundTransform({ ...current, width: zoom, height: zoom, x: 0.5 - centerX * zoom, y: 0.5 - centerY * zoom });
}

export function panBackground(transform: CreativeLayerTransform, position: CreativeInteractionPoint): CreativeLayerTransform {
  return normalizeBackgroundTransform({ ...normalizeBackgroundTransform(transform), ...position });
}

/** Resize an image by output-surface width while retaining its transform aspect ratio. */
export function resizeImageProportionally(transform: CreativeLayerTransform, widthRatio: number): CreativeLayerTransform {
  const requestedScale = finite(widthRatio, transform.width) / Math.max(transform.width, 0.0001);
  const minScale = Math.max(0.04 / Math.max(transform.width, 0.0001), 0.04 / Math.max(transform.height, 0.0001));
  const maxScale = Math.min(1.8 / Math.max(transform.width, 0.0001), 1.8 / Math.max(transform.height, 0.0001));
  const scale = clamp(requestedScale, minScale, maxScale);
  const width = transform.width * scale;
  const height = transform.height * scale;
  const position = clampLayerPosition({ ...transform, width, height }, transform.x, transform.y);
  return { ...transform, width, height, ...position };
}

/** Fits an image inside a format-specific area while matching its intrinsic pixel aspect. */
export function fitImageTransformToAspect(
  transform: CreativeLayerTransform,
  sourceAspect: number,
  outputWidth: number,
  outputHeight: number,
  maxWidth: number,
  maxHeight: number,
): CreativeLayerTransform {
  if (!Number.isFinite(sourceAspect) || sourceAspect <= 0 || outputWidth <= 0 || outputHeight <= 0) return transform;
  const normalizedAspect = sourceAspect * outputHeight / outputWidth;
  const height = Math.min(maxHeight, maxWidth / normalizedAspect);
  const width = height * normalizedAspect;
  const centerX = transform.x + transform.width / 2;
  const centerY = transform.y + transform.height / 2;
  const x = clamp(centerX - width / 2, 0, 1 - width);
  const y = clamp(centerY - height / 2, 0, 1 - height);
  return { ...transform, x, y, width, height, fit: "contain" };
}

/** Resizes from a fixed opposite corner using a uniform scale in output pixels. */
export function resizeImageFromCorner(
  transform: CreativeLayerTransform,
  outputWidth: number,
  outputHeight: number,
  start: CreativeInteractionPoint,
  current: CreativeInteractionPoint,
  corner: CreativeResizeCorner,
): CreativeLayerTransform {
  const rect = {
    x: transform.x * outputWidth,
    y: transform.y * outputHeight,
    width: transform.width * outputWidth,
    height: transform.height * outputHeight,
  };
  const anchorX = corner.endsWith("w") ? rect.x + rect.width : rect.x;
  const anchorY = corner.startsWith("n") ? rect.y + rect.height : rect.y;
  const startVector = { x: start.x - anchorX, y: start.y - anchorY };
  const nextVector = { x: current.x - anchorX, y: current.y - anchorY };
  const denominator = startVector.x ** 2 + startVector.y ** 2;
  if (!denominator) return transform;
  const requestedScale = (nextVector.x * startVector.x + nextVector.y * startVector.y) / denominator;
  const minScale = Math.max(40 / Math.max(rect.width, 1), 40 / Math.max(rect.height, 1));
  const maxScale = Math.min(1.8 * outputWidth / Math.max(rect.width, 1), 1.8 * outputHeight / Math.max(rect.height, 1));
  const scale = clamp(requestedScale, minScale, maxScale);
  const width = transform.width * scale;
  const height = transform.height * scale;
  const x = corner.endsWith("w") ? anchorX / outputWidth - width : anchorX / outputWidth;
  const y = corner.startsWith("n") ? anchorY / outputHeight - height : anchorY / outputHeight;
  return { ...transform, x, y, width, height };
}

/** Text needs a taller box as its requested size grows, otherwise the renderer's fit pass would shrink it back down. */
export function setTextFontSize(
  layer: CreativeTextLayer,
  fontSizePixels: number,
  outputWidth: number,
  outputHeight: number,
): CreativeTextLayer {
  const safePixels = clamp(finite(fontSizePixels, 10), 10, Math.max(10, outputWidth * 0.25));
  const fontSizeRatio = safePixels / outputWidth;
  const maxLines = Math.max(1, Math.floor(layer.maxLines ?? 2));
  const minimumHeight = (fontSizeRatio * 1.12 * maxLines * outputWidth) / outputHeight;
  const height = Math.max(layer.transform.height, minimumHeight);
  const position = clampLayerPosition({ ...layer.transform, height }, layer.transform.x, layer.transform.y);
  return { ...layer, fontSizeRatio, transform: { ...layer.transform, height, ...position } };
}

export function textFontSizePixels(layer: CreativeTextLayer, outputWidth: number): number {
  return Math.round(Math.max(10, (layer.fontSizeRatio ?? 0.05) * outputWidth));
}

function rectForTransform(transform: CreativeLayerTransform, width: number, height: number): CreativePixelRect {
  return {
    x: transform.x * width,
    y: transform.y * height,
    width: Math.max(0, transform.width * width),
    height: Math.max(0, transform.height * height),
  };
}

/**
 * Returns the pixels actually occupied by an image after the renderer's
 * contain/cover fit. Cover is clipped to its transform box; contain leaves
 * transparent margins that should not select the image.
 */
export function imageInteractionRect(
  transform: CreativeLayerTransform,
  outputWidth: number,
  outputHeight: number,
  source: CreativeImageDimensions | undefined,
): CreativePixelRect {
  const rect = rectForTransform(transform, outputWidth, outputHeight);
  if (!source || source.width <= 0 || source.height <= 0 || transform.fit !== "contain") return rect;
  const scale = Math.min(rect.width / source.width, rect.height / source.height);
  const width = source.width * scale;
  const height = source.height * scale;
  return { x: rect.x + (rect.width - width) / 2, y: rect.y + (rect.height - height) / 2, width, height };
}

function contains(rect: CreativePixelRect, point: CreativeInteractionPoint): boolean {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

function containsRotated(transform: CreativeLayerTransform, rect: CreativePixelRect, point: CreativeInteractionPoint): boolean {
  const rotation = ((transform.rotationDeg ?? 0) * Math.PI) / 180;
  if (!rotation) return contains(rect, point);
  const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  const cos = Math.cos(-rotation);
  const sin = Math.sin(-rotation);
  const local = { x: center.x + (point.x - center.x) * cos - (point.y - center.y) * sin, y: center.y + (point.x - center.x) * sin + (point.y - center.y) * cos };
  return contains(rect, local);
}

/** Hit testing follows the same paint order as drawCreative, with later layers on top. */
export function hitTestCreativeLayer(
  point: CreativeInteractionPoint,
  layout: CreativeFormatLayout,
  format: "card" | "banner",
  assets: Partial<Record<"background" | "athlete" | "logo", CreativeImageDimensions>> = {},
  availableAssets?: Partial<Record<"background" | "athlete" | "logo", boolean>>,
): CreativeInteractionLayer | null {
  const { width, height } = CREATIVE_FORMAT_DIMENSIONS[format];
  for (let index = layout.text.length - 1; index >= 0; index -= 1) {
    const layer = layout.text[index];
    const rect = rectForTransform(layer.transform, width, height);
    if (containsRotated(layer.transform, rect, point)) return `text:${layer.id}`;
  }
  for (const slot of ["logo", "athlete"] as const) {
    if (availableAssets && !availableAssets[slot]) continue;
    const transform = layout[slot];
    if (containsRotated(transform, imageInteractionRect(transform, width, height, assets[slot]), point)) return slot;
  }
  const background = layout.background;
  if (availableAssets && !availableAssets.background) return null;
  if (containsRotated(background, imageInteractionRect(background, width, height, assets.background), point)) return "background";
  return null;
}

export function interactionRectForLayer(
  layout: CreativeFormatLayout,
  format: "card" | "banner",
  layer: CreativeInteractionLayer,
  assets: Partial<Record<"background" | "athlete" | "logo", CreativeImageDimensions>> = {},
): CreativePixelRect | null {
  const { width, height } = CREATIVE_FORMAT_DIMENSIONS[format];
  const selected = layerTransform(layout, layer);
  const transform = selected && "transform" in selected ? selected.transform : selected;
  if (!transform || !("width" in transform)) return null;
  if (layer === "background" || layer === "athlete" || layer === "logo") return imageInteractionRect(transform, width, height, assets[layer]);
  return rectForTransform(transform, width, height);
}
