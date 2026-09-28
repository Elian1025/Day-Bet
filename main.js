const welcome = document.querySelector(".welcome");
const continueLink = document.querySelector("[data-next-section]");
const journey = document.querySelector(".journey");
const tulipTransition = document.querySelector(".tulip-transition");
const kdramas = document.querySelector(".kdramas");

const soundtrack = document.querySelector("[data-soundtrack]");

window.DayBet.initKdramas();

function addTulipPetals() {
  const fragment = document.createDocumentFragment();
  const columns = 12;
  const rows = 10;

  for (let index = 0; index < columns * rows; index += 1) {
    const petal = document.createElement("span");
    const column = index % columns;
    const row = Math.floor(index / columns);
    const hue = 338 + Math.round(Math.random() * 25);
    const lightness = 65 + Math.round(Math.random() * 12);

    petal.className = "tulip-transition__petal";
    petal.style.setProperty("--x", `${((column + Math.random()) / columns) * 100}%`);
    petal.style.setProperty("--y", `${((row + Math.random()) / rows) * 100}%`);
    petal.style.setProperty("--from-x", `${Math.round((Math.random() - 0.5) * 90)}vw`);
    petal.style.setProperty("--from-y", `${Math.round((Math.random() - 0.5) * 90)}vh`);
    petal.style.setProperty("--spin", `${Math.round(Math.random() * 540 - 270)}deg`);
    petal.style.setProperty("--petal-color", `hsl(${hue} 57% ${lightness}%)`);
    petal.style.setProperty("--delay", `${Math.round(Math.random() * 420)}ms`);
    fragment.append(petal);
  }

  tulipTransition.replaceChildren(fragment);
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
  journey.dataset.state = "transitioning";

  window.setTimeout(() => {
    welcome.hidden = true;
    kdramas.hidden = false;
    journey.dataset.state = "revealing";
  }, prefersReducedMotion ? 0 : 2400);
});

tulipTransition?.addEventListener("transitionend", (event) => {
  if (event.target !== tulipTransition || journey.dataset.state !== "revealing") return;

  tulipTransition.hidden = true;
  tulipTransition.replaceChildren();
  journey.dataset.state = "kdramas";
  history.replaceState(null, "", `#${kdramas.id}`);
});

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