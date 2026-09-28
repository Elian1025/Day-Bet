function prepareFinalSurprise() {
  const finale = document.querySelector(".final-surprise");
  if (!finale || finale.hidden) return;

  finale.classList.add("is-arrived");
  const letterLines = [...finale.querySelectorAll("[data-letter-line]")];
  letterLines.forEach((line, index) => {
    line.classList.add("final-surprise__letter-line");
    line.style.setProperty("--line-delay", `${index * 170}ms`);
  });

  const finalPhrase = finale.querySelector("[data-final-phrase]");
  if (finalPhrase) {
    finalPhrase.classList.add("final-surprise__letter-line");
    finalPhrase.style.setProperty("--line-delay", `${letterLines.length * 170 + 120}ms`);
  }
}

window.DayBet = window.DayBet || {};
window.DayBet.prepareFinalSurprise = prepareFinalSurprise;