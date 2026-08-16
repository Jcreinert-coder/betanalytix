import React from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Target, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

export default function AnaliseCard({ analise }) {
  const navigate = useNavigate();
  const data = analise.data_evento ? new Date(analise.data_evento) : null;

  return (
    <button
      onClick={() => navigate(`/analise/${analise.id}`)}
      className="group w-full text-left bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-slate-300 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-medium text-slate-600">
            {analise.esporte}
          </Badge>
          <Badge variant="outline" className={cn("font-medium", confiancaStyles[analise.confianca])}>
            <Target className="w-3 h-3 mr-1" />
            {analise.confianca} confiança
          </Badge>
        </div>
        <Badge variant="secondary" className={statusStyles[analise.status]}>
          {analise.status}
        </Badge>
      </div>

      <h3 className="font-heading text-lg font-semibold text-slate-900 leading-snug mb-2 line-clamp-2">
        {analise.evento}
      </h3>

      <div className="flex items-center gap-2 mb-4 text-slate-600">
        <span className="text-xs text-slate-400">{analise.mercado}</span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-0.5">Aposta</p>
            <p className="text-sm font-semibold text-slate-800 max-w-[160px] truncate">
              {analise.recomendacao}
            </p>
          </div>
          <div className="border-l border-slate-100 pl-4">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-0.5">Odd</p>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              {analise.odd_sugerida?.toFixed(2) ?? "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-300 group-hover:text-slate-900 transition-colors">
          {data && (
            <span className="text-[11px] text-slate-400 mr-2 hidden sm:flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
            </span>
          )}
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
}