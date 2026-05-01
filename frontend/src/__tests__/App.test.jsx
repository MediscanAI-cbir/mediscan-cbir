/**
 * @fileoverview Application integration tests for route changes, providers, and page composition.
 *
 * These tests keep the real App state machine under test while replacing heavy
 * page components with focused doubles. They verify routing, search subviews,
 * page transitions, body-scroll cleanup, and idle preloading without depending
 * on every child page's full DOM.
 * @module tests/AppTest
 */

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "../App";

vi.mock("../components/Navigation", () => ({
  default: function MockNavigation({
    currentPage,
    onPageChange,
    visible,
    tone,
    onMobileMenuOpenChange,
  }) {
    return (
      <nav data-testid="mock-nav">
        <span>{`page=${currentPage}`}</span>
        <span>{`visible=${visible}`}</span>
        <span>{`tone=${tone}`}</span>
        <button type="button" onClick={() => onPageChange("home")}>nav-home</button>
        <button type="button" onClick={() => onPageChange("search")}>nav-search</button>
        <button type="button" onClick={() => onPageChange("contact")}>nav-contact</button>
        <button type="button" onClick={() => onPageChange("how")}>nav-how</button>
        <button type="button" onClick={() => onPageChange("faq")}>nav-faq</button>
        <button type="button" onClick={() => onPageChange("about")}>nav-about</button>
        <button type="button" onClick={() => onPageChange("privacy")}>nav-privacy</button>
        <button type="button" onClick={() => onPageChange("legal")}>nav-legal</button>
        <button type="button" onClick={() => onPageChange("missing")}>nav-invalid</button>
        <button type="button" onClick={() => onMobileMenuOpenChange?.(true)}>menu-open</button>
        <button type="button" onClick={() => onMobileMenuOpenChange?.(false)}>menu-close</button>
      </nav>
    );
  },
}));

vi.mock("../components/HomePage", () => ({
  default: function MockHomePage({ onPageChange }) {
    return (
      <section data-testid="page-home">
        <button type="button" onClick={() => onPageChange("search")}>home-search</button>
      </section>
    );
  },
}));

vi.mock("../components/SearchPage", () => ({
  default: function MockSearchPage({ view, onSearchViewChange, onSearchToneChange }) {
    return (
      <section data-testid="page-search">
        <span>{`view=${view}`}</span>
        <button type="button" onClick={() => onSearchViewChange("image")}>choose-image</button>
        <button type="button" onClick={() => onSearchViewChange("text")}>choose-text</button>
        <button type="button" onClick={() => onSearchViewChange("invalid")}>choose-invalid</button>
        <button type="button" onClick={() => onSearchToneChange("accent")}>tone-accent</button>
      </section>
    );
  },
}));

vi.mock("../components/ContactPage", () => ({
  default: function MockContactPage({ onPageChange }) {
    return (
      <section data-testid="page-contact">
        <button type="button" onClick={() => onPageChange("faq")}>contact-faq</button>
      </section>
    );
  },
}));

vi.mock("../components/HowItWorks", () => ({
  default: function MockHowItWorks() {
    return <section data-testid="page-how" />;
  },
}));

vi.mock("../components/FAQPage", () => ({
  default: function MockFAQPage() {
    return <section data-testid="page-faq" />;
  },
}));

vi.mock("../components/AboutPage", () => ({
  default: function MockAboutPage() {
    return <section data-testid="page-about" />;
  },
}));

vi.mock("../components/PrivacyPage", () => ({
  default: function MockPrivacyPage() {
    return <section data-testid="page-privacy" />;
  },
}));

vi.mock("../components/LegalPage", () => ({
  default: function MockLegalPage() {
    return <section data-testid="page-legal" />;
  },
}));

vi.mock("../components/Footer", () => ({
  default: function MockFooter({ onPageChange }) {
    return (
      <footer className="bg-footer" data-testid="mock-footer">
        <button type="button" onClick={() => onPageChange("contact")}>footer-contact</button>
      </footer>
    );
  },
}));

vi.mock("../components/Spinner", () => ({
  default: function MockSpinner({ label }) {
    return <div role="status">{label}</div>;
  },
}));

async function advanceTimers(ms) {
  await act(async () => {
    await new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  });
}

async function finishPageTransition() {
  await advanceTimers(240);
  await advanceTimers(0);
}

function mockMobileViewport() {
  window.matchMedia = vi.fn((query) => ({
    matches: query === "(max-width: 767px)",
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function mockMobileChromeColors(colors) {
  const realGetComputedStyle = window.getComputedStyle.bind(window);

  vi.spyOn(window, "getComputedStyle").mockImplementation((element) => {
    const style = realGetComputedStyle(element);

    return new Proxy(style, {
      get(target, property) {
        if (property === "backgroundColor") {
          if (
            element === document.documentElement ||
            element?.classList?.contains("mobile-viewport-edge-frame")
          ) {
            return colors.home;
          }

          if (element?.tagName === "FOOTER") {
            return colors.footer;
          }
        }

        if (property === "getPropertyValue") {
          return (customPropertyName) => {
            if (customPropertyName === "--route-edge-bg" && element?.classList?.contains("mobile-viewport-edge-frame")) {
              return colors.home;
            }

            return target.getPropertyValue(customPropertyName);
          };
        }

        const value = target[property];
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
  });
}

async function expectMobileChrome(color) {
  await waitFor(() => {
    expect(document.querySelector(".mobile-viewport-edge-frame")).not.toHaveAttribute("data-mobile-surface");
    expect(document.documentElement.dataset.mobileSurface).toBeUndefined();
    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute("content", color);
    expect(document.querySelector('meta[name="msapplication-navbutton-color"]')).toHaveAttribute("content", color);
  });
}

describe("App", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete window.requestIdleCallback;
    delete window.cancelIdleCallback;
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });

  it("normalizes routes and drives search subviews with page transitions", async () => {
    render(<App />);

    expect(screen.getByTestId("page-home")).toBeInTheDocument();
    expect(screen.getByTestId("mock-nav")).toHaveTextContent("visible=false");

    fireEvent.click(screen.getByText("nav-home"));
    expect(screen.getByTestId("page-home")).toBeInTheDocument();

    await advanceTimers(180);
    expect(screen.getByTestId("mock-nav")).toHaveTextContent("visible=true");

    fireEvent.click(screen.getByText("nav-search"));
    await finishPageTransition();

    expect(await screen.findByTestId("page-search")).toHaveTextContent("view=hub");
    expect(screen.queryByTestId("mock-footer")).not.toBeInTheDocument();
    expect(document.querySelector(".mobile-viewport-edge-frame")).toHaveAttribute("data-mobile-footer-edge", "false");

    fireEvent.click(screen.getByText("choose-image"));
    await finishPageTransition();
    expect(await screen.findByTestId("page-search")).toHaveTextContent("view=image");
    expect(screen.getByTestId("mock-nav")).toHaveTextContent("tone=primary");
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
    expect(document.querySelector(".mobile-viewport-edge-frame")).toHaveAttribute("data-mobile-footer-edge", "true");

    fireEvent.click(screen.getByText("choose-text"));
    await finishPageTransition();
    expect(await screen.findByTestId("page-search")).toHaveTextContent("view=text");
    expect(screen.getByTestId("mock-nav")).toHaveTextContent("tone=accent");
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
    expect(document.querySelector(".mobile-viewport-edge-frame")).toHaveAttribute("data-mobile-footer-edge", "true");

    fireEvent.click(screen.getByText("tone-accent"));
    fireEvent.click(screen.getByText("tone-accent"));
    await waitFor(() => expect(screen.getByTestId("mock-nav")).toHaveTextContent("tone=accent"));

    fireEvent.click(screen.getByText("choose-invalid"));
    await finishPageTransition();
    expect(await screen.findByTestId("page-search")).toHaveTextContent("view=hub");

    fireEvent.click(screen.getByText("nav-invalid"));
    await finishPageTransition();
    expect(await screen.findByTestId("page-home")).toBeInTheDocument();
  });

  it("handles static pages, body scroll lock cleanup and idle preloading", async () => {
    window.requestIdleCallback = vi.fn((callback) => {
      callback();
      return 42;
    });
    window.cancelIdleCallback = vi.fn();
    Object.defineProperty(window, "scrollY", { value: 64, configurable: true });

    const { unmount } = render(<App />);

    fireEvent.click(screen.getByText("footer-contact"));
    expect(document.body.style.position).toBe("fixed");
    await finishPageTransition();
    expect(await screen.findByTestId("page-contact")).toBeInTheDocument();
    expect(document.body.style.position).toBe("");

    fireEvent.click(screen.getByText("contact-faq"));
    await finishPageTransition();
    expect(await screen.findByTestId("page-faq")).toBeInTheDocument();

    fireEvent.click(screen.getByText("nav-about"));
    await finishPageTransition();
    expect(await screen.findByTestId("page-about")).toBeInTheDocument();

    unmount();
    expect(window.cancelIdleCallback).toHaveBeenCalledWith(42);
  });

  it("keeps the mobile top chrome on the home edge color across routes", async () => {
    const colors = {
      home: "rgb(230, 234, 239)",
      "search-hub": "rgb(230, 234, 239)",
      "search-primary": "#d8eaed",
      "search-accent": "#e1edef",
      "search-text": "#e1eef0",
      static: "rgb(230, 234, 239)",
      default: "rgb(248, 250, 252)",
      menu: "rgb(230, 234, 239)",
      footer: "rgb(15, 23, 42)",
    };
    localStorage.setItem("theme", "light");
    mockMobileViewport();
    mockMobileChromeColors(colors);

    render(<App />);

    await expectMobileChrome(colors.home);
    expect(document.querySelector(".mobile-viewport-edge-frame")).toHaveAttribute("data-mobile-footer-edge", "true");

    fireEvent.click(screen.getByText("nav-search"));
    await finishPageTransition();
    await expectMobileChrome(colors.home);
    expect(document.querySelector(".mobile-viewport-edge-frame")).toHaveAttribute("data-mobile-footer-edge", "false");

    fireEvent.click(screen.getByText("choose-image"));
    await finishPageTransition();
    await expectMobileChrome(colors.home);
    expect(document.querySelector(".mobile-viewport-edge-frame")).toHaveAttribute("data-mobile-footer-edge", "true");

    fireEvent.click(screen.getByText("tone-accent"));
    await expectMobileChrome(colors.home);

    fireEvent.click(screen.getByText("choose-text"));
    await finishPageTransition();
    await expectMobileChrome(colors.home);
    expect(document.querySelector(".mobile-viewport-edge-frame")).toHaveAttribute("data-mobile-footer-edge", "true");

    for (const page of ["contact", "about", "faq", "privacy", "legal"]) {
      fireEvent.click(screen.getByText(`nav-${page}`));
      await finishPageTransition();
      await expectMobileChrome(colors.home);
      expect(document.querySelector(".mobile-viewport-edge-frame")).toHaveAttribute("data-mobile-footer-edge", "true");
    }

    fireEvent.click(screen.getByText("nav-how"));
    await finishPageTransition();
    await expectMobileChrome(colors.home);
    expect(document.querySelector(".mobile-viewport-edge-frame")).toHaveAttribute("data-mobile-footer-edge", "true");
  });

  it("does not let the footer recolor the mobile top chrome", async () => {
    const colors = {
      home: "rgb(230, 234, 239)",
      "search-hub": "rgb(230, 234, 239)",
      "search-primary": "#d8eaed",
      "search-accent": "#e1edef",
      "search-text": "#e1eef0",
      static: "rgb(230, 234, 239)",
      default: "rgb(248, 250, 252)",
      menu: "rgb(230, 234, 239)",
      footer: "rgb(15, 23, 42)",
    };
    localStorage.setItem("theme", "light");
    mockMobileViewport();
    mockMobileChromeColors(colors);

    render(<App />);

    fireEvent.click(screen.getByText("nav-search"));
    await finishPageTransition();
    fireEvent.click(screen.getByText("choose-image"));
    await finishPageTransition();
    await expectMobileChrome(colors.home);

    const footer = screen.getByTestId("mock-footer");
    footer.getBoundingClientRect = vi.fn(() => ({
      top: 10,
      bottom: 120,
      left: 0,
      right: 320,
      width: 320,
      height: 110,
      x: 0,
      y: 10,
      toJSON: () => {},
    }));

    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("resize"));

    await waitFor(() => {
      expect(document.documentElement.dataset.mobileFooterVisible).toBeUndefined();
      expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute("content", colors.home);
      expect(document.querySelector('meta[name="msapplication-navbutton-color"]')).toHaveAttribute("content", colors.home);
    });
  });

  it("keeps the mobile menu chrome on the shared home edge color", async () => {
    const colors = {
      home: "rgb(230, 234, 239)",
      "search-hub": "rgb(230, 234, 239)",
      "search-primary": "#d8eaed",
      "search-accent": "#e1edef",
      "search-text": "#e1eef0",
      static: "rgb(230, 234, 239)",
      default: "rgb(248, 250, 252)",
      menu: "rgb(1, 2, 3)",
      footer: "rgb(15, 23, 42)",
    };
    localStorage.setItem("theme", "light");
    mockMobileViewport();
    mockMobileChromeColors(colors);

    render(<App />);

    fireEvent.click(screen.getByText("nav-search"));
    await finishPageTransition();
    fireEvent.click(screen.getByText("choose-image"));
    await finishPageTransition();
    await expectMobileChrome(colors.home);

    fireEvent.click(screen.getByText("menu-open"));

    await waitFor(() => {
      expect(document.querySelector(".mobile-viewport-edge-frame")).toHaveAttribute("data-mobile-menu-open", "true");
      expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute("content", colors.home);
      expect(document.querySelector('meta[name="msapplication-navbutton-color"]')).toHaveAttribute("content", colors.home);
    });

    fireEvent.click(screen.getByText("menu-close"));
    await expectMobileChrome(colors.home);
  });
});
