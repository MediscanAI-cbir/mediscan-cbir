// src/components/AboutPage.jsx
import { useContext } from "react";
import { LangContext } from "../context/lang-context";

export default function AboutPage({ onPageChange }) {
  const { t } = useContext(LangContext);
  const content = t.about; // tu devras ajouter les textes en i18n

  return (
    <div className="bg-bg transition-colors duration-300 min-h-screen px-6 md:px-22 py-16">
      {/* Hero / Header */}
      <section className="max-w-[1200px] mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-text mb-4">
          {content.headline}
        </h1>
        <p className="text-muted max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
          {content.description}
        </p>
      </section>

      {/* Team / Mission */}
      <section className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-3xl font-bold text-text mb-4">{content.mission.title}</h2>
          <p className="text-muted leading-relaxed">{content.mission.text}</p>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-text mb-4">{content.vision.title}</h2>
          <p className="text-muted leading-relaxed">{content.vision.text}</p>
        </div>
      </section>

      {/* Team Members */}
      <section className="max-w-[1200px] mx-auto mb-16">
        <h2 className="text-3xl font-bold text-text text-center mb-12">{content.team.title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {content.team.members.map((member, idx) => (
            <div
              key={idx}
              className="bg-surface rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-lg transition-all"
            >
              <img
                src={member.photo}
                alt={member.name}
                className="w-24 h-24 rounded-full mb-4 object-cover"
              />
              <h3 className="font-bold text-text mb-1">{member.name}</h3>
              <p className="text-sm text-muted">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA / Contact */}
      <section className="max-w-[800px] mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-text mb-4">{content.cta.title}</h2>
        <p className="text-muted mb-6">{content.cta.description}</p>
        <button
          onClick={() => onPageChange("contact")}
          className="px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm cursor-pointer"
        >
          {content.cta.buttonText}
        </button>
      </section>
    </div>
  );
}