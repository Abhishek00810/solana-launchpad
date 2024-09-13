import './App.css'
import { TokenLaunchpad } from './components/TokenLaunchpad'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
function App() {
  return (
    <div>
       <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider
        >
          <div style={
            {display: "flex", justifyContent: "space-between"}
          }>
          <WalletMultiButton style = {{backgroundColor: "transparent"}}/>
          <WalletDisconnectButton style = {{backgroundColor: "transparent"}} />
          </div>
          <TokenLaunchpad></TokenLaunchpad> 
        </WalletModalProvider>
      </WalletProvider>
      </ConnectionProvider>

    </div>
    
  )
}

export default App
