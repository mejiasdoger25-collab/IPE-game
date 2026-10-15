/**
 * src/ui/SettingsModal.tsx
 * Audio Buses, Accessibility, and Versioned Save/Load Management Modal.
 * Harmonized with warm light brown, stone cream, and taupe editorial aesthetic with Inter black typography.
 */

import React, { useState, useEffect } from 'react';
import { useGameStore } from '../state/useGameStore';
import { AudioManager, type AudioBusType } from '../core/AudioManager';
import { FeedbackManager } from '../core/FeedbackManager';
import { SaveManager, type SaveSlotMetadata } from '../core/SaveManager';

export const SettingsModal: React.FC = () => {
  const { closeModal } = useGameStore();

  const [masterDb, setMasterDb] = useState<number>(AudioManager.getBusVolumeDb('master'));
  const [musicDb, setMusicDb] = useState<number>(AudioManager.getBusVolumeDb('music'));
  const [sfxDb, setSfxDb] = useState<number>(AudioManager.getBusVolumeDb('sfx'));
  const [uiDb, setUiDb] = useState<number>(AudioManager.getBusVolumeDb('ui'));

  const [reduceShake, setReduceShake] = useState<boolean>(FeedbackManager.settings.reduceScreenShake);
  const [reduceMotion, setReduceMotion] = useState<boolean>(FeedbackManager.settings.reduceMotion);
  const [coachMode, setCoachMode] = useState<boolean>(FeedbackManager.settings.coachMode);

  const [slots, setSlots] = useState<SaveSlotMetadata[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    refreshSlots();
  }, []);

  const refreshSlots = () => {
    setSlots(SaveManager.getSlotsMetadata());
  };

  const handleVolumeChange = (bus: AudioBusType, db: number) => {
    AudioManager.setBusVolumeDb(bus, db);
    if (bus === 'master') setMasterDb(db);
    if (bus === 'music') setMusicDb(db);
    if (bus === 'sfx') {
      setSfxDb(db);
      AudioManager.playKeyClack();
    }
    if (bus === 'ui') {
      setUiDb(db);
      AudioManager.playNotificationPing();
    }
  };

  const handleToggleShake = () => {
    const next = !reduceShake;
    setReduceShake(next);
    FeedbackManager.settings.reduceScreenShake = next;
  };

  const handleToggleMotion = () => {
    const next = !reduceMotion;
    setReduceMotion(next);
    FeedbackManager.settings.reduceMotion = next;
  };

  const handleToggleCoach = () => {
    const next = !coachMode;
    setCoachMode(next);
    FeedbackManager.settings.coachMode = next;
  };

  const handleSaveToSlot = (slotId: string) => {
    AudioManager.playKeyClack();
    const ok = SaveManager.saveGame(slotId);
    if (ok) {
      setMessage(`Partida guardada exitosamente en [${slotId.toUpperCase()}].`);
      refreshSlots();
    } else {
      setMessage(`Error al guardar en [${slotId}].`);
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLoadFromSlot = (slotId: string) => {
    AudioManager.playKeyClack();
    const ok = SaveManager.loadGame(slotId);
    if (ok) {
      setMessage(`Partida cargada exitosamente de [${slotId.toUpperCase()}].`);
      closeModal();
    } else {
      setMessage(`Error al cargar partida de [${slotId}].`);
    }
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto font-sans select-none text-stone-950">
      <div className="bg-[#FDFBF7] border-2 border-[#C2B299] rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl space-y-6 my-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
          <div>
            <h3 className="text-xl font-extrabold text-stone-950">⚙️ Ajustes del Sistema & Partidas</h3>
            <p className="text-xs text-stone-600">
              Control de volumen en decibelios (dB), accesibilidad y ranuras de guardado seguro.
            </p>
          </div>
          <button
            onClick={() => {
              AudioManager.playKeyClack();
              closeModal();
            }}
            className="text-stone-500 hover:text-stone-950 text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Feedback message banner */}
        {message && (
          <div className="p-3 bg-[#E2EBD8] border border-[#B3C99C] rounded-xl text-xs text-[#2F5233] animate-fade-in font-bold">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Audio Bus Mixer & Accessibility */}
          <div className="space-y-4">
            {/* Audio Sliders */}
            <div className="p-4 bg-[#EBE7DF] rounded-2xl border border-[#D1C9BC] space-y-3 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6F5643]">
                🔊 Mezclador de Audio (Ganancia en dB)
              </h4>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-stone-800 font-mono text-[11px] font-bold mb-1">
                    <span>Volumen Maestro:</span>
                    <span>{masterDb} dB</span>
                  </div>
                  <input
                    type="range"
                    min={-60}
                    max={6}
                    value={masterDb}
                    onChange={(e) => handleVolumeChange('master', Number(e.target.value))}
                    className="w-full accent-[#6F5643] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-stone-800 font-mono text-[11px] font-bold mb-1">
                    <span>Música de Fondo:</span>
                    <span>{musicDb} dB</span>
                  </div>
                  <input
                    type="range"
                    min={-60}
                    max={6}
                    value={musicDb}
                    onChange={(e) => handleVolumeChange('music', Number(e.target.value))}
                    className="w-full accent-[#4A3B32] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-stone-800 font-mono text-[11px] font-bold mb-1">
                    <span>Efectos SFX (Teclado / Alarmas):</span>
                    <span>{sfxDb} dB</span>
                  </div>
                  <input
                    type="range"
                    min={-60}
                    max={6}
                    value={sfxDb}
                    onChange={(e) => handleVolumeChange('sfx', Number(e.target.value))}
                    className="w-full accent-[#2F5233] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-stone-800 font-mono text-[11px] font-bold mb-1">
                    <span>Alertas UI / Notificaciones:</span>
                    <span>{uiDb} dB</span>
                  </div>
                  <input
                    type="range"
                    min={-60}
                    max={6}
                    value={uiDb}
                    onChange={(e) => handleVolumeChange('ui', Number(e.target.value))}
                    className="w-full accent-[#7C5117] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Accessibility Toggles */}
            <div className="p-4 bg-[#EBE7DF] rounded-2xl border border-[#D1C9BC] space-y-3 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                ♿ Opciones de Accesibilidad
              </h4>
              <div className="space-y-2 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer font-medium text-stone-800">
                  <input
                    type="checkbox"
                    checked={reduceShake}
                    onChange={handleToggleShake}
                    className="rounded accent-[#6F5643]"
                  />
                  <span>Reducir sacudida de pantalla (Screen Shake)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer font-medium text-stone-800">
                  <input
                    type="checkbox"
                    checked={reduceMotion}
                    onChange={handleToggleMotion}
                    className="rounded accent-[#6F5643]"
                  />
                  <span>Reducir movimiento y congelamiento (Hit-Stop)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer font-medium text-stone-800">
                  <input
                    type="checkbox"
                    checked={coachMode}
                    onChange={handleToggleCoach}
                    className="rounded accent-[#6F5643]"
                  />
                  <span>Modo Coach: Mostrar etiquetas de técnicas en diálogos</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Multi-Slot Save/Load */}
          <div className="space-y-3 p-4 bg-[#EBE7DF] rounded-2xl border border-[#D1C9BC] flex flex-col shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6F5643]">
              💾 Ranuras de Guardado en Navegador (Crash-Safe)
            </h4>

            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {slots.map((slot) => (
                <div
                  key={slot.slotId}
                  className="p-3 rounded-xl bg-[#FDFBF7] border border-[#D6CFC2] flex flex-col space-y-2 text-xs shadow-xs"
                >
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-stone-950 font-mono uppercase">
                      {slot.slotId.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono font-normal">
                      {slot.dateFormatted}
                    </span>
                  </div>

                  {!slot.isEmpty && (
                    <div className="flex items-center space-x-3 text-[10px] font-mono font-bold text-stone-700">
                      <span>Sprint {slot.sprint}</span>
                      <span className="text-[#2C4A6F]">IE: {slot.ie}</span>
                      <span className="text-[#2F5233]">ICE: {slot.ice}</span>
                      <span className="text-[#8C2D19]">Strikes: {slot.strikes}/3</span>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={() => handleSaveToSlot(slot.slotId)}
                      className="flex-1 py-1 px-2 rounded-lg bg-[#E6DEC8] hover:bg-[#D8CCB0] text-stone-950 font-bold text-[11px] border border-[#C2B299] shadow-xs cursor-pointer transition-all"
                    >
                      Guardar
                    </button>
                    {!slot.isEmpty && (
                      <button
                        onClick={() => handleLoadFromSlot(slot.slotId)}
                        className="flex-1 py-1 px-2 rounded-lg bg-[#D5E2D2] hover:bg-[#C2D6BE] text-[#2F5233] font-bold text-[11px] border border-[#AEC9A9] shadow-xs cursor-pointer transition-all"
                      >
                        Cargar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
