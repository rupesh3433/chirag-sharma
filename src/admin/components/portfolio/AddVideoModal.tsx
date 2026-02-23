// ============================================================
// AddVideoModal.tsx
// Modal to add a YouTube video URL (supports unlisted videos)
// ============================================================

import { useState } from 'react';
import { Youtube, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Textarea } from '@shared/components/ui/textarea';
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
import { useToast } from '@shared/hooks/use-toast';
import { portfolioApi } from '../../services/portfolioApi';
import { PortfolioCategory } from '../../types/portfolio';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: PortfolioCategory[];
}

const extractYoutubeId = (url: string): string | null => {
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_\-]{11})/,
    /youtube\.com\/watch\?.*v=([A-Za-z0-9_\-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_\-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_\-]{11})/,
    /youtube\.com\/v\/([A-Za-z0-9_\-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

const AddVideoModal = ({ open, onClose, onSuccess, categories }: Props) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    youtube_url: '',
    title: '',
    description: '',
    category: categories[0]?.slug || 'general',
    is_visible: true,
  });

  const previewId = form.youtube_url ? extractYoutubeId(form.youtube_url) : null;
  const isValidUrl = !!previewId;

  const reset = () => {
    setForm({ youtube_url: '', title: '', description: '', category: categories[0]?.slug || 'general', is_visible: true });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.youtube_url.trim()) {
      toast({ title: 'Validation Error', description: 'YouTube URL is required.', variant: 'destructive' });
      return;
    }
    if (!isValidUrl) {
      toast({ title: 'Invalid URL', description: 'Please enter a valid YouTube URL.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('youtube_url', form.youtube_url.trim());
      fd.append('title', form.title.trim() || `Video`);
      fd.append('description', form.description.trim());
      fd.append('category', form.category);
      fd.append('is_visible', String(form.is_visible));

      await portfolioApi.videos.add(fd);
      toast({ title: 'Video Added ✅', description: 'YouTube video has been added to portfolio.' });
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast({
        title: 'Failed',
        description: error.response?.data?.detail || 'Could not add video.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            Add YouTube Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* URL field */}
          <div className="space-y-1.5">
            <Label>YouTube URL *</Label>
            <Input
              placeholder="https://youtu.be/... or youtube.com/watch?v=..."
              value={form.youtube_url}
              onChange={(e) => setForm((f) => ({ ...f, youtube_url: e.target.value }))}
              className={form.youtube_url && !isValidUrl ? 'border-destructive' : ''}
            />
            {form.youtube_url && !isValidUrl && (
              <p className="text-xs text-destructive">
                Invalid YouTube URL. Supports youtu.be, watch?v=, /embed/, /shorts/
              </p>
            )}
            {isValidUrl && (
              <p className="text-xs text-green-600">✅ Valid YouTube URL — Video ID: {previewId}</p>
            )}
          </div>

          {/* Thumbnail preview */}
          {previewId && (
            <div className="rounded-lg overflow-hidden border aspect-video bg-black">
              <img
                src={`https://img.youtube.com/vi/${previewId}/maxresdefault.jpg`}
                alt="YouTube thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${previewId}/hqdefault.jpg`;
                }}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              placeholder="Video title (optional, auto-filled from ID)"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              placeholder="Short description (optional)"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
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

          <div className="flex items-center gap-3">
            <Switch
              checked={form.is_visible}
              onCheckedChange={(v) => setForm((f) => ({ ...f, is_visible: v }))}
            />
            <Label className="flex items-center gap-1.5 cursor-pointer">
              {form.is_visible ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
              {form.is_visible ? 'Visible on portfolio' : 'Hidden from portfolio'}
            </Label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSubmit} disabled={isSubmitting || !isValidUrl} className="flex-1">
              {isSubmitting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Add Video
            </Button>
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddVideoModal;