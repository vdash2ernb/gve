"use client";

import dynamic from 'next/dynamic';
import { Component, type ReactNode } from 'react';
import type { WorkDomain } from '@/content/domains';

const Canvas = dynamic(() => import('./FolioCanvas'), { ssr: false });
const Handoff = dynamic(() => import('./HandoffCanvas'), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div className="folio-fallback"><span>GVE services</span><strong>Admin, bookkeeping,<br/>design, and more.</strong></div> : this.props.children;
  }
}

export default function FolioScene({ mode = 'story', selected = 'plans', paused = false }: { mode?: 'story' | 'object'; selected?: WorkDomain; paused?: boolean }) {
  return <SceneBoundary><Canvas mode={mode} selected={selected} paused={paused}/></SceneBoundary>;
}

// Homepage story: tasks handed from your business to an Expert in the Philippines and back, done.
export function HandoffScene({ paused = false, panel = false }: { paused?: boolean; panel?: boolean }) {
  return <SceneBoundary><Handoff paused={paused} panel={panel}/></SceneBoundary>;
}
