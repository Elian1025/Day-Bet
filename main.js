const welcome = document.querySelector(".welcome");
const continueLink = document.querySelector("[data-next-section]");
const journey = document.querySelector(".journey");
const tulipTransition = document.querySelector(".tulip-transition");
const kdramas = document.querySelector(".kdramas");

const soundtrack = document.querySelector("[data-soundtrack]");
let tulipRevealFallback = 0;

window.DayBet.initKdramas();

function addTulipPetals() {
  const fragment = document.createDocumentFragment();
  const columnCount = Math.ceil(window.innerWidth / 72);
  const rowCount = Math.ceil(window.innerHeight / 76);
  const cellWidth = window.innerWidth / columnCount;

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      const petal = document.createElement("span");
      const depth = Math.random();
      const petalSize = Math.round(cellWidth * (1.12 + Math.random() * 0.18));
      const petalHeight = petalSize / 0.72;
      const horizontalPosition = ((columnIndex + 0.5 + (Math.random() - 0.5) * 0.16) / columnCount) * 100;
      const verticalPosition = ((rowIndex + 0.5 + (Math.random() - 0.5) * 0.16) / rowCount) * 100;
      const hue = 336 + Math.round(Math.random() * 24);
      const lightness = 58 + Math.round(Math.random() * 19);
      const saturation = 54 + Math.round(Math.random() * 18);
      const delay = Math.round((rowIndex / rowCount * 550) + (columnIndex / columnCount * 250) + Math.random() * 250);
      const duration = Math.round(1400 + Math.random() * 700);
      const swayDelay = delay + duration;
      const swayX = Math.round((Math.random() - 0.5) * 22);
      const swayY = Math.round((Math.random() - 0.5) * 16);

      petal.className = "tulip-transition__petal";
      petal.style.setProperty("--x", `calc(${horizontalPosition}% - ${petalSize / 2}px)`);
      petal.style.setProperty("--y", `calc(${verticalPosition}% - ${petalHeight / 2}px)`);
      petal.style.setProperty("--petal-size", `${petalSize}px`);
      petal.style.setProperty("--from-x", `${Math.round((Math.random() - 0.5) * 110)}vw`);
      petal.style.setProperty("--from-y", `${Math.round((Math.random() - 0.5) * 110)}vh`);
      petal.style.setProperty("--spin-start", `${Math.round(Math.random() * 360 - 180)}deg`);
      petal.style.setProperty("--spin", `${Math.round(Math.random() * 720 - 360)}deg`);
      petal.style.setProperty("--sway-x", `${swayX}px`);
      petal.style.setProperty("--sway-y", `${swayY}px`);
      petal.style.setProperty("--petal-color", `hsl(${hue} ${saturation}% ${lightness}%)`);
      petal.style.setProperty("--petal-opacity", String(0.62 + depth * 0.36));
      petal.style.setProperty("--petal-blur", `${((1 - depth) * 1.1).toFixed(2)}px`);
      petal.style.setProperty("--delay", `${delay}ms`);
      petal.style.setProperty("--duration", `${duration}ms`);
      petal.style.setProperty("--sway-delay", `${swayDelay}ms`);
      petal.style.setProperty("--sway-duration", `${Math.round(1700 + Math.random() * 2100)}ms`);
      petal.style.zIndex = String(1 + Math.floor(depth * 10));
      fragment.append(petal);
    }
  }

  tulipTransition.replaceChildren(fragment);
}

function finishTulipTransition() {
  if (journey.dataset.state !== "revealing") return;

  window.clearTimeout(tulipRevealFallback);
  tulipTransition.hidden = true;
  tulipTransition.classList.remove("is-covering");
  tulipTransition.replaceChildren();
  journey.dataset.state = "kdramas";
  history.replaceState(null, "", `#${kdramas.id}`);
}

function beginSoundtrack() {
  if (!soundtrack || !(soundtrack.currentSrc || soundtrack.src)) return;

  soundtrack.play().catch(() => {});
}

continueLink?.addEventListener("click", (event) => {
  event.preventDefault();
  if (journey.dataset.state !== "welcome") return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  beginSoundtrack();
  if (!prefersReducedMotion) addTulipPetals();
  tulipTransition.hidden = false;
  tulipTransition.classList.remove("is-covering");
  journey.dataset.state = "transitioning";
  if (!prefersReducedMotion) {
    window.requestAnimationFrame(() => {
      if (journey.dataset.state === "transitioning") tulipTransition.classList.add("is-covering");
    });
  }

  window.setTimeout(() => {
    if (journey.dataset.state !== "transitioning") return;

    welcome.hidden = true;
    kdramas.hidden = false;
    journey.dataset.state = "revealing";
    if (prefersReducedMotion) finishTulipTransition();
    else tulipRevealFallback = window.setTimeout(finishTulipTransition, 1400);
  }, prefersReducedMotion ? 0 : 3500);
});

function handleTulipTransitionEnd(event) {
  if (event.target !== tulipTransition || event.propertyName !== "opacity") return;
  finishTulipTransition();
}

tulipTransition?.addEventListener("transitionend", handleTulipTransitionEnd);
tulipTransition?.addEventListener("transitioncancel", handleTulipTransitionEnd);

if (window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
  let pointerFrame = 0;

  welcome?.addEventListener("pointermove", (event) => {
    if (pointerFrame) return;

    pointerFrame = window.requestAnimationFrame(() => {
      const bounds = welcome.getBoundingClientRect();
      const offsetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * -8;
      const offsetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * -6;
      welcome.style.setProperty("--parallax-x", `${offsetX}px`);
      welcome.style.setProperty("--parallax-y", `${offsetY}px`);
      pointerFrame = 0;
    });
  });
}