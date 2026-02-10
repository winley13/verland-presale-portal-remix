// --------------------
// Countdown Timer
// --------------------
function startCountdown() {
  const endDate = new Date("Dec 31, 2026 00:00:00").getTime();

  setInterval(() => {
    const now = Date.now();
    const diff = endDate - now;

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    document.getElementById("timer").innerText =
      `${d}d ${h}h ${m}m ${s}s`;
  }, 1000);
}

// --------------------
// Init
// --------------------
document.addEventListener("DOMContentLoaded", () => {
  startCountdown();
  
  // Setup explore map button
  const exploreBtn = document.getElementById("exploreMapBtn");
  if (exploreBtn) {
    exploreBtn.addEventListener("click", () => {
      console.log("Explore Map button clicked!");
      window.location.href = "map.html";
    });
  }
});