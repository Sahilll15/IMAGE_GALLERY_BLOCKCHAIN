import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import ImageUploader from './components/ImageUploader'
import ImageGallery from './components/ImageGallery'

function App() {
  const [account, setAccount] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const handleImageUploaded = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount('');
        }
      });
    }
    
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''} transition-colors duration-500`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 dark:text-white">
        <div className="absolute inset-0 bg-pattern opacity-5 dark:opacity-10 pointer-events-none"></div>
        
        {/* Hero Section Background */}
        <div className="absolute top-0 left-0 right-0 h-[30vh] md:h-[40vh] bg-gradient-to-r from-blue-600 to-indigo-700 transform -skew-y-3 origin-top-left z-0"></div>
        
        <Navbar account={account} setAccount={setAccount} />
        
        {/* Dark mode toggle button */}
        <button 
          onClick={toggleDarkMode}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 shadow-lg hover:shadow-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-110 hover:rotate-12"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          )}
        </button>
        
        <main className="container mx-auto px-4 py-8 pt-32 relative z-10">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Sidebar */}
            <div className="w-full md:w-1/3 lg:w-1/4 space-y-6">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                    </svg>
                    Upload Image
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Permanently store images on blockchain</p>
                </div>
                <div className="p-5">
                  <ImageUploader 
                    onImageUploaded={handleImageUploaded} 
                    account={account} 
                  />
                </div>
              </div>
              
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-5 transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
                <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  About
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  BlockImage stores your images permanently on the blockchain using IPFS technology. Decentralized, secure, and accessible from anywhere.
                </p>
                <div className="space-y-3">
                  <a href="https://ethereum.org" target="_blank" rel="noopener noreferrer" 
                    className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 group">
                    <span className="flex items-center justify-center w-8 h-8 mr-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                      </svg>
                    </span>
                    <span className="group-hover:underline">Learn about Ethereum</span>
                  </a>
                  <a href="https://ipfs.io" target="_blank" rel="noopener noreferrer" 
                    className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 group">
                    <span className="flex items-center justify-center w-8 h-8 mr-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0L3 12h6v12h6V12h6L12 0z" />
                      </svg>
                    </span>
                    <span className="group-hover:underline">Discover IPFS</span>
                  </a>
                  <a href="https://docs.pinata.cloud/" target="_blank" rel="noopener noreferrer" 
                    className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 group">
                    <span className="flex items-center justify-center w-8 h-8 mr-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                      </svg>
                    </span>
                    <span className="group-hover:underline">Pinata Documentation</span>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="w-full md:w-2/3 lg:w-3/4">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-6 transform transition-all duration-300 hover:shadow-2xl">
                <div className="p-6 relative">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/10 dark:bg-blue-400/10 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-600/10 dark:bg-indigo-400/10 rounded-full blur-3xl"></div>
                  
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center relative">
                    <svg className="w-7 h-7 mr-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span className="relative">Blockchain Gallery</span>
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">
                    {!account ? 'Connect your wallet to upload and interact with images stored on the blockchain.' : 'Browse decentralized images or upload your own to make them permanent.'}
                  </p>
                </div>
                
                <div className="flex px-6 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`group py-4 px-5 text-sm font-medium border-b-2 transition-all -mb-px relative ${
                      activeTab === 'all' 
                        ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                        : 'text-gray-500 border-transparent hover:text-blue-500 hover:border-blue-200 dark:text-gray-400'
                    }`}
                  >
                    <span className="relative z-10 flex items-center">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                      </svg>
                      All Images
                    </span>
                    <span className={`absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-lg -m-1 transition-all ${activeTab === 'all' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></span>
                  </button>
                  <button
                    onClick={() => setActiveTab('mine')}
                    className={`group py-4 px-5 text-sm font-medium border-b-2 transition-all -mb-px relative ${
                      activeTab === 'mine' 
                        ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                        : 'text-gray-500 border-transparent hover:text-blue-500 hover:border-blue-200 dark:text-gray-400'
                    }`}
                    disabled={!account}
                  >
                    <span className="relative z-10 flex items-center">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      My Uploads
                    </span>
                    <span className={`absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-lg -m-1 transition-all ${activeTab === 'mine' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></span>
                  </button>
                  
                  <div className="ml-auto self-center pb-2">
                    <button
                      onClick={() => setRefreshTrigger(prev => prev + 1)}
                      className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all hover:scale-110"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="ml-1.5">Refresh</span>
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <ImageGallery 
                    account={account} 
                    refreshTrigger={refreshTrigger} 
                    userOnly={activeTab === 'mine'} 
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 mt-12 relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">BlockImage</h2>
                    <p className="text-blue-300 text-sm mt-1">Decentralized Storage</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <a href="https://ethereum.org" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white p-2 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                  </svg>
                </a>
                <a href="https://ipfs.io" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white p-2 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0L3 12h6v12h6V12h6L12 0z" />
                  </svg>
                </a>
                <a href="https://pinata.cloud" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white p-2 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500 text-xs">
              <p>© {new Date().getFullYear()} BlockImage. All rights reserved.</p>
              <p className="mt-2">Powered by Ethereum & IPFS</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
