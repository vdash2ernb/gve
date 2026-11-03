// The homepage "Find your Expert" questions. Every task offered here is a GVE service (see site.ts)
// or a task GVE confirmed for that business type (see segments.ts). No prices, by GVE's choice.
import { segments, type SegmentId } from './segments';

export type BusinessId = SegmentId | 'other';
export type FunnelAnswers = { business?: BusinessId; tasks: string[]; hours?: string; start?: string };

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
export const helpMeChoose = 'Help me choose';
export function tasksFor(business: BusinessId = 'other') {
  const own = segments.find(s => s.id === business)?.chips ?? [];
  return [...own, ...commonTasks[business], helpMeChoose];
}

export const hoursOptions = ['Part-time · 4-hour shifts', 'Full-time · 8-hour shifts', 'Help me decide'];
export const startOptions = ['As soon as possible', 'Within a month', 'In 1–3 months', 'Just exploring'];

// The answers ride into the GHL "GVE Website Inquiry" form as URL parameters. GHL fills any form
// field whose Query Key matches, so each key below needs a matching hidden field in that form.
export function prefillFor(answers: FunnelAnswers): Record<string, string> {
  const business = businessOptions.find(b => b.id === answers.business)?.label;
  const fields: Record<string, string | undefined> = {
    business_type: business,
    help_with: answers.tasks.join(', ') || undefined,
    hours_needed: answers.hours,
    start_timing: answers.start,
    lead_source: 'Homepage funnel',
  };
  return Object.fromEntries(Object.entries(fields).filter((entry): entry is [string, string] => !!entry[1]));
}
