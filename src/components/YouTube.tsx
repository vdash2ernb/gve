"use client";
import {useState} from 'react';
export default function YouTube({id,title}:{id:string;title:string}){const [play,setPlay]=useState(false);return <div className="video-card">{play?<iframe src={'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0'} title={title} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>:<button type="button" onClick={()=>setPlay(true)} aria-label={'Play video: '+title}>
{/* eslint-disable-next-line @next/next/no-img-element */}
<img src={'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg'} alt="" loading="lazy"/><span className="video-play" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span><span className="video-title">{title}</span></button>}</div>}
