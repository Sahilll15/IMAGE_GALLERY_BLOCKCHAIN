# BlockImage Saver DApp

A decentralized application for saving images on IPFS and storing their metadata on the Ethereum blockchain.

## Features

- Upload images to IPFS via Pinata API
- Store IPFS hashes on the Ethereum blockchain
- View all uploaded images from the blockchain
- Like/favorite system for images
- Support for multiple EVM-compatible networks
- MetaMask wallet integration

## Project Structure

```
image-saver-dapp/
├── contracts/            # Smart contracts
├── frontend/             # React frontend application
├── scripts/              # Deployment scripts
└── test/                 # Contract tests
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MetaMask browser extension
- Pinata account for IPFS storage

### Smart Contract Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Create a `.env` file based on `.env.example`:

   ```
   PRIVATE_KEY=your_private_key_here
   ALCHEMY_API_KEY=your_alchemy_api_key_here
   PINATA_API_KEY=your_pinata_api_key_here
   PINATA_API_SECRET=your_pinata_api_secret_here
   ```

3. Run tests:

   ```
   npx hardhat test
   ```

4. Deploy the contract:
   ```
   npx hardhat run scripts/deploy.js --network sepolia
   ```
   Note the deployed contract address for frontend configuration.

### Frontend Setup

1. Navigate to the frontend directory:

   ```
   cd frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:

   ```
   VITE_CONTRACT_ADDRESS=your_deployed_contract_address
   VITE_PINATA_API_KEY=your_pinata_api_key
   VITE_PINATA_API_SECRET=your_pinata_api_secret
   ```

4. Start the development server:

   ```
   npm run dev
   ```

5. Open your browser at `http://localhost:5173`

## Usage

1. Connect your MetaMask wallet to the application
2. Choose an image to upload
3. The image will be stored on IPFS and its hash will be recorded on the blockchain
4. View all uploaded images in the gallery
5. Like your favorite images

## Networks Supported

- Ethereum Mainnet
- Sepolia Testnet
- Polygon Mainnet
- Mumbai Testnet

## Technologies Used

- **Frontend:**

  - React
  - Ethers.js
  - Tailwind CSS
  - Axios

- **Smart Contracts:**

  - Solidity
  - Hardhat
  - OpenZeppelin Contracts

- **Storage:**
  - IPFS (via Pinata)

## License

This project is licensed under the MIT License.

## Acknowledgements

- [IPFS](https://ipfs.io/)
- [Pinata](https://pinata.cloud/)
- [Ethereum](https://ethereum.org/)
- [Hardhat](https://hardhat.org/)
- [OpenZeppelin](https://openzeppelin.com/)
