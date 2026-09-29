function prepareFinalSurprise() {
  const finale = document.querySelector(".final-surprise");
  if (!finale || finale.hidden) return;

  const personalLetter = finale.querySelector("[data-personal-letter]");
  const letterSignoff = finale.querySelector("[data-letter-signoff]");
  const letterSections = String(window.DayBet.finalLetter || "").split(/\n{2,}/);
  const signoffText = letterSections.pop() || "";
  if (personalLetter) personalLetter.textContent = letterSections.join("\n\n");
  if (letterSignoff) letterSignoff.textContent = signoffText;

  const letterScroll = finale.querySelector("[data-letter-scroll]");
  const letterToggle = finale.querySelector("[data-letter-toggle]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (letterScroll && letterToggle && !prefersReducedMotion) {
    window.requestAnimationFrame(() => {
      if (letterScroll.scrollHeight <= letterScroll.clientHeight + 1) return;

      let isPaused = false;
      let animationFrame = 0;
      let previousFrame = 0;

      function updateToggle() {
        const label = isPaused ? "Reanudar desplazamiento de la carta" : "Pausar desplazamiento de la carta";
        letterToggle.setAttribute("aria-pressed", String(isPaused));
        letterToggle.setAttribute("aria-label", label);
        letterToggle.title = label;
        letterToggle.dataset.paused = String(isPaused);
      }

      function pauseReading() {
        isPaused = true;
        previousFrame = 0;
        window.cancelAnimationFrame(animationFrame);
        updateToggle();
      }

      function scrollLetter(timestamp) {
        if (isPaused) return;
        if (!previousFrame) previousFrame = timestamp;
        const elapsed = Math.min(timestamp - previousFrame, 100);
        previousFrame = timestamp;

        const maximumScroll = letterScroll.scrollHeight - letterScroll.clientHeight;
        letterScroll.scrollTop = Math.min(maximumScroll, letterScroll.scrollTop + elapsed * 0.006);
        if (letterScroll.scrollTop >= maximumScroll - 1) {
          pauseReading();
          letterToggle.disabled = true;
          letterToggle.setAttribute("aria-label", "Carta leída. El remate permanece visible.");
          letterToggle.title = "Carta leída. El remate permanece visible.";
          return;
        }

        animationFrame = window.requestAnimationFrame(scrollLetter);
      }

      letterToggle.hidden = false;
      updateToggle();
      letterToggle.addEventListener("click", () => {
        isPaused = !isPaused;
        previousFrame = 0;
        if (isPaused) window.cancelAnimationFrame(animationFrame);
        else animationFrame = window.requestAnimationFrame(scrollLetter);
        updateToggle();
      });
      ["wheel", "touchstart", "pointerdown"].forEach((eventName) => {
        letterScroll.addEventListener(eventName, pauseReading, { passive: true });
      });
      letterScroll.addEventListener("keydown", (event) => {
        if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
          pauseReading();
        }
      });
      animationFrame = window.requestAnimationFrame(scrollLetter);
    });
  }

  finale.classList.add("is-arrived");
}

window.DayBet = window.DayBet || {};
window.DayBet.prepareFinalSurprise = prepareFinalSurprise;