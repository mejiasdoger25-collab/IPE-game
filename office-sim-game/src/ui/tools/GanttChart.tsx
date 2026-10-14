// src/ui/tools/GanttChart.tsx
import React, { useState } from 'react';
import { useGameStore } from '../../state/useGameStore';

export const GanttChart: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [synced, setSynced] = useState(false);
  const { updateFiveC, setFlag } = useGameStore();

  const handleSyncDependencies = () => {
    if (!synced) {
      setSynced(true);
      updateFiveC({ coordinacion: 20, complementariedad: 20, comunicacion: 15 });
      setFlag('gantt_synced', true);
    }
  };

  return (
    <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-6 max-w-3xl w-full space-y-4 text-slate-100">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-purple-400">
            📅 Diagrama de Gantt Interactivo — Dependencias FinTrack 2.0
          </h3>
          <p className="text-xs text-slate-400">
            Haz clic en el bloqueo de dependencia para sincronizar a Marcos (Backend) con Sofía (UX/Frontend).
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
          Cerrar ✕
        </button>
      </div>

      {/* Cronograma Visual */}
      <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
        <div className="grid grid-cols-12 text-slate-400 pb-2 border-b border-slate-800 font-mono">
          <div className="col-span-4">Tarea / Responsable</div>
          <div className="col-span-2 text-center">09:00 - 11:00</div>
          <div className="col-span-2 text-center">11:00 - 14:00</div>
          <div className="col-span-2 text-center">14:00 - 16:00</div>
          <div className="col-span-2 text-center">16:00 - 18:00</div>
        </div>

        {/* Barra 1: Protagonista */}
        <div className="grid grid-cols-12 items-center">
          <div className="col-span-4 font-semibold text-blue-300">
            1. Contrato API & Pagos (Tú)
          </div>
          <div className="col-span-4 bg-blue-600/80 h-6 rounded flex items-center px-2 text-white">
            Endpoint Listo 14:00
          </div>
        </div>

        {/* Barra 2: Marcos */}
        <div className="grid grid-cols-12 items-center">
          <div className="col-span-4 font-semibold text-rose-300">
            2. Paginación SQL (Marcos)
          </div>
          <div className="col-span-2" />
          <div
            onClick={handleSyncDependencies}
            className={`col-span-4 h-6 rounded flex items-center px-2 cursor-pointer transition ${
              synced
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600/90 hover:bg-amber-500 text-slate-950 font-bold animate-pulse'
            }`}
          >
            {synced ? '🔗 Dependencia Sincronizada' : '⚠️ Clic para sincronizar con Sofía'}
          </div>
        </div>

        {/* Barra 3: Sofía */}
        <div className="grid grid-cols-12 items-center">
          <div className="col-span-4 font-semibold text-emerald-300">
            3. Panel Gastos Progresivo (Sofía)
          </div>
          <div className="col-span-4" />
          <div
            className={`col-span-4 h-6 rounded flex items-center px-2 ${
              synced ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-500'
            }`}
          >
            {synced ? 'Renderizado 5 gráficos OK' : '🔒 Bloqueada esperando API'}
          </div>
        </div>
      </div>

      {synced && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
          ✅ Dependencias desbloqueadas: Sofía podrá maquetar sin colapsar el servidor de Marcos (+20 Coordinación, +20 Complementariedad).
        </div>
      )}
    </div>
  );
};