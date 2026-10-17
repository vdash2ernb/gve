"use client";
import dynamic from 'next/dynamic';
import { Component, type ReactNode } from 'react';
import type { WorkDomain } from '@/content/domains';
import type { Sheet } from '@/content/segments';
const FolioScene=dynamic(()=>import('./folio/FolioScene'),{ssr:false});
class SceneGuard extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true}}render(){return this.state.failed?<div className="scene-fallback"><strong>Virtual assistant services</strong><span>Admin · Bookkeeping · Design · Dispatch</span></div>:this.props.children}}
export default function StudioScene({selected='plans',sheets}:{selected?:WorkDomain;sheets?:Sheet[];onSelect?:(domain:WorkDomain)=>void;variant?:'all'|'single'}){return <SceneGuard><FolioScene mode="object" selected={selected} sheets={sheets}/></SceneGuard>}
