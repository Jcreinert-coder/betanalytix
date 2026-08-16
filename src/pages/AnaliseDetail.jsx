import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Target, TrendingUp, Calendar, User, Check, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AnaliseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analise, setAnalise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [valor, setValor] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    base44.entities.Analise.get(id).then((a) => {
      setAnalise(a);
      setLoading(false);
    });
  }, [id]);

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
        <p className="text-slate-500">Análise não encontrada.</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Voltar
        </Button>
      </div>
    );
  }

  const data = analise.data_evento ? new Date(analise.data_evento) : null;
  const odd = analise.odd_sugerida || 0;
  const valorNum = parseFloat(valor) || 0;
  const retorno = (valorNum * odd).toFixed(2);

  const apostar = async () => {
    if (valorNum <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    setEnviando(true);
    try {
      await base44.entities.Aposta.create({
        analise_id: analise.id,
        evento: analise.evento,
        mercado: analise.mercado,
        recomendacao: analise.recomendacao,
        odd: odd,
        valor: valorNum,
        retorno_potencial: valorNum * odd,
        status: "Pendente",
        data: new Date().toISOString(),
      });
      toast.success("Aposta registrada com sucesso!");
      navigate("/minhas-apostas");
    } catch (e) {
      toast.error("Erro ao registrar aposta.");
    } finally {
      setEnviando(false);
    }
  };

  const marcarStatus = async (status) => {
    const atualizada = await base44.entities.Analise.update(analise.id, { status });
    setAnalise(atualizada);
    // Atualiza apostas vinculadas
    const apostas = await base44.entities.Aposta.filter({ analise_id: analise.id });
    if (apostas.length) {
      await base44.entities.Aposta.bulkUpdate(
        apostas.map((a) => ({ id: a.id, status }))
      );
    }
    toast.success(`Análise marcada como ${status}.`);
  };

  return (
    <div className="min-h-screen bg-slate-50/60">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{analise.esporte}</Badge>
            <Badge variant="secondary">{analise.status}</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8">
        <h1 className="font-heading text-3xl font-semibold text-slate-900 tracking-tight mb-2">
          {analise.evento}
        </h1>
        <p className="text-slate-500 mb-6">{analise.mercado}</p>

        {/* Cards de info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <InfoCard icon={Target} label="Recomendação" value={analise.recomendacao} />
          <InfoCard icon={TrendingUp} label="Odd sugerida" value={odd.toFixed(2)} />
          <InfoCard icon={User} label="Confiança" value={analise.confianca} />
          <InfoCard
            icon={Calendar}
            label="Data evento"
            value={data ? data.toLocaleDateString("pt-BR") : "—"}
          />
        </div>

        {/* Resumo */}
        {analise.resumo && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
            <h2 className="font-heading text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">
              Resumo da análise
            </h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{analise.resumo}</p>
          </div>
        )}

        {/* Painel de aposta */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
          <h2 className="font-heading text-lg font-semibold mb-1">Fazer aposta</h2>
          <p className="text-sm text-slate-500 mb-5">
            Direcionada pela análise acima. Odd de referência: {odd.toFixed(2)}
          </p>
          <div className="grid sm:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="valor" className="mb-1.5">
                Valor (R$)
              </Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Retorno potencial</p>
              <p className="text-2xl font-heading font-semibold text-emerald-600">R$ {retorno}</p>
            </div>
          </div>
          <Button className="w-full mt-5" disabled={enviando} onClick={apostar}>
            {enviando ? "Registrando..." : "Confirmar aposta"}
          </Button>
        </div>

        {/* Marcar resultado */}
        {analise.status === "Pendente" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-heading text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wide">
              Marcar resultado da análise
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="text-emerald-600" onClick={() => marcarStatus("Ganhou")}>
                <Check className="w-4 h-4 mr-1.5" /> Ganhou
              </Button>
              <Button variant="outline" className="text-rose-600" onClick={() => marcarStatus("Perdeu")}>
                <X className="w-4 h-4 mr-1.5" /> Perdeu
              </Button>
              <Button variant="outline" onClick={() => marcarStatus("Anulada")}>
                <Minus className="w-4 h-4 mr-1.5" /> Anulada
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-1.5 text-slate-400 mb-2">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[11px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-semibold text-slate-800 truncate">{value || "—"}</p>
    </div>
  );
}