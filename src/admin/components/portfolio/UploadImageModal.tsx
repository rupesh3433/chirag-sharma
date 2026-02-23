// ============================================================
// UploadImageModal.tsx — COMPLETE VERSION
// Features:
//   ✅ Multi-file upload (batch) with individual progress bars
//   ✅ Drag & drop zone with visual feedback
//   ✅ Direct URL mode (multiple URLs)
//   ✅ Per-file title editing before upload
//   ✅ Per-file remove before upload
//   ✅ Batch category + visibility settings
//   ✅ Upload queue with success/error/uploading status per file
//   ✅ Retry failed uploads
//   ✅ File size + type validation
//   ✅ Thumbnail preview per file
// ============================================================

import { useState, useRef, useCallback } from 'react';
import {
  Upload, Link2, X, Eye, EyeOff, Image,
  CheckCircle2, XCircle, AlertCircle, Loader2, Plus,
  Trash2, FolderOpen, RefreshCw,
} from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select';
import { Switch } from '@shared/components/ui/switch';
import { Progress } from '@shared/components/ui/progress';
import { Badge } from '@shared/components/ui/badge';
import { useToast } from '@shared/hooks/use-toast';
import { portfolioApi } from '../../services/portfolioApi';
import { PortfolioCategory } from '../../types/portfolio';

// ── Types ─────────────────────────────────────────────────────

type Mode = 'upload' | 'url';
type FileStatus = 'queued' | 'uploading' | 'success' | 'error';

interface FileEntry {
  id: string;
  file: File;
  preview: string;
  title: string;
  status: FileStatus;
  progress: number;
  error?: string;
}

interface UrlEntry {
  id: string;
  url: string;
  title: string;
  status: FileStatus;
  error?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: PortfolioCategory[];
}

// ── Helpers ───────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10);

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 10;

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const nameWithoutExt = (filename: string) =>
  filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');

// ── Status icon ───────────────────────────────────────────────

const StatusIcon = ({ status }: { status: FileStatus }) => {
  if (status === 'uploading') return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
  if (status === 'success')   return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === 'error')     return <XCircle className="h-4 w-4 text-red-500" />;
  return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
};

// ── Main component ────────────────────────────────────────────

const UploadImageModal = ({ open, onClose, onSuccess, categories }: Props) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode]               = useState<Mode>('upload');
  const [isDragging, setIsDragging]   = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDone, setUploadDone]   = useState(false);
  const [batchCategory, setBatchCategory] = useState(categories[0]?.slug || 'general');
  const [batchVisible, setBatchVisible]   = useState(true);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [urls, setUrls]   = useState<UrlEntry[]>([{ id: uid(), url: '', title: '', status: 'queued' }]);

  // ── Reset ──────────────────────────────────────────────────

  const reset = () => {
    setMode('upload');
    setFiles([]);
    setUrls([{ id: uid(), url: '', title: '', status: 'queued' }]);
    setBatchCategory(categories[0]?.slug || 'general');
    setBatchVisible(true);
    setIsUploading(false);
    setUploadDone(false);
    setIsDragging(false);
  };

  const handleClose = () => {
    if (isUploading) return;
    if (uploadDone) onSuccess();
    reset();
    onClose();
  };

  // ── File validation ────────────────────────────────────────

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) return `Unsupported type: ${file.type}`;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `Too large (max ${MAX_SIZE_MB}MB)`;
    return null;
  };

  // ── Add files ──────────────────────────────────────────────

  const addFiles = useCallback(
    (incoming: File[]) => {
      const newEntries: FileEntry[] = [];
      const errors: string[] = [];

      for (const file of incoming) {
        const err = validateFile(file);
        if (err) { errors.push(`${file.name}: ${err}`); continue; }
        newEntries.push({
          id: uid(),
          file,
          preview: URL.createObjectURL(file),
          title: nameWithoutExt(file.name),
          status: 'queued',
          progress: 0,
        });
      }

      if (errors.length) {
        toast({ title: 'Some files skipped', description: errors.join('\n'), variant: 'destructive' });
      }
      if (newEntries.length) setFiles((prev) => [...prev, ...newEntries]);
    },
    [toast]
  );

  // ── File input + drag & drop ───────────────────────────────

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) { addFiles(Array.from(e.target.files)); e.target.value = ''; }
  };

  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (dropped.length) addFiles(dropped);
  };

  // ── Per-file edits ─────────────────────────────────────────

  const updateFileTitle = (id: string, title: string) =>
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, title } : f));

  const removeFile = (id: string) =>
    setFiles((prev) => {
      const entry = prev.find((f) => f.id === id);
      if (entry) URL.revokeObjectURL(entry.preview);
      return prev.filter((f) => f.id !== id);
    });

  // ── URL helpers ────────────────────────────────────────────

  const addUrlRow    = () => setUrls((prev) => [...prev, { id: uid(), url: '', title: '', status: 'queued' }]);
  const removeUrlRow = (id: string) => setUrls((prev) => prev.filter((u) => u.id !== id));
  const updateUrl    = (id: string, field: 'url' | 'title', value: string) =>
    setUrls((prev) => prev.map((u) => u.id === id ? { ...u, [field]: value } : u));

  // ── Upload single file ─────────────────────────────────────

  const uploadSingleFile = async (entry: FileEntry): Promise<boolean> => {
    setFiles((prev) => prev.map((f) => f.id === entry.id ? { ...f, status: 'uploading', progress: 10 } : f));

    try {
      const fd = new FormData();
      fd.append('file', entry.file);
      fd.append('title', entry.title.trim() || nameWithoutExt(entry.file.name));
      fd.append('category', batchCategory);
      fd.append('is_visible', String(batchVisible));

      // Simulated progress ticks for UX
      let prog = 10;
      const ticker = setInterval(() => {
        prog = Math.min(prog + Math.random() * 20, 85);
        setFiles((prev) => prev.map((f) => f.id === entry.id ? { ...f, progress: prog } : f));
      }, 300);

      await portfolioApi.images.upload(fd);
      clearInterval(ticker);

      setFiles((prev) => prev.map((f) => f.id === entry.id ? { ...f, status: 'success', progress: 100 } : f));
      return true;
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'Upload failed';
      setFiles((prev) => prev.map((f) => f.id === entry.id ? { ...f, status: 'error', progress: 0, error: msg } : f));
      return false;
    }
  };

  // ── Upload single URL ──────────────────────────────────────

  const uploadSingleUrl = async (entry: UrlEntry): Promise<boolean> => {
    if (!entry.url.trim()) return false;
    setUrls((prev) => prev.map((u) => u.id === entry.id ? { ...u, status: 'uploading' } : u));
    try {
      const fd = new FormData();
      fd.append('url', entry.url.trim());
      fd.append('title', entry.title.trim() || 'Untitled');
      fd.append('category', batchCategory);
      fd.append('is_visible', String(batchVisible));
      await portfolioApi.images.addByUrl(fd);
      setUrls((prev) => prev.map((u) => u.id === entry.id ? { ...u, status: 'success' } : u));
      return true;
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'Failed';
      setUrls((prev) => prev.map((u) => u.id === entry.id ? { ...u, status: 'error', error: msg } : u));
      return false;
    }
  };

  // ── Start all uploads ──────────────────────────────────────

  const handleUpload = async () => {
    const queuedFiles = files.filter((f) => f.status === 'queued');
    const queuedUrls  = urls.filter((u) => u.url.trim() && u.status === 'queued');

    if (mode === 'upload' && queuedFiles.length === 0) {
      toast({ title: 'No files', description: 'Please select at least one image.', variant: 'destructive' });
      return;
    }
    if (mode === 'url' && queuedUrls.length === 0) {
      toast({ title: 'No URLs', description: 'Please enter at least one image URL.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    let successCount = 0;

    if (mode === 'upload') {
      for (const entry of queuedFiles) {
        const ok = await uploadSingleFile(entry);
        if (ok) successCount++;
      }
    } else {
      for (const entry of queuedUrls) {
        const ok = await uploadSingleUrl(entry);
        if (ok) successCount++;
      }
    }

    setIsUploading(false);
    setUploadDone(true);

    if (successCount > 0) {
      toast({ title: `${successCount} image${successCount > 1 ? 's' : ''} added ✅`, description: 'Portfolio updated.' });
      onSuccess();
    }

    const failCount = (mode === 'upload' ? files : urls).filter((i) => i.status === 'error').length;
    if (failCount > 0) {
      toast({ title: `${failCount} failed`, description: 'Check errors below and retry.', variant: 'destructive' });
    }
  };

  // ── Retry failed ───────────────────────────────────────────

  const retryFailed = () => {
    if (mode === 'upload') {
      setFiles((prev) => prev.map((f) => f.status === 'error' ? { ...f, status: 'queued', progress: 0, error: undefined } : f));
    } else {
      setUrls((prev) => prev.map((u) => u.status === 'error' ? { ...u, status: 'queued', error: undefined } : u));
    }
    setUploadDone(false);
  };

  // ── Derived state ──────────────────────────────────────────

  const queuedCount  = mode === 'upload'
    ? files.filter((f) => f.status === 'queued').length
    : urls.filter((u) => u.url.trim() && u.status === 'queued').length;

  const successCount = mode === 'upload'
    ? files.filter((f) => f.status === 'success').length
    : urls.filter((u) => u.status === 'success').length;

  const errorCount   = mode === 'upload'
    ? files.filter((f) => f.status === 'error').length
    : urls.filter((u) => u.status === 'error').length;

  const fileBadgeCount = mode === 'upload'
    ? files.length
    : urls.filter((u) => u.url.trim()).length;

  // ── Render ─────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5 text-pink-500" />
            Add Portfolio Images
            {fileBadgeCount > 0 && (
              <Badge className="ml-1 bg-pink-100 text-pink-700 border-pink-200 border text-xs">
                {fileBadgeCount} {fileBadgeCount === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">

          {/* ── Mode toggle ── */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'upload' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => setMode('upload')}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" /> Upload Files
            </Button>
            <Button
              variant={mode === 'url' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => setMode('url')}
              disabled={isUploading}
            >
              <Link2 className="h-4 w-4 mr-2" /> Direct URLs
            </Button>
          </div>

          {/* ── Batch settings (shared for both modes) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg border">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <FolderOpen className="h-3.5 w-3.5" /> Category (all items)
              </Label>
              <Select value={batchCategory} onValueChange={setBatchCategory} disabled={isUploading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                  ))}
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end pb-1">
              <div className="flex items-center gap-3">
                <Switch checked={batchVisible} onCheckedChange={setBatchVisible} disabled={isUploading} />
                <Label className="flex items-center gap-1.5 cursor-pointer text-sm">
                  {batchVisible
                    ? <Eye className="h-4 w-4 text-green-600" />
                    : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  {batchVisible ? 'Visible on portfolio' : 'Hidden from portfolio'}
                </Label>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════ */}
          {/* UPLOAD MODE                            */}
          {/* ══════════════════════════════════════ */}
          {mode === 'upload' && (
            <div className="space-y-4">

              {/* Drop zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer select-none ${
                  isDragging
                    ? 'border-primary bg-primary/5 scale-[1.01]'
                    : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'
                } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <Upload className={`h-10 w-10 mx-auto mb-3 transition-transform ${isDragging ? 'scale-125 text-primary' : 'text-muted-foreground'}`} />
                <p className="text-sm font-medium">
                  {isDragging ? '📂 Drop images here' : 'Drag & drop images or click to browse'}
                </p>
                <p className="text-xs text-muted-foreground mt-1.5">
                  JPG, PNG, WebP, GIF · max {MAX_SIZE_MB}MB each · multiple files supported
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              {/* File queue */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      {files.length} file{files.length !== 1 ? 's' : ''} in queue
                    </p>
                    {!isUploading && files.some((f) => f.status === 'queued') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-destructive hover:text-destructive h-7"
                        onClick={() => setFiles([])}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear all
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {files.map((entry) => (
                      <div
                        key={entry.id}
                        className={`flex gap-3 p-3 rounded-lg border transition-colors ${
                          entry.status === 'success'   ? 'border-green-200 bg-green-50' :
                          entry.status === 'error'     ? 'border-red-200 bg-red-50' :
                          entry.status === 'uploading' ? 'border-blue-200 bg-blue-50' :
                          'border-muted bg-card'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-12 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted border">
                          <img
                            src={entry.preview}
                            alt={entry.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <Input
                            value={entry.title}
                            onChange={(e) => updateFileTitle(entry.id, e.target.value)}
                            placeholder="Image title"
                            className="h-7 text-xs"
                            disabled={entry.status !== 'queued'}
                          />
                          <p className="text-xs text-muted-foreground truncate">
                            {entry.file.name} · {formatBytes(entry.file.size)}
                          </p>

                          {/* Progress bar */}
                          {entry.status === 'uploading' && (
                            <div className="space-y-1">
                              <Progress value={entry.progress} className="h-1.5" />
                              <p className="text-xs text-blue-600">{Math.round(entry.progress)}%</p>
                            </div>
                          )}

                          {/* Error */}
                          {entry.status === 'error' && entry.error && (
                            <p className="text-xs text-red-600">{entry.error}</p>
                          )}
                        </div>

                        {/* Status + remove */}
                        <div className="flex flex-col items-center justify-between flex-shrink-0">
                          <StatusIcon status={entry.status} />
                          {entry.status === 'queued' && !isUploading && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => removeFile(entry.id)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════ */}
          {/* URL MODE                               */}
          {/* ══════════════════════════════════════ */}
          {mode === 'url' && (
            <div className="space-y-3">
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {urls.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex gap-2 p-3 rounded-lg border transition-colors ${
                      entry.status === 'success'   ? 'border-green-200 bg-green-50' :
                      entry.status === 'error'     ? 'border-red-200 bg-red-50' :
                      entry.status === 'uploading' ? 'border-blue-200 bg-blue-50' :
                      'border-muted bg-card'
                    }`}
                  >
                    {/* Thumbnail preview */}
                    {entry.url.trim() && (
                      <div className="w-10 h-12 flex-shrink-0 rounded overflow-hidden border bg-muted">
                        <img
                          src={entry.url}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <Input
                        placeholder="https://example.com/photo.jpg"
                        value={entry.url}
                        onChange={(e) => updateUrl(entry.id, 'url', e.target.value)}
                        className="h-7 text-xs font-mono"
                        disabled={entry.status !== 'queued'}
                      />
                      <Input
                        placeholder="Title (optional)"
                        value={entry.title}
                        onChange={(e) => updateUrl(entry.id, 'title', e.target.value)}
                        className="h-7 text-xs"
                        disabled={entry.status !== 'queued'}
                      />
                      {entry.status === 'uploading' && (
                        <p className="text-xs text-blue-600 flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Adding…
                        </p>
                      )}
                      {entry.status === 'error' && entry.error && (
                        <p className="text-xs text-red-600">{entry.error}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-between flex-shrink-0">
                      <StatusIcon status={entry.status} />
                      {entry.status === 'queued' && !isUploading && urls.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeUrlRow(entry.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!isUploading && (
                <Button variant="outline" size="sm" onClick={addUrlRow} className="w-full gap-2">
                  <Plus className="h-4 w-4" /> Add Another URL
                </Button>
              )}
            </div>
          )}

          {/* ── Upload result summary ── */}
          {uploadDone && (
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${
              errorCount === 0 ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
            }`}>
              {errorCount === 0
                ? <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                : <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />}
              <div className="flex-1 text-sm">
                {successCount > 0 && (
                  <span className="text-green-700 font-medium">{successCount} uploaded. </span>
                )}
                {errorCount > 0 && (
                  <span className="text-amber-700">{errorCount} failed.</span>
                )}
              </div>
              {errorCount > 0 && (
                <Button size="sm" variant="outline" onClick={retryFailed} className="flex-shrink-0 gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" /> Retry Failed
                </Button>
              )}
            </div>
          )}

          {/* ── Action buttons ── */}
          <div className="flex gap-2 pt-1 border-t">
            {!uploadDone ? (
              <Button
                onClick={handleUpload}
                disabled={isUploading || queuedCount === 0}
                className="flex-1"
              >
                {isUploading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading…</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" />
                    Upload {queuedCount > 0 ? `${queuedCount} Image${queuedCount !== 1 ? 's' : ''}` : ''}
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleClose} className="flex-1">Done</Button>
            )}
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              {uploadDone ? 'Close' : 'Cancel'}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadImageModal;