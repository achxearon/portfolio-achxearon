gsap.registerPlugin(ScrollTrigger);

const GITHUB_USER = "achxearon"; // change to your GitHub username
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const heroName = document.querySelector(".hero-name");
const heroNameText = "</achxearon>";
const hello = document.querySelector(".hello");
const helloText = document.querySelector(".hello-text");
const helloIm = document.querySelector(".hello-im");

const islandTime = document.querySelector(".island-time");
const islandDate = document.querySelector(".island-date");
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
  islandTime.dateTime = now.toISOString();
  islandDate.dateTime = localDate;
  islandTime.textContent = localTimeFormatter.format(now);
  islandDate.textContent = localDateFormatter.format(now);
}
updateIslandClock();
window.setInterval(updateIslandClock, 60_000);

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
  let sootFrame = 0;
  let sootFadeTimeout;
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

  function moveSootWithScroll() {
    sootTarget = getSootPathPosition();
    window.clearTimeout(sootFadeTimeout);
    sootFadeTimeout = window.setTimeout(() => {
      sootParticles.forEach((particle) => {
        particle.style.opacity = "0";
      });
    }, 240);
    if (!sootFrame) sootFrame = window.requestAnimationFrame(renderSootTrail);
  }

  sootTrail.classList.add("is-active");
  window.addEventListener("scroll", moveSootWithScroll, { passive: true });
  window.addEventListener("resize", () => {
    sootHistory.length = 0;
    sootTarget = getSootPathPosition();
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
if (reduceMotion) renderHeroName(heroNameText.length);

gsap.fromTo(".dynamic-island", {
  autoAlpha: 0,
  y: -20,
  scale: 0.88,
}, {
  autoAlpha: 1,
  y: 0,
  scale: 1,
  duration: reduceMotion ? 0 : 0.45,
  ease: "back.out(1.7)",
  scrollTrigger: {
    trigger: ".hero-title",
    start: "bottom top",
    toggleActions: "play none none reverse",
  },
});

function prepareHeadingTyping(root) {
  root.querySelectorAll("h2, .card h3").forEach((heading) => {
    if (heading.dataset.typingReady) return;
    const text = heading.textContent.trim();
    heading.setAttribute("aria-label", text);
    heading.textContent = "";
    Array.from(text).forEach((character) => {
      const span = document.createElement("span");
      span.className = "heading-character";
      span.setAttribute("aria-hidden", "true");
      span.textContent = character === " " ? "\u00a0" : character;
      heading.append(span);
    });
    heading.dataset.typingReady = "true";
  });
}

function animateHeadingTyping(root) {
  root.querySelectorAll("[data-typing-ready]").forEach((heading) => {
    const characters = heading.querySelectorAll(".heading-character");
    gsap.set(characters, { autoAlpha: 0 });
    gsap.to(characters, {
      autoAlpha: 1,
      duration: 0.01,
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
  }, {
    autoAlpha: 1,
    y: 0,
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

prepareHeadingTyping(document);
let projectReveal;
animateScrollReveal(gsap.utils.toArray(".skill-list li"), ".skills", 0.07);
animateScrollReveal(gsap.utils.toArray(".contact > p:not(.copy-status)"), ".contact");
projectReveal = animateScrollReveal(Array.from(document.querySelectorAll(".track .card")), ".projects", 0.12);

const copyDiscordButton = document.querySelector(".copy-discord");
const discordCopyStatus = document.querySelector("#discord-copy-status");
copyDiscordButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("@achxearon");
    discordCopyStatus.textContent = "Discord handle copied.";
  } catch {
    discordCopyStatus.textContent = "Couldn't copy automatically. Your handle is @achxearon.";
  }
});

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
  const renderHello = (count) => {
    helloCharacters.forEach((character, index) => {
      character.style.opacity = index < count ? "1" : "0";
    });
  };
  const helloTyping = { characters: 0 };
  const helloBounds = hello.getBoundingClientRect();
  gsap.set(hello, {
    opacity: 0,
    scale: 1.8,
    textShadow: "0 0 0 rgba(139, 120, 255, 0)",
    x: window.innerWidth / 2 - (helloBounds.left + helloBounds.width / 2),
    y: window.innerHeight / 2 - (helloBounds.top + helloBounds.height / 2),
  });
  renderHello(0);
  gsap.set(".role", { opacity: 0 });
  document.documentElement.classList.add("intro-running");
  const intro = gsap.timeline();
  intro.eventCallback("onComplete", () => {
    document.documentElement.classList.remove("intro-running");
  });
  intro.to(".hello", {
    opacity: 1,
    scale: 2,
    textShadow: "0 0 22px rgba(139, 120, 255, 0.5)",
    duration: 0.32,
    ease: "back.out(2.4)",
  });
  intro.to(".hello", {
    scale: 1.8,
    duration: 0.18,
    ease: "power2.out",
  });
  intro.to(helloTyping, {
    characters: helloMessage.length,
    duration: 0.55,
    ease: "none",
    onUpdate: () => {
      renderHello(Math.round(helloTyping.characters));
    },
  });
  intro.to({}, { duration: 0.18 });
  const nameTyping = { characters: 0 };
  intro.set(".name-cursor", { visibility: "visible" });
  intro.call(() => {
    nameTyping.characters = 1;
    renderHeroName(1);
  });
  intro.to(".hello", {
    x: 0,
    y: 0,
    scale: 1,
    textShadow: "0 0 0 rgba(139, 120, 255, 0)",
    duration: 1,
    ease: "power3.inOut",
  });
  intro.to(nameTyping, {
    characters: heroNameText.length,
    duration: 0.75,
    ease: "none",
    onUpdate: () => {
      renderHeroName(Math.round(nameTyping.characters));
    },
  }, "<0.18");
  intro.set(".intro-overlay", { opacity: 0 });
  const backgroundBlinkGaps = [0.012, 0.012, 0.015, 0.018, 0.021, 0.024, 0.027, 0.03, 0.033, 0.036, 0.039, 0.033];
  backgroundBlinkGaps.forEach((gap, index) => {
    intro.to({}, { duration: gap });
    intro.set(".intro-overlay", { opacity: index % 2 === 0 ? 0 : 1 });
  });
  intro.set(".intro-overlay", { opacity: 0 });
  intro.set(helloIm, { display: "inline", opacity: 0 });
  intro.to(helloIm, { opacity: 1, duration: 0.18, ease: "power1.out" });
  intro.to(".role", { opacity: 1, duration: 0.25, ease: "power2.out" }, "-=0.1");

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
    onUpdate: () => renderTyped(Math.round(typing.n)),
    scrollTrigger: {
      trigger: typedEl,
      start: "top 85%",
      end: "top 45%",
      scrub: 0.3,
    },
  });

}
