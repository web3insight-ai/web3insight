// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Web3InsightsBadge is ERC721, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIds;

    struct Badge {
        uint256 tokenId;
        address owner;
        uint256 mintTime;
    }

    mapping(uint256 => Badge) private _badges;
    mapping(address => uint256) private _addressToTokenId;

    string private _baseTokenURI;

    event BadgeMinted(uint256 tokenId, address recipient, uint256 timestamp);

    constructor(address initialOwner, string memory baseTokenURI)
        ERC721("Web3InsightsBadge", "WIB")
        Ownable(initialOwner)
    {
        _baseTokenURI = baseTokenURI;
    }

    function mintBadge(address recipient) public onlyOwner {
        require(_addressToTokenId[recipient] == 0, "Recipient already has a badge");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(recipient, newTokenId);

        _badges[newTokenId] = Badge(newTokenId, recipient, block.timestamp);
        _addressToTokenId[recipient] = newTokenId;

        emit BadgeMinted(newTokenId, recipient, block.timestamp);
    }

    function getBadgeInfo(uint256 tokenId) public view returns (Badge memory) {
        require(_exists(tokenId), "Token does not exist");
        return _badges[tokenId];
    }

    function getAllBadges() public view returns (Badge[] memory) {
        Badge[] memory allBadges = new Badge[](_tokenIds.current());
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (_exists(i)) {
                allBadges[i - 1] = _badges[i];
            }
        }
        return allBadges;
    }

    function hasBadge(address owner) public view returns (bool) {
        return _addressToTokenId[owner] != 0;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string memory newBaseTokenURI) public onlyOwner {
        _baseTokenURI = newBaseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
    }

    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return _badges[tokenId].owner != address(0);
    }
}
