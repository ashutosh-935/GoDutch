import { createContext, useContext, useRef, useState } from 'react';

const SoundContext = createContext();

export function SoundProvider({ children }) {
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef(null);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const playKeyboardClick = () => {
    if (isMuted) return;
    initAudioContext();
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.05;
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.03);
  };

  const playConfirmBeep = () => {
    if (isMuted) return;
    initAudioContext();

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
    oscillator.frequency.setValueAtTime(1500, ctx.currentTime + 0.05);
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.15);
  };

  return (
    <SoundContext.Provider value={{
      isMuted,
      setIsMuted,
      playKeyboardClick,
      playConfirmBeep,
    }}>
      {children}
    </SoundContext.Provider>
  );
}

export const useSound = () => useContext(SoundContext);
