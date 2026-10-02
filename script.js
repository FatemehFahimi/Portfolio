function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Universal reveal observer ── */
function initRevealAnimations() {
  const revealElements = document.querySelectorAll(".reveal");
  if (!revealElements.length) return;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((element) => observer.observe(element));
}

/* ── Item-level staggered reveal for cards and skill tags ── */
function initItemReveal() {
  const items = document.querySelectorAll(
    ".project-card, .skill-cloud span, .about-metrics article, .timeline-item"
  );
  if (!items.length) return;
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px 60px 0px", threshold: 0 }
  );

  items.forEach((element) => observer.observe(element));
}

/* ── Safety net: reveal anything hidden after timeout or on resize ── */
function initRevealFallback() {
  const selector =
    ".reveal:not(.is-visible)," +
    ".project-card:not(.is-visible)," +
    ".skill-cloud span:not(.is-visible)," +
    ".about-metrics article:not(.is-visible)," +
    ".timeline-item:not(.is-visible)";

  const hiddenSel = selector;

  const showInView = () => {
    const hidden = document.querySelectorAll(hiddenSel);
    const margin = 200;
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    hidden.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < wh + margin && rect.bottom > -margin) {
        el.classList.add("is-visible");
      }
    });
  };

  /* safety timeout: show everything after 2.5 s */
  setTimeout(() => {
    document.querySelectorAll(hiddenSel).forEach((el) => el.classList.add("is-visible"));
  }, 2500);

  /* on resize/scroll, use a viewport-aware check */
  let debounceTimer;
  const handler = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(showInView, 250);
  };
  window.addEventListener("resize", handler, { passive: true });
  window.addEventListener("scroll", handler, { passive: true });
}

/* ── Hamburger menu ── */
function initHamburgerMenu() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ── Scroll spy ── */
function initScrollSpy() {
  const links = Array.from(document.querySelectorAll(".site-nav a"));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if (!sections.length || !("IntersectionObserver" in window)) return;

  const setActive = (id) => {
    links.forEach((link) =>
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`)
    );
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ── Scroll progress + back-to-top ── */
function initScrollProgress() {
  const bar = document.querySelector(".scroll-progress span");
  const backToTop = document.querySelector(".back-to-top");
  if (!bar && !backToTop) return;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (bar) bar.style.width = `${pct}%`;
    if (backToTop) backToTop.classList.toggle("is-visible", scrollTop > 500);
  };

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          update();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
  update();
}

function initBackToTop() {
  const button = document.querySelector(".back-to-top");
  if (!button) return;
  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });
}

/* ── Lightbox ── */
function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const caption = document.getElementById("lightbox-caption");
  const closeBtn = lightbox?.querySelector(".lightbox-close");
  const triggers = document.querySelectorAll(".project-cover[data-lightbox]");
  if (!lightbox || !lightboxImg || !triggers.length) return;

  let lastFocused = null;

  const open = (src, title, alt) => {
    lastFocused = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || title || "Project image";
    if (caption) caption.textContent = title || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeBtn?.focus();
  };

  const close = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lightboxImg.src = "";
    if (lastFocused) lastFocused.focus();
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const src = trigger.getAttribute("data-lightbox");
      const title = trigger.getAttribute("data-title");
      const img = trigger.querySelector("img");
      open(src, title, img?.alt);
    });
  });

  closeBtn?.addEventListener("click", close);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) close();
  });
}

/* ── Contact form → mailto ── */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const btn = form.querySelector(".form-submit");
    const status = form.querySelector(".form-status");
    if (!btn || btn.disabled) return;

    const nameInput = form.querySelector("[name=name]");
    const emailInput = form.querySelector("[name=email]");
    const messageInput = form.querySelector("[name=message]");
    const name = nameInput?.value.trim();
    const email = emailInput?.value.trim();
    const message = messageInput?.value.trim();

    if (!name || !email || !message) {
      const t = translations[document.documentElement.lang] || translations.en;
      status.textContent = t["contact.fillAll"] || "Please fill in all fields.";
      status.className = "form-status error";
      return;
    }

    const subject = encodeURIComponent("Portfolio Contact");
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );
    const mailto = `mailto:fatemehfahimi2001@gmail.com?subject=${subject}&body=${body}`;

    btn.disabled = true;
    btn.classList.add("is-success");
    const t2 = translations[document.documentElement.lang] || translations.en;
    status.textContent = t2["contact.opening"] || "Opening mail app…";
    status.className = "form-status success";

    window.location.href = mailto;

    setTimeout(() => {
      btn.classList.remove("is-success");
      btn.disabled = false;
      status.textContent = "";
      status.className = "form-status";
      form.reset();
    }, 5000);
  });
}

/* ── Custom cursor (desktop only) ── */
function initCustomCursor() {
  const cursor = document.querySelector(".custom-cursor");
  if (!cursor) return;
  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) { cursor.style.display = "none"; return; }

  document.documentElement.style.cursor = "none";
  document.querySelectorAll("a, button, input, textarea, .project-cover").forEach((el) => {
    el.style.cursor = "none";
  });

  let mouseX = -100, mouseY = -100;
  let rafId = null;

  const onMouseMove = (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        cursor.style.transform = `translate(${mouseX - 10}px, ${mouseY - 10}px)`;
        rafId = null;
      });
    }
  };

  document.addEventListener("mousemove", onMouseMove, { passive: true });

  document.querySelectorAll("a, button, input, textarea, .project-cover").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
  });
}

/* ── Animated counter for metrics ── */
function initCounters() {
  const metrics = document.querySelectorAll(".metric-value");
  if (!metrics.length || prefersReducedMotion) return;
  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const text = el.textContent || "";
        const parts = text.match(/^([^\d]*)([\d.]+)(.*)$/);
        if (!parts) return;
        const prefix = parts[1];
        const target = parseFloat(parts[2]);
        const suffix = parts[3];
        let current = 0;
        const step = Math.max(target / 30, 0.5);
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = prefix + Math.floor(current) + suffix;
        }, 40);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  metrics.forEach((el) => observer.observe(el));
}

/* ── Language switcher (EN / TR / FA segmented + ?lang= deep links) ── */
function initLanguageSwitcher() {
  const switcher = document.querySelector(".lang-switcher");
  if (!switcher || typeof translations === "undefined") return;

  const LANGS = ["en", "tr", "fa"];
  const TITLES = {
    en: "Fatemeh Fahimi | Architecture & Urban Design",
    tr: "Fatemeh Fahimi | Mimari ve Kentsel Tasarım",
    fa: "\u0641\u0627\u0637\u0645\u0647 \u0641\u0647\u0627\u0645\u06cc | \u0645\u0639\u0645\u0627\u0631\u06cc \u0648 \u0637\u0631\u0627\u062d\u06cc \u0634\u0647\u0631\u06cc"
  };
  const DESCRIPTIONS = {
    en: "Portfolio of Fatemeh Fahimi — architect and Master of Urban Design student at Newcastle University.",
    tr: "Fatemeh Fahimi'nin portfolyosu — Newcastle Üniversitesi Kentsel Tasarım yüksek lisans mezunu mimar.",
    fa: "\u0646\u0645\u0648\u0646\u0647\u200c\u06a9\u0627\u0631\u0647\u0627\u06cc \u0641\u0627\u0637\u0645\u0647 \u0641\u0647\u06cc\u0645\u06cc — \u0645\u0639\u0645\u0627\u0631 \u0648 \u062f\u0627\u0646\u0634\u200c\u0622\u0645\u0648\u062e\u062a\u0647 \u0637\u0631\u0627\u062d\u06cc \u0634\u0647\u0631\u06cc \u062f\u0627\u0646\u0634\u06af\u0627\u0647 \u0646\u06cc\u0648\u06a9\u0627\u0633\u0644."
  };

  const getLangFromURL = () => {
    try {
      const q = new URLSearchParams(window.location.search).get("lang");
      return q ? q.toLowerCase() : null;
    } catch (e) { return null; }
  };

  let currentLang = getLangFromURL();
  if (!LANGS.includes(currentLang)) {
    currentLang = localStorage.getItem("portfolio-lang") || "en";
  }
  if (!LANGS.includes(currentLang)) {
    const nav = (navigator.language || "en").toLowerCase();
    currentLang = nav.startsWith("fa") ? "fa" : nav.startsWith("tr") ? "tr" : "en";
  }

  const applyLang = (lang, opts) => {
    const dict = translations[lang];
    if (!dict) return;
    currentLang = lang;
    opts = opts || {};

    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "fa" ? "rtl" : "ltr");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (dict[key] !== undefined) el.setAttribute("placeholder", dict[key]);
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      if (dict[key] !== undefined) el.setAttribute("aria-label", dict[key]);
    });

    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      if (dict[key] !== undefined) {
        el.setAttribute("title", dict[key]);
        if (el.hasAttribute("aria-label")) el.setAttribute("aria-label", dict[key]);
      }
    });

    document.title = TITLES[lang] || TITLES.en;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && DESCRIPTIONS[lang]) metaDesc.setAttribute("content", DESCRIPTIONS[lang]);

    const CV_FILES = {
      en: "Fatemeh-Fahimi-CV-EN.pdf",
      tr: "Fatemeh-Fahimi-CV-TR.pdf",
      fa: "Fatemeh-Fahimi-CV-FA.pdf"
    };
    const cvFile = CV_FILES[lang] || CV_FILES.en;
    document.querySelectorAll("#cv-download-hero, #cv-download-contact").forEach((el) => {
      el.setAttribute("href", cvFile);
    });

    switcher.querySelectorAll("[data-lang]").forEach((btn) => {
      const active = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", active);
      if (active) btn.setAttribute("aria-current", "true");
      else btn.removeAttribute("aria-current");
      btn.setAttribute("aria-pressed", String(active));
    });

    try { localStorage.setItem("portfolio-lang", lang); } catch (e) {}

    // Keep shareable ?lang= deep link in the address bar (no reload)
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("lang") !== lang) {
        url.searchParams.set("lang", lang);
        window.history.replaceState({}, "", url);
      }
    } catch (e) {}

    if (!opts.initial) {
      const nav = document.getElementById("primary-nav");
      const toggle = document.querySelector(".nav-toggle");
      if (nav && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      }
    }
  };

  switcher.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.getAttribute("data-lang")));
  });

  applyLang(currentLang, { initial: true });
}

/* ── Sticky header shadow on scroll ── */
function initHeaderShadow() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}
initLanguageSwitcher();
initHeaderShadow();
initRevealAnimations();
initItemReveal();
initRevealFallback();
initCounters();
initHamburgerMenu();
initScrollSpy();
initScrollProgress();
initBackToTop();
initLightbox();
initContactForm();
initCustomCursor();
