"use client";

import dynamic from 'next/dynamic';
import { Component, type ReactNode } from 'react';
import type { WorkDomain } from '@/content/domains';
import type { Sheet } from '@/content/segments';

const Canvas = dynamic(() => import('./FolioCanvas'), { ssr: false });
const Handoff = dynamic(() => import('./HandoffCanvas'), { ssr: false });

// `onFail` lets the page hide controls that only work while the 3D is running.
class SceneBoundary extends Component<{ children: ReactNode; onFail?: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFail?.(); }
  render() {
    return this.state.failed ? <div className="folio-fallback"><span>GVE services</span><strong>Admin, bookkeeping,<br/>design, and more.</strong></div> : this.props.children;
  }
}

export default function FolioScene({ mode = 'story', selected = 'plans', sheets, paused = false }: { mode?: 'story' | 'object'; selected?: WorkDomain; sheets?: Sheet[]; paused?: boolean }) {
  return <SceneBoundary><Canvas mode={mode} selected={selected} sheets={sheets} paused={paused}/></SceneBoundary>;
}

// Homepage story: tasks handed from your business to an Expert in the Philippines and back, done.
export function HandoffScene({ paused = false, panel = false, sheets, caption, onFail }: { paused?: boolean; panel?: boolean; sheets?: Sheet[]; caption?: string; onFail?: () => void }) {
  return <SceneBoundary onFail={onFail}><Handoff paused={paused} panel={panel} sheets={sheets} caption={caption}/></SceneBoundary>;
}
