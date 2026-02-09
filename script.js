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
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();

    const short =
      `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;

    document.getElementById("connect-button").innerText = short;
    console.log("Wallet connected:", userAddress);
  } catch (err) {
    console.error("Wallet connection failed:", err);
  }
}

// --------------------
// Explore Map Button
// --------------------
document.addEventListener("DOMContentLoaded", () => {
  startCountdown();

  document
    .getElementById("connect-button")
    .addEventListener("click", connectWallet);

  // Explore Map button - navigate to map.html
  const exploreMapBtn = document.getElementById("exploreMapBtn");
  if (exploreMapBtn) {
    exploreMapBtn.addEventListener("click", () => {
      window.location.href = "/map.html";
    });
  }

  // Buy Land button
  const buyLandBtn = document.getElementById("buyLandBtn");
  if (buyLandBtn) {
    buyLandBtn.addEventListener("click", () => {
      // Scroll to presale section
      document.getElementById("presale").scrollIntoView({ behavior: "smooth" });
    });
  }
});

// Quantity changer
function changeQty(delta) {
  const input = document.getElementById("mint-qty");
  if (!input) return;
  
  let val = parseInt(input.value) + delta;
  if (val < 1) val = 1;
  if (val > 10) val = 10;
  input.value = val;
}
