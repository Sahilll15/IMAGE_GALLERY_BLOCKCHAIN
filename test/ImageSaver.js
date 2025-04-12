const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ImageSaver", function () {
  let imageSaver;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const ImageSaver = await ethers.getContractFactory("ImageSaver");
    imageSaver = await ImageSaver.deploy();
  });

  describe("Image Upload", function () {
    it("Should upload an image correctly", async function () {
      const ipfsHash = "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX";
      await imageSaver.connect(addr1).uploadImage(ipfsHash);
      
      const imageCount = await imageSaver.getImageCount();
      expect(imageCount).to.equal(1);
      
      const image = await imageSaver.images(0);
      expect(image.ipfsHash).to.equal(ipfsHash);
      expect(image.uploader).to.equal(addr1.address);
      expect(image.likes).to.equal(0);
    });

    it("Should emit an event when an image is uploaded", async function () {
      const ipfsHash = "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX";
      
      await expect(imageSaver.connect(addr1).uploadImage(ipfsHash))
        .to.emit(imageSaver, "ImageUploaded")
        .withArgs(0, ipfsHash, addr1.address, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));
    });
  });

  describe("Like Feature", function () {
    beforeEach(async function () {
      await imageSaver.connect(addr1).uploadImage("QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX");
    });

    it("Should allow a user to like an image", async function () {
      await imageSaver.connect(addr2).likeImage(0);
      
      const image = await imageSaver.images(0);
      expect(image.likes).to.equal(1);
      
      const hasLiked = await imageSaver.userLikes(0, addr2.address);
      expect(hasLiked).to.be.true;
    });

    it("Should not allow a user to like an image twice", async function () {
      await imageSaver.connect(addr2).likeImage(0);
      
      await expect(
        imageSaver.connect(addr2).likeImage(0)
      ).to.be.revertedWith("Image already liked");
    });
  });

  describe("Get Functions", function () {
    beforeEach(async function () {
      await imageSaver.connect(addr1).uploadImage("Hash1");
      await imageSaver.connect(addr1).uploadImage("Hash2");
      await imageSaver.connect(addr2).uploadImage("Hash3");
    });

    it("Should return all images", async function () {
      const allImages = await imageSaver.getAllImages();
      expect(allImages.length).to.equal(3);
    });

    it("Should return user images correctly", async function () {
      const addr1Images = await imageSaver.getUserImages(addr1.address);
      expect(addr1Images.length).to.equal(2);
      expect(addr1Images[0]).to.equal(0);
      expect(addr1Images[1]).to.equal(1);
      
      const addr2Images = await imageSaver.getUserImages(addr2.address);
      expect(addr2Images.length).to.equal(1);
      expect(addr2Images[0]).to.equal(2);
    });
  });
}); 