import { useState } from 'react';
import { uploadToIPFS } from '../utils/ipfs';
import { uploadImageToBlockchain, getProvider } from '../utils/contract';

const ImageUploader = ({ onImageUploaded, account }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ stage: '', percent: 0 });
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit');
      return;
    }
    
    setFile(selectedFile);
    setUploadError('');
    setUploadSuccess(false);
    
    // Create preview URL
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(selectedFile);
  };
  
  const handleUpload = async () => {
    if (!file || !account) return;
    
    setIsUploading(true);
    setUploadProgress({ stage: 'Preparing...', percent: 5 });
    setUploadError('');
    setUploadSuccess(false);
    
    try {
      setTimeout(() => {
        setUploadProgress({ stage: 'Uploading to IPFS...', percent: 10 });
      }, 500);
      
      // 1. Upload to IPFS
      const ipfsHash = await uploadToIPFS(file);
      
      setUploadProgress({ stage: 'Connecting to blockchain...', percent: 50 });
      
      // 2. Store on blockchain
      const provider = await getProvider();
      const tx = await uploadImageToBlockchain(provider, ipfsHash);
      
      setUploadProgress({ stage: 'Finalizing transaction...', percent: 80 });
      
      // Wait a bit for indexing
      setTimeout(() => {
        setUploadProgress({ stage: 'Success!', percent: 100 });
        setUploadSuccess(true);
        
        // Reset form and notify parent
        setTimeout(() => {
          setFile(null);
          setPreviewUrl('');
          setIsUploading(false);
          setUploadProgress({ stage: '', percent: 0 });
          onImageUploaded();
        }, 1500);
      }, 1000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(getErrorMessage(error));
      setUploadProgress({ stage: 'Failed', percent: 0 });
      setIsUploading(false);
    }
  };
  
  const getErrorMessage = (error) => {
    if (error.message && error.message.includes('insufficient funds')) {
      return 'Not enough ETH in your wallet to complete this transaction';
    } else if (error.message && error.message.includes('user rejected')) {
      return 'Transaction was rejected';
    } else {
      return `Upload failed: ${error.message || 'Unknown error'}`;
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Check file size (max 10MB)
      if (droppedFile.size > 10 * 1024 * 1024) {
        setUploadError('File size exceeds 10MB limit');
        return;
      }
      
      setFile(droppedFile);
      setUploadError('');
      setUploadSuccess(false);
      
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(droppedFile);
    }
  };
  
  return (
    <div className="w-full">
      {/* Error notification with enhanced styling */}
      {uploadError && (
        <div className="mb-5 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-l-4 border-red-500 dark:border-red-600 px-4 py-3 rounded-lg text-sm animate-fadeIn shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium text-red-800 dark:text-red-300">{uploadError}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Success notification with enhanced styling */}
      {uploadSuccess && !isUploading && (
        <div className="mb-5 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 border-l-4 border-green-500 dark:border-green-600 px-4 py-3 rounded-lg text-sm animate-fadeIn shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium text-green-800 dark:text-green-300">Image successfully uploaded to the blockchain!</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced drag and drop container */}
      <div 
        className={`border-2 ${
          isDragActive 
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-lg scale-[1.01]' 
            : uploadSuccess && !isUploading
              ? 'border-green-400 dark:border-green-500 border-dashed bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10'
              : 'border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50/50 dark:bg-gray-800/20'
        } rounded-xl p-6 text-center cursor-pointer transition-all duration-300 relative overflow-hidden
        ${isUploading ? 'pointer-events-none' : ''} ${!account ? 'opacity-75' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => account && document.getElementById('file-input').click()}
      >
        {previewUrl ? (
          <div className="flex flex-col items-center">
            <div className="relative group mb-4">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse"></div>
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="relative z-10 max-h-64 max-w-full rounded-lg object-contain transition-all duration-500 shadow-md group-hover:shadow-xl group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg"></div>
              
              {/* Edit/change overlay on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                <span className="bg-black/60 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                  Click to change
                </span>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-inner">
              <svg className="w-4 h-4 mr-1.5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
              </svg>
              {file?.name}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <svg className="w-12 h-12 text-blue-600 dark:text-blue-400 transition-all duration-500 transform hover:rotate-12 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Your Image</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-3 max-w-xs mx-auto">
              Drag and drop your image here, or click to browse
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Supports: JPG, PNG, GIF (max 10MB)
            </p>
            
            {!account && (
              <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-2 text-sm text-yellow-700 dark:text-yellow-500">
                Connect wallet to upload images
              </div>
            )}
          </div>
        )}
        
        <input 
          id="file-input" 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
        />
        
        {/* Improved upload overlay with animations */}
        {isUploading && (
          <div className="absolute inset-0 backdrop-blur-sm bg-white/90 dark:bg-gray-800/95 flex flex-col items-center justify-center z-10">
            <div className="w-20 h-20 mb-4 relative">
              <svg className="animate-spin w-full h-full text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{uploadProgress.percent}%</span>
              </div>
            </div>
            <div className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">{uploadProgress.stage}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs text-center">Your image is being permanently stored on the blockchain...</div>
          </div>
        )}
      </div>
      
      {/* Enhanced progress bar */}
      {isUploading && (
        <div className="mt-5 animate-fadeIn">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${uploadProgress.percent}%` }}
            >
              <div className="h-full w-full bg-opacity-30 bg-white animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>IPFS Upload</span>
            <span>Blockchain Transaction</span>
            <span>Confirmation</span>
          </div>
        </div>
      )}
      
      {/* Enhanced action buttons */}
      <div className="mt-5 space-y-3">
        <button
          onClick={handleUpload}
          disabled={!file || isUploading || !account}
          className={`w-full py-3 px-4 rounded-lg font-medium text-center 
                      transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                      transform hover:-translate-y-1 active:translate-y-0 text-base
                      ${!file || isUploading || !account
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg'}`}
        >
          {!account 
            ? 'Connect Wallet to Upload' 
            : isUploading 
              ? 'Uploading...' 
              : file
                ? 'Upload to Blockchain'
                : 'Select an Image First'}
        </button>
        
        {file && !isUploading && (
          <button
            onClick={() => {
              setFile(null);
              setPreviewUrl('');
              setUploadError('');
              setUploadSuccess(false);
            }}
            className="w-full py-2.5 px-4 rounded-lg font-medium text-center text-gray-700 dark:text-gray-300 
                      bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
          >
            Clear Selection
          </button>
        )}
        
        {!account && (
          <p className="mt-3 text-sm text-red-500 dark:text-red-400 text-center flex items-center justify-center">
            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
            You need to connect your wallet first
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageUploader; 