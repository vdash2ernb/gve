"use client";
import {useEffect,useRef,useState} from 'react';
import {loadYouTubePlayer,type YouTubePlayer,type YouTubePlayerEvent} from '@/lib/youtube-player';

export default function YouTube({id,title,showTitle=true,highResolution=false}:{id:string;title:string;showTitle?:boolean;highResolution?:boolean}){
const [play,setPlay]=useState(false);
const iframe=useRef<HTMLIFrameElement>(null);
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
    player=new api.Player(iframe.current,{events:{onReady:captionsOff,onApiChange:captionsOff}});
  }).catch(()=>{
    // The iframe can still play if the optional player API is unavailable.
  });
  return ()=>{cancelled=true;player?.destroy();};
},[play]);
const origin=play ? '&origin='+encodeURIComponent(window.location.origin) : '';
return <div className={showTitle ? "video-card" : "video-card video-card-plain"}>{play?<iframe ref={iframe} src={'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&enablejsapi=1&cc_load_policy=0&playsinline=1'+origin} title={title} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>:<button type="button" onClick={()=>setPlay(true)} aria-label={'Play video: '+title}>
{/* eslint-disable-next-line @next/next/no-img-element */}
<img src={'https://i.ytimg.com/vi/'+id+(highResolution?'/maxresdefault.jpg':'/hqdefault.jpg')} alt="" loading="lazy"/><span className="video-play" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>{showTitle&&<span className="video-title">{title}</span>}</button>}</div>}
