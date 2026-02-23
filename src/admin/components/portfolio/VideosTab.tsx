// ============================================================
// VideosTab.tsx
// Grid of portfolio YouTube videos with filter, CRUD actions
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import {
  Search, RefreshCw, Plus, Trash2, Edit2, Eye, EyeOff,
  Play, ExternalLink, X, CheckSquare, Square,
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
import { PortfolioVideo, PortfolioCategory, ViewMode } from '../../types/portfolio';
import AddVideoModal from './AddVideoModal';
import EditVideoModal from './EditVideoModal';
import { format } from 'date-fns';

interface Props {
  categories: PortfolioCategory[];
  onStatsRefresh: () => void;
}

const LIMIT = 20;

const VideosTab = ({ categories, onStatsRefresh }: Props) => {
  const { toast } = useToast();
  const [videos, setVideos] = useState<PortfolioVideo[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [skip, setSkip] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<PortfolioVideo | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<PortfolioVideo | null>(null);

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { skip, limit: LIMIT };
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (visibilityFilter !== 'all') params.is_visible = visibilityFilter === 'visible';
      const res = await portfolioApi.videos.getAll(params);
      let data = res.data.data;
      if (search.trim()) {
        const q = search.toLowerCase();
        data = data.filter((v) => v.title.toLowerCase().includes(q) || v.youtube_id.includes(q));
      }
      setVideos(data);
      setTotal(res.data.total);
    } catch {
      toast({ title: 'Error', description: 'Failed to load videos.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [skip, categoryFilter, visibilityFilter, search, toast]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const handleToggleVisibility = async (v: PortfolioVideo) => {
    try {
      await portfolioApi.videos.toggleVisibility(v.id);
      toast({ title: v.is_visible ? 'Hidden' : 'Visible', description: `"${v.title}" updated.` });
      fetchVideos();
      onStatsRefresh();
    } catch {
      toast({ title: 'Error', description: 'Could not toggle visibility.', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await portfolioApi.videos.delete(deletingId);
      toast({ title: 'Deleted', description: 'Video removed.' });
      fetchVideos();
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
      const res = await portfolioApi.videos.bulkDelete(ids);
      toast({ title: 'Deleted', description: `${res.data.deleted_count} videos removed.` });
      setSelectedIds(new Set());
      fetchVideos();
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
            placeholder="Search videos..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSkip(0); }}
            className="pl-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setSkip(0); }}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={visibilityFilter} onValueChange={(v: any) => { setVisibilityFilter(v); setSkip(0); }}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="visible">Visible</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchVideos}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Video
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

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{total} videos total · page {currentPage}/{Math.max(totalPages, 1)}</p>
        {videos.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => {
            selectedIds.size === videos.length
              ? setSelectedIds(new Set())
              : setSelectedIds(new Set(videos.map((v) => v.id)));
          }} className="gap-2 text-xs">
            {selectedIds.size === videos.length ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            {selectedIds.size === videos.length ? 'Deselect All' : 'Select All'}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-muted rounded-lg aspect-video" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No videos found.</p>
          <Button className="mt-4" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add First Video
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v) => {
            const isSelected = selectedIds.has(v.id);
            return (
              <div
                key={v.id}
                className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                  isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-muted-foreground/30'
                } ${!v.is_visible ? 'opacity-60' : ''}`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-black cursor-pointer" onClick={() => setPreviewVideo(v)}>
                  <img
                    src={v.thumbnail_url}
                    alt={v.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`;
                    }}
                  />
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <Play className="h-6 w-6 text-white fill-white" />
                    </div>
                  </div>

                  {/* Select checkbox */}
                  <div className="absolute top-2 left-2" onClick={(e) => { e.stopPropagation(); toggleSelect(v.id); }}>
                    {isSelected
                      ? <CheckSquare className="h-5 w-5 text-primary drop-shadow-md" />
                      : <Square className="h-5 w-5 text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>

                  {/* Hidden badge */}
                  {!v.is_visible && (
                    <Badge className="absolute top-2 right-2 bg-black/70 text-white border-0 text-xs px-1.5">
                      <EyeOff className="h-3 w-3 mr-1" /> Hidden
                    </Badge>
                  )}
                </div>

                {/* Info row */}
                <div className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{v.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{categoryName(v.category)}</Badge>
                        <span className="font-mono text-xs text-muted-foreground">{v.youtube_id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="flex-1 h-7 text-xs" onClick={() => setEditingVideo(v)}>
                      <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleToggleVisibility(v)} title={v.is_visible ? 'Hide' : 'Show'}>
                      {v.is_visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                    <a href={v.youtube_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="h-7 px-2" title="Open on YouTube">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:text-destructive" onClick={() => setDeletingId(v.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">{skip + 1}–{Math.min(skip + LIMIT, total)} of {total}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - LIMIT))}>Previous</Button>
            <Button size="sm" variant="outline" disabled={skip + LIMIT >= total} onClick={() => setSkip(skip + LIMIT)}>Next</Button>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewVideo(null)}
        >
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-medium truncate flex-1 mr-4">{previewVideo.title}</p>
              <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/20" onClick={() => setPreviewVideo(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src={`${previewVideo.embed_url}?autoplay=1`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
                title={previewVideo.title}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddVideoModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => { fetchVideos(); onStatsRefresh(); }}
        categories={categories}
      />

      <EditVideoModal
        video={editingVideo}
        open={!!editingVideo}
        onClose={() => setEditingVideo(null)}
        onSuccess={fetchVideos}
        categories={categories}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video?</AlertDialogTitle>
            <AlertDialogDescription>This removes the video from the portfolio. The YouTube video itself is not deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Videos?</AlertDialogTitle>
            <AlertDialogDescription>This removes all selected videos from the portfolio. YouTube videos are not deleted.</AlertDialogDescription>
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

export default VideosTab;