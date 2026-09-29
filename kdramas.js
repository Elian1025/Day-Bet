const dramas = [
  {
    id: "love-next-door",
    title: "Amor en la puerta de al lado",
    quote: "Que siempre estemos tan cerca como si fuera un Amor en la puerta de al lado, incluso cuando la vida intente ponernos lejos.",
    letter: "E",
    song: "Any Day With You",
    artist: "Muzie",
    audioFile: null,
  },
  {
    id: "a-time-called-you",
    title: "Tu tiempo llama",
    quote: "Y si algún día nuestros caminos se separan, ojalá nuestro corazón siempre recuerde que Tu tiempo llama cuando dos personas todavía tienen algo por encontrarse.",
    letter: "#",
    song: "Never Ending Story",
    artist: "Kim Min Seok (MeloMance)",
    audioFile: null,
  },
  {
    id: "my-demon",
    title: "Mi adorable demonio",
    quote: "Si hasta un demonio puede descubrir que amar también significa proteger, entonces quizá mi adorable demonio favorito también pueda enseñarnos que el amor puede cambiarlo todo.",
    letter: "B",
    song: "With You",
    artist: "WINTER (aespa)",
    audioFile: null,
  },
  {
    id: "moonlight-drawn-by-clouds",
    title: "Amor bajo la luz de la luna",
    quote: "Que algún día podamos quedarnos juntos bajo la luz de la luna, encontrando en ese silencio nuestro propio Amor bajo la luz de la luna.",
    letter: "8",
    song: "Moonlight Drawn by Clouds",
    artist: "Gummy",
    audioFile: null,
  },
  {
    id: "stairway-to-heaven",
    title: "Escalera al cielo",
    quote: "Si para encontrarte tuviera que subir una Escalera al cielo, subiría todos los escalones necesarios para volver a encontrarte.",
    letter: "T",
    song: "I Miss You",
    artist: "Kim Bum Soo",
    audioFile: null,
  },
  {
    id: "boys-over-flowers",
    title: "Boys Over Flowers",
    quote: "Que, como en Boys Over Flowers, podamos descubrir que lo que realmente importa no es el mundo del que venimos, sino la persona que elegimos cuando todo lo demás deja de importar.",
    letter: "A",
    song: "Paradise",
    artist: "T-Max",
    audioFile: null,
  },
  {
    id: "the-king-eternal-monarch",
    title: "El rey: Monarca eterno",
    quote: "Si existieran mil mundos y mil caminos, como en El rey: Monarca eterno, ojalá en cada uno de ellos el destino encontrara la manera de llevarme hasta ti.",
    letter: "B",
    song: "I Just Want to Stay With You",
    artist: "Zion.T",
    audioFile: null,
  },
  {
    id: "welcome-to-samdal-ri",
    title: "De vuelta a Samdal-ri",
    quote: "Y si algún día la vida nos lleva demasiado lejos, como en De vuelta a Samdal-ri, ojalá siempre exista un lugar al que podamos volver y sentirnos en casa.",
    letter: "1",
    song: "Short Hair",
    artist: "DK (DOKYEOM)",
    audioFile: null,
  },
  {
    id: "hometown-cha-cha-cha",
    title: "El amor es como el cha-cha-cha",
    quote: "Que podamos descubrir que El amor es como el cha-cha-cha: a veces avanzar, a veces retroceder, pero siempre encontrando juntos el ritmo.",
    letter: "S",
    song: "Romantic Sunday",
    artist: "Car, the garden",
    audioFile: null,
  },
  {
    id: "alchemy-of-souls",
    title: "Alquimia de almas",
    quote: "Que nuestras almas sepan reconocerse como en Alquimia de almas, incluso cuando la vida cambie nuestra historia, nuestro camino o la forma en que llegamos hasta el otro.",
    letter: "E",
    song: "Scars Leave Beautiful Trace",
    artist: "Car, the garden",
    audioFile: null,
  },
];

const pairSize = 2;
const pairCount = dramas.length / pairSize;

function initKdramas() {
  const journey = document.querySelector(".journey");
  const kdramas = document.querySelector(".kdramas");
  const pair = document.querySelector("[data-drama-pair]");
  const pairLabel = document.querySelector("[data-pair-label]");
  const progressTrack = document.querySelector(".drama-progress__track");
  const progressFill = document.querySelector("[data-progress-fill]");
  const discoveryCount = document.querySelector("[data-discovery-count]");
  const letterTrack = document.querySelector("[data-letter-track]");
  const nextButton = document.querySelector("[data-next-pair]");
  const gerberaTransition = document.querySelector("[data-gerbera-transition]");
  const garden = document.querySelector(".garden-puzzle");
  const audio = document.querySelector("[data-kdrama-audio]");

  if (!journey || !kdramas || !pair || !nextButton) return;

  const dramasById = new Map(dramas.map((drama) => [drama.id, drama]));
  const discovered = new Set();
  let currentPair = 0;
  let activeAudioId = null;
  let activeAudioButton = null;

  function stopAudio() {
    if (!audio) return;

    audio.pause();
    if (audio.currentSrc || audio.getAttribute("src")) {
      audio.currentTime = 0;
      audio.removeAttribute("src");
      audio.load();
    }

    activeAudioButton?.setAttribute("aria-pressed", "false");
    activeAudioId = null;
    activeAudioButton = null;
  }

  function toggleAudio(drama, button) {
    if (!audio || !drama.audioFile) return;

    if (activeAudioId === drama.id) {
      if (audio.paused) {
        audio.play().then(() => button.setAttribute("aria-pressed", "true")).catch(() => {
          button.hidden = true;
          stopAudio();
        });
      } else {
        audio.pause();
        button.setAttribute("aria-pressed", "false");
      }
      return;
    }

    stopAudio();
    audio.src = drama.audioFile;
    activeAudioId = drama.id;
    activeAudioButton = button;
    button.setAttribute("aria-pressed", "true");
    audio.play().catch(() => {
      button.hidden = true;
      stopAudio();
    });
  }

  function makeAudioButton(drama) {
    if (!drama.audioFile) return null;

    const button = document.createElement("button");
    button.className = "drama-card__audio";
    button.type = "button";
    button.setAttribute("aria-label", `Reproducir ${drama.song}`);
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 10v4h3l4 3V7l-4 3H5Zm11-2a6 6 0 0 1 0 8m2-10a9 9 0 0 1 0 12" /></svg>';
    button.addEventListener("click", () => toggleAudio(drama, button));
    return button;
  }

  function makeDramaCard(drama) {
    const card = document.createElement("article");
    card.className = "drama-card";
    card.dataset.dramaId = drama.id;

    const heading = document.createElement("div");
    heading.className = "drama-card__heading";

    const number = document.createElement("p");
    number.className = "drama-card__number";
    const dramaNumber = dramas.findIndex((item) => item.id === drama.id) + 1;
    number.textContent = `RECUERDO ${String(dramaNumber).padStart(2, "0")}`;

    const title = document.createElement("h3");
    title.className = "drama-card__title";
    title.textContent = drama.title;

    heading.append(number, title);

    const quote = document.createElement("p");
    quote.className = "drama-card__quote";
    quote.textContent = `“${drama.quote}”`;

    const music = document.createElement("div");
    music.className = "drama-card__music";

    const musicMark = document.createElement("span");
    musicMark.className = "drama-card__music-mark";
    musicMark.setAttribute("aria-hidden", "true");
    musicMark.innerHTML = "<i></i><i></i><i></i><i></i>";

    const musicDetails = document.createElement("div");
    musicDetails.className = "drama-card__music-details";
    const songLabel = document.createElement("span");
    songLabel.className = "drama-card__music-label";
    songLabel.textContent = "En su banda sonora";
    const songTitle = document.createElement("p");
    songTitle.className = "drama-card__song";
    songTitle.textContent = drama.song;
    const artist = document.createElement("p");
    artist.className = "drama-card__artist";
    artist.textContent = drama.artist;
    musicDetails.append(songLabel, songTitle, artist);

    const audioButton = makeAudioButton(drama);
    music.append(musicMark, musicDetails);
    if (audioButton) music.append(audioButton);

    const secret = document.createElement("div");
    secret.className = "drama-card__secret";

    const revealButton = document.createElement("button");
    revealButton.className = "drama-card__discover";
    revealButton.type = "button";
    revealButton.textContent = "Descubrir la señal";

    const letter = document.createElement("span");
    letter.className = "drama-card__letter";
    letter.hidden = true;
    letter.setAttribute("aria-label", `Señal de ${drama.title}`);

    revealButton.addEventListener("click", () => {
      if (discovered.has(drama.id)) return;

      discovered.add(drama.id);
      letter.textContent = drama.letter;
      letter.hidden = false;
      revealButton.hidden = true;
      card.classList.add("is-discovered");
      updateDiscoveries();
      updateNextButton();
    });

    secret.append(revealButton, letter);
    card.append(heading, quote, music, secret);
    return card;
  }

  function updateDiscoveries() {
    discoveryCount.textContent = `${discovered.size} de ${dramas.length} señales encontradas`;
    letterTrack.replaceChildren();

    dramas.forEach((drama, index) => {
      const item = document.createElement("li");
      item.className = discovered.has(drama.id) ? "is-found" : "is-waiting";
      item.textContent = discovered.has(drama.id) ? drama.letter : "";
      item.setAttribute("aria-label", discovered.has(drama.id) ? `Señal ${index + 1} encontrada` : `Señal ${index + 1} pendiente`);
      letterTrack.append(item);
    });
  }

  function updateNextButton() {
    const shownDramas = dramas.slice(currentPair * pairSize, (currentPair + 1) * pairSize);
    nextButton.disabled = !shownDramas.every((drama) => discovered.has(drama.id));
    nextButton.querySelector("span").textContent = currentPair === pairCount - 1 ? "Ir al jardín" : "Continuar";
  }

  function renderPair() {
    const start = currentPair * pairSize;
    const shownDramas = dramas.slice(start, start + pairSize);
    pair.replaceChildren(...shownDramas.map((drama) => makeDramaCard(drama)));
    pairLabel.textContent = `Recuerdo ${currentPair + 1} de ${pairCount}`;
    progressTrack.setAttribute("aria-valuenow", String(currentPair + 1));
    progressFill.style.width = `${((currentPair + 1) / pairCount) * 100}%`;
    updateNextButton();
  }

  function addGerberaPetals() {
    const fragment = document.createDocumentFragment();
    const columns = 15;
    const rows = 10;

    for (let index = 0; index < columns * rows; index += 1) {
      const petal = document.createElement("span");
      const column = index % columns;
      const row = Math.floor(index / columns);
      const hue = 19 + Math.round(Math.random() * 34);

      petal.className = "gerbera-transition__petal";
      petal.style.setProperty("--x", `${((column + Math.random()) / columns) * 100}%`);
      petal.style.setProperty("--y", `${((row + Math.random()) / rows) * 100}%`);
      petal.style.setProperty("--from-x", `${Math.round((Math.random() - 0.5) * 110)}vw`);
      petal.style.setProperty("--from-y", `${Math.round((Math.random() - 0.5) * 110)}vh`);
      petal.style.setProperty("--spin", `${Math.round(Math.random() * 360 - 180)}deg`);
      petal.style.setProperty("--petal-color", `hsl(${hue} 77% ${64 + Math.round(Math.random() * 10)}%)`);
      petal.style.setProperty("--delay", `${Math.round(Math.random() * 420)}ms`);
      fragment.append(petal);
    }

    gerberaTransition.replaceChildren(fragment);
  }

  function revealGarden() {
    stopAudio();
    window.DayBet.initGardenPuzzle(dramas.map(({ id, letter }) => ({ id, character: letter })));
    kdramas.hidden = true;
    garden.hidden = false;
    journey.dataset.state = "garden-revealing";
    history.replaceState(null, "", `#${garden.id}`);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gerberaTransition.hidden = true;
      gerberaTransition.classList.remove("is-covering", "is-clearing");
      journey.dataset.state = "garden";
      garden.querySelector("#garden-title").focus({ preventScroll: true });
      return;
    }

    gerberaTransition.classList.add("is-clearing");
  }

  function beginGerberaTransition() {
    if (discovered.size !== dramas.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealGarden();
      return;
    }

    addGerberaPetals();
    gerberaTransition.classList.remove("is-clearing");
    gerberaTransition.hidden = false;
    journey.dataset.state = "gerbera-transition";
    window.requestAnimationFrame(() => gerberaTransition.classList.add("is-covering"));
    window.setTimeout(revealGarden, 2250);
  }

  nextButton.addEventListener("click", () => {
    if (nextButton.disabled) return;
    nextButton.disabled = true;

    if (currentPair === pairCount - 1) {
      beginGerberaTransition();
      return;
    }

    stopAudio();
    pair.classList.add("is-changing");
    window.setTimeout(() => {
      currentPair += 1;
      renderPair();
      window.requestAnimationFrame(() => pair.classList.remove("is-changing"));
    }, 180);
  });

  gerberaTransition.addEventListener("transitionend", (event) => {
    if (event.target !== gerberaTransition || event.propertyName !== "opacity" || journey.dataset.state !== "garden-revealing") return;

    gerberaTransition.hidden = true;
    gerberaTransition.replaceChildren();
    gerberaTransition.classList.remove("is-covering", "is-clearing");
    journey.dataset.state = "garden";
    garden.querySelector("#garden-title").focus({ preventScroll: true });
  });

  audio?.addEventListener("ended", stopAudio);
  audio?.addEventListener("error", () => {
    if (activeAudioButton) activeAudioButton.hidden = true;
    stopAudio();
  });
  updateDiscoveries();
  renderPair();
}

window.DayBet = window.DayBet || {};
window.DayBet.initKdramas = initKdramas;