/**
 * src/ui/DialogueBox.tsx
 * Visual Novel & Dialogue UI Component for DevLife RPG.
 * Implements:
 * - Emotional self-regulation pre-step (Box Breathing) via DialogueRunner.isSelfRegulationRequired()
 * - Typewriter reveal with skippable animation (first press completes line, second advances)
 * - Protagonist internal monologue card with trade-off reflections
 * - Communication style technique badges (Empatía, Asertividad, Negociación Integrativa)
 * - Visual feedback delta toasts (+IE, +C5, -Time)
 * - 200-line conversation history backlog drawer
 * - Keyboard navigation (1-4, Enter, Space, Escape)
 * - Harmonized with warm light brown, stone cream, and taupe editorial aesthetic with Inter black typography
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../state/useGameStore';
import { useQuestStore } from '../state/useQuestStore';
import { DialogueRunner, type ChoiceExecutionResult } from '../core/DialogueRunner';
import { STORY_NODES, type StoryNode, type DialogueOption } from '../data/storyNodes';
import { AudioManager } from '../core/AudioManager';
import { SaveManager } from '../core/SaveManager';

export interface BacklogEntry {
  speaker: string;
  text: string;
  choiceMade?: string;
  timestamp: string;
}

export const DialogueBox: React.FC = () => {
  const { activeModal, closeModal, getEffectiveIE, getIEClimate, updateIE } = useGameStore();
  const { activeStoryNodeId, setActiveStoryNode } = useQuestStore();

  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showMonologue, setShowMonologue] = useState<boolean>(true);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<ChoiceExecutionResult | null>(null);
  const [backlogOpen, setBacklogOpen] = useState<boolean>(false);
  const [backlog, setBacklog] = useState<BacklogEntry[]>([]);
  const [coachMode, setCoachMode] = useState<boolean>(true);

  // Self-regulation state for tense scenes
  const [needsSelfRegulation, setNeedsSelfRegulation] = useState<boolean>(false);
  const [regulationPhase, setRegulationPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale' | 'done'>('idle');
  const [regulationSeconds, setRegulationSeconds] = useState<number>(4);

  const fullTextRef = useRef<string>('');
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync current story node from store or fallback
  useEffect(() => {
    if (activeModal !== 'DIALOGUE') return;
    const nodeId = activeStoryNodeId || 'scene_1_1_daily';
    const node = STORY_NODES[nodeId] || null;
    if (node) {
      setCurrentNode(node);
      setShowMonologue(true);
      setShowOptions(false);
      setFeedback(null);

      // Check if emotional self-regulation is required
      const req = DialogueRunner.isSelfRegulationRequired(node);
      setNeedsSelfRegulation(req);
      setRegulationPhase('idle');

      const resolvedLine = DialogueRunner.getSpeakerLine(node);
      fullTextRef.current = resolvedLine;
      startTypewriter(resolvedLine);

      // Add to backlog
      setBacklog((prev) => {
        const next = [
          ...prev,
          {
            speaker: node.speaker,
            text: resolvedLine,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
        return next.slice(-200);
      });
    }
  }, [activeModal, activeStoryNodeId]);

  const startTypewriter = (text: string) => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setDisplayedText('');
    setIsTyping(true);

    let idx = 0;
    typingTimerRef.current = setInterval(() => {
      idx++;
      setDisplayedText(text.slice(0, idx));
      if (idx % 4 === 0) {
        AudioManager.playKeyClack();
      }
      if (idx >= text.length) {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        setIsTyping(false);
        setShowOptions(true);
      }
    }, 18);
  };

  const skipTypewriter = () => {
    if (isTyping) {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      setDisplayedText(fullTextRef.current);
      setIsTyping(false);
      setShowOptions(true);
    }
  };

  const handleStartRegulation = () => {
    setRegulationPhase('inhale');
    setRegulationSeconds(4);

    const timer = setInterval(() => {
      setRegulationSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Transition to hold
          setRegulationPhase('hold');
          setRegulationSeconds(4);

          const holdTimer = setInterval(() => {
            setRegulationSeconds((hPrev) => {
              if (hPrev <= 1) {
                clearInterval(holdTimer);
                // Transition to exhale
                setRegulationPhase('exhale');
                setRegulationSeconds(4);

                const exhaleTimer = setInterval(() => {
                  setRegulationSeconds((ePrev) => {
                    if (ePrev <= 1) {
                      clearInterval(exhaleTimer);
                      // Done!
                      setRegulationPhase('done');
                      updateIE(10);
                      AudioManager.playNotificationPing();
                      setNeedsSelfRegulation(false);
                      return 0;
                    }
                    return ePrev - 1;
                  });
                }, 1000);

                return 0;
              }
              return hPrev - 1;
            });
          }, 1000);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSelectOption = useCallback(
    (option: DialogueOption) => {
      if (!currentNode) return;

      AudioManager.playKeyClack();
      const result = DialogueRunner.executeOption(currentNode.id, option);
      setFeedback(result);
      setShowOptions(false);

      // Auto-save progress
      SaveManager.autoSave();

      // Record choice in backlog
      setBacklog((prev) => {
        const next = [
          ...prev,
          {
            speaker: 'Tú',
            text: option.label,
            choiceMade: `[${option.styleTag}]`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
        return next.slice(-200);
      });
    },
    [currentNode]
  );

  const handleAdvanceConsequence = () => {
    AudioManager.playKeyClack();
    if (!feedback) return;
    if (feedback.nextNodeId) {
      setActiveStoryNode(feedback.nextNodeId);
    } else {
      closeModal();
      setActiveStoryNode(null);
    }
  };

  // Keyboard navigation: 1-4 for options, Space/Enter to skip typewriter or advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModal !== 'DIALOGUE') return;

      if (e.key === 'Escape') {
        if (backlogOpen) setBacklogOpen(false);
        else closeModal();
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        if (isTyping) {
          skipTypewriter();
        } else if (feedback) {
          handleAdvanceConsequence();
        }
      }

      // 1-4 choice numbers
      if (showOptions && currentNode && !feedback && !needsSelfRegulation) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= currentNode.options.length) {
          handleSelectOption(currentNode.options[num - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, isTyping, showOptions, currentNode, feedback, backlogOpen, needsSelfRegulation, handleSelectOption]);

  if (activeModal !== 'DIALOGUE' || !currentNode) return null;

  const ieClimate = getIEClimate();
  const ieScore = getEffectiveIE();

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end p-4 md:p-8 bg-stone-900/60 backdrop-blur-xs font-sans select-none">
      {/* Backlog Drawer */}
      {backlogOpen && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#F4F1EA] border-l border-[#D6CFC2] p-6 shadow-2xl z-50 flex flex-col space-y-4 text-stone-950">
          <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
            <h3 className="font-extrabold text-stone-950 text-sm">📜 Historial de Conversación (Backlog)</h3>
            <button
              onClick={() => setBacklogOpen(false)}
              className="text-stone-500 hover:text-stone-950 text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            {backlog.map((entry, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#EBE7DF] border border-[#D1C9BC] space-y-1">
                <div className="flex justify-between text-[10px] text-stone-600 font-bold">
                  <span>{entry.speaker}</span>
                  <span className="font-mono">{entry.timestamp}</span>
                </div>
                <p className="text-stone-900 leading-relaxed">{entry.text}</p>
                {entry.choiceMade && (
                  <span className="inline-block text-[10px] font-mono text-[#4A3B32] bg-[#DDD2BE] px-1.5 py-0.5 rounded font-bold">
                    {entry.choiceMade}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Dialogue Box Card */}
      <div className="max-w-4xl w-full mx-auto bg-[#FDFBF7] border-2 border-[#C2B299] rounded-3xl p-6 md:p-8 shadow-2xl space-y-4 text-stone-950">
        {/* Top Header: Speaker, IE badge, Coach toggle, Backlog */}
        <div className="flex flex-wrap justify-between items-center border-b border-[#EBE7DF] pb-3 gap-2">
          <div className="flex items-center space-x-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-[#DDD2BE] text-stone-950 font-black text-sm border border-[#B8A68E] shadow-xs">
              {currentNode.speaker}
            </span>
            <span className="text-xs text-stone-600 font-bold hidden sm:inline">
              {currentNode.title}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            {/* IE Climate Badge */}
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shadow-xs ${
                ieClimate === 'EMPATHIC_SYNERGY'
                  ? 'bg-[#E2EBD8] text-[#2F5233] border border-[#B3C99C]'
                  : ieClimate === 'PROFESSIONAL_CLIMATE'
                  ? 'bg-[#E3E8EC] text-[#2C4A6F] border border-[#BAC7D5]'
                  : 'bg-[#FBE5E1] text-[#8C2D19] border border-[#EBB3A9]'
              }`}
            >
              Clima: {ieClimate === 'EMPATHIC_SYNERGY' ? 'Sinergia (+25%)' : ieClimate === 'PROFESSIONAL_CLIMATE' ? 'Profesional' : 'Hostil'}
            </span>

            <button
              onClick={() => setCoachMode(!coachMode)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                coachMode
                  ? 'bg-[#E6DEC8] text-stone-950 border-[#C2B299]'
                  : 'bg-stone-100 text-stone-500 border-stone-200'
              }`}
            >
              🎓 Coach Soft-Skills: {coachMode ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => setBacklogOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-[#EBE7DF] hover:bg-[#DDD2BE] text-stone-800 text-[11px] font-bold border border-[#D1C9BC] transition-all cursor-pointer"
            >
              📜 Backlog
            </button>
          </div>
        </div>

        {/* Protagonist Psychological Monologue Card */}
        {showMonologue && currentNode.internalThought && (
          <div className="p-3 rounded-2xl bg-[#F5F1E8] border border-[#D6CFC2] text-xs space-y-1 shadow-xs">
            <div className="flex justify-between items-center text-[10px] font-bold text-[#6F5643]">
              <span className="flex items-center space-x-1">
                <span>🧠 Pensamiento Interno (IE: {ieScore}%)</span>
              </span>
              <button
                onClick={() => setShowMonologue(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                Ocultar
              </button>
            </div>
            <p className="text-stone-800 italic leading-relaxed">
              "{currentNode.internalThought}"
            </p>
          </div>
        )}

        {/* Speaker Dialogue Line */}
        <div
          onClick={skipTypewriter}
          className="text-sm md:text-base font-medium text-stone-950 leading-relaxed min-h-[50px] cursor-pointer"
        >
          {displayedText}
          {isTyping && <span className="animate-pulse font-bold text-[#6F5643]"> ▍</span>}
        </div>

        {/* EMOTIONAL SELF-REGULATION / BOX BREATHING PRE-STEP */}
        {needsSelfRegulation && !isTyping && (
          <div className="p-4 rounded-2xl bg-[#FBE5E1] border-2 border-[#EBB3A9] space-y-3 text-center">
            <div className="flex items-center justify-center space-x-2 text-[#8C2D19] font-extrabold text-sm">
              <span>⚠️ Autorregulación Emocional Requerida</span>
            </div>
            <p className="text-xs text-stone-700 max-w-md mx-auto">
              La tensión en la sala es crítica y tu Inteligencia Emocional es baja. Si reaccionas impulsivamente, empeorarás el conflicto.
              Realiza una técnica de <strong>Respiración Cuadrada (Box Breathing)</strong> antes de responder.
            </p>

            {regulationPhase === 'idle' && (
              <button
                onClick={handleStartRegulation}
                className="px-6 py-2 rounded-xl bg-[#6F5643] hover:bg-[#5C4736] text-white font-bold text-xs shadow-md cursor-pointer transition-all"
              >
                Iniciar Respiración Cuadrada (12s)
              </button>
            )}

            {regulationPhase === 'inhale' && (
              <div className="text-base font-bold text-[#2C4A6F] animate-pulse">
                🌬️ Inhala profundamente... {regulationSeconds}s
              </div>
            )}
            {regulationPhase === 'hold' && (
              <div className="text-base font-bold text-[#7C5117] animate-pulse">
                🧘‍♂️ Mantén el aire... {regulationSeconds}s
              </div>
            )}
            {regulationPhase === 'exhale' && (
              <div className="text-base font-bold text-[#2F5233] animate-pulse">
                💨 Exhala suavemente... {regulationSeconds}s
              </div>
            )}
            {regulationPhase === 'done' && (
              <div className="text-xs font-bold text-[#2F5233]">
                ✓ ¡Mente calmada! (+10 IE). Ahora puedes elegir tu respuesta asertiva.
              </div>
            )}
          </div>
        )}

        {/* Dialogue Branching Options */}
        {showOptions && !feedback && !needsSelfRegulation && (
          <div className="space-y-2 pt-2 border-t border-[#EBE7DF]">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
              Selecciona tu respuesta (Teclas 1 - {currentNode.options.length}):
            </span>
            <div className="grid grid-cols-1 gap-2">
              {currentNode.options.map((option, idx) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option)}
                  className="p-3 rounded-2xl bg-[#F4EFE6] hover:bg-[#EAE3D5] active:bg-[#DDD3C0] border border-[#C2B299] text-left text-xs transition-all flex flex-col space-y-1.5 shadow-xs cursor-pointer group"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-stone-950 group-hover:text-black">
                      <span className="font-mono text-[#6F5643] mr-2">[{idx + 1}]</span>
                      {option.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-[#E6DEC8] text-[#4A3B32] border border-[#C2B299]">
                      {option.styleTag}
                    </span>
                  </div>

                  {/* Coach reflection preview */}
                  {coachMode && (
                    <div className="text-[10px] text-stone-600 flex items-center space-x-2 pl-6">
                      <span>⚖️ Impacto previsto:</span>
                      {option.ieDelta !== 0 && (
                        <span className={option.ieDelta > 0 ? 'text-[#2F5233] font-bold' : 'text-[#8C2D19] font-bold'}>
                          {option.ieDelta > 0 ? `+${option.ieDelta}` : option.ieDelta} IE
                        </span>
                      )}
                      {option.timeCostMinutes !== 0 && (
                        <span className="text-stone-600">
                          {option.timeCostMinutes > 0 ? `+${option.timeCostMinutes}` : option.timeCostMinutes} min
                        </span>
                      )}
                      {option.fiveCDelta &&
                        Object.entries(option.fiveCDelta).map(([k, v]) => (
                          <span key={k} className={v > 0 ? 'text-[#2F5233]' : 'text-[#8C2D19]'}>
                            {k.slice(0, 4)}: {v > 0 ? `+${v}` : v}
                          </span>
                        ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Consequence & Feedback Toast */}
        {feedback && (
          <div className="p-4 rounded-2xl bg-[#EBE7DF] border border-[#D1C9BC] space-y-3 text-xs shadow-xs animate-fade-in">
            <div className="font-bold text-stone-950 text-sm">
              📢 Consecuencia Inmediata:
            </div>
            <p className="text-stone-800 leading-relaxed font-medium">
              {feedback.consequenceText}
            </p>

            {/* Stat Deltas */}
            {feedback.deltas.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px] font-bold">
                {feedback.deltas.map((d, i) => (
                  <span
                    key={i}
                    className={`px-2 py-0.5 rounded shadow-xs ${
                      d.isPositive
                        ? 'bg-[#E2EBD8] text-[#2F5233] border border-[#B3C99C]'
                        : 'bg-[#FBE5E1] text-[#8C2D19] border border-[#EBB3A9]'
                    }`}
                  >
                    {d.label}: {d.value > 0 ? `+${d.value}` : d.value}
                  </span>
                ))}
              </div>
            )}

            {/* Next Action Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleAdvanceConsequence}
                className="px-6 py-2 rounded-xl bg-[#6F5643] hover:bg-[#5C4736] text-white font-bold text-xs shadow-md cursor-pointer transition-all flex items-center space-x-1"
              >
                <span>{feedback.nextNodeId ? 'Continuar Historia ▶' : 'Cerrar Diálogo (Espacio) ✕'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
