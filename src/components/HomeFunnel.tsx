"use client";

import { useEffect, useRef, useState } from 'react';
import InquiryForm from './InquiryForm';
import { useLenis } from './SmoothScroll';
import { saveSegment } from '@/content/segments';
import { businessOptions, businessText, hoursOptions, otherTask, prefillFor, startOptions, tasksFor, tasksText, type BusinessId, type FunnelAnswers } from '@/content/funnel';
import styles from './HomeFunnel.module.css';

// The homepage funnel: four quick questions, then the GHL inquiry form with the answers attached
// as hidden fields, in a window over the page. The business type also tailors the rest of the
// homepage, like the old picker did.
const questions = [
  { title: 'What kind of business do you run?' },
  { title: 'What would you like help with?', hint: 'Choose all that apply.' },
  { title: 'How much help do you need?', hint: 'Your Expert works your business hours, in your time zone.' },
  { title: 'When would you like to start?', hint: 'Hiring usually takes about 2 weeks.' },
];
const QUESTIONS = questions.length;
// Below the fixed site header.
const HEADER = 112;

export default function HomeFunnel({ className, source = 'Homepage funnel' }: { className?: string; source?: string }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<FunnelAnswers>({ tasks: [] });
  const [nudge, setNudge] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const card = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const formHeading = useRef<HTMLHeadingElement>(null);
  const reopen = useRef<HTMLButtonElement>(null);
  const moved = useRef(false);
  const lenis = useLenis();

  // After each answer, focus moves to the next question so keyboard and screen-reader users follow
  // along. If that question sits under the header or low on the screen, the page scrolls to it.
  useEffect(() => {
    const el = heading.current;
    if (!moved.current || !el) return;
    moved.current = false;
    el.focus({ preventScroll: true });
    const top = el.getBoundingClientRect().top;
    if (top > HEADER && top < window.innerHeight * .6) return;
    const y = window.scrollY + top - HEADER - 16;
    if (lenis) lenis.scrollTo(y); else window.scrollTo(0, y);
  }, [step, lenis]);

  // The form window grows out of the card, and the page behind holds still while it is open.
  useEffect(() => {
    const el = dialog.current;
    const panel = el?.firstElementChild as HTMLElement | null;
    if (!formOpen || !el || !panel) return;
    if (!el.open) el.showModal();
    formHeading.current?.focus({ preventScroll: true });
    el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: calm() ? 200 : 400, easing: 'ease-out' });
    const from = card.current?.getBoundingClientRect();
    const to = panel.getBoundingClientRect();
    if (from && !calm()) panel.animate([
      { transformOrigin: '0 0', transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`, opacity: 0 },
      { opacity: 1, offset: .3 },
      { transformOrigin: '0 0', transform: 'none', opacity: 1 },
    ], { duration: 650, easing: 'cubic-bezier(.2, .8, .2, 1)' });
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = 'hidden';
    lenis?.stop();
    return () => { root.style.overflow = overflow; lenis?.start(); };
  }, [formOpen, lenis]);

  // Closing fades the window out. Answers and anything typed in the form stay until the page reloads.
  const closeForm = (then?: () => void) => {
    const el = dialog.current;
    if (!el?.open) return;
    const done = () => {
      el.close();
      el.getAnimations({ subtree: true }).forEach(a => a.cancel());
      setFormOpen(false);
      if (then) then(); else reopen.current?.focus({ preventScroll: true });
    };
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: calm() ? 150 : 250, easing: 'ease-in', fill: 'forwards' }).onfinish = done;
    if (!calm()) el.firstElementChild?.animate([{ transform: 'none' }, { transform: 'translateY(20px) scale(.97)' }], { duration: 250, easing: 'ease-in', fill: 'forwards' });
  };

  const go = (next: number) => { moved.current = true; setNudge(''); setStep(next); };
  const pickBusiness = (id: BusinessId) => {
    setAnswers(a => ({ ...a, business: id, tasks: a.business === id ? a.tasks : [] }));
    saveSegment(id === 'other' ? null : id);
    // "Another type of business" opens an optional box to name it, and Continue moves on.
    if (id !== 'other') go(1);
  };
  const toggleTask = (task: string) => {
    setNudge('');
    setAnswers(a => ({ ...a, tasks: a.tasks.includes(task) ? a.tasks.filter(t => t !== task) : [...a.tasks, task] }));
  };
  const typeOther = (other: string) => { setNudge(''); setAnswers(a => ({ ...a, other })); };
  const otherChosen = answers.tasks.includes(otherTask);

  // Questions 3 and 4 are one-tap choices from a list. The last answer opens the form window.
  const pickOption = (value: string) => {
    setAnswers(a => step === 2 ? { ...a, hours: value } : { ...a, start: value });
    if (step < QUESTIONS - 1) return go(step + 1);
    setStep(QUESTIONS);
    setFormOpen(true);
  };
  const continueTasks = () => {
    if (!answers.tasks.length) setNudge('Choose at least one to continue.');
    else if (otherChosen && !answers.other?.trim()) setNudge('Tell us what else you need help with.');
    else go(2);
  };
  const question = questions[step];
  const listOptions = step === 2 ? hoursOptions : startOptions;
  const chosen = step === 2 ? answers.hours : answers.start;

  return <section ref={card} className={className ? `${styles.card} ${className}` : styles.card} aria-labelledby="funnel-title">
    <p className={styles.kicker}>Free 30-minute call</p>
    <h2 id="funnel-title" className={styles.title}>All we need is 2 weeks to find your Expert.</h2>
    <p className={styles.intro}>Answer {QUESTIONS} quick questions, then request your free call.</p>
    <div className={styles.progress} aria-hidden="true"><span style={{ width: `${(step + 1) / (QUESTIONS + 1) * 100}%` }}/></div>
    <div className={styles.step} key={step}>
      {question ? <>
        <p className={styles.count}>Question {step + 1} of {QUESTIONS}</p>
        <h3 ref={heading} tabIndex={-1} id="funnel-question" className={styles.question}>{question.title}</h3>
        {question.hint && <p className={styles.hint} id="funnel-hint">{question.hint}</p>}
        {step === 0 && <div className={styles.options} role="group" aria-labelledby="funnel-question">
          {businessOptions.map(option => <button key={option.id} type="button" className={styles.option} aria-pressed={option.id === answers.business} onClick={() => pickBusiness(option.id)}>
            <span>{option.label}</span><span className={styles.arrow} aria-hidden="true">→</span>
          </button>)}
        </div>}
        {step === 0 && answers.business === 'other' && <>
          <label className={styles.other}>
            <span>What kind of business? <span className={styles.optional}>(optional)</span></span>
            {/* Opens ready to type; Enter continues like the button, with or without an answer. */}
            <input type="text" value={answers.otherBusiness ?? ''} maxLength={60} placeholder="e.g. dental office, law firm" autoFocus onChange={e => setAnswers(a => ({ ...a, otherBusiness: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') go(1); }}/>
          </label>
          <div className={styles.nav}><button type="button" className={styles.next} onClick={() => go(1)}>Continue</button></div>
        </>}
        {step === 1 && <>
          <div className={styles.chips} role="group" aria-labelledby="funnel-question" aria-describedby="funnel-hint">
            {tasksFor(answers.business).map(task => <button key={task} type="button" className={styles.chip} aria-pressed={answers.tasks.includes(task)} onClick={() => toggleTask(task)}>
              <span className={styles.check} aria-hidden="true"/>{task}
            </button>)}
          </div>
          {otherChosen && <label className={styles.other}>
            <span>What else do you need help with?</span>
            {/* Opens ready to type right after "Other" is ticked; Enter continues like the button. */}
            <input type="text" value={answers.other ?? ''} maxLength={120} placeholder="Tell us in a few words" autoFocus onChange={e => typeOther(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') continueTasks(); }}/>
          </label>}
          <p className={styles.nudge} aria-live="polite">{nudge}</p>
        </>}
        {step > 1 && <div className={styles.options} role="group" aria-labelledby="funnel-question" aria-describedby="funnel-hint">
          {listOptions.map(option => <button key={option} type="button" className={styles.option} aria-pressed={option === chosen} onClick={() => pickOption(option)}>
            <span>{option}</span><span className={styles.arrow} aria-hidden="true">→</span>
          </button>)}
        </div>}
        {step > 0 && <div className={styles.nav}>
          <button type="button" className={styles.back} onClick={() => go(step - 1)}><span aria-hidden="true">←</span> Back</button>
          {step === 1 && <button type="button" className={styles.next} onClick={continueTasks}>Continue</button>}
        </div>}
        <p className={styles.footnote}>We send you the best candidates. You choose your Expert.</p>
      </> : <>
        {/* Shown behind the form window, and after it closes. */}
        <p className={styles.count}>Last step</p>
        <h3 ref={heading} tabIndex={-1} className={styles.question}>Your answers are ready.</h3>
        <p className={styles.hint}>Add your details to request your free call.</p>
        <div className={styles.nav}>
          <button type="button" className={styles.back} onClick={() => go(0)}>Change answers</button>
          <button ref={reopen} type="button" className={styles.next} onClick={() => setFormOpen(true)}>Request your free call</button>
        </div>
      </>}
    </div>
    {step === QUESTIONS && <dialog ref={dialog} className={styles.modal} aria-labelledby="funnel-form-title" data-lenis-prevent onCancel={e => { e.preventDefault(); closeForm(); }}>
      <div className={styles.panel}>
        <button type="button" className={styles.close} aria-label="Close" onClick={() => closeForm()}><span aria-hidden="true">×</span></button>
        <div className={styles.aside}>
          <p className={styles.asideKicker}>Last step</p>
          <h3 ref={formHeading} tabIndex={-1} id="funnel-form-title" className={styles.formTitle}>Request your free call.</h3>
          <p className={styles.asideHint}>Add your details and our team will reach out to set up a time.</p>
          <dl className={styles.summary}>
            <div><dt>Business</dt><dd>{businessText(answers)}</dd></div>
            <div><dt>Help with</dt><dd>{tasksText(answers)}</dd></div>
            <div><dt>Hours</dt><dd>{answers.hours}</dd></div>
            <div><dt>Start</dt><dd>{answers.start}</dd></div>
          </dl>
          <button type="button" className={styles.change} onClick={() => closeForm(() => go(0))}>Change answers</button>
          <p className={styles.asideNote}>We send you the best candidates. You choose your Expert.</p>
        </div>
        <div className={styles.formArea}><InquiryForm prefill={prefillFor(answers, source)}/></div>
      </div>
    </dialog>}
  </section>;
}

function calm() { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
