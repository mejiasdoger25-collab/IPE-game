/**
 * src/ui/DialogueBox.tsx
 * Sistema de Diálogo Retro 16-Bit:
 * - Corregido el bucle del useEffect: solo se inicializa cuando cambia el nodo o se abre el modal.
 * - Si ya tomaste una decisión en ese nodo, muestra directamente el resumen sin repetir la pregunta.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../state/useGameStore';
import { useQuestStore } from '../state/useQuestStore';
import { DialogueRunner, type ChoiceExecutionResult } from '../core/DialogueRunner';
import { STORY_NODES, type StoryNode, type DialogueOption } from '../data/storyNodes';
import { SkinBuilder } from '../core/SkinBuilder';
import { AudioManager } from '../core/AudioManager';
import { SaveManager } from '../core/SaveManager';
import type { SkinConfig, NPCKey } from '../types/game';

function resolveSpeakerSkin(speakerName: string, playerSkin: SkinConfig): SkinConfig {
  const lower = speakerName.toLowerCase();
  if (lower.includes('elena')) return SkinBuilder.NPC_SKINS.elena_scrum;
  if (lower.includes('david')) return SkinBuilder.NPC_SKINS.david_po;
  if (lower.includes('marcos')) return SkinBuilder.NPC_SKINS.marcos_senior;
  if (lower.includes('sof')) return SkinBuilder.NPC_SKINS.sofia_ux;
  if (lower.includes('lucas')) return SkinBuilder.NPC_SKINS.lucas_junior;
  return playerSkin;
}

function resolveSpeakerAffinityKey(speakerName: string): NPCKey | null {
  const lower = speakerName.toLowerCase();
  if (lower.includes('elena')) return 'elena';
  if (lower.includes('david')) return 'david';
  if (lower.includes('marcos')) return 'marcos';
  if (lower.includes('sof')) return 'sofia';
  if (lower.includes('lucas')) return 'lucas';
  return null;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

export const DialogueBox: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    closeModal,
    updateIE,
    skinConfig,
    affinities,
    pendingInterruptionNodeId,
    clearPendingInterruption,
  } = useGameStore();
  const { activeStoryNodeId, setActiveStoryNode } = useQuestStore();

  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [feedback, setFeedback] = useState<ChoiceExecutionResult | null>(null);
  const [alreadyDecidedOption, setAlreadyDecidedOption] = useState<DialogueOption | null>(null);

  const [portraitFrame, setPortraitFrame] = useState<number>(0);
  const portraitCanvasRef = useRef<HTMLCanvasElement>(null);
  const playerPreviewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [needsSelfRegulation, setNeedsSelfRegulation] = useState<boolean>(false);
  const [regulationPhase, setRegulationPhase] = useState<
    'idle' | 'inhale' | 'hold' | 'exhale' | 'done'
  >('idle');
  const [regulationSeconds, setRegulationSeconds] = useState<number>(4);

  const fullTextRef = useRef<string>('');
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initializedNodeRef = useRef<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setPortraitFrame((prev) => (prev + 1) % 4);
    }, 200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!currentNode) return;
    const speakerSkin = resolveSpeakerSkin(currentNode.speaker, skinConfig);
    if (portraitCanvasRef.current) {
      const col = isTyping ? portraitFrame : 0;
      SkinBuilder.renderPreviewFrame(portraitCanvasRef.current, speakerSkin, 2, col, 3);
    }
    if (playerPreviewCanvasRef.current) {
      SkinBuilder.renderPreviewFrame(playerPreviewCanvasRef.current, skinConfig, 2, 0, 2);
    }
  }, [currentNode, portraitFrame, isTyping, skinConfig, showOptions, alreadyDecidedOption]);

  const startTypewriter = useCallback((text: string, enableOptionsOnEnd = true) => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setDisplayedText('');
    setIsTyping(true);
    let idx = 0;

    typingTimerRef.current = setInterval(() => {
      idx++;
      setDisplayedText(text.slice(0, idx));
      if (idx % 3 === 0) {
        AudioManager.playKeyClack();
      }
      if (idx >= text.length) {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        setIsTyping(false);
        if (enableOptionsOnEnd) {
          setShowOptions(true);
        }
      }
    }, 18);
  }, []);

  // Cargar el nodo SOLO cuando se abre el modal o cambia el ID del nodo (nunca cuando cambian las stats)
  useEffect(() => {
    if (activeModal !== 'DIALOGUE') {
      initializedNodeRef.current = null;
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      return;
    }

    const targetId = pendingInterruptionNodeId || activeStoryNodeId || 'act1_daily';
    if (pendingInterruptionNodeId) {
      setActiveStoryNode(pendingInterruptionNodeId);
      clearPendingInterruption();
    }

    // Evitar reinicializar el mismo nodo si ya está activo en pantalla
    if (initializedNodeRef.current === targetId) return;
    initializedNodeRef.current = targetId;

    const node = STORY_NODES[targetId] || STORY_NODES['act1_daily'] || null;
    if (!node) return;

    setCurrentNode(node);
    setSelectedIndex(0);
    setFeedback(null);

    const previousChoice = DialogueRunner.getRecordedOption(node.id);
    if (previousChoice || DialogueRunner.isNodeCompleted(node.id)) {
      const chosen = previousChoice || node.options[0];
      setAlreadyDecidedOption(chosen);
      setShowOptions(false);
      setNeedsSelfRegulation(false);

      const currentAffinities = useGameStore.getState().affinities;
      const npcKey = resolveSpeakerAffinityKey(node.speaker);
      const affValue = npcKey ? currentAffinities[npcKey] : 50;

      const followUpIntro =
        affValue >= 60
          ? `${node.speaker}: "Sigo teniendo muy presente cómo gestionaste esto antes. ${chosen.consequenceText}"`
          : affValue <= 40
          ? `${node.speaker} (distante): "Ya tomaste tu decisión antes y sus consecuencias se mantienen: ${chosen.consequenceText}"`
          : `${node.speaker}: "Sobre lo que ya decidimos en este Sprint: ${chosen.consequenceText}"`;

      fullTextRef.current = followUpIntro;
      startTypewriter(followUpIntro, false);
    } else {
      setAlreadyDecidedOption(null);
      setShowOptions(false);
      const req = DialogueRunner.isSelfRegulationRequired(node);
      setNeedsSelfRegulation(req);
      setRegulationPhase('idle');

      const resolvedLine = DialogueRunner.getSpeakerLine(node);
      fullTextRef.current = resolvedLine;
      startTypewriter(resolvedLine, true);
    }
  }, [
    activeModal,
    activeStoryNodeId,
    pendingInterruptionNodeId,
    setActiveStoryNode,
    clearPendingInterruption,
    startTypewriter,
  ]);

  const skipTypewriter = useCallback(() => {
    if (isTyping) {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      setDisplayedText(fullTextRef.current);
      setIsTyping(false);
      if (!alreadyDecidedOption && !feedback) {
        setShowOptions(true);
      }
    }
  }, [isTyping, alreadyDecidedOption, feedback]);

  const handleStartRegulation = () => {
    AudioManager.playKeyClack();
    setRegulationPhase('inhale');
    setRegulationSeconds(4);

    const timer = setInterval(() => {
      setRegulationSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setRegulationPhase('hold');
          setRegulationSeconds(4);
          const holdTimer = setInterval(() => {
            setRegulationSeconds((hPrev) => {
              if (hPrev <= 1) {
                clearInterval(holdTimer);
                setRegulationPhase('exhale');
                setRegulationSeconds(4);
                const exhaleTimer = setInterval(() => {
                  setRegulationSeconds((ePrev) => {
                    if (ePrev <= 1) {
                      clearInterval(exhaleTimer);
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
      if (!currentNode || feedback) return;
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      setIsTyping(false);
      setShowOptions(false);

      AudioManager.playNotificationPing();
      const result = DialogueRunner.executeOption(currentNode.id, option);
      setFeedback(result);
      SaveManager.autoSave();
    },
    [currentNode, feedback]
  );

  const handleAdvanceConsequence = useCallback(() => {
    AudioManager.playKeyClack();
    if (alreadyDecidedOption) {
      initializedNodeRef.current = null;
      closeModal();
      setActiveStoryNode(null);
      return;
    }
    if (!feedback) return;
    if (feedback.nextNodeId) {
      initializedNodeRef.current = null;
      setActiveStoryNode(feedback.nextNodeId);
    } else if (feedback.returnModal === 'WORKSTATION') {
      initializedNodeRef.current = null;
      setActiveStoryNode(null);
      setActiveModal('WORKSTATION');
    } else {
      initializedNodeRef.current = null;
      closeModal();
      setActiveStoryNode(null);
    }
  }, [alreadyDecidedOption, feedback, setActiveStoryNode, setActiveModal, closeModal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModal !== 'DIALOGUE' || !currentNode) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        initializedNodeRef.current = null;
        closeModal();
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();

        // 1. Si está escribiendo, muestra la frase entera de golpe
        if (isTyping) {
          skipTypewriter();
          return;
        }

        // 2. Si ya se mostró la consecuencia o era una decisión ya tomada, cierra el diálogo
        if (feedback || alreadyDecidedOption) {
          handleAdvanceConsequence();
          return;
        }

        // 3. Si están las opciones en pantalla, selecciona la opción activa
        if (showOptions && !needsSelfRegulation) {
          handleSelectOption(currentNode.options[selectedIndex]);
          return;
        }
      }

      if (showOptions && !feedback && !alreadyDecidedOption && !needsSelfRegulation) {
        const total = currentNode.options.length;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'd' || e.key === 's') {
          e.preventDefault();
          e.stopPropagation();
          AudioManager.playKeyClack();
          setSelectedIndex((prev) => (prev + 1) % total);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'a' || e.key === 'w') {
          e.preventDefault();
          e.stopPropagation();
          AudioManager.playKeyClack();
          setSelectedIndex((prev) => (prev - 1 + total) % total);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [
    activeModal,
    currentNode,
    isTyping,
    showOptions,
    feedback,
    alreadyDecidedOption,
    needsSelfRegulation,
    selectedIndex,
    skipTypewriter,
    handleSelectOption,
    handleAdvanceConsequence,
    closeModal,
  ]);

  if (activeModal !== 'DIALOGUE' || !currentNode) return null;

  const activeOption = currentNode.options[selectedIndex] || currentNode.options[0];
  const npcAffinityKey = resolveSpeakerAffinityKey(currentNode.speaker);
  const currentSpeakerAffinity = npcAffinityKey ? affinities[npcAffinityKey] : null;

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between p-3 md:p-5 bg-slate-950/85 select-none overflow-y-auto">
      {/* PARTE 1: RETRATO DEL NPC COMPLETAMENTE VISIBLE + BOCADILLO DE DIÁLOGO */}
      <div className="max-w-3xl w-full mx-auto flex flex-col items-center">
        <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-3">
            <div className="relative rpg-box-dark p-1.5 bg-[#262b44]">
              <canvas
                ref={portraitCanvasRef}
                className="w-16 h-16 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
              {isTyping && (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-emerald-400 border-2 border-black animate-bounce" />
              )}
            </div>
            <div className="rpg-box-dark px-3.5 py-2">
              <div className="flex items-center gap-2">
                <span className="font-arcade text-xs text-amber-300">
                  {currentNode.speaker}
                </span>
                {currentSpeakerAffinity !== null && (
                  <span className="font-arcade text-[8px] px-1.5 py-0.5 bg-slate-900 border border-slate-600 text-sky-300">
                    AFINIDAD {currentSpeakerAffinity}%
                  </span>
                )}
              </div>
              <span className="font-dialogue text-base text-slate-300 block mt-0.5">
                {currentNode.speakerRole}
              </span>
            </div>
          </div>

          <div className="rpg-box-dark px-3 py-1.5 bg-[#181e31]">
            <span className="font-arcade text-[8px] text-amber-300 block">
              {alreadyDecidedOption
                ? '✓ DECISIÓN YA REGISTRADA EN ESTE SPRINT'
                : currentNode.isInterruption
                ? '⚡ INTERRUPCIÓN EN EL KANBAN'
                : '🗣️ ESCENA DE HISTORIA'}
            </span>
            <span className="font-dialogue text-base text-slate-200">{currentNode.title}</span>
          </div>
        </div>

        <div
          onClick={skipTypewriter}
          className="relative w-full rpg-box-cream p-4 md:p-5 cursor-pointer"
        >
          <p className="font-dialogue text-2xl md:text-3xl text-stone-950 leading-snug min-h-[60px]">
            {displayedText}
            {isTyping && <span className="inline-block w-3 h-6 bg-stone-900 ml-1 animate-pulse" />}
          </p>

          {!isTyping && currentNode.internalThought && !feedback && !alreadyDecidedOption && (
            <div className="mt-2.5 pt-2 border-t-2 border-dashed border-[#b8ab8e] flex items-center gap-2 text-stone-700">
              <span className="font-arcade text-[8px] bg-[#2b2118] text-[#f4eed7] px-2 py-0.5 shrink-0">
                INTUICIÓN
              </span>
              <p className="font-dialogue text-lg italic leading-tight">
                "{currentNode.internalThought}"
              </p>
            </div>
          )}

          {isTyping && (
            <div className="text-right mt-1">
              <span className="font-arcade text-[8px] text-stone-600 animate-pulse">
                [ESPACIO] COMPLETAR TEXTO
              </span>
            </div>
          )}
        </div>
      </div>

      {/* PARTE 2: MEMORIA DE DECISIÓN TOMADA O ROSCO DE OPCIONES */}
      <div className="max-w-3xl w-full mx-auto mt-3">
        {alreadyDecidedOption && !isTyping && (
          <div className="rpg-box-dark p-4 md:p-5 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b-2 border-slate-700 pb-2">
              <span className="font-arcade text-[9px] text-emerald-400">
                ✓ DECISIÓN PERMANENTE TOMADA ({alreadyDecidedOption.styleTag})
              </span>
              <span className="font-arcade text-[8px] text-slate-400">
                YA REPERCUTIÓ EN TUS ESTADÍSTICAS
              </span>
            </div>

            <div className="bg-slate-900 border-2 border-slate-700 p-3">
              <span className="font-arcade text-[8px] text-amber-300 block mb-1">
                LO QUE DECIDISTE RESPONDER:
              </span>
              <p className="font-dialogue text-xl text-slate-200 leading-snug">
                {alreadyDecidedOption.label}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAdvanceConsequence}
                className="rpg-btn px-5 py-2 font-arcade text-[9px] bg-amber-300 hover:bg-amber-200 text-stone-950 cursor-pointer"
              >
                [ESPACIO / ENTER] CERRAR Y VOLVER A LA OFICINA ▶
              </button>
            </div>
          </div>
        )}

        {needsSelfRegulation && !isTyping && !alreadyDecidedOption && (
          <div className="rpg-box-dark p-4 text-center space-y-2.5 border-rose-500">
            <div className="font-arcade text-xs text-rose-400">
              ¡PULSO ACELERADO! AUTORREGULACIÓN EMOCIONAL REQUERIDA
            </div>
            <p className="font-dialogue text-xl text-slate-200 max-w-lg mx-auto">
              La tensión en la sala es máxima. Respira hondo antes de contestar para no perder los papeles.
            </p>
            {regulationPhase === 'idle' && (
              <button
                onClick={handleStartRegulation}
                className="rpg-btn px-5 py-2 font-arcade text-[10px] cursor-pointer"
              >
                RESPIRACIÓN CUADRADA (12S)
              </button>
            )}
            {regulationPhase === 'inhale' && (
              <div className="font-arcade text-sm text-sky-300 animate-pulse">
                INHALA... {regulationSeconds}S
              </div>
            )}
            {regulationPhase === 'hold' && (
              <div className="font-arcade text-sm text-amber-300 animate-pulse">
                MANTÉN EL AIRE... {regulationSeconds}S
              </div>
            )}
            {regulationPhase === 'exhale' && (
              <div className="font-arcade text-sm text-emerald-300 animate-pulse">
                EXHALA DESPACIO... {regulationSeconds}S
              </div>
            )}
          </div>
        )}

        {showOptions && !feedback && !alreadyDecidedOption && !needsSelfRegulation && (
          <div className="space-y-2.5 animate-fade-in">
            <div className="flex items-center justify-center gap-3 md:gap-5">
              <button
                onClick={() => {
                  AudioManager.playKeyClack();
                  setSelectedIndex(
                    (prev) => (prev - 1 + currentNode.options.length) % currentNode.options.length
                  );
                }}
                className="rpg-btn px-3 py-1.5 font-arcade text-xs cursor-pointer"
              >
                ◀
              </button>

              <div className="flex items-center gap-3">
                {currentNode.options.map((opt, idx) => {
                  const isSelected = idx === selectedIndex;
                  const letter = OPTION_LETTERS[idx] || String(idx + 1);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        AudioManager.playKeyClack();
                        setSelectedIndex(idx);
                      }}
                      className={`relative w-11 h-11 flex items-center justify-center font-arcade text-sm transition-all cursor-pointer border-2 ${
                        isSelected
                          ? 'bg-amber-400 text-stone-950 border-white -translate-y-1 shadow-[0_4px_0_0_#000000] scale-105'
                          : 'bg-[#1e293b] text-slate-400 border-slate-500 hover:text-white shadow-[0_3px_0_0_#000000]'
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  AudioManager.playKeyClack();
                  setSelectedIndex((prev) => (prev + 1) % currentNode.options.length);
                }}
                className="rpg-btn px-3 py-1.5 font-arcade text-xs cursor-pointer"
              >
                ▶
              </button>
            </div>

            <div className="rpg-box-dark p-4 relative">
              <div className="flex items-start gap-3">
                <div className="hidden sm:flex flex-col items-center shrink-0 bg-slate-900 border-2 border-slate-600 p-1.5">
                  <canvas
                    ref={playerPreviewCanvasRef}
                    className="w-11 h-11 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <span className="font-arcade text-[7px] text-emerald-400 mt-1">TÚ</span>
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-arcade text-[9px] text-amber-400">
                      OPCIÓN [{OPTION_LETTERS[selectedIndex]}] · TU RESPUESTA:
                    </span>
                    <span className="font-arcade text-[8px] text-slate-400">
                      {selectedIndex + 1} DE {currentNode.options.length}
                    </span>
                  </div>
                  <p className="font-dialogue text-2xl text-white leading-snug min-h-[48px]">
                    {activeOption.label}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t-2 border-slate-700 flex flex-wrap items-center justify-between gap-2">
                <span className="font-arcade text-[8px] text-slate-400">
                  USA [◀ ▶] PARA GIRAR EL ROSCO
                </span>
                <button
                  onClick={() => handleSelectOption(activeOption)}
                  className="rpg-btn px-5 py-2 font-arcade text-[10px] bg-emerald-400 hover:bg-emerald-300 text-stone-950 cursor-pointer"
                >
                  [ENTER / ESPACIO] CONFIRMAR DECISIÓN
                </button>
              </div>
            </div>
          </div>
        )}

        {feedback && (
          <div className="rpg-box-dark p-4 md:p-5 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b-2 border-slate-700 pb-1.5">
              <span className="font-arcade text-[10px] text-amber-400">
                REPERCUSIÓN EN EL EQUIPO (DECISIÓN GUARDADA)
              </span>
              <span className="font-arcade text-[8px] text-emerald-400">
                ESTADÍSTICAS ACTUALIZADAS ARRIBA ▲
              </span>
            </div>

            <p className="font-dialogue text-2xl text-slate-100 leading-snug">
              {feedback.consequenceText}
            </p>

            {feedback.deltas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {feedback.deltas.map((d, index) => (
                  <span
                    key={index}
                    className={`font-arcade text-[8px] px-2 py-1 border-2 ${
                      d.isPositive
                        ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                        : 'bg-rose-950 border-rose-500 text-rose-300'
                    }`}
                  >
                    {d.label}: {d.value > 0 ? `+${d.value}` : d.value}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                onClick={handleAdvanceConsequence}
                className="rpg-btn px-5 py-2 font-arcade text-[9px] bg-amber-300 hover:bg-amber-200 text-stone-950 cursor-pointer"
              >
                {feedback.nextNodeId
                  ? '[ESPACIO] CONTINUAR ▶'
                  : feedback.returnModal === 'WORKSTATION'
                  ? '[ESPACIO] VOLVER AL KANBAN ▶'
                  : '[ESPACIO] VOLVER A LA OFICINA ▶'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};