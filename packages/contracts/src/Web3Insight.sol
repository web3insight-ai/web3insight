// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Web3Insight
 * @dev Standard ERC721 NFT contract for Web3 developer profile insights
 * @custom:symbol W3I
 */
contract Web3Insight is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    // Contract state
    uint256 private _nextTokenId;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public mintPrice = 0.001 ether; // 0.001 MON on Monad testnet

    // Mapping from GitHub username to token ID
    mapping(string => uint256) public githubToTokenId;
    mapping(uint256 => string) public tokenIdToGithub;
    mapping(string => bool) public githubMinted;

    // Profile data struct
    struct ProfileData {
        string githubUsername;
        string name;
        string bio;
        uint256 web3Score;
        string[] skills;
        string[] ecosystems;
        uint256 mintTimestamp;
    }

    mapping(uint256 => ProfileData) public profiles;

    // Events
    event ProfileMinted(address indexed to, uint256 indexed tokenId, string githubUsername, uint256 web3Score);

    event PriceUpdated(uint256 oldPrice, uint256 newPrice);

    constructor(address initialOwner) ERC721("Web3Insight", "W3I") Ownable(initialOwner) {
        _nextTokenId = 1;
    }

    /**
     * @dev Mint a Web3Insight NFT with profile data - users mint to their own address
     * @param githubUsername GitHub username (must be unique)
     * @param name User's display name
     * @param bio User's bio
     * @param web3Score Calculated Web3 involvement score (0-100)
     * @param skills Array of user's technical skills
     * @param ecosystems Array of Web3 ecosystems user is involved in
     * @param metadataURI IPFS URI for the NFT metadata
     */
    function mintProfile(
        string memory githubUsername,
        string memory name,
        string memory bio,
        uint256 web3Score,
        string[] memory skills,
        string[] memory ecosystems,
        string memory metadataURI
    ) external payable {
        require(bytes(githubUsername).length > 0, "GitHub username required");
        require(!githubMinted[githubUsername], "Profile already minted for this GitHub user");
        require(_nextTokenId <= MAX_SUPPLY, "Max supply reached");
        require(msg.value >= mintPrice, "Insufficient payment");
        require(web3Score <= 100, "Web3 score must be 0-100");

        uint256 tokenId = _nextTokenId++;

        // Store profile data
        profiles[tokenId] = ProfileData({
            githubUsername: githubUsername,
            name: name,
            bio: bio,
            web3Score: web3Score,
            skills: skills,
            ecosystems: ecosystems,
            mintTimestamp: block.timestamp
        });

        // Create mappings
        githubToTokenId[githubUsername] = tokenId;
        tokenIdToGithub[tokenId] = githubUsername;
        githubMinted[githubUsername] = true;

        // Mint the NFT to msg.sender (user mints to their own address)
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit ProfileMinted(msg.sender, tokenId, githubUsername, web3Score);
    }

    /**
     * @dev Owner-only mint function for admin purposes
     */
    function ownerMint(
        address to,
        string memory githubUsername,
        string memory name,
        string memory bio,
        uint256 web3Score,
        string[] memory skills,
        string[] memory ecosystems,
        string memory metadataURI
    ) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(githubUsername).length > 0, "GitHub username required");
        require(!githubMinted[githubUsername], "Profile already minted for this GitHub user");
        require(_nextTokenId <= MAX_SUPPLY, "Max supply reached");
        require(web3Score <= 100, "Web3 score must be 0-100");

        uint256 tokenId = _nextTokenId++;

        // Store profile data
        profiles[tokenId] = ProfileData({
            githubUsername: githubUsername,
            name: name,
            bio: bio,
            web3Score: web3Score,
            skills: skills,
            ecosystems: ecosystems,
            mintTimestamp: block.timestamp
        });

        // Create mappings
        githubToTokenId[githubUsername] = tokenId;
        tokenIdToGithub[tokenId] = githubUsername;
        githubMinted[githubUsername] = true;

        // Mint the NFT to specified address
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit ProfileMinted(to, tokenId, githubUsername, web3Score);
    }

    /**
     * @dev Get profile data for a token ID
     */
    function getProfile(uint256 tokenId) external view returns (ProfileData memory) {
        require(_exists(tokenId), "Token does not exist");
        return profiles[tokenId];
    }

    /**
     * @dev Get token ID by GitHub username
     */
    function getTokenByGithub(string memory githubUsername) external view returns (uint256) {
        require(githubMinted[githubUsername], "No token minted for this GitHub user");
        return githubToTokenId[githubUsername];
    }

    /**
     * @dev Get user's skills array
     */
    function getSkills(uint256 tokenId) external view returns (string[] memory) {
        require(_exists(tokenId), "Token does not exist");
        return profiles[tokenId].skills;
    }

    /**
     * @dev Get user's ecosystems array
     */
    function getEcosystems(uint256 tokenId) external view returns (string[] memory) {
        require(_exists(tokenId), "Token does not exist");
        return profiles[tokenId].ecosystems;
    }

    /**
     * @dev Update mint price (owner only)
     */
    function setMintPrice(uint256 newPrice) external onlyOwner {
        uint256 oldPrice = mintPrice;
        mintPrice = newPrice;
        emit PriceUpdated(oldPrice, newPrice);
    }

    /**
     * @dev Update token URI (owner only, for metadata updates)
     */
    function updateTokenURI(uint256 tokenId, string memory newURI) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _setTokenURI(tokenId, newURI);
    }

    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success,) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Get total number of minted tokens
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    /**
     * @dev Check if a GitHub username has already minted
     */
    function isGithubMinted(string memory githubUsername) external view returns (bool) {
        return githubMinted[githubUsername];
    }

    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Check if token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
