import React, { createContext, useContext, useState, useEffect } from 'react';
import { playEmergencyChime, playAckChime } from '../utils/audio';

const AudioAlertContext = createContext(null);

export function AudioAlertProvider({ children }) {
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('methore_audio_muted') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('methore_audio_muted', String(isMuted));
  }, [isMuted]);

  const toggleAudio = () => {
    setIsMuted(prev => {
      const next = !prev;
      if (!next) {
        // play gentle test chirp when unmuting
        setTimeout(() => playAckChime(), 50);
      }
      return next;
    });
  };

  const triggerAlert = () => {
    if (!isMuted) {
      playEmergencyChime();
    }
  };

  const triggerAck = () => {
    if (!isMuted) {
      playAckChime();
    }
  };

  return (
    <AudioAlertContext.Provider value={{ isMuted, toggleAudio, triggerAlert, triggerAck }}>
      {children}
    </AudioAlertContext.Provider>
  );
}

export function useAudioAlert() {
  const context = useContext(AudioAlertContext);
  if (!context) {
    throw new Error('useAudioAlert must be used within an AudioAlertProvider');
  }
  return context;
}
