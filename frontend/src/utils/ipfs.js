import axios from 'axios';

const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

export const uploadToIPFS = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = {
      name: file.name,
      keyvalues: {
        timestamp: new Date().toISOString(),
      }
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));

    const pinataOptions = {
      cidVersion: 0,
    };
    formData.append('pinataOptions', JSON.stringify(pinataOptions));

    const response = await axios.post(PINATA_API_URL, formData, {
      maxBodyLength: 'Infinity',
      headers: {
        'Content-Type': `multipart/form-data;`,
        pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
        pinata_secret_api_key: import.meta.env.VITE_PINATA_API_SECRET,
      },
    });

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

export const getIPFSGatewayURL = (ipfsHash) => {
  // Try multiple gateways for better reliability
  // Using your dedicated gateway if you have a Pinata account
  const gateway = import.meta.env.VITE_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
  return `${gateway}${ipfsHash}`;
};

// Fallback function if primary gateway fails
export const getAlternativeIPFSGatewayURL = (ipfsHash) => {
  const gateways = [
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://ipfs.fleek.co/ipfs/',
    'https://ipfs.dweb.link/ipfs/'
  ];
  
  // Choose a random gateway for load distribution
  const randomGateway = gateways[Math.floor(Math.random() * gateways.length)];
  return `${randomGateway}${ipfsHash}`;
};

// Download an image from IPFS
export const downloadImage = async (ipfsHash, imageName = 'blockchain-image') => {
  try {
    // Try primary gateway first
    const url = getIPFSGatewayURL(ipfsHash);
    
    // Fetch the image
    const response = await fetch(url);
    
    if (!response.ok) {
      // Try alternative gateway if primary fails
      const altUrl = getAlternativeIPFSGatewayURL(ipfsHash);
      const altResponse = await fetch(altUrl);
      
      if (!altResponse.ok) {
        throw new Error('Failed to download image from IPFS');
      }
      
      const blob = await altResponse.blob();
      return saveImageFile(blob, imageName, ipfsHash);
    }
    
    const blob = await response.blob();
    return saveImageFile(blob, imageName, ipfsHash);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
};

// Helper function to save the downloaded file
const saveImageFile = (blob, name, hash) => {
  // Determine file extension based on blob type
  const fileExt = blob.type.split('/')[1] || 'png';
  const fileName = `${name}-${hash.slice(0, 7)}.${fileExt}`;
  
  // Create a download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  
  // Append to body, click and cleanup
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
  
  return true;
}; 