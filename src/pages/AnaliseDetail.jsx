import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Shield,
  User,
  Swords,
  Target,
  TrendingUp,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const confiancaStyles = {
  Alta: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Média: "bg-amber-50 text-amber-700 border-amber-200",
  Baixa: "bg-rose-50 text-rose-700 border-rose-200",
};

const schema = {
  type: "object",
  properties: {
    arbitro: {
      type: "object",
      properties: {
        nome: { type: "string" },
        experiencia: { type: "string" },
        media_cartoes_amarelos: { type: "number" },
        media_cartoes_vermelhos: { type: "number" },
        media_faltas: { type: "number" },
        estilo: { type: "string" },
      },
    },
    time_a: {
      type: "object",
      properties: {
        nome: { type: "string" },
        posse_bola: { type: "number" },
        media_chutes: { type: "number" },
        media_chutes_no_alvo: { type: "number" },
        media_gols_marcados: { type: "number" },
        media_gols_sofridos: { type: "number" },
        media_cartoes: { type: "number" },
        media_faltas: { type: "number" },
        forma_recente: { type: "string" },
        ultimos_jogos: { type: "array", items: { type: "string" } },
        jogadores_chave: {
          type: "array",
          items: {
            type: "object",
            properties: {
              nome: { type: "string" },
              posicao: { type: "string" },
              gols: { type: "number" },
              assistencias: { type: "number" },
              destaque: { type: "string" },
            },
          },
        },
      },
    },
    time_b: {
      type: "object",
      properties: {
        nome: { type: "string" },
        posse_bola: { type: "number" },
        media_chutes: { type: "number" },
        media_chutes_no_alvo: { type: "number" },
        media_gols_marcados: { type: "number" },
        media_gols_sofridos: { type: "number" },
        media_cartoes: { type: "number" },
        media_faltas: { type: "number" },
        forma_recente: { type: "string" },
        ultimos_jogos: { type: "array", items: { type: "string" } },
        jogadores_chave: {
          type: "array",
          items: {
            type: "object",
            properties: {
              nome: { type: "string" },
              posicao: { type: "string" },
              gols: { type: "number" },
              assistencias: { type: "number" },
              destaque: { type: "string" },
            },
          },
        },
      },
    },
    confronto_direto: {
      type: "object",
      properties: {
        vitorias_a: { type: "number" },
        empates: { type: "number" },
        vitorias_b: { type: "number" },
        ultimos_confrontos: { type: "array", items: { type: "string" } },
      },
    },
    recomendacao_final: {
      type: "object",
      properties: {
        aposta: { type: "string" },
        mercado: { type: "string" },
        odd_estimada: { type: "number" },
        confianca: { type: "string" },
        justificativa: { type: "string" },
        apostas_alternativas: {
          type: "array",
          items: {
            type: "object",
            properties: {
              aposta: { type: "string" },
              justificativa: { type: "string" },
            },
          },
        },
      },
    },
  },
};

export default function AnaliseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analise, setAnalise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detalhe, setDetalhe] = useState(null);
  const [gerando, setGerando] = useState(false);

  useEffect(() => {
    base44.entities.Analise.get(id).then(async (a) => {
      setAnalise(a);
      setLoading(false);
      if (a) await gerarDetalhe(a);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const gerarDetalhe = async (a) => {
    setGerando(true);
    setDetalhe(null);
    try {
      const prompt = `Você é um analista de dados esportivos. Faça uma análise PROFUNDA e detalhada da partida: "${a.evento}" (${a.esporte}).

Use dados reais da temporada atual e jogos recentes. Consulte estatísticas dos times no ano, os últimos confrontos, o árbitro designado e os jogadores principais.

Retorne um JSON estruturado com:
1. arbitro: nome, experiência, média de cartões amarelos e vermelhos por jogo, média de faltas, estilo de arbitragem
2. time_a e time_b: nome, posse de bola %, média de chutes, chutes no alvo, gols marcados e sofridos, cartões e faltas por jogo, forma recente (ex: VVEED), últimos 5 jogos (ex: "Time 2-1 Adversário"), e 3-5 jogadores chave com nome, posição, gols, assistências e um destaque
3. confronto_direto: vitórias de cada lado, empates nos últimos 10 confrontos, e os últimos 5 confrontos
4. recomendacao_final: a melhor aposta, mercado, odd estimada, confiança (Alta/Média/Baixa), justificativa detalhada, e 2-3 apostas alternativas com justificativa

Seja específico e use dados reais. Se não houver dados exatos, use estimativas realistas baseadas no histórico.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: schema,
      });
      setDetalhe(res);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar análise detalhada.");
    } finally {
      setGerando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!analise) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <p className="text-slate-500">Partida não encontrada.</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{analise.esporte}</Badge>
            <Badge variant="outline" className={confiancaStyles[analise.confianca]}>
              {analise.confianca} confiança
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => gerarDetalhe(analise)}
            disabled={gerando}
          >
            <RefreshIcon gerando={gerando} />
            Reanalisar
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8">
        {/* Título */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Análise completa da partida</span>
          </div>
          <h1 className="font-heading text-3xl font-semibold text-slate-900 tracking-tight mb-1">
            {analise.evento}
          </h1>
          <p className="text-slate-500">{analise.mercado}</p>
        </div>

        {/* Loading detalhe */}
        {gerando && !detalhe && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            <p className="text-sm text-slate-500">Buscando estatísticas da temporada, árbitro e jogadores...</p>
          </div>
        )}

        {detalhe && (
          <div className="space-y-6">
            {/* Árbitro */}
            {detalhe.arbitro && <SecaoArbitro arbitro={detalhe.arbitro} />}

            {/* Times */}
            <div className="grid sm:grid-cols-2 gap-6">
              {detalhe.time_a && <SecaoTime time={detalhe.time_a} />}
              {detalhe.time_b && <SecaoTime time={detalhe.time_b} />}
            </div>

            {/* Confronto direto */}
            {detalhe.confronto_direto && <SecaoConfronto h2h={detalhe.confronto_direto} />}

            {/* Recomendação final */}
            {detalhe.recomendacao_final && (
              <SecaoRecomendacao rec={detalhe.recomendacao_final} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function RefreshIcon({ gerando }) {
  return <RefreshCw className={cn("w-4 h-4 mr-1.5", gerando && "animate-spin")} />;
}

function StatLinha({ label, valor, sufixo }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">
        {valor}
        {sufixo && <span className="text-slate-400 ml-0.5">{sufixo}</span>}
      </span>
    </div>
  );
}

function SecaoArbitro({ arbitro }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <SecaoHeader icon={User} title="Árbitro" />
      <div className="grid sm:grid-cols-2 gap-x-8">
        <div>
          <p className="text-lg font-semibold text-slate-900 mb-1">{arbitro.nome || "—"}</p>
          {arbitro.experiencia && (
            <p className="text-sm text-slate-500 mb-2">{arbitro.experiencia}</p>
          )}
          {arbitro.estilo && (
            <p className="text-sm text-slate-600 italic">"{arbitro.estilo}"</p>
          )}
        </div>
        <div className="mt-4 sm:mt-0">
          <StatLinha label="Cartões amarelos (média/jogo)" valor={arbitro.media_cartoes_amarelos?.toFixed(1)} />
          <StatLinha label="Cartões vermelhos (média/jogo)" valor={arbitro.media_cartoes_vermelhos?.toFixed(1)} />
          <StatLinha label="Faltas (média/jogo)" valor={arbitro.media_faltas?.toFixed(0)} />
        </div>
      </div>
    </div>
  );
}

function SecaoTime({ time }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <SecaoHeader icon={Shield} title={time.nome || "Time"} />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MiniStat icon={Target} label="Chutes/jogo" valor={time.media_chutes?.toFixed(1)} />
        <MiniStat icon={Target} label="No alvo" valor={time.media_chutes_no_alvo?.toFixed(1)} />
        <MiniStat icon={TrendingUp} label="Gols marcados" valor={time.media_gols_marcados?.toFixed(1)} />
        <MiniStat icon={TrendingUp} label="Gols sofridos" valor={time.media_gols_sofridos?.toFixed(1)} />
        <MiniStat icon={User} label="Cartões/jogo" valor={time.media_cartoes?.toFixed(1)} />
        <MiniStat icon={Shield} label="Faltas/jogo" valor={time.media_faltas?.toFixed(0)} />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-400">Posse de bola</span>
          <span className="text-xs font-semibold text-slate-700">{time.posse_bola?.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${time.posse_bola || 50}%` }}
          />
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1.5">Forma recente</p>
        <div className="flex flex-wrap gap-1.5">
          {(time.forma_recente || "").split("").map((r, i) => (
            <span
              key={i}
              className={cn(
                "w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold text-white",
                r === "V" && "bg-emerald-500",
                r === "E" && "bg-slate-400",
                r === "D" && "bg-rose-500"
              )}
            >
              {r}
            </span>
          ))}
        </div>
      </div>

      {time.ultimos_jogos?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1.5">Últimos jogos</p>
          <ul className="space-y-1">
            {time.ultimos_jogos.slice(0, 5).map((j, i) => (
              <li key={i} className="text-sm text-slate-600">
                {j}
              </li>
            ))}
          </ul>
        </div>
      )}

      {time.jogadores_chave?.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Jogadores chave</p>
          <div className="space-y-2">
            {time.jogadores_chave.map((j, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {j.nome} <span className="text-slate-400 font-normal">· {j.posicao}</span>
                  </p>
                  <p className="text-xs text-slate-500 truncate">{j.destaque}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-slate-800">{j.gols}G</p>
                  <p className="text-[11px] text-slate-400">{j.assistencias}A</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SecaoConfronto({ h2h }) {
  const total = (h2h.vitorias_a || 0) + (h2h.empates || 0) + (h2h.vitorias_b || 0) || 1;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <SecaoHeader icon={Swords} title="Confronto direto" />
      <div className="grid grid-cols-3 gap-3 mb-5">
        <H2HStat label="Vitórias A" valor={h2h.vitorias_a} pct={((h2h.vitorias_a || 0) / total) * 100} cor="emerald" />
        <H2HStat label="Empates" valor={h2h.empates} pct={((h2h.empates || 0) / total) * 100} cor="slate" />
        <H2HStat label="Vitórias B" valor={h2h.vitorias_b} pct={((h2h.vitorias_b || 0) / total) * 100} cor="rose" />
      </div>
      {h2h.ultimos_confrontos?.length > 0 && (
        <ul className="space-y-1.5">
          {h2h.ultimos_confrontos.slice(0, 5).map((c, i) => (
            <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SecaoRecomendacao({ rec }) {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-4 h-4 text-emerald-400" />
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-slate-300">
          Recomendação final
        </h2>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">{rec.mercado}</p>
          <p className="text-2xl font-heading font-semibold">{rec.aposta}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-400">Odd est.</p>
            <p className="text-xl font-semibold text-emerald-400">{rec.odd_estimada?.toFixed(2)}</p>
          </div>
          <Badge
            className={cn(
              "font-medium",
              rec.confianca === "Alta" && "bg-emerald-500 text-white",
              rec.confianca === "Média" && "bg-amber-500 text-white",
              rec.confianca === "Baixa" && "bg-rose-500 text-white"
            )}
          >
            {rec.confianca}
          </Badge>
        </div>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed mb-5">{rec.justificativa}</p>

      {rec.apostas_alternativas?.length > 0 && (
        <div className="border-t border-white/10 pt-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Apostas alternativas</p>
          <div className="space-y-2">
            {rec.apostas_alternativas.map((alt, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 text-xs mt-0.5">•</span>
                <div>
                  <p className="text-sm font-medium text-white">{alt.aposta}</p>
                  <p className="text-xs text-slate-400">{alt.justificativa}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SecaoHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-slate-400" />
      <h2 className="font-heading text-sm font-semibold text-slate-900 uppercase tracking-wide">{title}</h2>
    </div>
  );
}

function MiniStat({ icon: Icon, label, valor }) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50">
      <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-slate-400 leading-none mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{valor ?? "—"}</p>
      </div>
    </div>
  );
}

function H2HStat({ label, valor, pct, cor }) {
  const cores = {
    emerald: "bg-emerald-500",
    slate: "bg-slate-400",
    rose: "bg-rose-500",
  };
  return (
    <div className="text-center">
      <p className="text-2xl font-heading font-semibold text-slate-900 mb-1">{valor}</p>
      <p className="text-[11px] text-slate-400 mb-2">{label}</p>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", cores[cor])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}