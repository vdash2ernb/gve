export type ClientStory = {
  id: string;
  name: string;
  role: string;
  company?: string;
  headline: string;
  summary: string;
  video: string;
  duration: string;
};

// Captions and attributions reviewed against the client interviews supplied by GVE.
// Headlines are summaries, not verbatim quotations or promises of typical results.
export const clientStories: ClientStory[] = [
  {
    id: 'mw-design', name: 'Josiah', role: 'CEO', company: 'MW Design Workshop',
    headline: 'More time for the business.',
    summary: 'Josiah handed off social media and research, with the GVE team behind his Expert.',
    video: 'XqHtApU0Qno', duration: '5:21',
  },
  {
    id: 'river-roofing', name: 'Martha', role: 'Office Manager & Bookkeeper', company: 'River Roofing',
    headline: 'Less admin. More breathing room.',
    summary: 'Martha explains how support with paperwork, bookkeeping, and systems made her day easier.',
    video: 'nhq0_DsNkuM', duration: '5:48',
  },
  {
    id: 'architect', name: 'John', role: 'Architect',
    headline: 'Support you can trust with the details.',
    summary: 'John shares how he delegated drafting and client communication to focus on his practice.',
    video: 'okbKCb31JZI', duration: '5:53',
  },
  {
    id: 'earthwin', name: 'Randy Trober', role: 'Executive Director', company: 'EarthWIN',
    headline: 'More time for the mission.',
    summary: 'Randy freed up time to build partnerships and expand EarthWIN’s school programs.',
    video: 'xV8793xZWSM', duration: '5:51',
  },
];

export const founderStory = {
  name: 'Craig Mauer', video: 'ezxcog902_Q', duration: '5:27',
  headline: 'Why Craig built GVE.',
  summary: 'Craig used virtual support at Silver Peak Design Build, then created GVE to help other owners get their time back.',
};

const serviceStories: Record<string, string> = {
  'executive-assistant': 'earthwin',
  'bookkeeping': 'river-roofing',
  'marketing': 'mw-design',
  'cad-drafting': 'architect',
  'project-management': 'architect',
  'customer-support': 'architect',
};

export function clientStoryForService(slug: string) {
  return clientStories.find(story => story.id === serviceStories[slug]);
}
