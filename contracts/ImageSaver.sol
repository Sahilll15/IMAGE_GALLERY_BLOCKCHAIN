// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ImageSaver is Ownable {
    struct Image {
        string ipfsHash;
        address uploader;
        uint256 timestamp;
        uint256 likes;
    }

    Image[] public images;
    mapping(uint256 => mapping(address => bool)) public userLikes;
    mapping(address => uint256[]) public userImages;

    event ImageUploaded(
        uint256 indexed imageId,
        string ipfsHash,
        address indexed uploader,
        uint256 timestamp
    );
    event ImageLiked(uint256 indexed imageId, address indexed liker);

    constructor() Ownable(msg.sender) {}

    function uploadImage(string memory _ipfsHash) external {
        require(bytes(_ipfsHash).length > 0, "Invalid IPFS hash");

        uint256 imageId = images.length;
        images.push(
            Image({
                ipfsHash: _ipfsHash,
                uploader: msg.sender,
                timestamp: block.timestamp,
                likes: 0
            })
        );

        userImages[msg.sender].push(imageId);

        emit ImageUploaded(imageId, _ipfsHash, msg.sender, block.timestamp);
    }

    function likeImage(uint256 _imageId) external {
        require(_imageId < images.length, "Image does not exist");
        require(!userLikes[_imageId][msg.sender], "Image already liked");

        userLikes[_imageId][msg.sender] = true;
        images[_imageId].likes++;

        emit ImageLiked(_imageId, msg.sender);
    }

    function getAllImages() external view returns (Image[] memory) {
        return images;
    }

    function getUserImages(
        address _user
    ) external view returns (uint256[] memory) {
        return userImages[_user];
    }

    function getImageCount() external view returns (uint256) {
        return images.length;
    }
}
