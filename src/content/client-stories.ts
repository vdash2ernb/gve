export type ClientStory = {
  id: string;
  name: string;
  role: string;
  company?: string;
  headline: string;
  summary: string;
  video: string;
  // Exact words from the client's own video interview, at `at` (m:ss). Only
  // quotes the user has confirmed go here; written reviews are not used.
  quote?: { text: string; at: string };
};

// Captions and attributions reviewed against the client interviews supplied by GVE.
// Headlines are summaries, not verbatim quotations or promises of typical results.
export const clientStories: ClientStory[] = [
  {
    id: 'river-roofing', name: 'Martha', role: 'Office Manager & Bookkeeper', company: 'River Roofing',
    headline: 'Bookkeeping and paperwork support.',
    summary: 'Martha describes getting help with payroll, bills, and paperwork at River Roofing.',
    video: 'nhq0_DsNkuM',
    quote: { text: 'It’s allowed me to simplify my day.', at: '2:21' },
  },
  {
    id: 'mw-design', name: 'Josiah', role: 'CEO', company: 'MW Design Workshop',
    headline: 'Help with social media and research.',
    summary: 'Josiah discusses delegating social media and research, and the support his assistant receives from GVE.',
    video: 'XqHtApU0Qno',
    quote: { text: 'I just wish I would have done it earlier.', at: '4:17' },
  },
  {
    id: 'architect', name: 'John', role: 'Architect',
    headline: 'Drafting and client communication.',
    summary: 'John explains how his assistant helps with drawings, renderings, and client communication.',
    video: 'okbKCb31JZI',
    // "Um" and "uh" removed; otherwise his exact words.
    quote: { text: 'I learned pretty quickly that I could trust her with my consultants, whether that be a civil engineer, structural engineer.', at: '2:04' },
  },
  {
    id: 'earthwin', name: 'Randen', role: 'Founder', company: 'EarthWIN',
    headline: 'Grant writing and database support.',
    summary: 'Randen discusses help with grant writing, email, and Salesforce at EarthWIN.',
    video: 'xV8793xZWSM',
    quote: { text: 'I’ve never worked with anybody that had such discipline and a deep desire to do a good job, somebody that actually cared.', at: '1:58' },
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
