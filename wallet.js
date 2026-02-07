/* ===============================
   WALLET FUNCTIONS
================================ */

// Wallet state
let wcProvider;
let signer;
let userAddress;
let currentChainId = null;
let walletBalance = '0';
let walletConnected = false;

// Device detection
const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

/* ===============================
   WALLET SELECTOR
================================ */

function showWalletSelector() {
    // Remove existing modal
    const existingModal = document.querySelector('.wallet-selector-modal');
    if (existingModal) existingModal.remove();
    
    const modalHTML = `
        <div class="wallet-selector-modal">
            <div class="wallet-selector-content">
                <div class="wallet-selector-header">
                    <h2>Connect Wallet</h2>
                    <p>Choose your preferred wallet to continue</p>
                </div>
                
                <div class="wallet-options">
                    <div class="wallet-option" onclick="connectMetaMask()">
                        <i class="fas fa-fox"></i>
                        <div class="wallet-option-info">
                            <div class="wallet-option-name">MetaMask</div>
                            <div class="wallet-option-description">Browser extension & mobile app</div>
                        </div>
                    </div>
                    
                    <div class="wallet-option" onclick="connectCoinbase()">
                        <i class="fab fa-bitcoin"></i>
                        <div class="wallet-option-info">
                            <div class="wallet-option-name">Coinbase Wallet</div>
                            <div class="wallet-option-description">Mobile app & browser extension</div>
                        </div>
                    </div>
                    
                    <div class="wallet-option" onclick="connectWalletConnect()">
                        <i class="fas fa-qrcode"></i>
                        <div class="wallet-option-info">
                            <div class="wallet-option-name">WalletConnect</div>
                            <div class="wallet-option-description">Scan QR code with any wallet</div>
                        </div>
                    </div>
                    
                    <div class="wallet-option" onclick="connectOther()">
                        <i class="fas fa-wallet"></i>
                        <div class="wallet-option-info">
                            <div class="wallet-option-name">Other Wallets</div>
                            <div class="wallet-option-description">Trust Wallet, Rainbow, etc.</div>
                        </div>
                    </div>
                </div>
                
                <div class="wallet-qr-container" id="wallet-qr-container">
                    <h4>Scan with WalletConnect</h4>
                    <canvas id="qr-canvas"></canvas>
                </div>
                
                <button class="close-selector-btn" onclick="closeWalletSelector()">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeWalletSelector() {
    const modal = document.querySelector('.wallet-selector-modal');
    if (modal) modal.remove();
}

/* ===============================
   WALLET CONNECTION
================================ */

async function connectMetaMask() {
    try {
        closeWalletSelector();
        
        if (typeof window.ethereum === 'undefined') {
            if (confirm('MetaMask is not installed. Would you like to install it?')) {
                window.open('https://metamask.io/download/', '_blank');
            }
            return;
        }
        
        showNotification('Connecting to MetaMask...', 'info');
        
        // Request accounts
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        if (accounts.length === 0) {
            showNotification('Please unlock MetaMask', 'warning');
            return;
        }
        
        userAddress = accounts[0];
        
        // Get chain ID
        const chainId = await window.ethereum.request({ 
            method: 'eth_chainId' 
        });
        currentChainId = parseInt(chainId);
        
        // Create ethers provider
        const provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        walletConnected = true;
        
        await updateWalletInfo();
        showNotification(`✅ Connected with MetaMask: ${userAddress.slice(0,6)}...${userAddress.slice(-4)}`, 'success');
        
        // Setup event listeners
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        
    } catch (error) {
        console.error('MetaMask connection error:', error);
        
        if (error.code === 4001) {
            showNotification('Connection rejected by user', 'warning');
        } else if (error.code === -32002) {
            showNotification('MetaMask is already processing a request. Please check your wallet.', 'warning');
        } else {
            showNotification('Failed to connect MetaMask', 'error');
        }
    }
}

async function connectCoinbase() {
    try {
        closeWalletSelector();
        
        if (typeof window.ethereum === 'undefined') {
            if (isMobileDevice) {
                window.location.href = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.href)}`;
            } else {
                showNotification('Coinbase Wallet not detected. Please install it first.', 'warning');
            }
            return;
        }
        
        // Check if it's Coinbase Wallet
        if (window.ethereum.isCoinbaseWallet) {
            await connectMetaMask(); // Same API as MetaMask
        } else {
            showNotification('Please install Coinbase Wallet', 'warning');
        }
        
    } catch (error) {
        console.error('Coinbase connection error:', error);
        showNotification('Failed to connect Coinbase Wallet', 'error');
    }
}

async function connectWalletConnect() {
    try {
        closeWalletSelector();
        
        if (typeof WalletConnectEthereumProvider === 'undefined') {
            showNotification('WalletConnect not loaded. Please refresh the page.', 'error');
            return;
        }
        
        showNotification('Initializing WalletConnect...', 'info');
        
        // Initialize WalletConnect provider
        wcProvider = await WalletConnectEthereumProvider.init({
            projectId: CONFIG.walletConnectProjectId,
            chains: [CONFIG.defaultChainId],
            showQrModal: false,
            methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData"],
            events: ["chainChanged", "accountsChanged", "disconnect"],
            qrModalOptions: {
                themeMode: 'dark',
                themeVariables: {
                    '--wcm-z-index': '4000'
                }
            }
        });
        
        // Get WC URI
        const wcUri = await wcProvider.getUri();
        
        if (isMobileDevice && wcUri) {
            window.location.href = `https://walletconnect.com/wc?uri=${encodeURIComponent(wcUri)}`;
        } else {
            const qrContainer = document.getElementById('wallet-qr-container');
            if (qrContainer) {
                qrContainer.style.display = 'block';
                
                // Generate QR code
                QRCode.toCanvas(document.getElementById('qr-canvas'), wcUri, {
                    width: 220,
                    height: 220,
                    color: {
                        dark: '#B6FE05',
                        light: '#FFFFFF',
                    },
                    margin: 1
                }, (error) => {
                    if (error) {
                        console.error('QR code error:', error);
                        qrContainer.innerHTML = '<p style="color: #f44336; padding: 20px;">Failed to generate QR code</p>';
                    }
                });
            }
            
            // Listen for connection
            wcProvider.on("connect", handleWalletConnectConnect);
            wcProvider.on("disconnect", handleWalletDisconnect);
        }
        
    } catch (error) {
        console.error('WalletConnect error:', error);
        
        if (error.message.includes('User rejected')) {
            showNotification('Connection rejected by user', 'warning');
        } else if (error.message.includes('session rejected')) {
            showNotification('Session rejected', 'warning');
        } else {
            showNotification('Failed to connect with WalletConnect', 'error');
        }
    }
}

async function connectOther() {
    try {
        closeWalletSelector();
        
        if (isMobileDevice) {
            const userAgent = navigator.userAgent.toLowerCase();
            
            if (userAgent.includes('trust')) {
                window.location.href = `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(window.location.href)}`;
            } else if (userAgent.includes('rainbow')) {
                window.location.href = `https://rnbwapp.com/dapp?url=${encodeURIComponent(window.location.href)}`;
            } else {
                if (window.ethereum) {
                    await connectMetaMask();
                } else {
                    showNotification('No wallet detected. Please install a wallet first.', 'warning');
                }
            }
        } else {
            await connectWalletConnect();
        }
        
    } catch (error) {
        console.error('Other wallet connection error:', error);
        showNotification('Failed to connect wallet', 'error');
    }
}

/* ===============================
   EVENT HANDLERS
================================ */

async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        await disconnectWallet();
    } else {
        userAddress = accounts[0];
        updateWalletUI();
        showNotification(`Account changed: ${userAddress.slice(0,6)}...`, 'info');
        await updateWalletInfo();
    }
}

function handleChainChanged(chainId) {
    currentChainId = parseInt(chainId);
    updateWalletUI();
    showNotification(`Network changed to ${getNetworkName(currentChainId)}`, 'info');
}

async function handleWalletConnectConnect() {
    try {
        const provider = new ethers.BrowserProvider(wcProvider);
        signer = await provider.getSigner();
        userAddress = await signer.getAddress();
        currentChainId = CONFIG.defaultChainId;
        walletConnected = true;
        
        await updateWalletInfo();
        closeWalletSelector();
        showNotification(`✅ Connected with WalletConnect: ${userAddress.slice(0,6)}...${userAddress.slice(-4)}`, 'success');
        
        // Setup event listeners
        wcProvider.on("accountsChanged", handleAccountsChanged);
        wcProvider.on("chainChanged", handleChainChanged);
        wcProvider.on("disconnect", handleWalletDisconnect);
        
    } catch (error) {
        console.error('WalletConnect connection handler error:', error);
    }
}

async function handleWalletDisconnect() {
    await disconnectWallet();
}

/* ===============================
   WALLET MANAGEMENT
================================ */

async function disconnectWallet() {
    try {
        if (wcProvider && wcProvider.disconnect) {
            await wcProvider.disconnect();
        }
        
        // Remove event listeners
        if (window.ethereum) {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
        
    } catch (error) {
        console.error('Disconnect error:', error);
    }
    
    walletConnected = false;
    userAddress = null;
    signer = null;
    currentChainId = null;
    walletBalance = '0';
    
    updateWalletUI();
    showNotification('Wallet disconnected', 'info');
    
    // Clear saved state
    localStorage.removeItem(CONFIG.storageKeys.walletAddress);
    localStorage.removeItem(CONFIG.storageKeys.chainId);
}

async function updateWalletInfo() {
    if (!walletConnected || !signer) return;
    
    try {
        // Get balance
        const balance = await signer.provider.getBalance(userAddress);
        walletBalance = ethers.formatEther(balance);
        
        updateWalletUI();
        
        // Save wallet state
        localStorage.setItem(CONFIG.storageKeys.walletAddress, userAddress);
        localStorage.setItem(CONFIG.storageKeys.chainId, currentChainId);
        
    } catch (error) {
        console.error('Update wallet info error:', error);
    }
}

function updateWalletUI() {
    const walletIcon = document.getElementById('wallet-icon');
    const walletInfo = document.getElementById('wallet-info');
    const walletInfoText = document.getElementById('wallet-info-text');
    const walletBalanceEl = document.getElementById('wallet-balance');
    const networkIndicator = document.getElementById('network-indicator');
    const confirmBtn = document.getElementById('confirm-purchase-btn');
    
    if (walletConnected && userAddress) {
        const shortAddress = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
        const networkName = getNetworkName(currentChainId);
        const balanceFormatted = parseFloat(walletBalance).toFixed(4);
        const tokenSymbol = getNetworkToken(currentChainId);
        
        // Update wallet icon
        walletIcon.innerHTML = '<i class="fas fa-check"></i>';
        walletIcon.title = `Connected: ${shortAddress}\nNetwork: ${networkName}\nBalance: ${balanceFormatted} ${tokenSymbol}`;
        walletIcon.style.background = 'linear-gradient(135deg, #45a049, #388E3C)';
        
        // Update wallet info
        if (walletInfo && walletInfoText) {
            walletInfo.style.display = 'flex';
            walletInfoText.textContent = `${shortAddress} | ${networkName}`;
        }
        
        // Update wallet balance
        if (walletBalanceEl) {
            walletBalanceEl.style.display = 'block';
            walletBalanceEl.textContent = `${balanceFormatted} ${tokenSymbol}`;
        }
        
        // Update network indicator
        if (networkIndicator) {
            networkIndicator.style.display = 'block';
            networkIndicator.textContent = networkName;
            networkIndicator.style.background = currentChainId === CONFIG.defaultChainId 
                ? 'rgba(182, 254, 5, 0.2)' 
                : 'rgba(255, 152, 0, 0.2)';
        }
        
        // Enable purchase button
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Confirm Purchase';
        }
        
    } else {
        // Not connected
        walletIcon.innerHTML = '<i class="fas fa-wallet"></i>';
        walletIcon.title = 'Connect Wallet';
        walletIcon.style.background = 'linear-gradient(135deg, #B6FE05, #45a049)';
        
        if (walletInfo) {
            walletInfo.style.display = 'none';
        }
        
        if (walletBalanceEl) {
            walletBalanceEl.style.display = 'none';
        }
        
        if (networkIndicator) {
            networkIndicator.style.display = 'none';
        }
        
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="fas fa-wallet"></i> Connect Wallet to Purchase';
        }
    }
}

/* ===============================
   HELPER FUNCTIONS
================================ */

function getNetworkName(chainId) {
    return CONFIG.supportedChains[chainId]?.name || `Chain ${chainId}`;
}

function getNetworkToken(chainId) {
    return CONFIG.supportedChains[chainId]?.token || 'ETH';
}

function getExplorerUrl(chainId) {
    return CONFIG.supportedChains[chainId]?.explorer || 'https://etherscan.io';
}

async function checkSavedConnection() {
    const savedAddress = localStorage.getItem(CONFIG.storageKeys.walletAddress);
    const savedChainId = localStorage.getItem(CONFIG.storageKeys.chainId);
    
    if (savedAddress && savedChainId && window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
                userAddress = savedAddress;
                currentChainId = parseInt(savedChainId);
                walletConnected = true;
                
                const provider = new ethers.BrowserProvider(window.ethereum);
                signer = await provider.getSigner();
                
                await updateWalletInfo();
                updateWalletUI();
                
                showNotification(`Auto-connected: ${userAddress.slice(0,6)}...`, 'info');
                
                // Setup event listeners
                window.ethereum.on('accountsChanged', handleAccountsChanged);
                window.ethereum.on('chainChanged', handleChainChanged);
            }
        } catch (error) {
            console.log('Auto-connect failed:', error);
        }
    }
}

// Export wallet functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showWalletSelector,
        connectMetaMask,
        connectCoinbase,
        connectWalletConnect,
        connectOther,
        disconnectWallet,
        updateWalletInfo,
        updateWalletUI,
        checkSavedConnection,
        walletConnected: () => walletConnected,
        userAddress: () => userAddress,
        signer: () => signer,
        currentChainId: () => currentChainId
    };
}