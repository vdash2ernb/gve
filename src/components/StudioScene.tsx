"use client";
import dynamic from 'next/dynamic';
import { Component, type ReactNode } from 'react';
import type { WorkDomain } from '@/content/domains';
const FolioScene=dynamic(()=>import('./folio/FolioScene'),{ssr:false});
class SceneGuard extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true}}render(){return this.state.failed?<div className="scene-fallback"><strong>The work behind your work.</strong><span>Plans · Projects · Accounts · Customers</span></div>:this.props.children}}
export default function StudioScene({selected='plans'}:{selected?:WorkDomain;onSelect?:(domain:WorkDomain)=>void;variant?:'all'|'single'}){return <SceneGuard><FolioScene mode="object" selected={selected}/></SceneGuard>}
