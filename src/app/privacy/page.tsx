import type { Metadata } from "next";
import { SceneStages } from "@/components/Scene";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = { title: "Privacy policy" };

// Legal text carried over from the live site. Wording kept close to the original on purpose.
const sections = [
  {
    h: "Who we are",
    p: [
      'Global Virtual Experts ("we," "our," or "us") is committed to protecting the privacy and security of your personal information. This policy explains what we collect, how we use and protect it, and the choices you have.',
      "By using www.globalvirtualexperts.com (the \"Website\"), you consent to the practices described here.",
    ],
  },
  {
    h: "Information we collect",
    p: ["We may collect names, email addresses, phone numbers, mailing addresses, IP addresses and other data you give us through forms or other interactions with the Website."],
  },
  {
    h: "How we collect it",
    p: ["When you submit a form, sign up for our services, contact us, or use Website features that ask for personal information."],
  },
  {
    h: "How we use it",
    list: [
      "Providing and improving our services",
      "Communicating with you about your account or inquiries",
      "Sending updates, newsletters and promotional materials",
      "Analyzing and improving the Website experience",
      "Responding to legal obligations or requests from authorities",
    ],
  },
  {
    h: "Data security",
    p: ["We use appropriate measures, including encryption, access controls and regular security assessments, to protect your information from unauthorized access, alteration, disclosure or destruction."],
  },
  {
    h: "Third-party sharing",
    p: [
      "We do not sell, trade or otherwise transfer your personal information to third parties without your consent, except trusted third parties who help us run the Website and our business and agree to keep it confidential.",
      "No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.",
    ],
  },
  {
    h: "Cookies",
    p: ["We may use cookies and similar technologies to collect information about how you use the Website. You can manage cookies in your browser settings."],
  },
  {
    h: "Your rights",
    p: ["You can access, update or delete your personal information, and object to or restrict how we process it. Contact us using the details below."],
  },
  {
    h: "Children",
    p: ["Our services are not directed to children under 13, and we do not knowingly collect their information. If you believe we have, contact us right away."],
  },
  {
    h: "Changes",
    p: ['We may update this policy. The "Last updated" date shows the latest version.'],
  },
  {
    h: "Contact",
    p: ["Global Virtual Experts · info@globalvirtualexperts.com · (206) 455-8605 · Seattle, Washington, USA"],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SceneStages stages={[{ shape: "sphere", x: 3, scale: 0.8, dim: 0.4 }]} />
      <PageHero eyebrow="Last updated: September 1, 2023" title="Privacy policy." accent={["policy."]} />
      <section className="px-4 pb-32 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-10">
          {sections.map((s) => (
            <div key={s.h} className="card p-7">
              <h2 className="text-xl font-medium">{s.h}</h2>
              {s.p?.map((t) => (
                <p key={t} className="mt-3 text-muted">
                  {t}
                </p>
              ))}
              {s.list && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-muted">
                  {s.list.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
