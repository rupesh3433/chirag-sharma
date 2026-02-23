// ============================================================
// EditVideoModal.tsx
// Edit video metadata (title, description, category, visibility, URL)
// ============================================================

import { useState, useEffect } from 'react';
import { RefreshCw, Eye, EyeOff, Edit2, Youtube } from 'lucide-react';
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
import { PortfolioVideo, PortfolioCategory } from '../../types/portfolio';

interface Props {
  video: PortfolioVideo | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: PortfolioCategory[];
}

const EditVideoModal = ({ video, open, onClose, onSuccess, categories }: Props) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'general',
    is_visible: true,
    youtube_url: '',
  });

  useEffect(() => {
    if (video) {
      setForm({
        title: video.title,
        description: video.description || '',
        category: video.category,
        is_visible: video.is_visible,
        youtube_url: video.youtube_url,
      });
    }
  }, [video]);

  const handleSubmit = async () => {
    if (!video) return;
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('description', form.description.trim());
      fd.append('category', form.category);
      fd.append('is_visible', String(form.is_visible));
      if (form.youtube_url !== video.youtube_url) {
        fd.append('youtube_url', form.youtube_url.trim());
      }
      await portfolioApi.videos.update(video.id, fd);
      toast({ title: 'Updated ✅', description: 'Video updated.' });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({ title: 'Failed', description: error.response?.data?.detail || 'Update failed.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!video) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5 text-blue-500" /> Edit Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden border aspect-video">
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`;
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label>YouTube URL</Label>
            <Input
              value={form.youtube_url}
              onChange={(e) => setForm((f) => ({ ...f, youtube_url: e.target.value }))}
              placeholder="https://youtu.be/..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={form.is_visible} onCheckedChange={(v) => setForm((f) => ({ ...f, is_visible: v }))} />
            <Label className="flex items-center gap-1.5 cursor-pointer">
              {form.is_visible ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
              {form.is_visible ? 'Visible' : 'Hidden'}
            </Label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
              {isSubmitting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditVideoModal;