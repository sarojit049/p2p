import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '../lib/utils';

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60).toString();
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const VoiceMessagePlayer = ({ src, duration, isMine }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef(null);

  // Fallback duration if not provided
  const displayDuration = duration || (audioRef.current?.duration && isFinite(audioRef.current.duration) ? audioRef.current.duration : 0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => console.error("Error playing audio", err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = Number(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleSpeed = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    
    let newRate = 1;
    if (playbackRate === 1) newRate = 1.5;
    else if (playbackRate === 1.5) newRate = 2;
    
    audio.playbackRate = newRate;
    setPlaybackRate(newRate);
  };

  return (
    <div className={cn(
      "flex items-center gap-3 p-1 rounded-full w-[240px]",
      isMine ? "text-white" : "text-slate-800 dark:text-slate-200"
    )}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <button 
        onClick={togglePlay}
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm",
          isMine ? "bg-white text-blue-600 hover:bg-blue-50" : "bg-blue-600 text-white hover:bg-blue-700"
        )}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
      </button>
      
      <div className="flex-1 flex flex-col justify-center">
        <input 
          type="range" 
          min="0" 
          max={displayDuration || 100} 
          value={currentTime} 
          onChange={handleSeek}
          className="w-full h-1.5 bg-black/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-[11px] font-medium opacity-80 font-mono">
            {formatTime(currentTime)} / {formatTime(displayDuration)}
          </span>
          <button 
            onClick={toggleSpeed}
            className="text-[10px] font-bold bg-black/10 px-1.5 py-0.5 rounded-md hover:bg-black/20 transition-colors"
          >
            {playbackRate}x
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceMessagePlayer;
