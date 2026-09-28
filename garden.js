const gardenSolution = ["B", "E", "T", "S", "A", "B", "E", "#", "1", "8"];
let gardenHasStarted = false;

function shufflePieces(pieces) {
  const shuffled = [...pieces];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[otherIndex]] = [shuffled[otherIndex], shuffled[index]];
  }

  if (shuffled.every((piece, index) => piece.id === pieces[index].id)) shuffled.reverse();
  return shuffled;
}

function initGardenPuzzle(pieces) {
  const garden = document.querySelector(".garden-puzzle");
  const board = document.querySelector("[data-puzzle-board]");
  const tray = document.querySelector("[data-puzzle-tray]");
  const status = document.querySelector("[data-puzzle-status]");
  const gardenLights = document.querySelector("[data-garden-lights]");
  const dahliaTransition = document.querySelector("[data-dahlia-transition]");
  const finalSurprise = document.querySelector(".final-surprise");

  if (gardenHasStarted || !garden || !board || !tray || !status || !dahliaTransition || !finalSurprise) return;
  if (!Array.isArray(pieces) || pieces.length !== gardenSolution.length) {
    status.textContent = "Aún faltan algunas señales del jardín.";
    return;
  }

  gardenHasStarted = true;

  const shuffledPieces = shufflePieces(pieces.map((piece, index) => ({
    id: `garden-piece-${index}`,
    number: index + 1,
    character: piece.character,
  })));
  const piecesById = new Map(shuffledPieces.map((piece) => [piece.id, piece]));
  const pieceButtons = new Map();
  const slots = Array(gardenSolution.length).fill(null);
  const slotElements = [];
  const blooms = [...garden.querySelectorAll(".garden-bloom")];
  let selectedPieceId = null;
  let activeDrag = null;
  let suppressClick = false;
  let correctCount = 0;
  let isComplete = false;
  let mistakeTimer = 0;

  function currentCorrectCount() {
    return slots.reduce((count, pieceId, slotIndex) => {
      if (pieceId && piecesById.get(pieceId).character === gardenSolution[slotIndex]) return count + 1;
      return count;
    }, 0);
  }

  function updateScene(nextCount, hasMistake = false) {
    const progress = nextCount / gardenSolution.length;
    const dimming = Math.max(0, 0.58 - progress * 0.58 + (hasMistake ? 0.08 : 0));

    garden.dataset.correct = String(nextCount);
    garden.dataset.feedback = hasMistake ? "incorrect" : "";
    garden.style.setProperty("--garden-life", String(progress));
    garden.style.setProperty("--garden-dimming", String(dimming));
    garden.style.setProperty("--garden-brightness", String(0.58 + progress * 0.42));
    garden.style.setProperty("--garden-saturation", String(0.32 + progress * 0.68));
    garden.style.setProperty("--garden-sky-light", String(0.08 + progress * 0.74));
    garden.style.setProperty("--garden-sunlight", String(progress * 0.84));

    blooms.forEach((bloom, index) => {
      const lean = index % 2 === 0 ? -13 : 11;
      const mistakeLean = hasMistake ? Math.sign(lean) * 2 : 0;
      bloom.style.setProperty("--bloom-tilt", `${lean * (1 - progress) + mistakeLean}deg`);
      bloom.style.setProperty("--bloom-rise", `${-progress * 0.8}rem`);
    });
  }

  function updateAccessibleNames() {
    slotElements.forEach((slot, index) => {
      const pieceId = slots[index];
      const piece = pieceId ? piecesById.get(pieceId) : null;
      slot.setAttribute("aria-label", piece
        ? `Lugar ${index + 1}, ficha ${piece.character}`
        : `Lugar ${index + 1}, vacío`);
      slot.classList.toggle("has-piece", Boolean(piece));
    });

    pieceButtons.forEach((button, pieceId) => {
      const piece = piecesById.get(pieceId);
      const slotIndex = slots.indexOf(pieceId);
      const location = slotIndex < 0 ? "en la bandeja" : `en el lugar ${slotIndex + 1}`;
      const isSelected = selectedPieceId === pieceId;

      button.setAttribute("aria-label", `Ficha ${piece.number}: ${piece.character}, ${location}`);
      button.setAttribute("aria-pressed", String(isSelected));
      button.classList.toggle("is-selected", isSelected);
    });
  }

  function messageForProgress(count) {
    if (count === 0) return "El jardín todavía duerme.";
    if (count <= 2) return `Una luz vuelve al jardín · ${count} de 10`;
    if (count <= 4) return `Las flores empiezan a despertar · ${count} de 10`;
    if (count <= 6) return `El cielo recupera su luz · ${count} de 10`;
    if (count <= 8) return `El atardecer vuelve a encenderse · ${count} de 10`;
    if (count === 9) return "Una señal más y todo florecerá.";
    return "Todas las señales encontraron su lugar.";
  }

  function addGardenLights() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 20; index += 1) {
      const light = document.createElement("span");
      light.className = "garden-light";
      light.style.setProperty("--light-x", `${Math.round(Math.random() * 94 + 3)}%`);
      light.style.setProperty("--light-y", `${Math.round(Math.random() * 73 + 10)}%`);
      light.style.setProperty("--light-delay", `${Math.round(Math.random() * 1800)}ms`);
      fragment.append(light);
    }

    gardenLights.replaceChildren(fragment);
  }

  function makeDahliaPetals() {
    const fragment = document.createDocumentFragment();
    const columns = 15;
    const rows = 10;

    for (let index = 0; index < columns * rows; index += 1) {
      const petal = document.createElement("span");
      const column = index % columns;
      const row = Math.floor(index / columns);
      const hue = 326 + Math.round(Math.random() * 45);

      petal.className = "dahlia-transition__petal";
      petal.style.setProperty("--x", `${((column + Math.random()) / columns) * 100}%`);
      petal.style.setProperty("--y", `${((row + Math.random()) / rows) * 100}%`);
      petal.style.setProperty("--from-x", `${Math.round((Math.random() - 0.5) * 115)}vw`);
      petal.style.setProperty("--from-y", `${Math.round((Math.random() - 0.5) * 115)}vh`);
      petal.style.setProperty("--spin", `${Math.round(Math.random() * 420 - 210)}deg`);
      petal.style.setProperty("--petal-color", `hsl(${hue} 67% ${62 + Math.round(Math.random() * 12)}%)`);
      petal.style.setProperty("--delay", `${Math.round(Math.random() * 420)}ms`);
      fragment.append(petal);
    }

    dahliaTransition.replaceChildren(fragment);
  }

  function showFinalSurprise() {
    garden.hidden = true;
    finalSurprise.hidden = false;
    document.querySelector(".journey").dataset.state = "dahlia-revealing";
    history.replaceState(null, "", `#${finalSurprise.id}`);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dahliaTransition.hidden = true;
      gardenLights.replaceChildren();
      document.querySelector(".journey").dataset.state = "final";
      window.DayBet.prepareFinalSurprise();
      finalSurprise.querySelector("#surprise-title").focus({ preventScroll: true });
      return;
    }

    dahliaTransition.classList.add("is-clearing");
  }

  function beginDahliaTransition() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showFinalSurprise();
      return;
    }

    makeDahliaPetals();
    dahliaTransition.classList.remove("is-clearing");
    dahliaTransition.hidden = false;
    document.querySelector(".journey").dataset.state = "dahlia-transition";
    window.requestAnimationFrame(() => dahliaTransition.classList.add("is-covering"));
    window.setTimeout(showFinalSurprise, 2250);
  }

  function completeGarden() {
    if (isComplete) return;
    isComplete = true;
    window.clearTimeout(mistakeTimer);
    selectedPieceId = null;
    pieceButtons.forEach((button) => { button.disabled = true; });
    slotElements.forEach((slot) => { slot.tabIndex = -1; });
    updateAccessibleNames();
    updateScene(gardenSolution.length);
    status.textContent = messageForProgress(gardenSolution.length);
    status.focus({ preventScroll: true });
    addGardenLights();
    const finalPause = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 3200;
    window.setTimeout(beginDahliaTransition, finalPause);
  }

  function updateAfterMove(targetIndex, pieceId, wasReturned = false) {
    const nextCount = currentCorrectCount();
    const placedPiece = pieceId ? piecesById.get(pieceId) : null;
    const isWrong = targetIndex !== null && placedPiece?.character !== gardenSolution[targetIndex];

    correctCount = nextCount;
    updateAccessibleNames();
    updateScene(nextCount, isWrong);

    if (nextCount === gardenSolution.length) {
      completeGarden();
      return;
    }

    if (isWrong) {
      status.textContent = "No pasa nada. Prueba otro lugar para esa señal.";
      window.clearTimeout(mistakeTimer);
      mistakeTimer = window.setTimeout(() => {
        updateScene(correctCount);
        status.textContent = messageForProgress(correctCount);
      }, 950);
      return;
    }

    status.textContent = wasReturned ? "La señal vuelve a esperar en el jardín." : messageForProgress(nextCount);
  }

  function selectPiece(pieceId) {
    if (isComplete) return;
    selectedPieceId = selectedPieceId === pieceId ? null : pieceId;
    updateAccessibleNames();
    if (selectedPieceId) status.textContent = "Señal seleccionada.";
  }

  function placePiece(pieceId, targetIndex) {
    if (isComplete || targetIndex < 0 || targetIndex >= slots.length) return;

    const sourceIndex = slots.indexOf(pieceId);
    if (sourceIndex === targetIndex) {
      selectedPieceId = null;
      updateAccessibleNames();
      return;
    }

    const displacedId = slots[targetIndex];
    if (sourceIndex >= 0) {
      slots[sourceIndex] = displacedId;
      if (displacedId) slotElements[sourceIndex].append(pieceButtons.get(displacedId));
    } else if (displacedId) {
      tray.append(pieceButtons.get(displacedId));
    }

    slots[targetIndex] = pieceId;
    slotElements[targetIndex].append(pieceButtons.get(pieceId));
    selectedPieceId = null;
    updateAfterMove(targetIndex, pieceId);
  }

  function returnPieceToTray(pieceId) {
    if (isComplete) return;

    const sourceIndex = slots.indexOf(pieceId);
    if (sourceIndex >= 0) slots[sourceIndex] = null;
    tray.append(pieceButtons.get(pieceId));
    selectedPieceId = null;
    updateAfterMove(null, null, true);
  }

  function useSlot(slotIndex) {
    if (isComplete) return;

    if (selectedPieceId) {
      placePiece(selectedPieceId, slotIndex);
      return;
    }

    if (slots[slotIndex]) {
      selectPiece(slots[slotIndex]);
      return;
    }

    status.textContent = "Elige una señal para este lugar.";
  }

  function clearFloatingStyle(button) {
    button.classList.remove("is-dragging");
    ["position", "zIndex", "left", "top", "width", "height"].forEach((property) => {
      button.style.removeProperty(property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`));
    });
  }

  function addPointerControls(button, pieceId) {
    button.addEventListener("pointerdown", (event) => {
      if (isComplete || (event.pointerType === "mouse" && event.button !== 0)) return;

      const bounds = button.getBoundingClientRect();
      activeDrag = {
        button,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        grabX: event.clientX - bounds.left,
        grabY: event.clientY - bounds.top,
        width: bounds.width,
        height: bounds.height,
        moved: false,
      };

      button.setPointerCapture(event.pointerId);
    });

    button.addEventListener("pointermove", (event) => {
      if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;

      const distance = Math.hypot(event.clientX - activeDrag.startX, event.clientY - activeDrag.startY);
      if (!activeDrag.moved && distance < 8) return;

      if (!activeDrag.moved) {
        activeDrag.moved = true;
        button.classList.add("is-dragging");
        button.style.position = "fixed";
        button.style.zIndex = "20";
        button.style.width = `${activeDrag.width}px`;
        button.style.height = `${activeDrag.height}px`;
      }

      button.style.left = `${event.clientX - activeDrag.grabX}px`;
      button.style.top = `${event.clientY - activeDrag.grabY}px`;
    });

    button.addEventListener("pointerup", (event) => {
      if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;

      const drag = activeDrag;
      activeDrag = null;
      if (!drag.moved) return;

      const target = document.elementFromPoint(event.clientX, event.clientY);
      const slot = target?.closest("[data-puzzle-slot]");
      const isTray = target?.closest("[data-puzzle-tray]");
      clearFloatingStyle(button);
      suppressClick = true;
      window.setTimeout(() => { suppressClick = false; }, 0);

      if (slot) placePiece(pieceId, Number(slot.dataset.puzzleSlot));
      else if (isTray) returnPieceToTray(pieceId);
    });

    button.addEventListener("pointercancel", (event) => {
      if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
      activeDrag = null;
      clearFloatingStyle(button);
    });
  }

  gardenSolution.forEach((_, index) => {
    const slot = document.createElement("div");
    slot.className = "puzzle-slot";
    slot.dataset.puzzleSlot = String(index);
    slot.tabIndex = 0;
    slot.setAttribute("role", "group");

    const number = document.createElement("span");
    number.className = "puzzle-slot__number";
    number.textContent = String(index + 1).padStart(2, "0");
    slot.append(number);

    slot.addEventListener("click", (event) => {
      if (!event.target.closest(".puzzle-piece")) useSlot(index);
    });
    slot.addEventListener("keydown", (event) => {
      if (event.target !== slot || (event.key !== "Enter" && event.key !== " ")) return;
      event.preventDefault();
      useSlot(index);
    });

    slotElements.push(slot);
    board.append(slot);
  });

  shuffledPieces.forEach((piece) => {
    const button = document.createElement("button");
    button.className = "puzzle-piece";
    button.type = "button";
    button.dataset.puzzlePiece = piece.id;
    button.textContent = piece.character;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      if (suppressClick) {
        suppressClick = false;
        return;
      }

      const occupiedSlot = slots.indexOf(piece.id);
      if (selectedPieceId && selectedPieceId !== piece.id && occupiedSlot >= 0) {
        placePiece(selectedPieceId, occupiedSlot);
        return;
      }

      selectPiece(piece.id);
    });
    addPointerControls(button, piece.id);
    pieceButtons.set(piece.id, button);
    tray.append(button);
  });

  dahliaTransition.addEventListener("transitionend", (event) => {
    if (event.target !== dahliaTransition || event.propertyName !== "opacity") return;
    if (document.querySelector(".journey").dataset.state !== "dahlia-revealing") return;

    dahliaTransition.hidden = true;
    dahliaTransition.replaceChildren();
    dahliaTransition.classList.remove("is-covering", "is-clearing");
    gardenLights.replaceChildren();
    document.querySelector(".journey").dataset.state = "final";
    window.DayBet.prepareFinalSurprise();
    finalSurprise.querySelector("#surprise-title").focus({ preventScroll: true });
  });

  correctCount = currentCorrectCount();
  updateAccessibleNames();
  updateScene(correctCount);
}

window.DayBet = window.DayBet || {};
window.DayBet.initGardenPuzzle = initGardenPuzzle;