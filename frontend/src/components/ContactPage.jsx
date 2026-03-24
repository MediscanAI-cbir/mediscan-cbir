import { BadgeEuro, Info, Mail } from "lucide-react";
import { useState, useContext } from "react";
import { LangContext } from "../context/lang-context";

export default function ContactPage() {
  const { t } = useContext(LangContext);
  const content = t.contact;
  const [form, setForm] = useState({ name: "", email: "", org: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", form);
    alert("Thank you! We'll get back to you soon.");
    setForm({ name: "", email: "", org: "", message: "" });
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="font-bold text-text mb-2 flex items-center gap-2">
                <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg">
                  <Mail className="w-5 h-5" strokeWidth={1.8} />
                </span>
                {content.email}
              </h3>
              <p className="text-muted ml-12">
                <a href={`mailto:${content.emailAddr}`} className="text-primary hover:underline">
                  {content.emailAddr}
                </a>
              </p>
            </div>

            <div>
              <h3 className="font-bold text-text mb-2 flex items-center gap-2">
                <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg">
                  <BadgeEuro className="w-5 h-5" strokeWidth={1.8} />
                </span>
                {content.sales}
              </h3>
              <p className="text-muted ml-12">
                <a href={`mailto:${content.salesAddr}`} className="text-primary hover:underline">
                  {content.salesAddr}
                </a>
              </p>
            </div>

            <div>
              <h3 className="font-bold text-text mb-2 flex items-center gap-2">
                <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg">
                  <Info className="w-5 h-5" strokeWidth={1.8} />
                </span>
                {content.support}
              </h3>
              <p className="text-muted ml-12">
                <a href={`mailto:${content.supportAddr}`} className="text-primary hover:underline">
                  {content.supportAddr}
                </a>
              </p>
            </div>

            <div className="pt-8 border-t border-border">
              <h3 className="font-bold text-text mb-4">{content.responses}</h3>
              <div className="space-y-3">
                {[content.resp1, content.resp2, content.resp3].map((item) => (
                  <p key={item} className="text-sm text-muted flex gap-2 items-start">
                    <span className="text-primary">✓</span>
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-8 space-y-5 shadow-sm backdrop-blur-sm">
            <div>
              <label className="block text-sm font-medium text-text mb-2">{content.formName}</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-border bg-bg-soft text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                placeholder={content.formPlaceholder1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">{content.formEmail}</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-border bg-bg-soft text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                placeholder={content.formPlaceholder2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">{content.formOrg}</label>
              <input
                type="text"
                name="org"
                value={form.org}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-border bg-bg-soft text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                placeholder={content.formPlaceholder3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">{content.formMessage}</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-border bg-bg-soft text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-colors"
                placeholder={content.formPlaceholder4}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              {content.formSubmit}
            </button>

            <p className="text-xs text-muted text-center">
              {content.formPrivacy}
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
