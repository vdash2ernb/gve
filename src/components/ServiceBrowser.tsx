"use client";
import {useState} from 'react';
import Link from 'next/link';
import {services} from '@/content/site';
import {domainForService} from '@/content/domains';
import StudioScene from './StudioScene';
const groups=['Admin & operations','Sales & marketing','Specialist services'] as const;
export default function ServiceBrowser(){const [group,setGroup]=useState<typeof groups[number]>('Admin & operations');const [selected,setSelected]=useState(services[0]);return <div className="service-browser"><div className="catalogue-tabs" role="group" aria-label="Service groups">{groups.map((g,i)=><button key={g} type="button" aria-pressed={g===group} onClick={()=>{setGroup(g);setSelected(services.find(s=>s.group===g)!)}}>0{i+1} / {g}<span>{services.filter(s=>s.group===g).length} services</span></button>)}</div><div className="catalogue-list">{services.filter(s=>s.group===group).map(s=><Link key={s.slug} href={'/services/'+s.slug} onMouseEnter={()=>setSelected(s)} onFocus={()=>setSelected(s)}><h2>{s.name}</h2><p>{s.short}</p></Link>)}</div><aside className="catalogue-object"><div className="scene-space"><StudioScene selected={domainForService(selected.slug)} variant="single"/></div><strong>{selected.name}</strong><p>{selected.intro}</p><Link className="underlined" href={'/services/'+selected.slug}>See the tasks</Link></aside></div>}
