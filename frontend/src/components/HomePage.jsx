import {
  BetweenHorizontalStart,
  Blocks,
  Brain,
  HardDrive,
  Hospital,
  Microscope,
  Route,
  Search,
  Stethoscope,
  UserKey,
} from "lucide-react";
import { useContext } from "react";
import { LangContext } from "../context/lang-context";

const benefitIcons = {
  route: Route,
  "between-horizontal-start": BetweenHorizontalStart,
  brain: Brain,
  "user-key": UserKey,
  "hard-drive": HardDrive,
  blocks: Blocks,
};

const useCaseIcons = {
  stethoscope: Stethoscope,
  microscope: Microscope,
  hospital: Hospital,
  search: Search,
};

function BenefitCard({ icon, title, description }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
      <div className="w-12 h-12 rounded-xl bg-primary-pale text-primary flex items-center justify-center mb-4 text-xl">
        {icon}
      </div>
      <h3 className="font-bold text-text mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </div>
  );
}

function UseCaseCard({ title, description, icon }) {
  return (
    <div className="bg-gradient-to-br from-primary-pale to-surface border border-primary/20 rounded-2xl p-6">
      <div className="text-3xl mb-3">{icon}</div>
      <h4 className="font-bold text-text mb-2">{title}</h4>
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}

export default function HomePage() {
  const { t } = useContext(LangContext);
  const content = t.home;

  return (
    <div className="bg-bg transition-colors duration-300">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-bg-soft via-primary-pale to-accent-pale pt-24 pb-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full bg-surface border border-border shadow-sm backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-xs font-semibold text-muted">{content.badge}</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold text-text mb-5 leading-tight">
                {content.headline}
              </h1>

              <p className="text-lg text-muted mb-8 leading-relaxed">
                {content.description}
              </p>

              <div className="flex gap-4 flex-wrap">
                <button className="px-7 py-3 rounded-lg bg-primary text-white font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  {content.cta1}
                </button>
                <button className="px-7 py-3 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary-pale transition-all">
                  {content.cta2}
                </button>
              </div>

              <p className="text-xs text-muted mt-8">
                ✓ {content.trust}
              </p>
            </div>

            {/* Right - Visual */}
            <div className="relative flex justify-center md:justify-end">
              <div className="absolute inset-6 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-[40px] blur-3xl" />
              <div className="hero-frame relative w-full max-w-[760px]">
                <img
                  src="/HomePres.jpg"
                  alt="MEDISCAN AI interface preview"
                  className="hero-preview w-full object-contain select-none"
                  draggable="false"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Metrics */}
      <section className="max-w-[1400px] mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { number: content.stats.value1, label: content.stats.title1 },
          { number: content.stats.value2, label: content.stats.title2 },
          { number: content.stats.value3, label: content.stats.title3 },
          { number: content.stats.value4, label: content.stats.title4 },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-primary">{stat.number}</p>
            <p className="text-xs text-muted mt-2">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Key Benefits */}
      <section className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-text mb-3">{content.whyChoose.headline}</h2>
          <p className="text-muted max-w-2xl mx-auto">
            {content.whyChoose.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.whyChoose.features.map((feature, i) => {
            const BenefitIcon = benefitIcons[feature.icon];

            return (
              <BenefitCard
                key={i}
                icon={BenefitIcon ? <BenefitIcon className="w-5 h-5" strokeWidth={1.8} /> : null}
                title={feature.title}
                description={feature.desc}
              />
            );
          })}
        </div>
      </section>

      {/* Use Cases */}
      <section className="max-w-[1400px] mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-text text-center mb-14">{content.useCases.headline}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {content.useCases.roles.map((role, i) => {
            const UseCaseIcon = useCaseIcons[role.icon];

            return (
              <UseCaseCard
                key={i}
                icon={UseCaseIcon ? <UseCaseIcon className="w-8 h-8 text-primary" strokeWidth={1.8} /> : null}
                title={role.title}
                description={role.desc}
              />
            );
          })}
        </div>
      </section>

      {/* Two Search Modes */}
      <section className="bg-bg-soft py-20 transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="text-4xl font-bold text-text text-center mb-3">{content.modes.headline}</h2>
          <p className="text-muted text-center mb-14 max-w-2xl mx-auto">
            {content.modes.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: content.modes.visual.title,
                desc: content.modes.visual.desc,
                use: content.modes.visual.use,
                color: "primary",
              },
              {
                name: content.modes.semantic.title,
                desc: content.modes.semantic.desc,
                use: content.modes.semantic.use,
                color: "accent",
              },
            ].map((mode) => {
              const isBg = mode.color === "primary" ? "from-primary-pale to-surface border-primary/20" : "from-accent-pale to-surface border-accent/20";
              const badge = mode.color === "primary" ? "bg-primary text-white" : "bg-accent text-white";
              return (
                <div key={mode.name} className={`bg-gradient-to-br ${isBg} border rounded-2xl p-8`}>
                  <p className={`text-xs font-bold uppercase tracking-wider ${badge} inline-block px-3 py-1 rounded-full mb-4`}>
                    {mode.name}
                  </p>
                  <h3 className="text-2xl font-bold text-text mb-2">{mode.name}</h3>
                  <p className="text-sm text-muted mb-4">{mode.desc}</p>
                  <p className="text-xs font-semibold text-muted mb-4">{mode.use}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-footer text-white py-12 transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-3">MediScan AI</h4>
              <p className="text-sm text-footer-muted">{content.footer.tagline}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-footer-muted">{content.footer.compliance}</p>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-footer-muted">
            <p>© 2024 MediScan AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
