const welcome = document.querySelector(".welcome");
const video = document.querySelector(".welcome__video");
const continueLink = document.querySelector("[data-next-section]");
const continueStatus = document.querySelector(".welcome__status");
const videoNotice = document.querySelector(".welcome__video-notice");

video.addEventListener("error", () => {
  videoNotice.hidden = false;
}, { once: true });

continueLink.addEventListener("click", (event) => {
  event.preventDefault();
  continueStatus.hidden = false;
  welcome.dataset.state = "continuing";
  history.replaceState(null, "", `#${continueLink.dataset.nextSection}`);
});