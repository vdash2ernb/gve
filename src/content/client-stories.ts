export type ClientStory = {
  id: string;
  name: string;
  role: string;
  company?: string;
  headline: string;
  summary: string;
  video: string;
};

// Captions and attributions reviewed against the client interviews supplied by GVE.
// Headlines are summaries, not verbatim quotations or promises of typical results.
export const clientStories: ClientStory[] = [
  {
    id: 'mw-design', name: 'Josiah', role: 'CEO', company: 'MW Design Workshop',
    headline: 'Help with social media and research.',
    summary: 'Josiah discusses delegating social media and research, and the support his assistant receives from GVE.',
    video: 'XqHtApU0Qno',
  },
  {
    id: 'river-roofing', name: 'Martha', role: 'Office Manager & Bookkeeper', company: 'River Roofing',
    headline: 'Bookkeeping and paperwork support.',
    summary: 'Martha describes getting help with payroll, bills, and paperwork at River Roofing.',
    video: 'nhq0_DsNkuM',
  },
  {
    id: 'architect', name: 'John', role: 'Architect',
    headline: 'Drafting and client communication.',
    summary: 'John explains how his assistant helps with drawings, renderings, and client communication.',
    video: 'okbKCb31JZI',
  },
  {
    id: 'earthwin', name: 'Randen', role: 'Founder', company: 'EarthWIN',
    headline: 'Grant writing and database support.',
    summary: 'Randen discusses help with grant writing, email, and Salesforce at EarthWIN.',
    video: 'xV8793xZWSM',
  },
];

export const founderStory = {
  name: 'Craig Mauer', video: 'ezxcog902_Q',
  headline: 'Why Craig built GVE.',
  summary: 'Craig explains how hiring virtual assistants at Silver Peak Design Build led him to start GVE.',
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
