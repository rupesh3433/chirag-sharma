// ============================================================
// PortfolioStatsCards.tsx
// Top stats bar — matches existing BookingStats / EventStats pattern
// ============================================================

import { Image, Video, FolderOpen, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@shared/components/ui/card';
import { PortfolioStats } from '../../types/portfolio';

interface Props {
  stats: PortfolioStats | undefined;
  isLoading?: boolean;
}

const StatCard = ({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}) => (
  <Card>
    <CardContent className="pt-4 sm:pt-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <h3 className={`text-xl sm:text-2xl font-bold ${accent}`}>{value}</h3>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        {icon}
      </div>
    </CardContent>
  </Card>
);

const PortfolioStatsCards = ({ stats, isLoading }: Props) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4 sm:pt-5">
              <div className="animate-pulse space-y-2">
                <div className="h-3 w-16 bg-muted rounded" />
                <div className="h-7 w-10 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      <StatCard
        label="Total Images"
        value={stats.images.total}
        sub={`${stats.images.visible} visible`}
        icon={<Image className="h-6 w-6 text-pink-500" />}
        accent=""
      />
      <StatCard
        label="Total Videos"
        value={stats.videos.total}
        sub={`${stats.videos.visible} visible`}
        icon={<Video className="h-6 w-6 text-purple-500" />}
        accent="text-purple-600"
      />
      <StatCard
        label="Categories"
        value={stats.categories.total}
        icon={<FolderOpen className="h-6 w-6 text-blue-500" />}
        accent="text-blue-600"
      />
      <StatCard
        label="Hidden Items"
        value={stats.images.hidden + stats.videos.hidden}
        sub="images + videos"
        icon={<EyeOff className="h-6 w-6 text-muted-foreground" />}
        accent="text-muted-foreground"
      />
    </div>
  );
};

export default PortfolioStatsCards;