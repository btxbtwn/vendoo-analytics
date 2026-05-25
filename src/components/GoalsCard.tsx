"use client";

import { useEffect, useState } from "react";
import { Target, TrendingUp, DollarSign, ShoppingBag } from "lucide-react";

interface GoalConfig {
 revenueTarget: number;
 profitTarget: number;
 itemsTarget: number;
}

function getSavedGoals(): GoalConfig {
 if (typeof window === "undefined") return { revenueTarget: 2000, profitTarget: 800, itemsTarget: 50 };
 try {
 const raw = localStorage.getItem("vendoo-goals");
 if (!raw) return { revenueTarget: 2000, profitTarget: 800, itemsTarget: 50 };
 return JSON.parse(raw) as GoalConfig;
 } catch {
 return { revenueTarget: 2000, profitTarget: 800, itemsTarget: 50 };
 }
}

function saveGoals(config: GoalConfig) {
 if (typeof window === "undefined") return;
 localStorage.setItem("vendoo-goals", JSON.stringify(config));
}

function clamp(v: number, min: number, max: number) {
 return Math.min(Math.max(v, min), max);
}

function CircularProgress({
 pct,
 color,
 icon: Icon,
 label,
 value,
}: {
 pct: number;
 color: string;
 icon: React.ComponentType<{ size?: number; className?: string }>;
 label: string;
 value: string;
}) {
 const r = 28;
 const dash = 2 * Math.PI * r;
 const offset = dash - (clamp(pct, 0, 100) / 100) * dash;

 return (
 <div className="flex flex-col items-center gap-2">
 <div className="relative h-20 w-20">
 <svg className="h-full w-full -rotate-90" viewBox="0 0 72 72">
 <circle cx="36" cy="36" r={r} fill="none" stroke="var(--color-border)" strokeWidth={6} />
 <circle
 cx="36"
 cy="36"
 r={r}
 fill="none"
 stroke={color}
 strokeWidth={6}
 strokeDasharray={dash}
 strokeDashoffset={offset}
 strokeLinecap="round"
 className="transition-all duration-700 ease-out"
 />
 </svg>
 <div className="absolute inset-0 flex items-center justify-center">
 <Icon size={18} className="text-foreground" />
 </div>
 </div>
 <div className="text-center">
 <p className="text-[10px] font-medium uppercase tracking-wider text-secondary">{label}</p>
 <p className="text-sm font-bold tabular-nums text-foreground">{value}</p>
 <p className="text-[10px] text-tertiary">{Math.round(clamp(pct, 0, 100))}%</p>
 </div>
 </div>
 );
}

export default function GoalsCard({
 currentRevenue,
 currentProfit,
 currentItems,
}: {
 currentRevenue: number;
 currentProfit: number;
 currentItems: number;
}) {
 const [config, setConfig] = useState<GoalConfig>({
 revenueTarget: 2000,
 profitTarget: 800,
 itemsTarget: 50,
 });
 const [editing, setEditing] = useState(false);
 const [draft, setDraft] = useState(config);

 useEffect(() => {
 const saved = getSavedGoals();
 setConfig(saved);
 setDraft(saved);
 }, []);

 useEffect(() => {
 saveGoals(config);
 }, [config]);

 const apply = () => {
 setConfig(draft);
 setEditing(false);
 };

  return (
    <div className="surface-card glass-card rounded-none p-5">
 <div className="mb-5 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
 <Target size={16} className="text-accent" />
 </div>
 <div>
 <h3 className="text-sm font-semibold text-foreground">Monthly Goals</h3>
 <p className="text-xs text-tertiary">Track progress vs targets</p>
 </div>
 </div>
 <button
        onClick={() => (editing ? apply() : setEditing(true))}
        className="rounded-none border border-border bg-muted/20 px-3 py-1 text-[11px] font-medium text-secondary transition hover:border-border-hover hover:text-foreground"
 >
 {editing ? "Save" : "Edit"}
 </button>
 </div>

 {editing ? (
 <div className="grid grid-cols-3 gap-3">
 {[
 { label: "Revenue", key: "revenueTarget" as const, prefix: "$" },
 { label: "Profit", key: "profitTarget" as const, prefix: "$" },
 { label: "Items", key: "itemsTarget" as const, prefix: "" },
 ].map((field) => (
 <div key={field.key} className="space-y-1">
 <label className="text-[10px] font-medium uppercase tracking-wider text-secondary">
 {field.label} target
 </label>
        <div className="flex items-center rounded-none border border-border bg-muted/10 px-2 py-2">
 <span className="text-xs text-tertiary">{field.prefix}</span>
 <input
 type="number"
 value={draft[field.key]}
 onChange={(e) => setDraft((p) => ({ ...p, [field.key]: Number(e.target.value) }))}
 className="w-full bg-transparent text-sm font-semibold text-foreground outline-none"
 />
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="flex items-center justify-around">
 <CircularProgress
 pct={(currentRevenue / config.revenueTarget) * 100}
 color="#6366f1"
 icon={DollarSign}
 label="Revenue"
 value={`$${Math.round(currentRevenue).toLocaleString()} / $${config.revenueTarget.toLocaleString()}`}
 />
 <CircularProgress
 pct={(currentProfit / config.profitTarget) * 100}
 color="#22c55e"
 icon={TrendingUp}
 label="Profit"
 value={`$${Math.round(currentProfit).toLocaleString()} / $${config.profitTarget.toLocaleString()}`}
 />
 <CircularProgress
 pct={(currentItems / config.itemsTarget) * 100}
 color="#8b5cf6"
 icon={ShoppingBag}
 label="Items"
 value={`${currentItems} / ${config.itemsTarget}`}
 />
 </div>
 )}
 </div>
 );
}
