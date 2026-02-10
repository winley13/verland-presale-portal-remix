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
// WalletConnect v2
// --------------------
const projectId = "PASTE_YOUR_PROJECT_ID_HERE"; // REQUIRED

const web3Modal = new window.Web3Modal.default({
  projectId,
  themeMode: "dark",
  walletConnectVersion: 2,
  chains: [
    {
      chainId: 1,
      name: "Ethereum",
      currency: "ETH",
      explorerUrl: "https://etherscan.io",
      rpcUrl: "https://rpc.ankr.com/eth"
    }
  ]
});

let provider;
let signer;
let userAddress;

async function connectWallet() {
  try {
    const instance = await web3Modal.connect();

    provider = new ethers.BrowserProvider(instance);
 
// --------------------
// Init - Consolidated
// --------------------
document.addEventListener("DOMContentLoaded", () => {
  // Start countdown timer
  startCountdown();
  
  // Setup wallet connection
  document.getElementById("connect-button").addEventListener("click", connectWallet);
  
  // Setup explore map button
  const exploreBtn = document.getElementById("exploreMapBtn");
  if (exploreBtn) {
    exploreBtn.addEventListener("click", () => {
      window.location.href = "map.html";
    });
  }
});