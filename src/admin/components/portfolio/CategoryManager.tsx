// ============================================================
// CategoryManager.tsx
// Inline category management panel — create, edit, delete
// ============================================================

import { useState } from 'react';
import { Plus, Trash2, Edit2, RefreshCw, FolderOpen, GripVertical } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@shared/components/ui/alert-dialog';
import { Badge } from '@shared/components/ui/badge';
import { useToast } from '@shared/hooks/use-toast';
import { portfolioApi } from '@admin/services/portfolioApi';
import { PortfolioCategory } from '../../types/portfolio';

interface Props {
  categories: PortfolioCategory[];
  onRefresh: () => void;
}

const slugify = (str: string) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const CategoryManager = ({ categories, onRefresh }: Props) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', slug: '', description: '' });
  const [createForm, setCreateForm] = useState({ name: '', slug: '', description: '' });

  const handleCreate = async () => {
    if (!createForm.name.trim()) {
      toast({ title: 'Name required', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', createForm.name.trim());
      fd.append('slug', createForm.slug || slugify(createForm.name));
      fd.append('description', createForm.description.trim());
      await portfolioApi.categories.create(fd);
      toast({ title: 'Category created ✅' });
      setCreateForm({ name: '', slug: '', description: '' });
      setIsCreating(false);
      onRefresh();
    } catch (error: any) {
      toast({ title: 'Failed', description: error.response?.data?.detail || 'Could not create.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (cat: PortfolioCategory) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, slug: cat.slug, description: cat.description || '' });
  };

  const handleUpdate = async (id: string) => {
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', editForm.name.trim());
      fd.append('slug', editForm.slug || slugify(editForm.name));
      fd.append('description', editForm.description.trim());
      await portfolioApi.categories.update(id, fd);
      toast({ title: 'Updated ✅' });
      setEditingId(null);
      onRefresh();
    } catch (error: any) {
      toast({ title: 'Failed', description: error.response?.data?.detail || 'Update failed.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await portfolioApi.categories.delete(deletingId);
      toast({ title: 'Deleted' });
      onRefresh();
    } catch (error: any) {
      toast({ title: 'Failed', description: error.response?.data?.detail || 'Delete failed.', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base sm:text-lg">
          <span className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-blue-500" /> Categories
          </span>
          <Button size="sm" onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Create form */}
        {isCreating && (
          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <p className="text-sm font-semibold">New Category</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Name *</Label>
                <Input
                  placeholder="e.g. Weddings"
                  value={createForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setCreateForm((f) => ({ ...f, name, slug: slugify(name) }));
                  }}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Slug (auto-generated)</Label>
                <Input
                  placeholder="weddings"
                  value={createForm.slug}
                  onChange={(e) => setCreateForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input
                placeholder="Optional description"
                value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={isSaving}>
                {isSaving && <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                Create
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setIsCreating(false); setCreateForm({ name: '', slug: '', description: '' }); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Categories list */}
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No categories yet. Create one above.</p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="border rounded-lg">
                {editingId === cat.id ? (
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                          autoFocus
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Slug</Label>
                        <Input
                          value={editForm.slug}
                          onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={editForm.description}
                        onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdate(cat.id)} disabled={isSaving}>
                        {isSaving && <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{cat.name}</span>
                        <Badge variant="outline" className="text-xs font-mono">{cat.slug}</Badge>
                        {cat.image_count !== undefined && (
                          <span className="text-xs text-muted-foreground">{cat.image_count} images · {cat.video_count} videos</span>
                        )}
                      </div>
                      {cat.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{cat.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(cat)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingId(cat.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This only deletes the category definition. Existing images/videos tagged with this category will remain, but will show the old category slug as text.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default CategoryManager;