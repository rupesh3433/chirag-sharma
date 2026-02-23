// ============================================================
// EditImageModal.tsx
// Edit image metadata (title, category, visibility)
// ============================================================

import { useState, useEffect } from 'react';
import { RefreshCw, Eye, EyeOff, Edit2 } from 'lucide-react';
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
import { useToast } from '@shared/hooks/use-toast';
import { portfolioApi } from '../../services/portfolioApi';
import { PortfolioImage, PortfolioCategory } from '../../types/portfolio';

interface Props {
  image: PortfolioImage | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: PortfolioCategory[];
}

const EditImageModal = ({ image, open, onClose, onSuccess, categories }: Props) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'general', is_visible: true });

  useEffect(() => {
    if (image) {
      setForm({ title: image.title, category: image.category, is_visible: image.is_visible });
    }
  }, [image]);

  const handleSubmit = async () => {
    if (!image) return;
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('category', form.category);
      fd.append('is_visible', String(form.is_visible));
      await portfolioApi.images.update(image.id, fd);
      toast({ title: 'Updated ✅', description: 'Image metadata updated.' });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({ title: 'Failed', description: error.response?.data?.detail || 'Update failed.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5 text-blue-500" /> Edit Image
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden border aspect-[9/16] max-h-48 w-fit mx-auto">
            <img src={image.url} alt={image.title} className="h-full object-cover" />
          </div>

          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
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

export default EditImageModal;