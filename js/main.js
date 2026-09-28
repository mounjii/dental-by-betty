const startReveals = () => {
  document.documentElement.classList.add("js-reveal");

  const revealTargets = document.querySelectorAll(
    [
      ".hero-copy",
      ".soins-intro",
      ".soins-lead",
      ".soins-card",
      ".soins-bottom",
      ".about-copy",
      ".about-stats",
      ".location-copy",
      ".location-map",
      ".avis-heading",
      ".reel",
      ".contact-copy",
      ".booking-form",
      ".legal-inner",
      ".footer-brand-col",
      ".footer-col",
    ].join(", ")
  );

  revealTargets.forEach((el) => el.classList.add("reveal"));
  revealTargets.forEach((el) => {
    const group = el.parentElement;
    if (!group) return;
    const siblings = [...group.children].filter((child) => child.classList.contains("reveal"));
    const index = siblings.indexOf(el);
    if (index > 0) el.style.setProperty("--reveal-delay", `${index * 90}ms`);
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.05, rootMargin: "80px 0px -4% 0px" }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));
};

const goToSection = (id) => {
  const section = document.getElementById(id);
  if (!section) return false;
  section.classList.add("is-in");
  section.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
};

const openHash = () => {
  const id = decodeURIComponent(location.hash.replace("#", ""));
  if (id) goToSection(id);
};

const playIntro = () => {
  const intro = document.getElementById("intro");
  const logo = intro?.querySelector(".intro-logo");
  const target = document.querySelector(".brand-logo");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!intro || !logo || !target || reduce) {
    document.documentElement.classList.remove("is-intro");
    startReveals();
    openHash();
    return;
  }

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    document.documentElement.classList.remove("is-intro", "is-intro-docking");
    intro.remove();
    startReveals();
    openHash();
  };

  const imageReady = logo.complete
    ? Promise.resolve()
    : new Promise((resolve) => {
        logo.addEventListener("load", resolve, { once: true });
        logo.addEventListener("error", resolve, { once: true });
      });

  imageReady.then(() => {
    requestAnimationFrame(() => intro.classList.add("is-ready"));

    window.setTimeout(() => {
      const start = logo.getBoundingClientRect();
      const end = target.getBoundingClientRect();

      intro.classList.remove("is-ready");
      logo.style.transition = "none";
      logo.style.opacity = "1";
      logo.style.left = `${start.left}px`;
      logo.style.top = `${start.top}px`;
      logo.style.width = `${start.width}px`;
      logo.style.height = `${start.height}px`;
      logo.style.transformOrigin = "top left";
      logo.style.transform = "none";
      void logo.offsetWidth;

      intro.classList.add("is-moving");
      const dx = end.left - start.left;
      const dy = end.top - start.top;
      const sx = end.width / start.width;
      const sy = end.height / start.height;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          logo.style.transition = "transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)";
          logo.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
        });
      });
    }, 1600);

    logo.addEventListener("transitionend", (event) => {
      if (event.propertyName === "transform" && intro.classList.contains("is-moving")) {
        finish();
      }
    });
    window.setTimeout(finish, 3800);
  });
};

playIntro();

const siteHeader = document.querySelector(".site-header");
const setHeaderScroll = () => {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 12);
};
setHeaderScroll();
window.addEventListener("scroll", setHeaderScroll, { passive: true });

const navLinks = document.getElementById("nav-links");
const toggle = document.querySelector(".nav-toggle");
const links = [...document.querySelectorAll(".nav-link")];
const year = document.getElementById("year");

if (year) {
  year.textContent = String(new Date().getFullYear());
}

const params = new URLSearchParams(window.location.search);
if (params.has("menu")) {
  navLinks?.classList.add("is-open");
  toggle?.setAttribute("aria-expanded", "true");
}
const jump = params.get("section");
if (jump) {
  const go = () => document.getElementById(jump)?.scrollIntoView({ block: "start" });
  if (document.readyState === "complete") go();
  else window.addEventListener("load", go);
}

toggle?.addEventListener("click", () => {
  const open = navLinks.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  document.body.classList.toggle("is-menu-open", open);
});

navLinks?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    navLinks.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-menu-open");
  }
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link) return;
  const url = new URL(link.href, location.href);
  const here = location.pathname.replace(/\/index\.html$/, "/");
  const there = url.pathname.replace(/\/index\.html$/, "/");
  if (here !== there || !url.hash) return;
  const id = decodeURIComponent(url.hash.slice(1));
  if (!document.getElementById(id)) return;
  event.preventDefault();
  goToSection(id);
  history.replaceState(null, "", `#${id}`);
});

const sections = links
  .map((link) => document.getElementById(link.dataset.section || ""))
  .filter(Boolean);

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    links.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.section === visible.target.id);
    });
  },
  { rootMargin: "-18% 0px -55% 0px", threshold: [0.1, 0.3, 0.6] }
);

sections.forEach((section) => observer.observe(section));

const setReelState = (reel, video, button, playing) => {
  reel.classList.toggle("is-playing", playing);
  button.textContent = playing ? "❚❚" : "▶";
  button.setAttribute("aria-label", playing ? "Mettre en pause" : "Lire la vidéo");
  if (playing) {
    video.muted = false;
    video.volume = 1;
  }
};

const motifSelect = document.querySelector(".motif-select");
const motifTrigger = motifSelect?.querySelector(".motif-trigger");
const motifMenu = motifSelect?.querySelector(".motif-menu");
const motifValue = motifSelect?.querySelector(".motif-value");
const motifInput = motifSelect?.querySelector('input[name="reason"]');
const motifOther = document.querySelector(".motif-other");
const motifDetail = motifOther?.querySelector("textarea");

const closeMotif = () => {
  motifSelect?.classList.remove("is-open");
  motifTrigger?.setAttribute("aria-expanded", "false");
  motifMenu?.setAttribute("hidden", "");
};

motifTrigger?.addEventListener("click", () => {
  const open = !motifSelect.classList.contains("is-open");
  motifSelect.classList.toggle("is-open", open);
  motifTrigger.setAttribute("aria-expanded", String(open));
  if (open) motifMenu.removeAttribute("hidden");
  else motifMenu.setAttribute("hidden", "");
});

motifMenu?.addEventListener("click", (event) => {
  const option = event.target.closest("button");
  if (!option) return;
  const value = option.textContent.trim();
  motifValue.textContent = value;
  motifInput.value = value;
  motifMenu.querySelectorAll("button").forEach((button) => {
    button.setAttribute("aria-selected", String(button === option));
  });
  const isOther = value === "Autre";
  motifOther.hidden = !isOther;
  if (motifDetail) {
    motifDetail.required = isOther;
    if (!isOther) motifDetail.value = "";
    else motifDetail.focus();
  }
  closeMotif();
});

document.addEventListener("click", (event) => {
  if (motifSelect && !motifSelect.contains(event.target)) closeMotif();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMotif();
});

document.querySelectorAll(".reel").forEach((reel) => {
  const video = reel.querySelector("video");
  const button = reel.querySelector(".reel-play");
  if (!video || !button) return;

  video.addEventListener("loadeddata", () => reel.classList.add("has-video"));

  video.addEventListener("play", () => setReelState(reel, video, button, true));
  video.addEventListener("pause", () => setReelState(reel, video, button, false));
  video.addEventListener("ended", () => setReelState(reel, video, button, false));

  const togglePlay = () => {
    document.querySelectorAll(".reel video").forEach((other) => {
      if (other !== video) {
        other.pause();
        other.muted = true;
      }
    });
    if (video.paused) {
      video.muted = false;
      video.volume = 1;
      video.play();
    } else {
      video.pause();
    }
  };

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    togglePlay();
  });
  video.addEventListener("click", togglePlay);
});

const bookingForm = document.querySelector(".booking-form");
const bookingSuccess = bookingForm?.querySelector(".booking-success");
const bookingError = bookingForm?.querySelector(".booking-error");
const bookingSubmit = bookingForm?.querySelector('button[type="submit"]');

bookingForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (bookingForm.classList.contains("is-sending")) return;

  const data = new FormData(bookingForm);
  if (String(data.get("_gotcha") || "").trim()) return;

  const payload = {
    name: String(data.get("name") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    reason: String(data.get("reason") || "").trim(),
    reason_detail: String(data.get("reason_detail") || "").trim(),
    _subject: "Nouveau rendez-vous — Dental by Betty",
    _template: "table",
    _captcha: "false",
  };

  bookingForm.classList.add("is-sending");
  if (bookingError) bookingError.hidden = true;
  if (bookingSubmit) bookingSubmit.textContent = "Envoi…";

  try {
    const response = await fetch("https://formsubmit.co/ajax/tookrecipes@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("send-failed");
    bookingForm.classList.add("is-sent");
    if (bookingSuccess) bookingSuccess.hidden = false;
  } catch (error) {
    if (bookingError) bookingError.hidden = false;
    if (bookingSubmit) bookingSubmit.textContent = "Envoyer la demande →";
  } finally {
    bookingForm.classList.remove("is-sending");
  }
});
