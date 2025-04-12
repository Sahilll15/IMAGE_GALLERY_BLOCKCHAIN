import { useState, useEffect } from 'react';
import { getIPFSGatewayURL, getAlternativeIPFSGatewayURL, downloadImage } from '../utils/ipfs';
import { getAllImages, likeImage, getProvider } from '../utils/contract';

const ImageGallery = ({ account, refreshTrigger, userOnly }) => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeInProgress, setLikeInProgress] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  
  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        if (!window.ethereum) {
          setError('MetaMask is not installed');
          setIsLoading(false);
          return;
        }
        
        const provider = await getProvider();
        
        // Check if we're on the right network
        const network = await provider.getNetwork();
        const networkId = network.chainId;
        
        // This should match the network where your contract is deployed
        const expectedNetworkIds = [1, 11155111, 80001, 5]; // Mainnet, Sepolia, Mumbai, Goerli
        if (!expectedNetworkIds.includes(networkId)) {
          setError(`Please connect to the right network. Current network ID: ${networkId}`);
          setIsLoading(false);
          return;
        }
        
        try {
          const imagesData = await getAllImages(provider);
          
          // Convert to a more usable format
          const formattedImages = imagesData.map((img, index) => ({
            id: index,
            ipfsHash: img.ipfsHash,
            uploader: img.uploader,
            timestamp: new Date(Number(img.timestamp) * 1000).toLocaleString(),
            likes: Number(img.likes),
            isOwner: account && img.uploader.toLowerCase() === account.toLowerCase()
          }));
          
          // Filter user images if userOnly is true
          const filteredImages = userOnly
            ? formattedImages.filter(img => img.isOwner)
            : formattedImages;
            
          // Initial sort by ID in descending order
          filteredImages.sort((a, b) => {
            return b.id - a.id;
          });
          
          setImages(filteredImages);
        } catch (contractError) {
          console.error('Contract error:', contractError);
          setError('Failed to load images from blockchain. Make sure you are connected to the correct network where the contract is deployed.');
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        if (error.message.includes('contract not deployed')) {
          setError('Contract not found on this network. Please switch to the correct network.');
        } else {
          setError(`Failed to load images: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchImages();
  }, [refreshTrigger, account, userOnly]);
  
  // Sort images based on selected option
  const sortedImages = [...images].sort((a, b) => {
    switch (sortOption) {
      case 'newest':
        return new Date(b.timestamp) - new Date(a.timestamp);
      case 'oldest':
        return new Date(a.timestamp) - new Date(b.timestamp);
      case 'mostLiked':
        return b.likes - a.likes;
      default:
        return b.id - a.id;
    }
  });
  
  const handleLike = async (imageId) => {
    if (!account) return;
    
    setLikeInProgress(prev => ({ ...prev, [imageId]: true }));
    
    try {
      const provider = await getProvider();
      await likeImage(provider, imageId);
      
      // Update likes count locally
      setImages(prev => 
        prev.map(img => 
          img.id === imageId 
            ? { ...img, likes: img.likes + 1 } 
            : img
        )
      );
    } catch (error) {
      console.error('Error liking image:', error);
    } finally {
      setLikeInProgress(prev => ({ ...prev, [imageId]: false }));
    }
  };
  
  const handleDownload = async (ipfsHash) => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    
    try {
      await downloadImage(ipfsHash, `blockchain-image-${Date.now()}`);
      setDownloadSuccess(true);
      
      // Reset download success message after 3 seconds
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-16 h-16 mb-4">
          <svg className="animate-spin w-full h-full text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Loading images from blockchain...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-2">Connection Error</h3>
        <p className="text-red-600 dark:text-red-300">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Refresh Page
        </button>
      </div>
    );
  }
  
  if (images.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No images found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {userOnly 
            ? "You haven't uploaded any images yet." 
            : "No images have been uploaded to the blockchain yet."}
        </p>
        {!userOnly && (
          <p className="text-blue-600 dark:text-blue-400">Be the first to upload an image!</p>
        )}
      </div>
    );
  }
  
  return (
    <>
      {/* Sorting Controls - Enhanced UI */}
      <div className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3 flex items-center">
              <svg className="w-4 h-4 mr-1.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path>
              </svg>
              Sort by:
            </span>
            <div className="relative inline-flex rounded-lg shadow-sm">
              <button
                onClick={() => setSortOption('newest')}
                className={`px-4 py-2.5 text-sm font-medium rounded-l-lg border transition-all duration-200 ${
                  sortOption === 'newest'
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-300 dark:bg-gradient-to-r dark:from-blue-900/40 dark:to-indigo-900/40 dark:text-blue-300 dark:border-blue-700 shadow-inner'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700/70'
                }`}
                aria-label="Sort by newest first"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Newest
                </div>
              </button>
              <button
                onClick={() => setSortOption('oldest')}
                className={`px-4 py-2.5 text-sm font-medium border-t border-b transition-all duration-200 ${
                  sortOption === 'oldest'
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-300 dark:bg-gradient-to-r dark:from-blue-900/40 dark:to-indigo-900/40 dark:text-blue-300 dark:border-blue-700 shadow-inner'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700/70'
                }`}
                aria-label="Sort by oldest first"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Oldest
                </div>
              </button>
              <button
                onClick={() => setSortOption('mostLiked')}
                className={`px-4 py-2.5 text-sm font-medium rounded-r-lg border transition-all duration-200 ${
                  sortOption === 'mostLiked'
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-300 dark:bg-gradient-to-r dark:from-blue-900/40 dark:to-indigo-900/40 dark:text-blue-300 dark:border-blue-700 shadow-inner'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700/70'
                }`}
                aria-label="Sort by most liked"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                  </svg>
                  Most Liked
                </div>
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg flex items-center">
            <svg className="w-4 h-4 mr-1.5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span className="font-medium">{images.length}</span> {images.length === 1 ? 'image' : 'images'} found
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedImages.map((image) => (
          <div key={image.id} 
            className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer"
            onClick={() => {
              setSelectedImage(image);
              setModalOpen(true);
            }}
          >
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-900 overflow-hidden">
              {/* Loading skeleton */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse"></div>
              
              <img 
                src={getIPFSGatewayURL(image.ipfsHash)}
                alt={`Image ${image.id}`}
                className="relative z-10 w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                onError={(e) => {
                  // First try alternate IPFS gateway before falling back to placeholder
                  if (!e.target.dataset.usedFallback) {
                    e.target.dataset.usedFallback = 'true';
                    e.target.src = getAlternativeIPFSGatewayURL(image.ipfsHash);
                  } else {
                    // If alternate gateway also fails, show placeholder
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                  }
                }}
              />
              
              {/* Gradient overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              
              {/* Owner badge */}
              {image.isOwner && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-blue-600/90 text-white text-xs px-2.5 py-1.5 rounded-full shadow-lg backdrop-blur-sm flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    My Upload
                  </span>
                </div>
              )}
              
              {/* Bottom info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-0 group-hover:translate-y-0 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1.5">
                    <div className="h-7 w-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xs font-medium">
                      {image.uploader.slice(0, 2)}
                    </div>
                    <span className="text-xs font-medium truncate max-w-[120px]">
                      {image.uploader.slice(0, 6)}...{image.uploader.slice(-4)}
                    </span>
                  </div>
                  
                  <a 
                    href={getIPFSGatewayURL(image.ipfsHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs flex items-center hover:text-blue-300 backdrop-blur-sm bg-white/10 px-2.5 py-1.5 rounded-full transition-all hover:bg-white/20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    IPFS
                  </a>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center font-medium bg-gray-100 dark:bg-gray-700/50 px-2.5 py-1.5 rounded-full">
                  <svg className="w-3.5 h-3.5 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {image.timestamp}
                </p>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(image.id);
                  }}
                  disabled={!account || likeInProgress[image.id]}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full transition-all ${
                    !account 
                      ? 'text-gray-400 cursor-not-allowed bg-gray-100 dark:bg-gray-800' 
                      : 'text-pink-600 dark:text-pink-500 bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/40 hover:scale-105'
                  }`}
                  aria-label={`Like image ${image.id}`}
                >
                  {likeInProgress[image.id] ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                    </svg>
                  )}
                  <span className="text-sm font-medium">{image.likes}</span>
                </button>
              </div>
              
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-full">
                  <svg className="w-3.5 h-3.5 mr-1 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                  <span className="font-medium">ID:</span> {image.id}
                </span>
                
                <span className="text-xs px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-full text-gray-600 dark:text-gray-300 flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                  </svg>
                  {image.ipfsHash.slice(0, 7)}...
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Image Detail Modal */}
      {modalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800/95 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative">
            {/* Close button with enhanced styling */}
            <button 
              onClick={() => setModalOpen(false)} 
              className="absolute top-4 right-4 z-20 bg-white/20 dark:bg-black/40 text-gray-800 dark:text-white rounded-full p-2 backdrop-blur-sm hover:bg-white/40 dark:hover:bg-black/60 transition-all duration-300 shadow-lg"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            <div className="flex flex-col lg:flex-row h-[90vh]">
              {/* Dominant image section */}
              <div className="w-full lg:w-3/4 bg-gray-100 dark:bg-gray-900 relative flex items-center justify-center">
                {/* Image loading skeleton */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse"></div>
                
                <img 
                  src={getIPFSGatewayURL(selectedImage.ipfsHash)} 
                  alt={`Image ${selectedImage.id}`}
                  className="relative z-10 w-full h-full object-contain max-h-[90vh] p-4"
                  onError={(e) => {
                    if (!e.target.dataset.usedFallback) {
                      e.target.dataset.usedFallback = 'true';
                      e.target.src = getAlternativeIPFSGatewayURL(selectedImage.ipfsHash);
                    } else {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                    }
                  }}
                />
                
                {/* Image uploader badge - overlay on the image */}
                {selectedImage.isOwner && (
                  <div className="absolute top-6 left-6 z-20">
                    <span className="bg-blue-600/90 text-white text-sm font-medium px-3 py-1.5 rounded-full shadow-xl backdrop-blur-sm flex items-center">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      My Upload
                    </span>
                  </div>
                )}
              </div>
              
              {/* Collapsible side panel for image details */}
              <div className="w-full lg:w-1/4 bg-white dark:bg-gray-800 border-l border-gray-100 dark:border-gray-700 flex flex-col h-full">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Image Details
                  </h3>
                </div>
                
                <div className="p-6 overflow-y-auto flex-grow space-y-6">
                  {/* Image ID section */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Image ID</h4>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedImage.id}</p>
                      </div>
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Uploader */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Uploader
                    </h4>
                    <div className="flex items-center bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 overflow-x-auto">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-sm font-medium text-blue-700 dark:text-blue-300 mr-3 flex-shrink-0">
                        {selectedImage.uploader.slice(0, 2)}
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 text-sm font-mono break-all">
                        {selectedImage.uploader}
                      </p>
                    </div>
                  </div>
                  
                  {/* Timestamp */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Timestamp
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                      <p className="text-gray-800 dark:text-gray-200 text-sm">{selectedImage.timestamp}</p>
                    </div>
                  </div>
                  
                  {/* Likes */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-pink-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                      </svg>
                      Likes
                    </h4>
                    <div className="flex items-center">
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg py-2 px-4 mr-3">
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{selectedImage.likes}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(selectedImage.id);
                        }}
                        disabled={!account || likeInProgress[selectedImage.id]}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                          !account 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600' 
                            : 'bg-pink-50 text-pink-600 hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:hover:bg-pink-900/40 hover:scale-105 transform'
                        }`}
                      >
                        {likeInProgress[selectedImage.id] ? (
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                          </svg>
                        )}
                        <span className="font-medium">Like</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* IPFS Hash */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                      </svg>
                      IPFS Hash
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 overflow-x-auto font-mono">
                      <p className="text-gray-800 dark:text-gray-200 text-sm break-all">{selectedImage.ipfsHash}</p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="space-y-3 pt-2">
                    <a 
                      href={getIPFSGatewayURL(selectedImage.ipfsHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center px-4 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-all hover:shadow-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                      View Original on IPFS
                    </a>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(selectedImage.ipfsHash);
                      }}
                      disabled={isDownloading}
                      className={`flex w-full items-center justify-center px-4 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white ${
                        isDownloading
                          ? 'bg-green-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg'
                      } transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                    >
                      {isDownloading ? (
                        <>
                          <svg className="animate-spin w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                          </svg>
                          Download Image
                        </>
                      )}
                    </button>
                    
                    {downloadSuccess && (
                      <div className="mt-2 text-center text-sm font-medium text-green-600 dark:text-green-400 animate-fadeIn bg-green-50 dark:bg-green-900/20 p-2 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Image downloaded successfully!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery; 