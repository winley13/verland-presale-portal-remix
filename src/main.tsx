import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'
import { Web3Provider } from './lib/web3'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Toaster position="top-right" />
    <Web3Provider>
      <App />
    </Web3Provider>
  </React.StrictMode>,
)
