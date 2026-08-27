import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Upload, X, Check, Loader2 } from "lucide-react";
import api from "@/lib/api.ts";

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 80 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

async function getCroppedBlob(
  image: HTMLImageElement,
  crop: PixelCrop,
  fileName: string,
  outputWidth?: number,
  outputHeight?: number,
): Promise<File> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Use exact output dimensions if provided, otherwise use natural crop size
  canvas.width = outputWidth ?? Math.round(crop.width * scaleX);
  canvas.height = outputHeight ?? Math.round(crop.height * scaleY);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas context");

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error("Canvas toBlob failed")); return; }
        resolve(new File([blob], fileName, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92
    );
  });
}

// ── Cropper modal ─────────────────────────────────────────────────────────────

function CropModal({
  src,
  fileName,
  aspect,
  outputWidth,
  outputHeight,
  onConfirm,
  onCancel,
}: {
  src: string;
  fileName: string;
  aspect?: number;
  outputWidth?: number;
  outputHeight?: number;
  onConfirm: (file: File) => void;
  onCancel: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [processing, setProcessing] = useState(false);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect ?? 1));
    },
    [aspect]
  );

  const handleConfirm = async () => {
    if (!imgRef.current || !completedCrop || processing) return;
    setProcessing(true);
    try {
      const file = await getCroppedBlob(imgRef.current, completedCrop, fileName, outputWidth, outputHeight);
      onConfirm(file);
    } finally {
      setProcessing(false);
    }
  };

  const sizeLabel = outputWidth && outputHeight ? `${outputWidth}×${outputHeight}px` : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="font-bold text-gray-900">Обрезать фото</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {sizeLabel
                ? `Выберите область — она будет сохранена в размере ${sizeLabel}`
                : "Выберите нужную область и нажмите «Готово»"}
            </p>
          </div>
          <button type="button" onClick={onCancel} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop area */}
        <div className="p-5 flex items-center justify-center bg-gray-50 min-h-64 max-h-[60vh] overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            minWidth={50}
            minHeight={50}
            className="max-w-full max-h-full"
          >
            <img
              ref={imgRef}
              src={src}
              alt="crop preview"
              onLoad={onImageLoad}
              style={{ maxHeight: "55vh", maxWidth: "100%", display: "block" }}
            />
          </ReactCrop>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => { void handleConfirm(); }}
            disabled={!completedCrop || processing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {processing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Обработка...</>
            ) : (
              <><Check className="w-4 h-4" /> Готово — использовать</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

type Props = {
  value: string;
  onChange: (url: string) => void;
  aspect?: number;          // e.g. 1 = square, 16/9 = landscape. undefined = free
  /** Exact output width in pixels after crop (canvas is resized to this) */
  outputWidth?: number;
  /** Exact output height in pixels after crop (canvas is resized to this) */
  outputHeight?: number;
  disabled?: boolean;
  /** Preview size class, e.g. "w-20 h-20". Defaults to "w-16 h-16" */
  previewClass?: string;
  /** Label shown on the button. Defaults to "Загрузить фото" */
  label?: string;
};

export default function ImageUploadCrop({
  value,
  onChange,
  aspect,
  outputWidth,
  outputHeight,
  disabled,
  previewClass = "w-16 h-16",
  label = "Загрузить фото",
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`Файл слишком большой. Максимум ${MAX_FILE_SIZE_MB} МБ.`);
      return;
    }

    setCropFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async (croppedFile: File) => {
    setCropSrc(null);
    try {
      setUploading(true);
      const url = await api.uploadDishImage(croppedFile);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => setCropSrc(null);

  const handleRemove = () => {
    onChange("");
    setError(null);
  };

  // Build aspect ratio hint label
  const aspectHint = outputWidth && outputHeight
    ? `${outputWidth}×${outputHeight}px`
    : aspect
      ? `рекомендуется ${aspect === 1 ? "1:1" : `${aspect.toFixed(1).replace(".0", "")}:1`}`
      : null;

  return (
    <>
      <div className="flex items-center gap-3 flex-wrap">
        {/* Preview */}
        <div className={`relative ${previewClass} rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex-shrink-0`}>
          {value ? (
            <>
              <img src={value} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled || uploading}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : uploading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              <span className="text-[10px] text-center px-1 leading-tight">Выбрать</span>
            </button>
          )}
        </div>

        {/* Button + info */}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Загрузка...</>
            ) : (
              <><Upload className="w-4 h-4" /> {label}</>
            )}
          </button>
          <p className="text-xs text-gray-400">
            JPG, PNG, WebP · до {MAX_FILE_SIZE_MB} МБ
            {aspectHint ? ` · ${aspectHint}` : ""}
          </p>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileSelect}
      />

      {cropSrc && (
        <CropModal
          src={cropSrc}
          fileName={cropFileName}
          aspect={aspect}
          outputWidth={outputWidth}
          outputHeight={outputHeight}
          onConfirm={(file) => { void handleCropConfirm(file); }}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}
