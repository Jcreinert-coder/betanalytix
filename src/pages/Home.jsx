import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Sparkles, LineChart, Calendar, Loader2, RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const periodos = [
  { id: "hoje", label: "Hoje" },
  { id: "semana", label: "Esta semana" },
  { id: "mes", label: "Este mês" },
];

const confiancaStyles = {
  Alta: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Média: "bg-amber-50 text-amber-700 border-amber-200",
  Baixa: "bg-rose-50 text-rose-700 border-rose-200",
};

const statusStyles = {
  Pendente: "bg-slate-100 text-slate-600",
  Ganhou: "bg-emerald-100 text-emerald-700",
  Perdeu: "bg-rose-100 text-rose-700",
  Anulada: "bg-slate-100 text-slate-400",
};

export default function Home() {
  const [periodo, setPeriodo] = useState("hoje");
  const [analises, setAnalises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);

  const carregar = async () => {
    setLoading(true);
    const lista = await base44.entities.Analise.list("-data_evento", 60);
    setAnalises(lista);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const gerarAnalises = async () => {
    setGerando(true);
    try {
      const hoje = new Date();
      const limite = new Date();
      if (periodo === "hoje") limite.setDate(hoje.getDate() + 1);
      if (periodo === "semana") limite.setDate(hoje.getDate() + 7);
      if (periodo === "mes") limite.setMonth(hoje.getMonth() + 1);

      const prompt = `Você é um analista de apostas esportivas profissional. Liste as partidas reais de futebol, basquete, tênis e e-sports que acontecem entre ${hoje.toLocaleDateString(
        "pt-BR"
      )} e ${limite.toLocaleDateString(
        "pt-BR"
      )}.

Para cada partida, gere uma análise de aposta com base em estatísticas, momento das equipes, confrontos diretos e notícias recentes. Seja específico e realista.

Retorne um JSON com esta estrutura exata:
{
  "partidas": [
    {
      "esporte": "Futebol|Basquete|Tênis|MMA|E-sports|Vôlei|Outro",
      "evento": "Time A x Time B",
      "data_evento": "ISO 8601 datetime (UTC)",
      "mercado": "tipo de aposta (ex: Resultado 1X2, Over/Under, Ambas marcam)",
      "recomendacao": "a aposta exata recomendada",
      "odd_sugerida": número decimal,
      "confianca": "Alta|Média|Baixa",
      "resumo": "justificativa detalhada da análise (3-5 linhas)",
      "analista": "IA Base44"
    }
  ]
}

Inclua entre 6 e 10 partidas reais. Priorize as ligas mais populares do momento.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            partidas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  esporte: { type: "string" },
                  evento: { type: "string" },
                  data_evento: { type: "string" },
                  mercado: { type: "string" },
                  recomendacao: { type: "string" },
                  odd_sugerida: { type: "number" },
                  confianca: { type: "string" },
                  resumo: { type: "string" },
                  analista: { type: "string" },
                },
              },
            },
          },
        },
      });

      const partidas = res?.partidas || [];
      if (!partidas.length) {
        toast.error("Nenhuma partida encontrada para esse período.");
        return;
      }

      const registros = partidas.map((p) => ({
        esporte: p.esporte || "Outro",
        evento: p.evento,
        mercado: p.mercado,
        recomendacao: p.recomendacao,
        odd_sugerida: Number(p.odd_sugerida) || 0,
        confianca: ["Alta", "Média", "Baixa"].includes(p.confianca) ? p.confianca : "Média",
        data_evento: p.data_evento,
        status: "Pendente",
        resumo: p.resumo,
        analista: p.analista || "IA Base44",
      }));

      await base44.entities.Analise.bulkCreate(registros);
      toast.success(`${registros.length} análises geradas!`);
      await carregar();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar análises. Tente novamente.");
    } finally {
      setGerando(false);
    }
  };

  const doDelete = async (id) => {
    await base44.entities.Analise.delete(id);
    setAnalises((prev) => prev.filter((a) => a.id !== id));
    toast.success("Análise removida.");
  };

  const sorted = [...analises].sort(
    (a, b) =>
      (new Date(b.data_evento || 0).getTime() || 0) -
      (new Date(a.data_evento || 0).getTime() || 0)
  );

  return (
    <div className="min-h-screen bg-slate-50/60">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
              <LineChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-semibold leading-none">BetAnálise</h1>
              <p className="text-[11px] text-slate-400 leading-none mt-1">Análises inteligentes</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={carregar} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4 mr-1.5", loading && "animate-spin")} />
            Atualizar
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {/* Hero + gerar */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Análise por IA</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight mb-2">
            O que devo apostar?
          </h2>
          <p className="text-slate-500 max-w-xl mb-5">
            Escolha o período e a IA busca as partidas reais e te passa a recomendação de aposta,
            odd e nível de confiança para cada jogo.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              {periodos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriodo(p.id)}
                  className={
                    "px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors " +
                    (periodo === p.id
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300")
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
            <Button onClick={gerarAnalises} disabled={gerando} className="sm:ml-auto">
              {gerando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando análises...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar análises
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Lista de análises */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <TrendingUp className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Nenhuma análise ainda</p>
            <p className="text-sm mt-1">Clique em "Gerar análises" para começar.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((a) => (
              <AnaliseRow key={a.id} analise={a} onDelete={doDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function AnaliseRow({ analise, onDelete }) {
  const data = analise.data_evento ? new Date(analise.data_evento) : null;
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-medium text-slate-600">
            {analise.esporte}
          </Badge>
          <Badge variant="outline" className={cn("font-medium", confiancaStyles[analise.confianca])}>
            {analise.confianca} confiança
          </Badge>
        </div>
        <Badge variant="secondary" className={statusStyles[analise.status]}>
          {analise.status}
        </Badge>
      </div>

      <h3 className="font-heading text-lg font-semibold text-slate-900 leading-snug mb-1">
        {analise.evento}
      </h3>
      <p className="text-xs text-slate-400 mb-3">{analise.mercado}</p>

      <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 mb-3">
        <p className="text-[11px] uppercase tracking-wide text-emerald-600 mb-1">Apostar em</p>
        <p className="text-sm font-semibold text-emerald-800">{analise.recomendacao}</p>
      </div>

      {analise.resumo && (
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-4">{analise.resumo}</p>
      )}

      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Odd</p>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              {analise.odd_sugerida?.toFixed(2) ?? "—"}
            </p>
          </div>
          {data && (
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Data</p>
              <p className="text-sm font-semibold text-slate-800">
                {data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => onDelete(analise.id)}
          className="text-xs text-slate-300 hover:text-rose-500 transition-colors"
        >
          Remover
        </button>
      </div>
    </div>
  );
}