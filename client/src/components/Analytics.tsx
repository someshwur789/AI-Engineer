import { useAnalytics } from "@/hooks/useAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function Analytics() {
  const { data: analytics, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-lg font-medium text-destructive">Failed to load analytics</p>
          <p className="text-sm text-muted-foreground mt-1">Please check your connection and try again</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const sentimentStats = analytics.sentimentStats as any || { positive: 0, negative: 0, neutral: 0 };
  const categoryStats = analytics.categoryStats as any || {};

  const sentimentTotal = sentimentStats.positive + sentimentStats.negative + sentimentStats.neutral;
  const sentimentPercentages = {
    positive: sentimentTotal > 0 ? Math.round((sentimentStats.positive / sentimentTotal) * 100) : 0,
    negative: sentimentTotal > 0 ? Math.round((sentimentStats.negative / sentimentTotal) * 100) : 0,
    neutral: sentimentTotal > 0 ? Math.round((sentimentStats.neutral / sentimentTotal) * 100) : 0,
  };

  const priorityPercentages = {
    urgent: (analytics.totalEmails || 0) > 0 ? Math.round(((analytics.urgentEmails || 0) / (analytics.totalEmails || 1)) * 100) : 0,
    normal: 65, // Mock percentage
    low: 20, // Mock percentage
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Email Analytics Dashboard</h2>
        <p className="text-sm text-muted-foreground">Real-time insights into your email management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600" data-testid="metric-total-emails">
              {(analytics.totalEmails || 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Emails (24h)</div>
            <div className="flex items-center mt-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12% vs yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600" data-testid="metric-urgent-emails">
              {analytics.urgentEmails}
            </div>
            <div className="text-sm text-muted-foreground">Urgent Emails</div>
            <div className="flex items-center mt-1 text-xs text-red-600">
              <TrendingDown className="w-3 h-3 mr-1" />
              -5% vs yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600" data-testid="metric-resolved-emails">
              {analytics.resolvedEmails}
            </div>
            <div className="text-sm text-muted-foreground">Emails Resolved</div>
            <div className="flex items-center mt-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +18% vs yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600" data-testid="metric-avg-response-time">
              {Math.round((analytics.avgResponseTime || 0) / 60 * 10) / 10}h
            </div>
            <div className="text-sm text-muted-foreground">Avg Response Time</div>
            <div className="flex items-center mt-1 text-xs text-green-600">
              <TrendingDown className="w-3 h-3 mr-1" />
              -0.4h vs yesterday
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Sentiment Analysis Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              <div className="w-32 h-32 relative">
                <div className="w-32 h-32 rounded-full border-8 border-green-200 border-t-green-500 border-r-yellow-200 border-b-red-200"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold" data-testid="chart-sentiment-positive">
                      {sentimentPercentages.positive}%
                    </div>
                    <div className="text-xs text-muted-foreground">Positive</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>Positive</span>
                </div>
                <span data-testid="text-sentiment-positive-percent">{sentimentPercentages.positive}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span>Neutral</span>
                </div>
                <span data-testid="text-sentiment-neutral-percent">{sentimentPercentages.neutral}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span>Negative</span>
                </div>
                <span data-testid="text-sentiment-negative-percent">{sentimentPercentages.negative}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Urgent</span>
                  <span data-testid="text-priority-urgent-percent">{priorityPercentages.urgent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${priorityPercentages.urgent}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Normal</span>
                  <span data-testid="text-priority-normal-percent">{priorityPercentages.normal}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${priorityPercentages.normal}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Low</span>
                  <span data-testid="text-priority-low-percent">{priorityPercentages.low}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${priorityPercentages.low}%` }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Email Categories (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(categoryStats).length > 0 ? (
              Object.entries(categoryStats).map(([category, count]) => (
                <div key={category} className="text-center p-3 bg-card rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600" data-testid={`category-${category.toLowerCase()}-count`}>
                    {count as number}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">{category}</div>
                </div>
              ))
            ) : (
              <div className="col-span-5 text-center text-muted-foreground">
                No category data available yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
