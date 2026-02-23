// ============================================================
// ImagesTab.tsx
// Grid of portfolio images with filter, bulk select, CRUD actions
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import {
  Search, RefreshCw, Plus, Trash2, Edit2, Eye, EyeOff,
  Grid3X3, List, X, Filter, CheckSquare, Square,
} from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Badge } from '@shared/components/ui/badge';
import { Card, CardContent } from '@shared/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@shared/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@shared/components/ui/alert-dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@shared/components/ui/table';
import { useToast } from '@shared/hooks/use-toast';
import { portfolioApi } from '../../services/portfolioApi';
import { PortfolioImage, PortfolioCategory, ViewMode } from '../../types/portfolio';
import EditImageModal from './EditImageModal';
import { format } from 'date-fns';
import UploadImageModal from './UploadImageModal';

interface Props {
  categories: PortfolioCategory[];
  onStatsRefresh: () => void;
}

const LIMIT = 24;

const ImagesTab = ({ categories, onStatsRefresh }: Props) => {
  const { toast } = useToast();
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [skip, setSkip] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<PortfolioImage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { skip, limit: LIMIT };
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (visibilityFilter !== 'all') params.is_visible = visibilityFilter === 'visible';
      const res = await portfolioApi.images.getAll(params);
      let data = res.data.data;
      if (search.trim()) {
        const q = search.toLowerCase();
        data = data.filter((img) => img.title.toLowerCase().includes(q));
      }
      setImages(data);
      setTotal(res.data.total);
    } catch {
      toast({ title: 'Error', description: 'Failed to load images.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [skip, categoryFilter, visibilityFilter, search, toast]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleToggleVisibility = async (img: PortfolioImage) => {
    try {
      await portfolioApi.images.toggleVisibility(img.id);
      toast({ title: img.is_visible ? 'Hidden' : 'Visible', description: `"${img.title}" visibility updated.` });
      fetchImages();
      onStatsRefresh();
    } catch {
      toast({ title: 'Error', description: 'Could not toggle visibility.', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await portfolioApi.images.delete(deletingId);
      toast({ title: 'Deleted', description: 'Image removed.' });
      fetchImages();
      onStatsRefresh();
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.detail || 'Delete failed.', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const ids = Array.from(selectedIds);
      const res = await portfolioApi.images.bulkDelete(ids);
      toast({ title: 'Deleted', description: `${res.data.deleted_count} images removed.` });
      setSelectedIds(new Set());
      fetchImages();
      onStatsRefresh();
    } catch {
      toast({ title: 'Error', description: 'Bulk delete failed.', variant: 'destructive' });
    } finally {
      setBulkDeleteOpen(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === images.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(images.map((i) => i.id)));
    }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(skip / LIMIT) + 1;

  const categoryName = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name || slug;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search images..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSkip(0); }}
            className="pl-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setSkip(0); }}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={visibilityFilter} onValueChange={(v: any) => { setVisibilityFilter(v); setSkip(0); }}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="visible">Visible</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} title="Toggle view">
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={fetchImages} title="Refresh">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setUploadOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Image
          </Button>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium text-blue-700">{selectedIds.size} selected</span>
          <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set())}>
            <X className="h-3.5 w-3.5 mr-1.5" /> Deselect
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:text-destructive border-destructive/40 hover:bg-destructive/10"
            onClick={() => setBulkDeleteOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Selected
          </Button>
        </div>
      )}

      {/* Count + select all */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{total} images total · page {currentPage}/{Math.max(totalPages, 1)}</p>
        {images.length > 0 && (
          <Button variant="ghost" size="sm" onClick={selectAll} className="gap-2 text-xs">
            {selectedIds.size === images.length ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            {selectedIds.size === images.length ? 'Deselect All' : 'Select All'}
          </Button>
        )}
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3' : 'space-y-2'}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`animate-pulse bg-muted rounded-lg ${viewMode === 'grid' ? 'aspect-[9/16]' : 'h-16'}`} />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No images found.</p>
          <Button className="mt-4" onClick={() => setUploadOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Upload First Image
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        // ── GRID VIEW ─────────────────────────────────────────
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {images.map((img) => {
            const isSelected = selectedIds.has(img.id);
            return (
              <div
                key={img.id}
                className={`relative group rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-muted-foreground/30'
                } ${!img.is_visible ? 'opacity-50' : ''}`}
                onClick={() => toggleSelect(img.id)}
              >
                <div style={{ aspectRatio: '9/16' }} className="bg-muted">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Selection checkbox */}
                <div className="absolute top-2 left-2">
                  {isSelected
                    ? <CheckSquare className="h-5 w-5 text-primary drop-shadow-md" />
                    : <Square className="h-5 w-5 text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>

                {/* Hidden badge */}
                {!img.is_visible && (
                  <Badge className="absolute top-2 right-2 bg-black/70 text-white border-0 text-xs px-1.5">
                    <EyeOff className="h-3 w-3 mr-1" /> Hidden
                  </Badge>
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 gap-1"
                  onClick={(e) => e.stopPropagation()}>
                  <p className="text-white text-xs font-medium truncate">{img.title}</p>
                  <Badge className="w-fit text-xs bg-white/20 border-0 text-white">{categoryName(img.category)}</Badge>
                  <div className="flex gap-1 mt-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-white hover:bg-white/20"
                      onClick={() => setEditingImage(img)}
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-white hover:bg-white/20"
                      onClick={() => handleToggleVisibility(img)}
                      title={img.is_visible ? 'Hide' : 'Show'}
                    >
                      {img.is_visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-red-400 hover:bg-white/20"
                      onClick={() => setDeletingId(img.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // ── LIST VIEW ─────────────────────────────────────────
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="w-16">Preview</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {images.map((img) => (
                  <TableRow key={img.id} className={selectedIds.has(img.id) ? 'bg-blue-50' : ''}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto"
                        onClick={() => toggleSelect(img.id)}
                      >
                        {selectedIds.has(img.id) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="w-10 h-14 rounded overflow-hidden bg-muted">
                        <img src={img.url} alt={img.title} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">{img.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{categoryName(img.category)}</Badge>
                    </TableCell>
                    <TableCell>
                      {img.is_visible
                        ? <Badge className="bg-green-100 text-green-700 border-green-200 border text-xs flex items-center gap-1 w-fit"><Eye className="h-3 w-3" /> Visible</Badge>
                        : <Badge className="bg-gray-100 text-gray-600 border-gray-200 border text-xs flex items-center gap-1 w-fit"><EyeOff className="h-3 w-3" /> Hidden</Badge>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(img.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditingImage(img)} title="Edit">
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleToggleVisibility(img)} title={img.is_visible ? 'Hide' : 'Show'}>
                          {img.is_visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeletingId(img.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">{skip + 1}–{Math.min(skip + LIMIT, total)} of {total}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - LIMIT))}>
              Previous
            </Button>
            <Button size="sm" variant="outline" disabled={skip + LIMIT >= total} onClick={() => setSkip(skip + LIMIT)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <UploadImageModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => { fetchImages(); onStatsRefresh(); }}
        categories={categories}
      />

      <EditImageModal
        image={editingImage}
        open={!!editingImage}
        onClose={() => setEditingImage(null)}
        onSuccess={fetchImages}
        categories={categories}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the image from Cloudinary. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete confirm */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Images?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete all selected images from Cloudinary. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90">Delete All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ImagesTab;