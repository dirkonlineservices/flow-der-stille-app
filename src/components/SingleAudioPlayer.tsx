import React from 'react';

const LOCAL_AUDIO_MAP: Record<string, string> = {
  'a080ef5a-b9e3-4b2c-938e-d2787991461d': '/MMM_Anleitung atmen.wav.mp3',
  'f18150c6-a6a8-4f6f-a0a2-ce0b8c7edd4a': '/Progressive Muskelentspannung.mp3',
  'ddd69d28-1378-4787-bb9a-bdaf0baca8ce': '/Final - Herzoeffnung Meditation.mp3',
};

export default function SingleAudioPlayer({ produktId }: { produktId: string }) {
  const audioSrc = LOCAL_AUDIO_MAP[produktId];
  if (!audioSrc) return null;

  return (
    <div className="mt-4 p-4 bg-stone-100 rounded-xl border border-stone-200 w-full max-w-md">
      <audio src={audioSrc} controls className="w-full text-stone-800" preload="metadata" controlsList="nodownload" />
    </div>
  );
}
