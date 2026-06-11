import * as React from "react";
import Hls from "hls.js";
import { ExternalLink } from "lucide-react";

export function HlsPlayer({ src, poster }: { src: string; poster?: string }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pipSupported, setPipSupported] = React.useState(false);
  const [isPipActive, setIsPipActive] = React.useState(false);

  React.useEffect(() => {
    if (typeof document !== "undefined" && "pictureInPictureEnabled" in document) {
      setPipSupported(document.pictureInPictureEnabled);
    }
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onEnterPip = () => setIsPipActive(true);
    const onLeavePip = () => setIsPipActive(false);

    video.addEventListener("enterpictureinpicture", onEnterPip);
    video.addEventListener("leavepictureinpicture", onLeavePip);

    return () => {
      video.removeEventListener("enterpictureinpicture", onEnterPip);
      video.removeEventListener("leavepictureinpicture", onLeavePip);
    };
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    setError(null);

    let hls: Hls | null = null;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) setError("Stream error — check the link or try another channel.");
      });
    } else {
      setError("Your browser does not support HLS playback.");
    }

    return () => {
      if (hls) hls.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  const togglePip = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement === video) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error("Failed to toggle Picture-in-Picture", err);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-black shadow-2xl group/player">
      <div className="aspect-video w-full">
        <video
          ref={videoRef}
          className="h-full w-full bg-black"
          controls
          autoPlay
          playsInline
          poster={poster}
        />
      </div>

      {pipSupported && (
        <button
          onClick={togglePip}
          className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white rounded-xl p-2.5 transition-all backdrop-blur-sm border border-white/10 shadow-lg cursor-pointer group flex items-center gap-1.5 text-xs font-semibold hover:scale-105 active:scale-95"
          title="Picture in Picture"
        >
          <ExternalLink className="h-4.5 w-4.5 text-rose-500 stroke-[2.5]" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">
            {isPipActive ? "Close Mini Player" : "Mini Player (PiP)"}
          </span>
        </button>
      )}

      {error && (
        <div className="absolute inset-x-0 bottom-0 bg-destructive/90 text-destructive-foreground text-xs font-mono px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}