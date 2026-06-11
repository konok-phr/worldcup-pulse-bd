import * as React from "react";
import Hls from "hls.js";

export function HlsPlayer({ src, poster }: { src: string; poster?: string }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [error, setError] = React.useState<string | null>(null);

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

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-black shadow-2xl">
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
      {error && (
        <div className="absolute inset-x-0 bottom-0 bg-destructive/90 text-destructive-foreground text-xs font-mono px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}