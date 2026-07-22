import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Settings, Check } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const QUALITY_LABELS: Record<string, string> = {
  hd2160: "2160p",
  hd1440: "1440p",
  hd1080: "1080p",
  hd720: "720p",
  large: "480p",
  medium: "360p",
  small: "240p",
  tiny: "144p",
  auto: "Auto",
  default: "Auto",
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
}

let apiLoaded = false;
let apiReady = false;
const readyCallbacks: (() => void)[] = [];

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (apiReady) return resolve();
    readyCallbacks.push(resolve);
    if (apiLoaded) return;
    apiLoaded = true;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      apiReady = true;
      readyCallbacks.forEach((cb) => cb());
      readyCallbacks.length = 0;
    };
  });
}

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const YouTubePlayer = ({ videoId, title }: YouTubePlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [quality, setQuality] = useState<string>("auto");
  const [availableQualities, setAvailableQualities] = useState<string[]>(["auto"]);
  const [menuOpen, setMenuOpen] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const startTracking = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 500);
  }, []);

  const stopTracking = useCallback(() => {
    clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    let destroyed = false;
    loadYouTubeAPI().then(() => {
      if (destroyed) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          controls: 0,
          rel: 0,
          modestbranding: 1,
          showinfo: 0,
          iv_load_policy: 3,
          disablekb: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => {
            if (destroyed) return;
            setDuration(e.target.getDuration());
            e.target.setVolume(volume);
            setIsReady(true);
          },
          onStateChange: (e: any) => {
            if (destroyed) return;
            if (e.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              startTracking();
              // Qualities become available after playback starts
              try {
                const levels = playerRef.current?.getAvailableQualityLevels?.() || [];
                if (levels.length) setAvailableQualities(["auto", ...levels.filter((l: string) => l !== "auto")]);
                const cur = playerRef.current?.getPlaybackQuality?.();
                if (cur) setQuality(cur);
              } catch {}
            } else {
              setIsPlaying(false);
              stopTracking();
            }
          },
          onPlaybackRateChange: (e: any) => {
            if (!destroyed) setSpeed(e.data);
          },
          onPlaybackQualityChange: (e: any) => {
            if (!destroyed) setQuality(e.data);
          },
        },
      });
    });
    return () => {
      destroyed = true;
      stopTracking();
      playerRef.current?.destroy?.();
    };
  }, [videoId]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const handleSeek = (val: number[]) => {
    const t = val[0];
    playerRef.current?.seekTo(t, true);
    setCurrentTime(t);
  };

  const handleVolume = (val: number[]) => {
    const v = val[0];
    setVolume(v);
    setIsMuted(v === 0);
    playerRef.current?.setVolume(v);
    if (v > 0) playerRef.current?.unMute();
  };

  const toggleMute = () => {
    if (isMuted) {
      playerRef.current?.unMute();
      playerRef.current?.setVolume(volume || 80);
      setIsMuted(false);
      if (volume === 0) setVolume(80);
    } else {
      playerRef.current?.mute();
      setIsMuted(true);
    }
  };

  const skip = (sec: number) => {
    const t = Math.max(0, Math.min(duration, currentTime + sec));
    playerRef.current?.seekTo(t, true);
    setCurrentTime(t);
  };

  const changeSpeed = (s: number) => {
    playerRef.current?.setPlaybackRate?.(s);
    setSpeed(s);
  };

  const changeQuality = (q: string) => {
    playerRef.current?.setPlaybackQuality?.(q);
    setQuality(q);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current?.parentElement;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideTimerRef.current);
    if (isPlaying && !menuOpen) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black group select-none"
      onContextMenu={(e) => e.preventDefault()}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && !menuOpen && setShowControls(false)}
    >
      <div ref={containerRef} className="w-full h-full" />

      {/* Click overlay for play/pause */}
      {isReady && (
        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={togglePlay}
        />
      )}

      {/* Center play button when paused */}
      {isReady && !isPlaying && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-xl">
            <Play className="w-7 h-7 sm:w-9 sm:h-9 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Bottom control bar */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300",
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress bar */}
        <div className="px-3 sm:px-4">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 1}
            step={1}
            onValueChange={handleSeek}
            className="h-1.5 cursor-pointer [&_[role=slider]]:h-3.5 [&_[role=slider]]:w-3.5 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-0"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-t from-black/80 to-transparent">
          <button onClick={togglePlay} className="p-1.5 text-white hover:text-primary transition-colors">
            {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5" fill="currentColor" />}
          </button>

          <button onClick={() => skip(-10)} className="p-1.5 text-white/80 hover:text-white transition-colors hidden sm:block">
            <SkipBack className="w-4 h-4" />
          </button>
          <button onClick={() => skip(10)} className="p-1.5 text-white/80 hover:text-white transition-colors hidden sm:block">
            <SkipForward className="w-4 h-4" />
          </button>

          <span className="text-white/90 text-xs font-mono mx-1 sm:mx-2 min-w-[70px] sm:min-w-[90px]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button onClick={toggleMute} className="p-1.5 text-white/80 hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={100}
              step={1}
              onValueChange={handleVolume}
              className="w-20 h-1 cursor-pointer [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0"
            />
          </div>

          {/* Settings menu */}
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1.5 text-white/80 hover:text-white transition-colors"
                aria-label="Settings"
              >
                <Settings className={cn("w-4 h-4 transition-transform", menuOpen && "rotate-45")} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="end"
              className="w-44 bg-black/90 border-white/10 text-white"
            >
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-white focus:bg-white/10 focus:text-white data-[state=open]:bg-white/10">
                  <span className="flex-1">গতি</span>
                  <span className="text-xs text-white/60 mr-1">{speed}x</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-black/90 border-white/10 text-white">
                    {SPEEDS.map((s) => (
                      <DropdownMenuItem
                        key={s}
                        onClick={() => changeSpeed(s)}
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        <Check className={cn("w-3.5 h-3.5 mr-2", speed === s ? "opacity-100" : "opacity-0")} />
                        {s === 1 ? "Normal" : `${s}x`}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-white focus:bg-white/10 focus:text-white data-[state=open]:bg-white/10">
                  <span className="flex-1">কোয়ালিটি</span>
                  <span className="text-xs text-white/60 mr-1">{QUALITY_LABELS[quality] || quality}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-black/90 border-white/10 text-white">
                    {availableQualities.map((q) => (
                      <DropdownMenuItem
                        key={q}
                        onClick={() => changeQuality(q)}
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        <Check className={cn("w-3.5 h-3.5 mr-2", quality === q ? "opacity-100" : "opacity-0")} />
                        {QUALITY_LABELS[q] || q}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

          <button onClick={toggleFullscreen} className="p-1.5 text-white/80 hover:text-white transition-colors">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;
