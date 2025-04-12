import { ethers } from 'ethers';

const contractABI = [
  "function uploadImage(string memory _ipfsHash) external",
  "function likeImage(uint256 _imageId) external",
  "function getAllImages() external view returns (tuple(string ipfsHash, address uploader, uint256 timestamp, uint256 likes)[] memory)",
  "function getUserImages(address _user) external view returns (uint256[] memory)",
  "function getImageCount() external view returns (uint256)",
  "function images(uint256) external view returns (string ipfsHash, address uploader, uint256 timestamp, uint256 likes)",
  "event ImageUploaded(uint256 indexed imageId, string ipfsHash, address indexed uploader, uint256 timestamp)",
  "event ImageLiked(uint256 indexed imageId, address indexed liker)"
];

export const getContract = (provider) => {
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    throw new Error('Contract address not defined in environment variables');
  }
  
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
};

export const getProvider = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  return new ethers.providers.Web3Provider(window.ethereum);
};

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    console.error('Error connecting to MetaMask', error);
    throw error;
  }
};

export const uploadImageToBlockchain = async (provider, ipfsHash) => {
  const contract = getContract(provider);
  const tx = await contract.uploadImage(ipfsHash);
  return await tx.wait();
};

export const likeImage = async (provider, imageId) => {
  const contract = getContract(provider);
  const tx = await contract.likeImage(imageId);
  return await tx.wait();
};

export const getAllImages = async (provider) => {
  const contract = getContract(provider);
  const images = await contract.getAllImages();
  return images;
};

export const getUserImages = async (provider, userAddress) => {
  const contract = getContract(provider);
  const imageIds = await contract.getUserImages(userAddress);
  return imageIds;
}; 