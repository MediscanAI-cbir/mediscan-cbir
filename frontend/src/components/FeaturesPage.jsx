import { useContext } from "react";
import { LangContext } from "../context/lang-context";

export default function FeaturesPage() {
  const { t } = useContext(LangContext);
  const content = t.features;

  return (
    <div className="bg-bg transition-colors duration-300">
      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h1 className="text-5xl font-bold text-text mb-4">{content.headline}</h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            {content.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {content.items.map((feature, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-8 hover:shadow-lg transition-all backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-text mb-3">{feature.title}</h3>
              <p className="text-muted mb-4">{feature.desc}</p>
              <ul className="space-y-2">
                {feature.features.map((f) => (
                  <li key={f} className="text-sm text-text flex gap-2 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
