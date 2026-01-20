import { useDataPoints } from "@/hooks/use-data-points";
import { CreateDataPointDialog } from "@/components/CreateDataPointDialog";
import { StatsCard } from "@/components/StatsCard";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from "recharts";
import { Loader2, TrendingUp, Users, DollarSign, Activity, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: dataPoints, isLoading, error } = useDataPoints();

  // Calculate some derived stats for the cards
  const totalValue = dataPoints?.reduce((acc, curr) => acc + curr.value, 0) || 0;
  const averageValue = dataPoints?.length ? Math.round(totalValue / dataPoints.length) : 0;
  const highestPoint = dataPoints?.reduce((max, curr) => curr.value > max.value ? curr : max, dataPoints[0] || { value: 0, label: '-' });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background flex-col gap-4">
        <div className="bg-destructive/10 p-4 rounded-full">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Failed to load data</h2>
        <p className="text-muted-foreground">Please try refreshing the page</p>
      </div>
    );
  }

  const chartData = dataPoints || [];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 font-sans selection:bg-primary/20">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 tracking-tight">
              Analytics
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Real-time insights and performance metrics.
            </p>
          </div>
          <CreateDataPointDialog />
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatsCard 
              title="Total Volume" 
              value={totalValue.toLocaleString()} 
              icon={<DollarSign className="h-4 w-4" />}
              trend="up"
              percentage="+12.5%"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatsCard 
              title="Average Metric" 
              value={averageValue.toLocaleString()} 
              icon={<Users className="h-4 w-4" />}
              trend="neutral"
              percentage="0.0%"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatsCard 
              title="Peak Performance" 
              value={highestPoint.value.toLocaleString()} 
              icon={<TrendingUp className="h-4 w-4" />}
              trend="up"
              percentage="+4.3%"
            />
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          
          {/* Main Chart */}
          <motion.div 
            className="lg:col-span-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold font-display">Performance Trend</h3>
                <p className="text-sm text-muted-foreground">Historical data overview</p>
              </div>
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="label" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}`}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  No data points yet
                </div>
              )}
            </div>
          </motion.div>

          {/* Secondary Chart */}
          <motion.div 
            className="lg:col-span-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold font-display">Distribution</h3>
                <p className="text-sm text-muted-foreground">Categorical breakdown</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="label" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--muted)/0.3)'}}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
