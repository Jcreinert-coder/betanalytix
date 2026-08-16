import React from "react";
import { Wallet, TrendingUp, TrendingDown, Target } from "lucide-react";

function Stat({ icon: Icon, label, value, tone }) {
  const tones = {
    neutral: "bg-white text-slate-900",
    positive: "bg-emerald-50 text-emerald-700",
    negative: "bg-rose-50 text-rose-700",
  };
  return (
    <div className={tones[tone] + " rounded-2xl border border-slate-200/70 p-5"}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 opacity-70" />
        <span className="text-[11px] uppercase tracking-wide opacity-60 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-heading font-semibold">{value}</p>
    </div>
  );
}

export default function StatsResumo({ apostas }) {
  const total = apostas.length;
  const apostado = apostas.reduce((s, a) => s + (a.valor || 0), 0);
  const ganhas = apostas.filter((a) => a.status === "Ganhou");
  const perdidas = apostas.filter((a) => a.status === "Perdeu");
  const ganhos = ganhas.reduce((s, a) => s + (a.retorno_potencial || 0), 0);
  const lucro = ganhos - apostado;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Stat icon={Wallet} label="Total apostas" value={total} tone="neutral" />
      <Stat icon={TrendingUp} label="Ganhas" value={ganhas.length} tone="positive" />
      <Stat icon={TrendingDown} label="Perdidas" value={perdidas.length} tone="negative" />
      <Stat
        icon={Target}
        label="Lucro/Prejuízo"
        value={(lucro >= 0 ? "+R$ " : "-R$ ") + Math.abs(lucro).toFixed(2)}
        tone={lucro >= 0 ? "positive" : "negative"}
      />
    </div>
  );
}