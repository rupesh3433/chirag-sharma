// ============================================================
// PortfolioAdmin.tsx — Main admin page
// Tabs: Images | Videos | Categories
// Matches existing Bookings.tsx / EventBookings.tsx pattern exactly
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Image, Video, FolderOpen, RefreshCw, LayoutGrid } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent } from '@shared/components/ui/card';
import { portfolioApi } from '../services/portfolioApi';
import { PortfolioStats, PortfolioCategory, PortfolioTab } from '../types/portfolio';
import { useToast } from '@shared/hooks/use-toast';
import PortfolioStatsCards from '../components/portfolio/PortfolioStatsCards';
import ImagesTab from '../components/portfolio/ImagesTab';
import VideosTab from '../components/portfolio/VideosTab';
import CategoryManager from '../components/portfolio/CategoryManager';

const TAB_CONFIG: { id: PortfolioTab; label: string; icon: React.ReactNode }[] = [
  { id: 'images',     label: 'Images',     icon: <Image className="h-4 w-4" /> },
  { id: 'videos',     label: 'Videos',     icon: <Video className="h-4 w-4" /> },
  { id: 'categories', label: 'Categories', icon: <FolderOpen className="h-4 w-4" /> },
];

const PortfolioAdmin = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<PortfolioTab>('images');
  const [stats, setStats] = useState<PortfolioStats | undefined>();
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const res = await portfolioApi.stats.get();
      setStats(res.data.data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load stats.', variant: 'destructive' });
    } finally {
      setIsLoadingStats(false);
    }
  }, [toast]);

  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const res = await portfolioApi.categories.getAll();
      setCategories(res.data.data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load categories.', variant: 'destructive' });
    } finally {
      setIsLoadingCategories(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, [fetchStats, fetchCategories]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-3xl font-bold flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 sm:h-7 sm:w-7 text-pink-500" />
            Portfolio Manager
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Manage images, videos, and categories shown on the public portfolio
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { fetchStats(); fetchCategories(); }}
          disabled={isLoadingStats}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* ── Stats cards ── */}
      <PortfolioStatsCards stats={stats} isLoading={isLoadingStats} />

      {/* ── Tabs ── */}
      <div className="flex gap-1 sm:gap-2 border-b pb-0">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {/* Mobile: show count badge */}
            {tab.id === 'images' && stats && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {stats.images.total}
              </span>
            )}
            {tab.id === 'videos' && stats && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {stats.videos.total}
              </span>
            )}
            {tab.id === 'categories' && stats && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {stats.categories.total}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div>
        {activeTab === 'images' && (
          <ImagesTab
            categories={categories}
            onStatsRefresh={fetchStats}
          />
        )}

        {activeTab === 'videos' && (
          <VideosTab
            categories={categories}
            onStatsRefresh={fetchStats}
          />
        )}

        {activeTab === 'categories' && (
          <CategoryManager
            categories={categories}
            onRefresh={() => { fetchCategories(); fetchStats(); }}
          />
        )}
      </div>
    </div>
  );
};

export default PortfolioAdmin;