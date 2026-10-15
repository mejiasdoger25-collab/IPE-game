/**
 * src/ui/tools/ParetoAnalyzer.tsx
 * Level 3 Unlock: Pareto 80/20 MVP Scanner.
 * Allows scanning complex features to identify the core 20% effort delivering 80% customer value,
 * enabling flawless MVP delivery in half the time without perfectionist traps.
 */

import React, { useState } from 'react';
import { useGameStore } from '../../state/useGameStore';

interface SubtaskItem {
  id: string;
  title: string;
  effortPercent: number;
  valueImpactPercent: number;
  isParetoCore: boolean;
}

const FEATURE_SUBTASKS: SubtaskItem[] = [
  {
    id: 'st_1',
    title: '1. Exportación limpia de datos en CSV + Resumen visual rápido',
    effortPercent: 20,
    valueImpactPercent: 80,
    isParetoCore: true,
  },
  {
    id: 'st_2',
    title: '2. Generador complejo de PDF multipágina con tipografías vectoriales',
    effortPercent: 40,
    valueImpactPercent: 10,
    isParetoCore: false,
  },
  {
    id: 'st_3',
    title: '3. Gráficos interactivos animados incrustados en el documento',
    effortPercent: 25,
    valueImpactPercent: 5,
    isParetoCore: false,
  },
  {
    id: 'st_4',
    title: '4. Marca de agua personalizada y temas de color para el banco',
    effortPercent: 15,
    valueImpactPercent: 5,
    isParetoCore: false,
  },
];

export const ParetoAnalyzer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedSubtaskId, setSelectedSubtaskId] = useState<string | null>(null);
  const [analyzed, setAnalyzed] = useState<boolean>(false);
  const { updateIE, updateFiveC, unlockTool, setFlag } = useGameStore();

  const handleScan = () => {
    if (!selectedSubtaskId) return;
    const chosen = FEATURE_SUBTASKS.find((s) => s.id === selectedSubtaskId);
    if (!chosen) return;

    setAnalyzed(true);

    if (chosen.isParetoCore) {
      updateIE(15);
      updateFiveC({ coordinacion: 15, comunicacion: 15 });
      unlockTool('gantt');
      setFlag('used_pareto_correctly', true);
      setFlag('bonus_herramientas_negociacion', 25);
    }
  };

  const chosen = FEATURE_SUBTASKS.find((s) => s.id === selectedSubtaskId);

  return (
    <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 max-w-2xl w-full space-y-4 text-slate-100 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-emerald-400 flex items-center space-x-1.5">
            <span>⚖️ Escáner Ley de Pareto (80/20) — Nivel 3</span>
          </h3>
          <p className="text-xs text-slate-400">
            Identifica el 20% de esfuerzo que genera el 80% del valor real para el cliente bancario.
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-sm font-bold">
          ✕
        </button>
      </div>

      {/* Feature Context Banner */}
      <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-1">
        <span className="font-bold text-amber-400">
          Caso David (Acto 2): "Exportación de Reportes Financieros para el Banco"
        </span>
        <p className="text-slate-300">
          Si intentas programar todo el PDF complejo con gráficos animados, agotarás el tiempo del Sprint y recibirás
          Strikes. Selecciona la subtarea que representa el Producto Mínimo Viable (MVP).
        </p>
      </div>

      {/* Subtasks Selection */}
      <div className="space-y-2">
        {FEATURE_SUBTASKS.map((subtask) => {
          const isSelected = selectedSubtaskId === subtask.id;
          return (
            <button
              key={subtask.id}
              onClick={() => {
                if (!analyzed) setSelectedSubtaskId(subtask.id);
              }}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-950/50 text-emerald-100 shadow-md shadow-emerald-500/10'
                  : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="space-y-1">
                <span className="font-semibold block">{subtask.title}</span>
                {analyzed && (
                  <div className="flex items-center space-x-3 text-[10px] font-mono">
                    <span className="text-purple-400">Esfuerzo: {subtask.effortPercent}%</span>
                    <span className="text-emerald-400 font-bold">
                      Impacto Valor: {subtask.valueImpactPercent}%
                    </span>
                  </div>
                )}
              </div>
              <span className="text-base font-bold text-slate-500">
                {isSelected ? '✓' : '○'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Analysis Result */}
      {analyzed && chosen && (
        <div
          className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
            chosen.isParetoCore
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
          }`}
        >
          <span className="font-bold block">
            {chosen.isParetoCore
              ? '🎉 ¡Análisis Impecable de Pareto 80/20!'
              : '⚠️ Trampa de Perfeccionismo Detectada'}
          </span>
          <p className="leading-relaxed">
            {chosen.isParetoCore
              ? 'El CSV con resumen visual proporciona el 80% de lo que necesita el banco en solo el 20% del tiempo. Esto desbloquea el Bono de Negociación (+25 P_negociacion) con David.'
              : 'Esta subtarea consume demasiado esfuerzo para un impacto marginal. Concéntrate en la exportación básica para no agotar el reloj.'}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end pt-2 border-t border-slate-800">
        {!analyzed ? (
          <button
            onClick={handleScan}
            disabled={!selectedSubtaskId}
            className={`px-5 py-2 rounded-xl font-bold text-xs shadow-lg transition-all ${
              selectedSubtaskId
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            🔍 Ejecutar Escáner MVP
          </button>
        ) : (
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
          >
            Cerrar Escáner
          </button>
        )}
      </div>
    </div>
  );
};
