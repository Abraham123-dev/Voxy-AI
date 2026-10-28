"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Building2, 
  Activity, 
  DollarSign, 
  ArrowRight, 
  TrendingUp, 
  Zap,
  Terminal,
  Loader2,
  Cpu
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

const AdminStatCard = ({ title, value, description, icon: Icon, colorClass }) => (
  <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-2xl flex flex-col h-full hover:border-white/10 transition-all group">
    <div className="flex items-start justify-between mb-4">
      <div className={`size-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-voxy-primary transition-colors`}>
        <Icon size={20} className={colorClass} />
      </div>
      <div className="text-[12px] font-semibold text-zinc-500 text-right">{title}</div>
    </div>
    
    <div>
      <h3 className="text-3xl font-bold text-white mb-1 tracking-tight tabular-nums">{value}</h3>
      <p className="text-[13px] text-zinc-500 font-medium">{description}</p>
    </div>
  </div>
);

export default function LighthouseOverviewPage() {
  const [stats, setStats] = useState(null);
  const [aiMetrics, setAiMetrics] = useState(null);
  const [aiUsage, setAiUsage] = useState([]);
  const [aiCostData, setAiCostData] = useState([]);
  const [aiTypeData, setAiTypeData] = useState([]);
  const [liveLogs, setLiveLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchAIMetrics();

    // SSE Real-time updates
    const eventSource = new EventSource('/api/admin/live');
    eventSource.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      if (type === 'usage') {
        setLiveLogs(prev => [data, ...prev].slice(0, 10));
        fetchStats(); // Refresh stats when new usage occurs
        fetchAIMetrics(); // Refresh AI stats too
      }
    };

    return () => eventSource.close();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      setStats({
        totalBusinesses: data.totalBusinesses || 0,
        activeBusinesses: data.activeBusinesses || 0,
        totalCost: data.totalCost || 0,
        topBusinesses: data.topBusinesses || []
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIMetrics = async () => {
     try {
       const [metRes, useRes, cstRes] = await Promise.all([
         fetch('/api/admin/ai/metrics'),
         fetch('/api/admin/ai/usage'),
         fetch('/api/admin/ai/cost')
       ]);
       
       const metData = await metRes.json();
       const useData = await useRes.json();
       const cstData = await cstRes.json();

       if (metData.success) setAiMetrics(metData.metrics);
       if (useData.success) setAiUsage([...useData.usage].reverse());
       if (cstData.success) {
         setAiCostData([...cstData.dailyCost].reverse());
         setAiTypeData(cstData.typeCost);
       }
     } catch (err) {
       console.error('Failed to fetch AI metrics:', err);
     }
  };

  if (loading && !stats) {
    return (
      <DashboardLayout title="Admin Home">
        <div className="flex flex-col items-center justify-center p-20 min-h-[60vh] text-zinc-500">
          <Loader2 className="w-10 h-10 animate-spin text-voxy-primary mb-4" />
          <p className="text-[13px] font-medium">Booting intelligence engine...</p>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    { 
      title: 'Total Businesses', 
      value: stats.totalBusinesses, 
      description: 'Platform total nodes',
      icon: Building2,
      colorClass: 'text-voxy-primary'
    },
    { 
      title: 'Active Nodes', 
      value: stats.activeBusinesses, 
      description: 'Engaged last 7 days',
      icon: Activity,
      colorClass: 'text-blue-400'
    },
    { 
      title: 'Monthly Consumption', 
      value: stats.totalCost ? `₦${Number(stats.totalCost).toFixed(2)}` : '₦0.00', 
      description: 'Aggregate provider cost',
      icon: DollarSign, 
      colorClass: 'text-emerald-400'
    },
  ];

  return (
    <DashboardLayout title="Admin Home">
      <div className="max-w-[1400px] mx-auto pt-8 pb-32 space-y-12">
        
        {/* Page Header */}
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl font-bold text-white tracking-tight">System Intelligence</h1>
          <p className="text-[15px] text-zinc-500">
            Real-time monitoring of platform activity, cost distribution, and AI performance.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          {statCards.map((stat, i) => (
            <AdminStatCard key={i} {...stat} />
          ))}
        </div>

        {/* AI Observability Section (NEW) */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
           <div className="flex items-center gap-4">
              <div className="size-10 rounded-2xl bg-voxy-primary/10 flex items-center justify-center text-voxy-primary shadow-lg shadow-voxy-primary/5">
                 <Cpu size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">AI Observability</h2>
                <p className="text-[13px] text-zinc-500 font-medium">Low-latency tracking across all AI interfaces</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AdminStatCard 
                title="AI Operations" 
                value={aiMetrics?.totalRequests?.toLocaleString() || '0'} 
                description="Total inference requests"
                icon={Zap}
                colorClass="text-amber-400"
              />
              <AdminStatCard 
                title="Model Spend" 
                value={`₦${Number(aiMetrics?.totalCost || 0).toFixed(2)}`} 
                description="Estimated provider costs"
                icon={DollarSign}
                colorClass="text-emerald-500"
              />
              <AdminStatCard 
                title="Network Latency" 
                value={`${Math.round(aiMetrics?.avgLatency || 0)}ms`} 
                description="Average response time"
                icon={Activity}
                colorClass="text-blue-400"
              />
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Usage Chart */}
              <div className="bg-[#0A0A0A] border border-white/5 p-8 rounded-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Inference Volume (Daily)</h3>
                  <Badge variant="outline" className="text-[10px] border-blue-500/20 text-blue-400 bg-blue-500/5">Live Stream</Badge>
                </div>
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={aiUsage}>
                      <defs>
                        <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                      <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                      <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                      <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#usageGradient)" animationDuration={1500} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cost Chart */}
              <div className="bg-[#0A0A0A] border border-white/5 p-8 rounded-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Aggregate Spend (Daily)</h3>
                  <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-400 bg-emerald-500/5">Finance</Badge>
                </div>
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={aiCostData}>
                      <defs>
                        <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                      <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                      <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₦${Number(val).toFixed(2)}`} />
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                      <Area type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#costGradient)" animationDuration={1500} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
           </div>

           <div className="bg-[#0A0A0A] border border-white/5 p-8 rounded-3xl">
              <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-8">System Distribution (Cost by Type)</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={aiTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" horizontal={false} />
                    <XAxis type="number" stroke="#3f3f46" fontSize={10} hide />
                    <YAxis dataKey="type" type="category" stroke="#fff" fontSize={12} width={80} tickLine={false} axisLine={false} className="font-bold capitalize" />
                    <Tooltip cursor={{ fill: '#ffffff02' }} contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                    <Bar dataKey="cost" radius={[0, 8, 8, 0]} barSize={24} animationDuration={1200}>
                      {aiTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : '#ec4899'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Top Businesses List */}
           <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                 <div className="p-8 border-b border-white/[0.03] flex items-center justify-between">
                   <div>
                     <div className="flex items-center gap-3 mb-1">
                       <TrendingUp size={16} className="text-voxy-primary" />
                       <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Analytics</h2>
                     </div>
                     <p className="text-xl font-bold text-white tracking-tight">High Consumption Accounts</p>
                   </div>
                   <Link href="/lighthouse/businesses" className="text-[13px] font-bold text-zinc-400 hover:text-white transition-all underline underline-offset-4 decoration-voxy-primary/30">View Directory</Link>
                 </div>

                 <div className="divide-y divide-white/[0.03]">
                   {stats.topBusinesses.length === 0 ? (
                     <div className="py-20 text-center text-zinc-600">No activity data found</div>
                   ) : (
                     stats.topBusinesses.map((b, i) => (
                       <div key={b.id} className="flex items-center justify-between p-6 hover:bg-white/[0.01] transition-all group">
                         <div className="flex items-center gap-6">
                           <div className="font-bold text-2xl text-zinc-800 tracking-tighter tabular-nums w-8">{i + 1}</div>
                           <div>
                               <Link href={`/lighthouse/businesses/${b.id}`} className="font-bold text-lg text-white group-hover:text-voxy-primary transition-colors tracking-tight flex items-center gap-3">
                                 {b.name}
                                 <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-voxy-primary" />
                               </Link>
                               <Badge variant="outline" className="text-[10px] font-bold border-white/5 bg-white/5 text-zinc-500 py-0 h-5 mt-1">Verified Node</Badge>
                           </div>
                         </div>
                         <div className="text-right">
                           <div className="text-xl font-bold text-white tracking-tight tabular-nums">₦{Number(b.cost).toFixed(2)}</div>
                           <p className="text-[11px] font-bold text-zinc-500 mt-1 uppercase">Monthly Spend</p>
                         </div>
                       </div>
                     ))
                   )}
                 </div>
              </div>
           </div>

           {/* Live Activity Log */}
           <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 delay-400">
              <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 h-full flex flex-col min-h-[500px]">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                       <Terminal size={16} />
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">Live Activity</h3>
                 </div>
                 
                 <div className="flex-1 space-y-4 overflow-hidden">
                    {liveLogs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-3">
                         <Zap size={32} />
                         <p className="text-[11px] font-bold uppercase tracking-widest">Listening for events...</p>
                      </div>
                    ) : (
                      liveLogs.map((log, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl animate-in slide-in-from-top-2">
                           <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-voxy-primary shrink-0">
                              <Activity size={14} />
                           </div>
                            <div className="space-y-1">
                              <p className="text-[12px] font-bold text-white">{log.businesses?.name || 'Unknown'}</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${log.type === 'llm' ? 'text-blue-400' : 'text-purple-400'}`}>
                                  {log.type}
                                </span>
                                <span className="text-zinc-600 text-[10px] tabular-nums">₦{Number(log.cost_estimate).toFixed(2)}</span>
                              </div>
                           </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
