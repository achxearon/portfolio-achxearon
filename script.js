gsap.registerPlugin(ScrollTrigger);

const GITHUB_USER = "achxearon"; // change to your GitHub username
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const heroName = document.querySelector(".hero-name");
const heroNameText = "</achxearon>";
const hello = document.querySelector(".hello");
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

let projectScrollMedia;
function setupProjectScroll() {
  if (track.children.length < 2) return;

  projectScrollMedia?.revert();
  projectScrollMedia = gsap.matchMedia();
  projectScrollMedia.add("(min-width: 800px)", () => {
    if (track.scrollWidth <= window.innerWidth) return;
    const distance = () => track.scrollWidth - window.innerWidth + 160;

    gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: ".projects",
        start: "top top",
        end: () => "+=" + distance(),
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  });
}

fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=30`)
  .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
  .then((repos) => {
    const list = repos.filter((r) => !r.fork && r.name !== GITHUB_USER).slice(0, 8);
    if (!list.length) return;
    track.replaceChildren(...list.map(makeCard), comingSoonCard);
    prepareHeadingTyping(track);
    document.querySelector(".projects").classList.toggle("has-multiple-projects", track.children.length > 1);
    if (!reduceMotion) {
      animateHeadingTyping(track);
      setupProjectScroll();
      projectReveal?.scrollTrigger?.kill();
      projectReveal?.kill();
      projectReveal = animateScrollReveal(Array.from(track.children), ".projects", 0.12);
      ScrollTrigger.refresh();
    }
  })
  .catch(() => { /* keep placeholder cards */ });

if (!reduceMotion) {
  animateHeadingTyping(document);

  /* ---------- Intro: center the greeting, then reveal the name ---------- */
  const helloBounds = hello.getBoundingClientRect();
  gsap.set(hello, {
    opacity: 0,
    x: window.innerWidth / 2 - (helloBounds.left + helloBounds.width / 2),
    y: window.innerHeight / 2 - (helloBounds.top + helloBounds.height / 2),
  });
  gsap.set(".role", { opacity: 0 });
  const intro = gsap.timeline();
  intro.to(".hello", { opacity: 1, duration: 0.25, ease: "power1.out" });
  intro.to({}, { duration: 0.15 });
  intro.to(".hello", { x: 0, y: 0, duration: 0.9, ease: "power2.inOut" });
  intro.to(".hello", { scale: 1.12, duration: 0.2, ease: "power2.out" });
  intro.to(".hello", { scale: 1, duration: 0.65, ease: "elastic.out(1, 0.45)" });
  const nameTyping = { characters: 0 };
  intro.set(".name-cursor", { visibility: "visible" });
  intro.call(() => {
    nameTyping.characters = 1;
    renderHeroName(1);
  });
  intro.to(nameTyping, {
    characters: heroNameText.length,
    duration: 0.75,
    ease: "none",
    onUpdate: () => {
      renderHeroName(Math.round(nameTyping.characters));
    },
  });
  intro.set(".intro-overlay", { opacity: 0 });
  const backgroundBlinkGaps = [0.012, 0.012, 0.015, 0.018, 0.021, 0.024, 0.027, 0.03, 0.033, 0.036, 0.039, 0.033];
  backgroundBlinkGaps.forEach((gap, index) => {
    intro.to({}, { duration: gap });
    intro.set(".intro-overlay", { opacity: index % 2 === 0 ? 0 : 1 });
    intro.set(hello, { backgroundColor: index % 2 === 0 ? "transparent" : "#000" });
  });
  intro.set(".intro-overlay", { opacity: 0 });
  intro.set(hello, { backgroundColor: "transparent" });
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

  /* ---------- Projects: horizontal pinned scroll ---------- */
  setupProjectScroll();

}
