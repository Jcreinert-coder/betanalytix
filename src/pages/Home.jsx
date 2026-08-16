import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, SlidersHorizontal, Sparkles, LineChart } from "lucide-react";
import AnaliseCard from "@/components/AnaliseCard";
import StatsResumo from "@/components/StatsResumo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const esportes = ["Todos", "Futebol", "Basquete", "Tênis", "MMA", "E-sports", "Vôlei", "Outro"];

export default function Home() {
  const navigate = useNavigate();
  const [analises, setAnalises] = useState([]);
  const [apostas, setApostas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroEsporte, setFiltroEsporte] = useState("Todos");

  const carregar = async () => {
    setLoading(true);
    const [a, ap] = await Promise.all([
      base44.entities.Analise.list("-data_evento", 50),
      base44.entities.Aposta.list("-data", 100),
    ]);
    setAnalises(a);
    setApostas(ap);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const filtradas = useMemo(() => {
    return analises.filter((a) => {
      const matchBusca =
        !busca ||
        a.evento?.toLowerCase().includes(busca.toLowerCase()) ||
        a.recomendacao?.toLowerCase().includes(busca.toLowerCase());
      const matchEsporte = filtroEsporte === "Todos" || a.esporte === filtroEsporte;
      return matchBusca && matchEsporte;
    });
  }, [analises, busca, filtroEsporte]);

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
              <LineChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-semibold leading-none">BetAnálise</h1>
              <p className="text-[11px] text-slate-400 leading-none mt-1">Análises & apostas</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/minhas-apostas")}>
            Minhas apostas
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Análises do dia</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight mb-2">
            Apostas com direcionamento inteligente
          </h2>
          <p className="text-slate-500 max-w-xl">
            Acompanhe análises de jogos, veja a recomendação e nível de confiança, e faça apostas
            direcionadas — tudo em um só lugar.
          </p>
        </div>

        <StatsResumo apostas={apostas} />

        {/* Filtros */}
        <div className="mt-8 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar evento ou aposta..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            {esportes.map((esp) => (
              <button
                key={esp}
                onClick={() => setFiltroEsporte(esp)}
                className={
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors " +
                  (filtroEsporte === esp
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300")
                }
              >
                {esp}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filtradas.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="font-medium">Nenhuma análise encontrada</p>
            <p className="text-sm mt-1">Tente ajustar os filtros.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtradas.map((a) => (
              <AnaliseCard key={a.id} analise={a} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}