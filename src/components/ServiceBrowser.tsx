"use client";
import {useState,useSyncExternalStore} from 'react';
import Link from 'next/link';
import {services} from '@/content/site';
import {domainForService} from '@/content/domains';
import StudioScene from './StudioScene';
import {segments,readSegment,subscribeSegment} from '@/content/segments';
const groups=['Construction & trades','Admin & operations','Sales & marketing','Design & web'] as const;
export default function ServiceBrowser(){// A business type picked on the homepage during this visit sets where the page opens. Every group stays available,
// and the visitor's own clicks take over from there.
const remembered=useSyncExternalStore(subscribeSegment,readSegment,()=>null);const start=segments.find(s=>s.id===remembered)?.services;
const [chosenGroup,setGroup]=useState<typeof groups[number]|null>(null);const [chosen,setSelected]=useState<typeof services[number]|null>(null);
const group=chosenGroup??start?.group??'Construction & trades';const selected=chosen??services.find(s=>s.slug===start?.slug)??services[0];
return <div className="service-browser"><div className="catalogue-tabs" role="group" aria-label="Service groups">{groups.map((g,i)=><button key={g} type="button" aria-pressed={g===group} onClick={()=>{setGroup(g);setSelected(services.find(s=>s.group===g)!)}}>0{i+1} / {g}<span>{services.filter(s=>s.group===g).length} services</span></button>)}</div><div className="catalogue-list">{services.filter(s=>s.group===group).map(s=><Link key={s.slug} href={'/services/'+s.slug} onMouseEnter={()=>setSelected(s)} onFocus={()=>setSelected(s)}><h2>{s.name}</h2><p>{s.short}</p></Link>)}</div><aside className="catalogue-object"><div className="scene-space"><StudioScene selected={domainForService(selected.slug)} variant="single"/></div><strong>{selected.name}</strong><p>{selected.intro}</p><Link className="underlined" href={'/services/'+selected.slug}>See the tasks</Link></aside></div>}
