"use client";

import { useEffect, useRef, useState } from 'react';
import InquiryForm from './InquiryForm';
import { useLenis } from './SmoothScroll';
import { saveSegment } from '@/content/segments';
import { businessOptions, helpMeChoose, hoursOptions, prefillFor, startOptions, tasksFor, type BusinessId, type FunnelAnswers } from '@/content/funnel';
import styles from './HomeFunnel.module.css';

// The homepage funnel: four quick questions, then the GHL inquiry form with the answers attached
// as hidden fields. The business type also tailors the rest of the homepage, like the old picker did.
const questions = [
  { title: 'What kind of business do you run?' },
  { title: 'What would you like help with?', hint: 'Choose all that apply.' },
  { title: 'How much help do you need?', hint: 'Your Expert works your business hours, in your time zone.' },
  { title: 'When would you like to start?', hint: 'Hiring usually takes 5–10 business days.' },
];
const QUESTIONS = questions.length;
// Below the fixed site header.
const HEADER = 112;

export default function HomeFunnel({ className }: { className?: string }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<FunnelAnswers>({ tasks: [] });
  const [nudge, setNudge] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
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

  const go = (next: number) => { moved.current = true; setNudge(false); setStep(next); };
  const pickBusiness = (id: BusinessId) => {
    setAnswers(a => ({ ...a, business: id, tasks: a.business === id ? a.tasks : [] }));
    saveSegment(id === 'other' ? null : id);
    go(1);
  };
  const toggleTask = (task: string) => {
    setNudge(false);
    setAnswers(a => ({ ...a, tasks: a.tasks.includes(task) ? a.tasks.filter(t => t !== task) : [...a.tasks, task] }));
  };
  const business = businessOptions.find(b => b.id === answers.business);

  // Questions 3 and 4 are one-tap choices from a list.
  const pickOption = (value: string) => {
    setAnswers(a => step === 2 ? { ...a, hours: value } : { ...a, start: value });
    go(step + 1);
  };
  const continueTasks = () => { if (answers.tasks.length) go(2); else setNudge(true); };
  const question = questions[step];
  const listOptions = step === 2 ? hoursOptions : startOptions;
  const chosen = step === 2 ? answers.hours : answers.start;

  return <section className={className ? `${styles.card} ${className}` : styles.card} aria-labelledby="funnel-title">
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
        {step === 1 && <>
          <div className={styles.chips} role="group" aria-labelledby="funnel-question" aria-describedby="funnel-hint">
            {tasksFor(answers.business).map(task => <button key={task} type="button" className={styles.chip} aria-pressed={answers.tasks.includes(task)} onClick={() => toggleTask(task)}>
              <span className={styles.check} aria-hidden="true"/>{task}
            </button>)}
          </div>
          <p className={styles.nudge} aria-live="polite">{nudge ? `Choose at least one, or ${helpMeChoose}.` : ''}</p>
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
        <p className={styles.footnote}>You interview the candidates and choose your Expert.</p>
      </> : <>
        <p className={styles.count}>Last step</p>
        <h3 ref={heading} tabIndex={-1} className={styles.question}>Request your free call.</h3>
        <p className={styles.hint}>Add your details and our team will reach out to set up a time.</p>
        <div className={styles.summary}>
          <dl>
            <div><dt>Business</dt><dd>{business?.label}</dd></div>
            <div><dt>Help with</dt><dd>{answers.tasks.join(', ')}</dd></div>
            <div><dt>Hours</dt><dd>{answers.hours}</dd></div>
            <div><dt>Start</dt><dd>{answers.start}</dd></div>
          </dl>
          <button type="button" className={styles.back} onClick={() => go(0)}>Change answers</button>
        </div>
        <div className={styles.form}><InquiryForm prefill={prefillFor(answers)}/></div>
      </>}
    </div>
  </section>;
}
