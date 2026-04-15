import { useContext, useState, useEffect, useRef } from "react";
import { LangContext } from "../context/LangContext";
import LanguageSelector from "./LanguageSelector";

export default function Navigation({
  currentPage,
  onPageChange,
  visible = true,
  tone = "default",
}) {
  const { t } = useContext(LangContext);
  const [scrollHidden, setScrollHidden] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeBoxStyle, setActiveBoxStyle] = useState({ width: 0, x: 0, opacity: 0 });
  
  const lastY = useRef(0);
  const turnY = useRef(0);
  const goingDown = useRef(true);
  const shellRef = useRef(null);
  const tabRefs = useRef({});

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
  }, [isMenuOpen]);

  const handlePageChange = (id) => {
    setIsMenuOpen(false); 
    onPageChange(id);
  };

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setIsScrolled(y > 10);
      if (isMenuOpen || window.innerWidth < 768) {
        setScrollHidden(false);
        return;
      }
      const down = y > lastY.current;
      if (down !== goingDown.current) {
        turnY.current = lastY.current;
        goingDown.current = down;
      }
      if (down && y > 300) setScrollHidden(true);
      if (!down && turnY.current - y > 60) setScrollHidden(false);
      if (y <= 10) setScrollHidden(false);
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMenuOpen]);

useEffect(() => {
  function updateActiveBox() {
    const shell = shellRef.current;
    const activeTab = tabRefs.current[currentPage];
    
    if (!shell || !activeTab) {
      setActiveBoxStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const offset = activeTab.getBoundingClientRect().left - shell.getBoundingClientRect().left;

    setActiveBoxStyle({
      width: activeTab.offsetWidth,
      x: offset,
      opacity: 1,
    });
  }

  updateActiveBox();

  const timer = setTimeout(updateActiveBox, 100);

  window.addEventListener("resize", updateActiveBox);
  return () => {
    window.removeEventListener("resize", updateActiveBox);
    clearTimeout(timer);
  };
}, [currentPage, t.nav]); 

  const show = visible && !scrollHidden;

  const shellToneClass =
    tone === "primary"
      ? "nav-shell nav-shell-primary"
      : tone === "accent"
        ? "nav-shell nav-shell-accent"
        : "nav-shell nav-shell-default";

  const mainTabs = [
    { id: "home", label: t.nav.home },
    { id: "search", label: t.nav.scan },
    { id: "how", label: t.nav.features },
    { id: "contact", label: t.nav.contact },
    { id: "about", label: t.nav.aboutUs },
  ];

  return (
    <>
      <nav
        className="sticky top-0 z-[9999] w-full transition-all duration-300"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(-100%)",
          backgroundColor: (isScrolled || isMenuOpen) ? "var(--palette-bg)" : "transparent",
          borderBottom: (isScrolled || isMenuOpen) ? "1px solid var(--palette-border)" : "1px solid transparent",
        }}
      >
        <div className="relative z-[1200] w-full px-6">
          <div className="flex h-16 items-center justify-between md:grid md:h-20 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-4 lg:px-8">
            
            <button onClick={() => handlePageChange("home")} className="z-[1300] outline-none">
              <img src="/Logo-2.svg" alt="LOGO" className="h-8 md:h-10 w-auto object-contain" />
            </button>

            <div ref={shellRef} className={`hidden md:flex nav-shell-track justify-self-center items-center gap-[0.5vw] overflow-hidden rounded-2xl px-[1vw] py-1.5 ${shellToneClass}`}>
              <div 
                aria-hidden="true" 
                className="nav-active-indicator" 
                style={{ 
                  position: 'absolute',
                  left: 0, 
                  width: `${activeBoxStyle.width}px`, 
                  transform: `translateX(${activeBoxStyle.x}px)`, 
                }} 
              />
              {mainTabs.map((tab) => (
                <button key={tab.id} ref={(node) => { tabRefs.current[tab.id] = node; }} onClick={() => handlePageChange(tab.id)} className={`nav-tab relative z-10 px-5 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap ${currentPage === tab.id ? "nav-tab-active" : "nav-tab-inactive"}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 z-[1300]">
              <div className="hidden md:block scale-90 origin-right">
                <LanguageSelector />
              </div>

              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="md:hidden flex flex-col justify-center items-center w-6 h-6 relative outline-none"
              >
                <span className="block h-[1.5px] absolute transition-all duration-300" 
                  style={{ width: '20px', backgroundColor: "var(--palette-text)", transform: isMenuOpen ? 'rotate(45deg)' : 'translateY(-6px)' }} />
                <span className="block h-[1.5px] transition-all duration-300" 
                  style={{ width: '20px', backgroundColor: "var(--palette-text)", opacity: isMenuOpen ? 0 : 1 }} />
                <span className="block h-[1.5px] absolute transition-all duration-300" 
                  style={{ width: '20px', backgroundColor: "var(--palette-text)", transform: isMenuOpen ? 'rotate(-45deg)' : 'translateY(6px)' }} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`md:hidden fixed inset-0 z-[9998] transition-all duration-300 ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        style={{ backgroundColor: "var(--palette-bg)" }}
      >
        <div className="flex flex-col pt-20 px-6 h-full pb-10">

          {mainTabs.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => handlePageChange(tab.id)}
              className="text-left text-[1.3rem] font-medium tracking-tight py-4 transition-opacity active:opacity-40"
              style={{
                color: "var(--palette-text)",
                borderBottom: i < mainTabs.length - 1 ? "1px solid var(--palette-border)" : "none",
              }}
            >
              {tab.label}
            </button>
          ))}

          <div
            className="flex items-center justify-between mt-8 pt-5"
            style={{ borderTop: "1px solid var(--palette-border)" }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--palette-muted)" }}>
              {t.nav.settings || "Settings"}
            </span>
            <LanguageSelector />
          </div>

        </div>
      </div>
    </>
  );
}