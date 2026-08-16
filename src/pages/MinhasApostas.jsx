import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Check, X, Minus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsResumo from "@/components/StatsResumo";
import { toast } from "sonner";

const statusStyles = {
  Pendente: "bg-slate-100 text-slate-600",
  Ganhou: "bg-emerald-100 text-emerald-700",
  Perdeu: "bg-rose-100 text-rose-700",
  Anulada: "bg-slate-100 text-slate-400",
};

export default function MinhasApostas() {
  const navigate = useNavigate();
  const [apostas, setApostas] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    const ap = await base44.entities.Aposta.list("-data", 100);
    setApostas(ap);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const atualizarStatus = async (aposta, status) => {
    await base44.entities.Aposta.update(aposta.id, { status });
    setApostas((prev) => prev.map((a) => (a.id === aposta.id ? { ...a, status } : a)));
    toast.success(`Aosta marcada como ${status}.`);
  };

  return (
    <div className="min-h-screen bg-slate-50/60">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-heading text-lg font-semibold">Minhas apostas</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8">
        <StatsResumo apostas={apostas} />

        <div className="mt-8">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-white border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : apostas.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p className="font-medium">Você ainda não fez apostas</p>
              <p className="text-sm mt-1">Acesse uma análise para apostar.</p>
              <Button className="mt-4" onClick={() => navigate("/")}>
                Ver análises
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {apostas.map((a) => (
                <div
                  key={a.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className={statusStyles[a.status]}>
                        {a.status}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {a.data ? new Date(a.data).toLocaleDateString("pt-BR") : ""}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900 truncate">{a.evento}</p>
                    <p className="text-sm text-slate-500 truncate">
                      {a.mercado} · {a.recomendacao}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400 uppercase">Valor</p>
                      <p className="font-semibold text-slate-800">R$ {(a.valor || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400 uppercase">Odd</p>
                      <p className="font-semibold text-slate-800">{(a.odd || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400 uppercase">Retorno</p>
                      <p className="font-semibold text-emerald-600">
                        R$ {(a.retorno_potencial || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {a.analise_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/analise/${a.analise_id}`)}
                      title="Ver análise"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}

                  {a.status === "Pendente" && (
                    <div className="flex gap-1 sm:ml-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-emerald-600 h-8 w-8"
                        onClick={() => atualizarStatus(a, "Ganhou")}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-rose-600 h-8 w-8"
                        onClick={() => atualizarStatus(a, "Perdeu")}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => atualizarStatus(a, "Anulada")}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}