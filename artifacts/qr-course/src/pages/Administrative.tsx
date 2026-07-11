import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Users, Clock, TrendingUp, Calendar, Infinity } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Visit {
  id: number;
  email: string | null;
  visitedAt: string;
}

interface Series {
  label: string;
  count: number;
}

interface AdminData {
  stats: {
    allTime: number;
    last24Hours: number;
    lastMonth: number;
    lastYear: number;
  };
  series: {
    last24Hours: Series[];
    lastMonth: Series[];
    lastYear: Series[];
    allTime: Series[];
  };
  visits: Visit[];
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="border border-border rounded-xl p-5 bg-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <span className="text-3xl font-bold tabular-nums">{value}</span>
    </div>
  );
}

function ChartSection({
  title,
  data,
}: {
  title: string;
  data: Series[];
}) {
  return (
    <div className="border border-border rounded-xl p-5 bg-card">
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: 12,
            }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function buildWeekSeries(visits: Visit[]): Series[] {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const weekAgo = now - 7 * DAY;
  const labels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekAgo + i * DAY);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });
  const counts = new Array(7).fill(0);
  for (const v of visits) {
    const t = new Date(v.visitedAt).getTime();
    if (t >= weekAgo) {
      const idx = Math.min(Math.floor((t - weekAgo) / DAY), 6);
      counts[idx]++;
    }
  }
  return labels.map((label, i) => ({ label, count: counts[i] }));
}

export default function Administrative() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${basePath}/api/admin/visits`, { credentials: "include" })
      .then((r) => {
        if (r.status === 403) throw new Error("not_admin");
        if (!r.ok) throw new Error("fetch_failed");
        return r.json();
      })
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Loading…
        </div>
      </Layout>
    );
  }

  if (error === "not_admin") {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="font-semibold">Access restricted</p>
            <p className="text-sm text-muted-foreground">
              This page is only accessible to the site administrator.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center text-destructive text-sm">
          Failed to load analytics.
        </div>
      </Layout>
    );
  }

  const lastWeekCount = data.visits.filter(
    (v) => new Date(v.visitedAt).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length;
  const weekSeries = buildWeekSeries(data.visits);

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-2xl font-bold font-serif tracking-tight">
            Administrative
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Google login analytics and visitor log.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Last 24 h" value={data.stats.last24Hours} icon={Clock} />
          <StatCard label="Last 7 days" value={lastWeekCount} icon={TrendingUp} />
          <StatCard label="Last 30 days" value={data.stats.lastMonth} icon={Calendar} />
          <StatCard label="Last year" value={data.stats.lastYear} icon={Users} />
          <StatCard label="All time" value={data.stats.allTime} icon={Infinity} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartSection title="Last 24 hours (by hour)" data={data.series.last24Hours} />
          <ChartSection title="Last 7 days (by day)" data={weekSeries} />
          <ChartSection title="Last 30 days (by day)" data={data.series.lastMonth} />
          <ChartSection title="Last 12 months (by month)" data={data.series.lastYear} />
        </div>

        {/* All-time chart */}
        <ChartSection title="All time" data={data.series.allTime} />

        {/* Login log */}
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-card">
            <h3 className="text-sm font-semibold">
              Login log ({data.visits.length} total)
            </h3>
          </div>
          {data.visits.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No logins recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {data.visits.map((v) => (
                <div
                  key={v.id}
                  className="px-5 py-3 flex items-center justify-between text-sm bg-card"
                >
                  <span className="font-medium">
                    {v.email ?? <span className="text-muted-foreground italic">unknown</span>}
                  </span>
                  <span className="text-muted-foreground tabular-nums text-xs">
                    {new Date(v.visitedAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
