/**
 * src/ui/PhaserGame.tsx
 * React wrapper component for the Phaser 3 canvas with Arcade Physics.
 * Handles mounting, lifecycle cleanup, and pixel-art scale configuration.
 */

import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { OfficeScene } from '../core/OfficeScene';

export interface PhaserGameProps {
  onSceneReady?: (scene: OfficeScene) => void;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ onSceneReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 960,
      height: 640,
      parent: containerRef.current,
      pixelArt: true,
      backgroundColor: '#0F172A',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [OfficeScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.once(Phaser.Core.Events.READY, () => {
      const scene = game.scene.getScene('OfficeScene') as OfficeScene;
      if (scene && onSceneReady) {
        onSceneReady(scene);
      }
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onSceneReady]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden shadow-2xl rounded-2xl border border-slate-800"
      id="phaser-container"
    />
  );
};
