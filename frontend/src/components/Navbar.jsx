import { useState, useEffect } from 'react';
import { connectWallet } from '../utils/contract';

const Navbar = ({ account, setAccount }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [networkName, setNetworkName] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleConnectWallet = async () => {
    setIsLoading(true);
    try {
      const connectedAccount = await connectWallet();
      setAccount(connectedAccount);
      detectNetwork();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const detectNetwork = async () => {
    if (!window.ethereum) return;
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setNetworkName(getNetworkName(chainId));
      
      window.ethereum.on('chainChanged', (newChainId) => {
        setNetworkName(getNetworkName(newChainId));
      });
    } catch (error) {
      console.error('Error detecting network:', error);
    }
  };

  const getNetworkName = (chainId) => {
    const networks = {
      '0x1': 'Ethereum Mainnet',
      '0x5': 'Goerli Testnet',
      '0xaa36a7': 'Sepolia Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Mumbai Testnet',
    };
    return networks[chainId] || `Chain ID: ${chainId}`;
  };

  useEffect(() => {
    if (account) {
      detectNetwork();
    }
    
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [account]);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'backdrop-blur-lg bg-white/70 dark:bg-gray-900/80 shadow-lg py-2' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className={`flex-shrink-0 ${scrolled ? 'bg-gradient-to-br from-blue-600 to-indigo-700' : 'bg-gradient-to-br from-blue-500 to-indigo-600'} p-2 rounded-xl shadow-lg transition-all duration-500 transform ${scrolled ? 'scale-90' : 'scale-100'}`}>
              <img src="/blockchain-icon.svg" alt="Logo" className="h-8 w-8 invert" 
                   onError={(e) => {
                     e.target.onerror = null;
                     e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjM2NkYxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci1kYXRhYmFzZSI+PHBhdGggZD0iTTEyIDdDOC4yMjM2MyA3IDUgNS42NTY4MiA1IDR2MTZjMCAxLjY1NjggMy4yMjM2MyAzIDcgM3M3LTEuMzQzMiA3LTNWNGMwIDEuNjU2ODItMy4yMjM2MyAzLTcgM3oiLz48cGF0aCBkPSJNNSA0YzAgMS4xMDQ1NyAzLjEzNCAzIDcgM3M3LTEuODk1NDMgNy0zLTMuMTM0LTMtNy0zLTcgMS44OTU0My03IDN6Ii8+PHBhdGggZD0iTTUgMTJjMCAxLjEwNDYgMy4xMzQgMyA3IDNzNy0xLjg5NTQgNy0zIi8+PC9zdmc+';
                   }}
            />
            </div>
            <div className="transform transition-all duration-300">
              <h1 className={`text-xl font-bold transition-all duration-300 ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
                BlockImage
              </h1>
              <p className={`text-xs font-medium tracking-wider transition-all duration-300 ${scrolled ? 'text-gray-600 dark:text-gray-300' : 'text-blue-200'}`}>
                DECENTRALIZED STORAGE
              </p>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`focus:outline-none transition-colors duration-300 ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {networkName && (
              <div className={`px-3 py-1 rounded-full flex items-center transition-all duration-300 ${
                scrolled 
                  ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' 
                  : 'bg-white/20 text-white backdrop-blur-sm'
              }`}>
                <span className={`w-2 h-2 rounded-full mr-2 animate-pulse ${networkName.includes('Mainnet') ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                <span className="text-sm font-medium">{networkName}</span>
              </div>
            )}
            
            {account ? (
              <div className="flex items-center space-x-3">
                <div className={`text-sm backdrop-blur-sm transition-all duration-300 ${
                  scrolled 
                    ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700' 
                    : 'bg-white/10 text-white border border-white/20'
                } px-3 py-2 rounded-lg`}>
                  {account.slice(0, 6)}...{account.slice(-4)}
                </div>
                <button
                  onClick={() => window.open(`https://etherscan.io/address/${account}`, '_blank')}
                  className={`transition-colors duration-300 ${
                    scrolled ? 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300' : 'text-blue-200 hover:text-white'
                  }`}
                  aria-label="View on Explorer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isLoading}
                className={`transition-all duration-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
                  scrolled
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-lg hover:from-blue-700 hover:to-indigo-800'
                    : 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 border border-white/30'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    Connect Wallet
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-500 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-screen opacity-100 py-4' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col space-y-4 pb-3">
            {networkName && (
              <div className={`px-3 py-1 rounded-full self-start flex items-center transition-colors duration-300 ${
                scrolled 
                  ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' 
                  : 'bg-white/20 text-white backdrop-blur-sm'
              }`}>
                <span className={`w-2 h-2 rounded-full mr-2 animate-pulse ${networkName.includes('Mainnet') ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                <span className="text-sm font-medium">{networkName}</span>
              </div>
            )}
            
            {account ? (
              <div className="flex flex-col space-y-2">
                <div className={`text-sm self-start backdrop-blur-sm transition-colors duration-300 ${
                  scrolled 
                    ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700' 
                    : 'bg-white/10 text-white border border-white/20'
                } px-3 py-2 rounded-lg`}>
                  {account.slice(0, 6)}...{account.slice(-4)}
                </div>
                <button
                  onClick={() => window.open(`https://etherscan.io/address/${account}`, '_blank')}
                  className={`self-start flex items-center transition-colors duration-300 ${
                    scrolled ? 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300' : 'text-blue-200 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                  View on Explorer
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isLoading}
                className={`self-start transition-all duration-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
                  scrolled
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'
                    : 'bg-white/20 text-white backdrop-blur-sm border border-white/30'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    Connect Wallet
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 