window.DayBet = window.DayBet || {};
window.DayBet.finalLetter = `Hoy nuevamente celebro que existes
Me alegraste mucho desde el dia que nos conocimos y intercambiamos palabras por primera vez
Tal vez sea por la forma en la que nos conocimos oh nose pero un recuerdo que atesoro es como recostaba en tus piernas y me acariciabas por un rato te juro que era lo que mas  paz me daba
Eres ese tipo de persona que difícilmente se olvida cuando te llegan ah conocer y te consta el porque lo digo apesar de todo, siempre estas presente y tienes un lugar en mi corazon
Quiero que todos tus sueños por mas difíciles que sean los llegues ah cumplir, no siempre estaré presente pero Siempre querré que tu estes Bien, que nada te falte y seas muy muy feliz
Pronto iniciara una nueva etapa en tu vida y por dificil que pueda llegar ah ser te pido que no te rindas todos confiamos en ti y sabemos que lo lograras y como sabes no soy de palabras esto es puees algo muy pequeño comparado con lo que podria decirte en realidad y todo esto te lo resumo en un
FELIZ CUMPLEAÑOS BETSABE

Ya 18 esta viejiiiitaaaa Jaja`;

(() => {
  const databaseName = "day-bet-photo-settings";
  const storeName = "scene-photos";
  const maximumFileSize = 20 * 1024 * 1024;
  const maximumPixels = 24000000;
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
  const objectUrls = new Map();

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("El almacenamiento de fotos no está disponible en este navegador."));
        return;
      }

      const request = window.indexedDB.open(databaseName, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(storeName)) {
          request.result.createObjectStore(storeName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("No se pudo abrir el almacenamiento de fotos."));
    });
  }

  const databasePromise = openDatabase();

  function readPhoto(database, scene) {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readonly");
      const request = transaction.objectStore(storeName).get(scene);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error("No se pudo cargar la foto guardada."));
    });
  }

  function savePhoto(database, scene, file) {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readwrite");
      transaction.objectStore(storeName).put(file, scene);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error("No se pudo guardar la foto."));
      transaction.onabort = () => reject(transaction.error || new Error("No se pudo guardar la foto."));
    });
  }

  function setPhoto(scene, file) {
    const image = document.querySelector(`[data-scene-image="${scene}"]`);
    if (!image) return;

    const oldUrl = objectUrls.get(scene);
    if (oldUrl) URL.revokeObjectURL(oldUrl);

    const url = URL.createObjectURL(file);
    objectUrls.set(scene, url);
    image.src = url;
    image.hidden = false;
  }

  function setStatus(scene, message) {
    const status = document.querySelector(`[data-photo-status="${scene}"]`);
    if (status) status.textContent = message;
  }

  async function validatePhoto(file) {
    if (!allowedTypes.has(file.type)) {
      throw new Error("Elige una foto JPG, PNG, WebP o AVIF.");
    }
    if (file.size > maximumFileSize) {
      throw new Error("La foto debe pesar menos de 20 MB.");
    }

    let bitmap;
    try {
      bitmap = await createImageBitmap(file);
      if (bitmap.width * bitmap.height > maximumPixels) {
        throw new Error("Elige una foto con un máximo de 24 megapíxeles.");
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Elige")) throw error;
      throw new Error("No se pudo abrir esa foto. Prueba con otra imagen.");
    } finally {
      bitmap?.close();
    }
  }

  async function restorePhotos() {
    try {
      const database = await databasePromise;
      await Promise.all(["welcome", "garden"].map(async (scene) => {
        const file = await readPhoto(database, scene);
        if (file instanceof Blob) setPhoto(scene, file);
      }));
    } catch {
      ["welcome", "garden"].forEach((scene) => {
        setStatus(scene, "No se pudo recuperar la foto guardada.");
      });
    }
  }

  document.querySelectorAll("[data-photo-trigger]").forEach((button) => {
    const scene = button.dataset.photoTrigger;
    const input = document.querySelector(`[data-photo-input="${scene}"]`);
    if (!input) return;

    button.addEventListener("click", () => input.click());
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      input.value = "";
      if (!file) return;

      try {
        await validatePhoto(file);
        setPhoto(scene, file);
        const database = await databasePromise;
        await savePhoto(database, scene, file);
        setStatus(scene, "Foto guardada en este navegador.");
      } catch (error) {
        setStatus(scene, error instanceof Error ? error.message : "No se pudo guardar la foto.");
      }
    });
  });

  restorePhotos();
})();
