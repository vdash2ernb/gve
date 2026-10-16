"use client";
import {useEffect,useId,useRef,useState} from 'react';
import {loadYouTubePlayer,type YouTubePlayer,type YouTubePlayerEvent} from '@/lib/youtube-player';

// Only one video plays at a time: a video that starts tells the others on the page to pause.
const PLAYING='gve:video-playing';
const announcePlaying=(id:string)=>window.dispatchEvent(new CustomEvent(PLAYING,{detail:id}));

export default function YouTube({id,title,showTitle=true,highResolution=false}:{id:string;title:string;showTitle?:boolean;highResolution?:boolean}){
const [play,setPlay]=useState(false);
// Poster falls back from the large thumbnail to the standard one, then to the plain navy card,
// so a missing or blocked image never shows a broken-image icon.
const [poster,setPoster]=useState<'max'|'hq'|'none'>(highResolution?'max':'hq');
const posterFailed=()=>setPoster(p=>p==='max'?'hq':'none');
const iframe=useRef<HTMLIFrameElement>(null);
const self=useId();
const playerRef=useRef<YouTubePlayer|undefined>(undefined);
useEffect(()=>{
  if(!play) return;
  const others=(e:Event)=>{
    if((e as CustomEvent<string>).detail===self) return;
    // Without the player API there is no pause control, so close the video instead.
    if(playerRef.current) playerRef.current.pauseVideo(); else setPlay(false);
  };
  window.addEventListener(PLAYING,others);
  return ()=>window.removeEventListener(PLAYING,others);
},[play,self]);
useEffect(()=>{
  if(!play || !iframe.current) return;
  let cancelled=false;
  let captionsCleared=false;
  let player:YouTubePlayer|undefined;
  const captionsOff=({target}:YouTubePlayerEvent)=>{
    if(captionsCleared || !target.getOptions('captions').includes('track')) return;
    captionsCleared=true;
    target.setOption('captions','track',{});
  };
  loadYouTubePlayer().then(api=>{
    if(cancelled || !iframe.current) return;
    player=new api.Player(iframe.current,{events:{onReady:e=>{playerRef.current=e.target;captionsOff(e);},onApiChange:captionsOff,onStateChange:({data})=>{if(data===1)announcePlaying(self);}}});
  }).catch(()=>{
    // The iframe can still play if the optional player API is unavailable.
  });
  return ()=>{cancelled=true;playerRef.current=undefined;player?.destroy();};
},[play,self]);
const origin=play ? '&origin='+encodeURIComponent(window.location.origin) : '';
return <div className={showTitle ? "video-card" : "video-card video-card-plain"}>{play?<iframe ref={iframe} src={'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&enablejsapi=1&cc_load_policy=0&playsinline=1'+origin} title={title} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>:<button type="button" onClick={()=>{announcePlaying(self);setPlay(true);}} aria-label={'Play video: '+title}>
{/* eslint-disable-next-line @next/next/no-img-element */}
{poster!=='none'&&<img key={poster} src={'https://i.ytimg.com/vi/'+id+(poster==='max'?'/maxresdefault.jpg':'/hqdefault.jpg')} alt="" loading="lazy" onError={posterFailed} onLoad={e=>{if(e.currentTarget.naturalWidth<=120)posterFailed();}}/>}<span className="video-play" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>{showTitle&&<span className="video-title">{title}</span>}</button>}</div>}
