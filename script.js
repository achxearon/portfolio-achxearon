gsap.registerPlugin(ScrollTrigger);

const GITHUB_USER = "achxearon"; // change to your GitHub username
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const heroName = document.querySelector(".hero-name");
const heroNameText = "</achxearon>";
function updateElementMetrics(element) {
  const { width, height } = element.getBoundingClientRect();
  element.dataset.metrics = `${element.dataset.metricLabel} ${Math.round(width)} × ${Math.round(height)} px`;
}
const metricResizeObserver = new ResizeObserver((entries) => {
  entries.forEach(({ target }) => updateElementMetrics(target));
});
function enableMetricOutline(element, label) {
  element.classList.add("metric-outline");
  element.dataset.metricLabel = label;
  element.addEventListener("pointerenter", () => updateElementMetrics(element));
  metricResizeObserver.observe(element);
}
enableMetricOutline(heroName, "user");
const hello = document.querySelector(".hello");
const helloText = document.querySelector(".hello-text");
const helloIm = document.querySelector(".hello-im");

const islandTimes = document.querySelectorAll(".island-time");
const islandDates = document.querySelectorAll(".island-date");
const localTimeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
});
const localDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
});
function updateIslandClock() {
  const now = new Date();
  const localDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  islandTimes.forEach((time) => {
    time.dateTime = now.toISOString();
    time.textContent = localTimeFormatter.format(now);
  });
  islandDates.forEach((date) => {
    date.dateTime = localDate;
    date.textContent = localDateFormatter.format(now);
  });
}
updateIslandClock();
window.setInterval(updateIslandClock, 60_000);

const pageAccentLayer = document.querySelector(".page-accent-layer");
function renderPageAccents() {
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.scrollHeight;
  const accentTypes = ["circle", "square", "triangle", "cross"];
  const fragment = document.createDocumentFragment();
  const placements = [];
  const targetCount = Math.round((width * height) / 65000);
  const minimumSpacing = 145;
  const edgePadding = 60;

  pageAccentLayer.style.height = `${height}px`;
  for (let attempt = 0; attempt < targetCount * 40 && placements.length < targetCount; attempt += 1) {
    const x = edgePadding + Math.random() * Math.max(0, width - edgePadding * 2);
    const y = edgePadding + Math.random() * Math.max(0, height - edgePadding * 2);
    if (placements.some((point) => Math.hypot(point.x - x, point.y - y) < minimumSpacing)) continue;

    const accent = document.createElement("span");
    const type = accentTypes[Math.floor(Math.random() * accentTypes.length)];
    accent.className = `page-accent page-accent--${type}`;
    accent.style.left = `${(x / width) * 100}%`;
    accent.style.top = `${y}px`;
    accent.style.opacity = String(0.18 + Math.random() * 0.25);
    accent.style.setProperty("--accent-rotation", `${Math.round(Math.random() * 360)}deg`);
    placements.push({ x, y });
    fragment.append(accent);
  }
  pageAccentLayer.replaceChildren(fragment);
}
renderPageAccents();
function updateAccentParallax() {
  pageAccentLayer.style.setProperty("--accent-parallax-y", `${window.scrollY * 0.08}px`);
}
if (!reduceMotion) {
  window.addEventListener("scroll", updateAccentParallax, { passive: true });
  updateAccentParallax();
}
let accentResizeFrame = 0;
const pageSizeObserver = new ResizeObserver(() => {
  if (accentResizeFrame) return;
  accentResizeFrame = window.requestAnimationFrame(() => {
    accentResizeFrame = 0;
    renderPageAccents();
  });
});
pageSizeObserver.observe(document.body);
window.addEventListener("resize", renderPageAccents);

if (!reduceMotion) {
  const updateTriangleParallax = () => {
    const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollRange > 0 ? window.scrollY / scrollRange : 0;
    const offset = -progress * window.innerHeight * 0.18;
    document.documentElement.style.setProperty("--triangle-parallax-y", `${offset}px`);
  };
  window.addEventListener("scroll", updateTriangleParallax, { passive: true });
  window.addEventListener("resize", updateTriangleParallax);
  updateTriangleParallax();
}

if (!reduceMotion) {
  const sootTrail = document.querySelector(".soot-trail");
  const sootBall = document.querySelector(".soot-ball");
  const sootParticles = Array.from(document.querySelectorAll(".soot-particle"));
  const sootHistory = [];
  const hoverTargets = "a, button, [role='button'], .skill-list li, .card, .hero-name, .hello, .role, h1, h2, h3, p, img";
  let sootFrame = 0;
  let sootFadeTimeout;
  let highlightedTarget;
  let sootTarget = getSootPathPosition();
  let sootPosition = { ...sootTarget };

  function getSootPathPosition() {
    const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollRange > 0 ? window.scrollY / scrollRange : 0;
    return {
      x: window.innerWidth * (0.8 + Math.sin(progress * Math.PI * 6) * 0.07),
      y: window.innerHeight * (0.16 + progress * 0.68) + Math.sin(progress * Math.PI * 12) * 14,
    };
  }

  function getSootTargetPosition(target) {
    const bounds = target.getBoundingClientRect();
    const cursorBounds = sootBall.getBoundingClientRect();
    return {
      x: bounds.right - cursorBounds.width,
      y: bounds.bottom - cursorBounds.height,
    };
  }

  function renderSootTrail() {
    sootFrame = 0;
    sootPosition.x += (sootTarget.x - sootPosition.x) * 0.16;
    sootPosition.y += (sootTarget.y - sootPosition.y) * 0.16;
    const lastPosition = sootHistory[0];
    if (!lastPosition || Math.hypot(sootPosition.x - lastPosition.x, sootPosition.y - lastPosition.y) >= 5) {
      sootHistory.unshift({ ...sootPosition });
      sootHistory.length = Math.min(sootHistory.length, sootParticles.length);
    }

    sootBall.style.transform = `translate3d(${sootPosition.x}px, ${sootPosition.y}px, 0)`;
    sootParticles.forEach((particle, index) => {
      const position = sootHistory[index + 1];
      particle.style.opacity = position ? String(0.34 - index * 0.032) : "0";
      if (position) {
        particle.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%) scale(${1 - index * 0.055})`;
      }
    });

    if (Math.abs(sootTarget.x - sootPosition.x) > 0.5 || Math.abs(sootTarget.y - sootPosition.y) > 0.5) {
      sootFrame = window.requestAnimationFrame(renderSootTrail);
    }
  }

  function restartSootRender() {
    if (sootFrame) window.cancelAnimationFrame(sootFrame);
    sootFrame = window.requestAnimationFrame(renderSootTrail);
  }

  function moveSootWithScroll() {
    sootTarget = highlightedTarget
      ? getSootTargetPosition(highlightedTarget)
      : getSootPathPosition();
    window.clearTimeout(sootFadeTimeout);
    sootFadeTimeout = window.setTimeout(() => {
      sootParticles.forEach((particle) => {
        particle.style.opacity = "0";
      });
    }, 240);
    if (!sootFrame) sootFrame = window.requestAnimationFrame(renderSootTrail);
  }

  function moveSootToTarget(target) {
    const bounds = target.getBoundingClientRect();
    if (!bounds.width && !bounds.height) return;
    highlightedTarget = target;
    window.clearTimeout(sootFadeTimeout);
    sootTarget = getSootTargetPosition(target);
    restartSootRender();
  }

  function restoreSootPath() {
    highlightedTarget = undefined;
    sootTarget = getSootPathPosition();
    window.clearTimeout(sootFadeTimeout);
    sootFadeTimeout = window.setTimeout(() => {
      sootParticles.forEach((particle) => {
        particle.style.opacity = "0";
      });
    }, 240);
    restartSootRender();
  }

  sootTrail.classList.add("is-active");
  window.addEventListener("scroll", moveSootWithScroll, { passive: true });
  document.addEventListener("pointerover", (event) => {
    if (!(event.target instanceof Element)) return;
    const target = event.target.closest(hoverTargets);
    if (target && target !== highlightedTarget) moveSootToTarget(target);
  });
  document.addEventListener("pointerout", (event) => {
    if (!highlightedTarget || !(event.target instanceof Element)) return;
    if (highlightedTarget.contains(event.target) && !highlightedTarget.contains(event.relatedTarget)) {
      restoreSootPath();
    }
  });
  window.addEventListener("resize", () => {
    sootHistory.length = 0;
    sootTarget = highlightedTarget
      ? getSootTargetPosition(highlightedTarget)
      : getSootPathPosition();
    sootPosition = { ...sootTarget };
    sootBall.style.transform = `translate3d(${sootPosition.x}px, ${sootPosition.y}px, 0)`;
    if (!sootFrame) sootFrame = window.requestAnimationFrame(renderSootTrail);
  });
  sootBall.style.transform = `translate3d(${sootPosition.x}px, ${sootPosition.y}px, 0)`;
}

function renderHeroName(count) {
  const fragment = document.createDocumentFragment();
  Array.from(heroNameText.slice(0, count)).forEach((character) => {
    const letter = document.createElement("span");
    letter.className = "name-character";
    letter.textContent = character;
    fragment.append(letter);
  });
  heroName.replaceChildren(fragment);
}

renderHeroName(reduceMotion ? heroNameText.length : 0);

function prepareHeadingTyping(root) {
  root.querySelectorAll("h2, .card h3").forEach((heading) => {
    if (heading.dataset.typingReady) return;
    const text = heading.textContent.trim();
    heading.setAttribute("aria-label", text);
    heading.textContent = "";
    const label = document.createElement("span");
    label.className = "heading-label";
    enableMetricOutline(label, `h${heading.tagName.slice(1)}`);
    Array.from(text).forEach((character) => {
      const span = document.createElement("span");
      span.className = "heading-character";
      span.setAttribute("aria-hidden", "true");
      span.textContent = character === " " ? "\u00a0" : character;
      label.append(span);
    });
    heading.append(label);
    heading.dataset.typingReady = "true";
  });
}

function animateHeadingTyping(root) {
  root.querySelectorAll("[data-typing-ready]").forEach((heading) => {
    const characters = heading.querySelectorAll(".heading-character");
    gsap.set(characters, { autoAlpha: 0, filter: "blur(5px)" });
    gsap.to(characters, {
      autoAlpha: 1,
      filter: "blur(0px)",
      duration: 0.08,
      stagger: 0.045,
      scrollTrigger: {
        trigger: heading,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

function animateScrollReveal(targets, trigger, stagger = 0.08) {
  if (reduceMotion || !targets.length) return null;

  return gsap.fromTo(targets, {
    autoAlpha: 0,
    y: 24,
    filter: "blur(8px)",
  }, {
    autoAlpha: 1,
    y: 0,
    filter: "blur(0px)",
    duration: 0.65,
    stagger,
    ease: "power3.out",
    scrollTrigger: {
      trigger,
      start: "top 88%",
      toggleActions: "play none none reverse",
    },
  });
}

function addRapidBlink(timeline, targets, position, duration = 0.055, ease = "none") {
  return timeline.to(targets, {
    autoAlpha: 0,
    duration,
    repeat: 5,
    yoyo: true,
    ease,
  }, position);
}

function addSlowingNameBlink(timeline, targets, position) {
  const blink = gsap.timeline();
  const intervals = [0.05, 0.07, 0.09, 0.12, 0.16, 0.21, 0.3];
  let elapsed = 0;

  intervals.forEach((interval) => {
    blink.set(targets, { autoAlpha: 0 }, elapsed);
    blink.set(targets, { autoAlpha: 1 }, elapsed + interval / 2);
    elapsed += interval;
  });
  blink.set(targets, { autoAlpha: 1 }, elapsed);

  return timeline.add(blink, position);
}

prepareHeadingTyping(document);
let projectReveal;
animateScrollReveal(gsap.utils.toArray(".skill-list li"), ".skills", 0.07);
animateScrollReveal(gsap.utils.toArray(".contact > p"), ".contact");
projectReveal = animateScrollReveal(Array.from(document.querySelectorAll(".track .card")), ".projects", 0.12);

/* ---------- Typed about text (scroll-driven) ---------- */
const typedEl = document.querySelector(".about p");
const fullText = typedEl.textContent.trim();
typedEl.setAttribute("aria-label", fullText);
const typedSpan = document.createElement("span");
const restSpan = document.createElement("span");
typedSpan.className = "typed";
restSpan.className = "rest";
restSpan.setAttribute("aria-hidden", "true");
typedEl.textContent = "";
typedEl.append(typedSpan, restSpan);
const renderTyped = (n) => {
  typedSpan.textContent = fullText.slice(0, n);
  restSpan.textContent = fullText.slice(n);
};
renderTyped(reduceMotion ? fullText.length : 0);
if (!reduceMotion) typedSpan.style.filter = "blur(6px)";

/* ---------- GitHub projects ---------- */
const track = document.querySelector(".track");
const comingSoonCard = track.querySelector(".coming-soon-card");

function makeCard(repo) {
  const card = document.createElement("article");
  card.className = "card";

  const preview = document.createElement("div");
  preview.className = "project-preview";
  const image = document.createElement("img");
  const isRoomScheduler = repo.name === "room-scheduler";
  const isPortfolio = repo.name.toLowerCase().includes("portfolio");
  if (isRoomScheduler || isPortfolio) preview.classList.add("wide-banner-preview");
  image.src = isRoomScheduler
    ? "assets/room-scheduler-banner.svg"
    : isPortfolio
      ? "assets/portfolio-banner.svg"
      : `https://opengraph.githubassets.com/1/${repo.full_name}`;
  image.alt = `${repo.name} project preview`;
  image.loading = "lazy";
  image.addEventListener("error", () => {
    image.hidden = true;
  }, { once: true });
  preview.append(image);

  const h3 = document.createElement("h3");
  h3.textContent = repo.name;

  const p = document.createElement("p");
  p.textContent = repo.description || "No description provided.";

  const meta = document.createElement("span");
  meta.className = "meta";
  meta.textContent = [repo.language, repo.stargazers_count ? `★ ${repo.stargazers_count}` : null]
    .filter(Boolean).join("  |  ");

  const a = document.createElement("a");
  a.href = repo.html_url;
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = "View on GitHub";

  card.append(preview, h3, p, meta, a);
  return card;
}

let projectLoop;
let projectLoopResizeTimeout;
let projectLoopCards = Array.from(track.children);
function setupProjectLoop() {
  projectLoop?.kill();
  track.querySelectorAll(".project-card-clone").forEach((card) => card.remove());
  gsap.set(track, { x: 0 });

  if (reduceMotion || projectLoopCards.length < 2) return;

  const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
  const loopDistance = projectLoopCards.reduce((distance, card) => distance + card.offsetWidth + gap, 0);
  let cloneIndex = 0;
  while (track.scrollWidth < window.innerWidth + loopDistance) {
    const clone = projectLoopCards[cloneIndex % projectLoopCards.length].cloneNode(true);
    clone.classList.add("project-card-clone");
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("a, button, input, select, textarea, [tabindex]").forEach((element) => {
      element.setAttribute("tabindex", "-1");
    });
    track.append(clone);
    cloneIndex += 1;
  }

  projectLoop = gsap.to(track, {
    x: -loopDistance,
    duration: loopDistance / 36,
    ease: "none",
    repeat: -1,
  });
}

setupProjectLoop();
track.addEventListener("pointerenter", () => projectLoop?.pause());
track.addEventListener("pointerleave", () => projectLoop?.play());
track.addEventListener("focusin", () => projectLoop?.pause());
track.addEventListener("focusout", (event) => {
  if (!track.contains(event.relatedTarget)) projectLoop?.play();
});

fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=30`)
  .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
  .then((repos) => {
    const list = repos.filter((r) => !r.fork && r.name !== GITHUB_USER).slice(0, 8);
    if (!list.length) return;
    track.replaceChildren(...list.map(makeCard), comingSoonCard);
    prepareHeadingTyping(track);
    projectLoopCards = Array.from(track.children);
    setupProjectLoop();
    if (!reduceMotion) {
      animateHeadingTyping(track);
      projectReveal?.scrollTrigger?.kill();
      projectReveal?.kill();
      projectReveal = animateScrollReveal(projectLoopCards, ".projects", 0.12);
    }
  })
  .catch(() => { /* keep placeholder cards */ });

window.addEventListener("resize", () => {
  if (reduceMotion || !projectLoopCards.length) return;
  window.clearTimeout(projectLoopResizeTimeout);
  projectLoopResizeTimeout = window.setTimeout(setupProjectLoop, 120);
});

if (!reduceMotion) {
  animateHeadingTyping(document);

  /* ---------- Intro: center the greeting, then reveal the name ---------- */
  const helloMessage = helloText.textContent;
  const helloCharacters = Array.from(helloMessage, (character) => {
    const span = document.createElement("span");
    span.className = "hello-character";
    span.textContent = character;
    return span;
  });
  helloText.replaceChildren(...helloCharacters);
  const helloBounds = hello.getBoundingClientRect();
  gsap.set(hello, {
    opacity: 0,
    scale: 1.8,
    filter: "blur(8px)",
    textShadow: "0 0 0 rgba(139, 120, 255, 0)",
    x: window.innerWidth / 2 - (helloBounds.left + helloBounds.width / 2),
    y: window.innerHeight / 2 - (helloBounds.top + helloBounds.height / 2),
  });
  gsap.set(helloCharacters, { autoAlpha: 0, y: 24, rotation: -10, filter: "blur(6px)" });
  gsap.set(".role", { opacity: 0, filter: "blur(8px)" });
  const trianglePaths = Array.from(document.querySelectorAll(".triangle-background path"));
  gsap.set(trianglePaths, { opacity: 0 });
  gsap.set(".hero-name", { filter: "blur(10px)" });
  gsap.set(".dynamic-island", {
    autoAlpha: 0,
    x: 24,
    scale: 0.88,
    filter: "blur(8px)",
  });
  document.documentElement.classList.add("intro-running", "hello-intro");
  const intro = gsap.timeline();
  intro.eventCallback("onComplete", () => {
    document.documentElement.classList.remove("intro-running", "hello-intro");
  });
  intro.to(".hello", {
    opacity: 1,
    scale: 2,
    filter: "blur(0px)",
    textShadow: "0 0 22px rgba(139, 120, 255, 0.5)",
    duration: 0.32,
    ease: "back.out(2.4)",
  });
  intro.to(".hello", {
    scale: 1.8,
    duration: 0.18,
    ease: "power2.out",
  });
  intro.to(helloCharacters, {
    autoAlpha: 1,
    y: 0,
    rotation: 0,
    filter: "blur(0px)",
    duration: 0.55,
    stagger: 0.1,
    ease: "back.out(2.2)",
  });
  intro.to({}, { duration: 0.18 });
  const nameTyping = { characters: 0 };
  intro.set(".name-cursor", { visibility: "visible" });
  intro.call(() => {
    document.documentElement.classList.remove("hello-intro");
    nameTyping.characters = 1;
    renderHeroName(1);
  });
  intro.to(".hello", {
    x: 0,
    y: 0,
    scale: 1,
    textShadow: "0 0 0 rgba(139, 120, 255, 0)",
    duration: 0.7,
    ease: "power3.inOut",
  });
  intro.to(".dynamic-island", {
    autoAlpha: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    duration: 0.45,
    ease: "back.out(1.7)",
  }, "<");
  intro.to(nameTyping, {
    characters: heroNameText.length,
    duration: 0.75,
    ease: "none",
    onUpdate: () => {
      renderHeroName(Math.round(nameTyping.characters));
    },
  }, "<0.18");
  intro.to(".hero-name", {
    filter: "blur(0px)",
    duration: 0.75,
    ease: "power1.out",
  }, "<");
  addSlowingNameBlink(intro, ".hero-name", "<");
  intro.to(".intro-overlay", {
    opacity: 0,
    duration: 0.25,
    ease: "power1.out",
  });
  trianglePaths.forEach((path, index) => {
    const start = index * 0.1;
    for (let blink = 0; blink < 3; blink += 1) {
      intro.set(path, { opacity: 1 }, start + blink * 0.12);
      intro.set(path, { opacity: 0 }, start + blink * 0.12 + 0.06);
    }
    intro.set(path, { opacity: 1 }, start + 0.36);
  });
  intro.set(helloIm, { display: "inline", opacity: 0, filter: "blur(6px)" });
  intro.to(helloIm, {
    opacity: 1,
    filter: "blur(0px)",
    duration: 0.18,
    ease: "power1.out",
  });
  intro.to(".role", {
    opacity: 1,
    filter: "blur(0px)",
    duration: 0.25,
    ease: "power2.out",
  }, "-=0.1");
  addRapidBlink(intro, ".role", ">", 0.055, "steps(1)");

  /* ---------- Hero parallax out (on .hero-copy so it never touches the intro) ---------- */
  gsap.fromTo(".hero-title", { yPercent: 0 }, {
    yPercent: -35,
    ease: "none",
    immediateRender: false,
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.fromTo(".hero-copy", { opacity: 1 }, {
    opacity: 0.2,
    ease: "none",
    immediateRender: false,
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* ---------- About: types in fast, tied to scroll, no pin ---------- */
  const typing = { n: 0 };
  gsap.to(typing, {
    n: fullText.length,
    ease: "none",
    onUpdate: () => {
      renderTyped(Math.round(typing.n));
      typedSpan.style.filter = `blur(${6 * (1 - typing.n / fullText.length)}px)`;
    },
    scrollTrigger: {
      trigger: typedEl,
      start: "top 85%",
      end: "top 45%",
      scrub: 0.3,
    },
  });

}
