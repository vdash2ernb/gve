export type YouTubePlayer = {
  getOptions: (module?: string) => string[];
  setOption: (module: string, option: string, value: unknown) => void;
  destroy: () => void;
};

export type YouTubePlayerEvent = { target: YouTubePlayer };

type YouTubeApi = {
  Player: new (iframe: HTMLIFrameElement, options: {
    events: {
      onReady: (event: YouTubePlayerEvent) => void;
      onApiChange: (event: YouTubePlayerEvent) => void;
    };
  }) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ready: Promise<YouTubeApi> | null = null;

/** Share one API download, started only after a visitor plays a video. */
export function loadYouTubePlayer(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (ready) return ready;
  ready = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error('YouTube player unavailable'));
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => {
      ready = null;
      window.onYouTubeIframeAPIReady = previous;
      script.remove();
      reject(new Error('YouTube player could not load'));
    };
    document.head.appendChild(script);
  });
  return ready;
}
