"use client";

import dynamic from 'next/dynamic';
import { Component, type ReactNode } from 'react';
import type { WorkDomain } from '@/content/domains';

const Canvas = dynamic(() => import('./FolioCanvas'), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div className="folio-fallback"><span>Plans. Projects. People.</span><strong>Everything moves forward<br/>with the right support.</strong></div> : this.props.children;
  }
}

export default function FolioScene({ mode = 'story', selected = 'plans', paused = false }: { mode?: 'story' | 'object'; selected?: WorkDomain; paused?: boolean }) {
  return <SceneBoundary><Canvas mode={mode} selected={selected} paused={paused}/></SceneBoundary>;
}
