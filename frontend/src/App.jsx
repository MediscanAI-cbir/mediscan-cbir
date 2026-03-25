import { useState, useEffect, useRef, useContext } from "react";
import { LangProvider } from "./context/LangContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LangContext } from "./context/lang-context";
import Navigation from "./components/Navigation";
import HomePage from "./components/HomePage";
import SearchPage from "./components/SearchPage";
import FeaturesPage from "./components/FeaturesPage";
import ContactPage from "./components/ContactPage";
import HowItWorks from "./components/HowItWorks";
import FAQPage from "./components/FAQPage";
import Footer from './components/Footer';
import AboutPage from "./components/AboutPage";

const pages = {
  home: HomePage,
  search: SearchPage,
  features: FeaturesPage,
  contact: ContactPage,
  how: HowItWorks,
  faq: FAQPage,
  about : AboutPage
};

function AppInner() {
  const { langVisible } = useContext(LangContext);
  const [currentPage, setCurrentPage] = useState("home");
  const [pageVisible, setPageVisible] = useState(true);
  const [displayPage, setDisplayPage] = useState("home");
  const timeoutRef = useRef(null);

  function handlePageChange(page) {
    if (page === currentPage) return;
    setCurrentPage(page);
    setPageVisible(false);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDisplayPage(page);
      window.scrollTo({ top: 0, behavior: "instant" });
      setPageVisible(true);
    }, 180);
  }

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const PageComponent = pages[displayPage] || HomePage;

  // Combine page transition + language transition
  const opacity = pageVisible && langVisible ? 1 : 0;
  const translateY = pageVisible ? "0px" : "6px";

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300">
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
      <main className="pt-0"
        style={{
          opacity,
          transform: `translateY(${translateY})`,
          transition: "opacity 160ms ease, transform 160ms ease",
        }}
      >
        <PageComponent onPageChange={handlePageChange} />
      </main>
      <Footer onPageChange={handlePageChange} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <AppInner />
      </LangProvider>
    </ThemeProvider>
  );
}
