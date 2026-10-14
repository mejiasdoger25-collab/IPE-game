// src/ui/tools/EisenhowerMatrix.tsx
import React, { useState } from 'react';
import { useGameStore } from '../../state/useGameStore';

interface TaskItem {
  id: string;
  title: string;
  correctQuadrant: 'DO' | 'PLAN' | 'DELEGATE' | 'DELETE';
  assigned?: 'DO' | 'PLAN' | 'DELEGATE' | 'DELETE';
}

const INITIAL_TASKS: TaskItem[] = [
  { id: 't1', title: 'Bug crítico en pasarela de pagos', correctQuadrant: 'DO' },
  { id: 't2', title: 'Arquitectura y exportación MVP cliente', correctQuadrant: 'PLAN' },
  { id: 't3', title: 'Configurar entorno de pruebas / Diapositivas', correctQuadrant: 'DELEGATE' },
  { id: 't4', title: 'Cambiar fuentes y color de botón web interna', correctQuadrant: 'DELETE' },
];

export const EisenhowerMatrix: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [completed, setCompleted] = useState(false);
  const { updateFiveC, updateIE, unlockTool, setFlag } = useGameStore();

  const assignQuadrant = (taskId: string, quadrant: TaskItem['correctQuadrant']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, assigned: quadrant } : t))
    );
  };

  const verifyMatrix = () => {
    const allCorrect = tasks.every((t) => t.assigned === t.correctQuadrant);
    if (allCorrect && !completed) {
      setCompleted(true);
      updateIE(10);
      updateFiveC({ coordinacion: 15, comunicacion: 10, confianza: 10 });
      unlockTool('pareto');
      setFlag('used_eisenhower_correctly', true);
    }
  };

  return (
    <div className="bg-slate-900 border border-sky-500/40 rounded-2xl p-6 max-w-3xl w-full space-y-4 text-slate-100">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-sky-400">📊 Matriz de Eisenhower (2x2)</h3>
          <p className="text-xs text-slate-400">
            Clasifica cada petición de la oficina según su Urgencia e Importancia.
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
          Cerrar ✕
        </button>
      </div>

      <div className="space-y-2.5">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-3 rounded-xl bg-slate-800 border border-slate-700 flex flex-wrap items-center justify-between gap-2"
          >
            <span className="text-sm font-medium">{task.title}</span>
            <div className="flex gap-1.5 text-xs">
              {[
                { key: 'DO', label: '1. Hacer Ahora' },
                { key: 'PLAN', label: '2. Planificar' },
                { key: 'DELEGATE', label: '3. Delegar (Lucas/Elena)' },
                { key: 'DELETE', label: '4. Posponer/Eliminar' },
              ].map((q) => (
                <button
                  key={q.key}
                  onClick={() => assignQuadrant(task.id, q.key as any)}
                  className={`px-2.5 py-1 rounded font-semibold transition ${
                    task.assigned === q.key
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        {completed ? (
          <span className="text-emerald-400 text-sm font-semibold">
            ✅ ¡Priorización impecable! +15 Coordinación, +10 IE y Ley de Pareto 80/20 activada.
          </span>
        ) : (
          <span className="text-xs text-slate-400">
            Asigna los 4 tickets y pulsa Validar para ganar el bonus de negociación.
          </span>
        )}
        <button
          onClick={verifyMatrix}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold"
        >
          Validar Prioridades
        </button>
      </div>
    </div>
  );
};