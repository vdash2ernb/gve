// The homepage "Find your Expert" questions. Every task offered here is a GVE service (see site.ts)
// or a task GVE confirmed for that business type (see segments.ts). No prices, by GVE's choice.
import { segments, type SegmentId } from './segments';

export type BusinessId = SegmentId | 'other';
export type FunnelAnswers = { business?: BusinessId; tasks: string[]; other?: string; hours?: string; start?: string };

export const businessOptions: { id: BusinessId; label: string }[] = [
  ...segments.map(s => ({ id: s.id, label: s.label })),
  { id: 'other', label: 'Another type of business' },
];

// Shown after the business type: that type's own tasks first, then common office work.
const commonTasks: Record<BusinessId, string[]> = {
  builders: ['CAD drafting', 'Bookkeeping & invoices', 'Email & calendar'],
  roofing: ['Customer calls', 'Email & calendar', 'Social media & marketing'],
  'home-services': ['Bookkeeping', 'Email & calendar', 'Social media & marketing'],
  property: ['Bookkeeping', 'Email & calendar', 'Social media & marketing'],
  other: ['Email & calendar', 'Customer calls & messages', 'Bookkeeping & invoices', 'Lead follow-ups & CRM', 'Social media & marketing', 'Graphic design', 'Website updates'],
};
// The last choice opens a text box for anything not listed.
export const otherTask = 'Other';
export function tasksFor(business: BusinessId = 'other') {
  const own = segments.find(s => s.id === business)?.chips ?? [];
  return [...own, ...commonTasks[business], otherTask];
}
// The chosen tasks as one line, with the typed answer in place of "Other".
export function tasksText(answers: FunnelAnswers) {
  return answers.tasks.map(task => task === otherTask ? `Other: ${answers.other?.trim()}` : task).join(', ');
}

export const hoursOptions = ['Part-time · 4-hour shifts', 'Full-time · 8-hour shifts', 'Help me decide'];
export const startOptions = ['As soon as possible', 'Within a month', 'In 1–3 months', 'Just exploring'];

// The answers ride into the GHL "GVE Website Inquiry" form as URL parameters. GHL fills any form
// field whose Query Key matches, so each key below needs a matching hidden field in that form.
// `source` names the page the funnel sits on, e.g. 'Homepage funnel'.
export function prefillFor(answers: FunnelAnswers, source: string): Record<string, string> {
  const business = businessOptions.find(b => b.id === answers.business)?.label;
  const fields: Record<string, string | undefined> = {
    business_type: business,
    help_with: tasksText(answers) || undefined,
    hours_needed: answers.hours,
    start_timing: answers.start,
    lead_source: source,
  };
  return Object.fromEntries(Object.entries(fields).filter((entry): entry is [string, string] => !!entry[1]));
}
