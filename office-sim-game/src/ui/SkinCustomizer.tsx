/**
 * src/ui/SkinCustomizer.tsx
 * Personalizador Pro de Skins estilo Pokémon 2D:
 * Permite elegir peinado, prenda, accesorios, tono de piel, colores hexadecimales y previsualizar a los NPCs.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../state/useGameStore';
import { SkinBuilder } from '../core/SkinBuilder';
import { AudioManager } from '../core/AudioManager';
import type { SkinConfig } from '../types/game';

export interface SkinCustomizerProps {
  onClose?: () => void;
}

export const SkinCustomizer: React.FC<SkinCustomizerProps> = ({ onClose }) => {
  const { skinConfig, setSkinConfig, currentMapKey, setCurrentMapKey, closeModal, fiveCs, temporalMasteryPoints } =
    useGameStore();

  const [currentConfig, setCurrentConfig] = useState<SkinConfig>({ ...skinConfig });
  const [selectedMap, setSelectedMap] = useState<string>(currentMapKey);
  const [animationRow, setAnimationRow] = useState<number>(2);
  const [frameCol, setFrameCol] = useState<number>(0);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrameCol((prev) => (prev + 1) % SkinBuilder.COLS);
    }, 220);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (previewCanvasRef.current) {
      SkinBuilder.renderPreviewFrame(
        previewCanvasRef.current,
        currentConfig,
        animationRow,
        frameCol,
        4
      );
    }
  }, [currentConfig, animationRow, frameCol]);

  const updateLayer = (
    layerKey: 'hair' | 'top' | 'bottom',
    field: 'sprite' | 'tint',
    value: string
  ) => {
    AudioManager.playKeyClack();
    setCurrentConfig((prev) => ({
      ...prev,
      layers: {
        ...prev.layers,
        [layerKey]: {
          sprite:
            field === 'sprite'
              ? value
              : prev.layers[layerKey]?.sprite || 'default',
          tint:
            field === 'tint'
              ? value
              : prev.layers[layerKey]?.tint || '#2563EB',
        },
      },
    }));
  };

  const handleApplyPreset = (preset: SkinConfig) => {
    AudioManager.playKeyClack();
    if (preset.unlockCondition) {
      const { metric, min } = preset.unlockCondition;
      if (metric === 'temporalMasteryPoints' && temporalMasteryPoints < min) {
        alert(`🔒 Bloqueado: Requiere ${min} Puntos de Maestría Temporal (tienes ${temporalMasteryPoints})`);
        return;
      } else if (metric === 'emotionalIntelligence') {
        const val = useGameStore.getState().emotionalIntelligence;
        if (val < min) {
          alert(`🔒 Bloqueado: Requiere ${min}% de Inteligencia Emocional (tienes ${val}%)`);
          return;
        }
      } else if (metric in fiveCs) {
        const val = fiveCs[metric as keyof typeof fiveCs];
        if (val < min) {
          alert(`🔒 Bloqueado: Requiere ${min}% en ${metric.toUpperCase()} (tienes ${val}%)`);
          return;
        }
      }
    }
    setCurrentConfig(JSON.parse(JSON.stringify(preset)));
  };

  const handleSaveAndPlay = () => {
    AudioManager.playKeyClack();
    setSkinConfig(currentConfig);
    setCurrentMapKey(selectedMap);
    if (onClose) onClose();
    else closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/65 backdrop-blur-xs p-4 overflow-y-auto font-sans select-none text-stone-950">
      <div className="bg-[#FDFBF7] border-2 border-[#C2B299] rounded-3xl p-6 max-w-4xl w-full shadow-2xl space-y-5 my-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#D6CFC2] pb-3">
          <div>
            <h2 className="text-xl font-extrabold text-stone-950">
              🎨 Estudio de Skins Pokémon 2D & Entorno de Laboratorio
            </h2>
            <p className="text-xs text-stone-600">
              Personaliza tu sprite Chibi 16-bit con outlines, peinados, ropa, accesorios o prueba las skins del equipo.
            </p>
          </div>
          <button
            onClick={handleSaveAndPlay}
            className="text-stone-500 hover:text-stone-950 text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Columna Izquierda: Vista Previa en Vivo */}
          <div className="md:col-span-4 flex flex-col items-center justify-between p-4 bg-[#EBE7DF] rounded-2xl border border-[#D1C9BC] space-y-4">
            <div className="text-center">
              <span className="text-[11px] font-mono font-bold uppercase text-[#6F5643] block">
                Vista Previa en Vivo (4x)
              </span>
              <span className="text-xs font-extrabold text-stone-900">{currentConfig.name}</span>
            </div>

            <div className="relative p-6 bg-[#E6CCA9] rounded-2xl border-2 border-[#6F5643] shadow-inner flex items-center justify-center">
              <canvas
                ref={previewCanvasRef}
                className="w-32 h-32 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Selector de Dirección / Animación */}
            <div className="w-full space-y-1.5">
              <label className="text-[11px] font-bold text-stone-700 block text-center">
                Probar Animación / Dirección:
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { row: 2, label: '⬇ Caminar Frente' },
                  { row: 0, label: '⬆ Caminar Espalda' },
                  { row: 1, label: '⬅ Perfil Izq.' },
                  { row: 3, label: '➡ Perfil Der.' },
                  { row: 9, label: '🙌 Celebrar' },
                  { row: 10, label: '☕ Tomar Café' },
                ].map((item) => (
                  <button
                    key={item.row}
                    type="button"
                    onClick={() => setAnimationRow(item.row)}
                    className={`py-1.5 px-2 rounded-xl border font-bold transition-all cursor-pointer text-[11px] ${
                      animationRow === item.row
                        ? 'bg-[#6F5643] border-[#4A3B32] text-white'
                        : 'bg-[#F4F1EA] border-[#C2B299] text-stone-800 hover:bg-[#E6DEC8]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Controles de Capas y Presets */}
          <div className="md:col-span-8 space-y-4">
            {/* Presets de Jugador y Skins de NPCs */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                1. Skins Pro & Compañeros de NovaSoft
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SkinBuilder.PRESET_SKINS.map((preset) => (
                  <button
                    key={preset.skinId}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`text-left p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                      currentConfig.skinId === preset.skinId
                        ? 'border-[#6F5643] bg-[#DDD2BE] text-stone-950 font-bold'
                        : 'border-[#D1C9BC] bg-[#EBE7DF] hover:bg-[#E2DDD3] text-stone-800'
                    }`}
                  >
                    <div className="font-bold truncate">{preset.name}</div>
                    {preset.unlockCondition ? (
                      <div className="text-[10px] text-[#7C5117] font-semibold">
                        🔒 {preset.unlockCondition.metric.slice(0, 6)} ≥ {preset.unlockCondition.min}
                      </div>
                    ) : (
                      <div className="text-[10px] text-[#2F5233] font-semibold">✓ Desbloqueado</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Peinado, Ropa, Piel y Accesorios */}
            <div className="p-3.5 bg-[#EBE7DF] rounded-2xl border border-[#D1C9BC] space-y-3 text-xs">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                2. Moldeado de Sprite (Capas Chibi)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <span className="text-[11px] font-bold text-stone-700 block mb-1">Tono de Piel:</span>
                  <select
                    value={currentConfig.layers.body}
                    onChange={(e) =>
                      setCurrentConfig((p) => ({ ...p, layers: { ...p.layers, body: e.target.value } }))
                    }
                    className="w-full p-1.5 rounded-lg bg-[#FDFBF7] border border-[#C2B299] font-semibold"
                  >
                    <option value="skin_light">Clara</option>
                    <option value="skin_warm">Cálida</option>
                    <option value="skin_tan">Bronceada</option>
                    <option value="skin_dark">Oscura</option>
                  </select>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-stone-700 block mb-1">Estilo de Pelo:</span>
                  <select
                    value={currentConfig.layers.hair?.sprite || 'hair_spiky'}
                    onChange={(e) => updateLayer('hair', 'sprite', e.target.value)}
                    className="w-full p-1.5 rounded-lg bg-[#FDFBF7] border border-[#C2B299] font-semibold"
                  >
                    <option value="hair_spiky">Puntas Anime</option>
                    <option value="hair_messy">Despeinado Dev</option>
                    <option value="hair_long">Melena Larga</option>
                    <option value="hair_ponytail">Coleta Agile</option>
                    <option value="hair_curly">Rizado</option>
                    <option value="hair_short">Corto Ejecutivo</option>
                  </select>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-stone-700 block mb-1">Torso / Ropa:</span>
                  <select
                    value={currentConfig.layers.top?.sprite || 'shirt_hoodie'}
                    onChange={(e) => updateLayer('top', 'sprite', e.target.value)}
                    className="w-full p-1.5 rounded-lg bg-[#FDFBF7] border border-[#C2B299] font-semibold"
                  >
                    <option value="shirt_hoodie">Sudadera Hoodie</option>
                    <option value="shirt_jacket">Chaqueta Cyber</option>
                    <option value="shirt_blazer">Blazer y Corbata</option>
                  </select>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-stone-700 block mb-1">Accesorio:</span>
                  <select
                    value={currentConfig.layers.accessory || 'none'}
                    onChange={(e) =>
                      setCurrentConfig((p) => ({ ...p, layers: { ...p.layers, accessory: e.target.value } }))
                    }
                    className="w-full p-1.5 rounded-lg bg-[#FDFBF7] border border-[#C2B299] font-semibold"
                  >
                    <option value="none">Ninguno</option>
                    <option value="headphones_pro">Auriculares Pro</option>
                    <option value="glasses_blueblock">Gafas Anti-Luz Azul</option>
                    <option value="visor_matrix">Visor Cyber</option>
                    <option value="cap_trainer">Gorra Entrenador</option>
                    <option value="badge_scrum">Insignia Dorada</option>
                  </select>
                </div>
              </div>

              {/* Selectores de Color */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-[11px] text-stone-700 font-bold block mb-1">Color Pelo:</span>
                  <input
                    type="color"
                    value={currentConfig.layers.hair?.tint || '#3B2314'}
                    onChange={(e) => updateLayer('hair', 'tint', e.target.value)}
                    className="w-full h-8 cursor-pointer rounded border border-[#C2B299]"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-stone-700 font-bold block mb-1">Color Prenda:</span>
                  <input
                    type="color"
                    value={currentConfig.layers.top?.tint || '#2563EB'}
                    onChange={(e) => updateLayer('top', 'tint', e.target.value)}
                    className="w-full h-8 cursor-pointer rounded border border-[#C2B299]"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-stone-700 font-bold block mb-1">Color Pantalón:</span>
                  <input
                    type="color"
                    value={currentConfig.layers.bottom?.tint || '#1E293B'}
                    onChange={(e) => updateLayer('bottom', 'tint', e.target.value)}
                    className="w-full h-8 cursor-pointer rounded border border-[#C2B299]"
                  />
                </div>
              </div>
            </div>

            {/* Selector de Tema del Mapa */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                3. Estilo del Entorno 2D (Inspirado en Pokémon)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedMap('startup')}
                  className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                    selectedMap === 'startup'
                      ? 'border-[#6F5643] bg-[#DDD2BE] text-stone-950'
                      : 'border-[#D1C9BC] bg-[#EBE7DF] hover:bg-[#E2DDD3] text-stone-800'
                  }`}
                >
                  🏡 Laboratorio Madera Cálida (Estilo Pueblo Paleta)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMap('corporate')}
                  className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                    selectedMap === 'corporate'
                      ? 'border-[#6F5643] bg-[#DDD2BE] text-stone-950'
                      : 'border-[#D1C9BC] bg-[#EBE7DF] hover:bg-[#E2DDD3] text-stone-800'
                  }`}
                >
                  🏢 Torre Silph S.A. (Baldosa Tecnológica)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-[#D6CFC2]">
          <button
            type="button"
            onClick={handleSaveAndPlay}
            className="px-6 py-2.5 rounded-xl bg-[#6F5643] hover:bg-[#5C4736] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            Guardar Skin y Volver a la Oficina →
          </button>
        </div>
      </div>
    </div>
  );
};