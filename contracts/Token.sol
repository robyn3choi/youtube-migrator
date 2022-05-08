//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";
import "hardhat/console.sol";

contract Token is ERC721, Ownable {
    struct Video {
        string id;
        string title;
        string channelId;
        string channelName;
        string thumbnailUri;
        string videoUri;
        string description;
        string publishedAt;
        string views;
        string likes;
        string dislikes;
        string commentCount;
    }

    uint256 private _tokenCounter;

    mapping(string => uint256) public videoIdToTokenId;
    mapping(uint256 => Video) private _tokenIdToVideo;

    event MintedNft(uint256 indexed tokenId, string videoId);

    constructor() ERC721("Youtube Migration", "YT3") {
        _tokenCounter = 1;
    }

    function mintNft(Video calldata vid) public {
        require(videoIdToTokenId[vid.id] == 0, "This video has already been minted as an NFT");
        _safeMint(msg.sender, _tokenCounter);
        _tokenIdToVideo[_tokenCounter] = vid;
        videoIdToTokenId[vid.id] = _tokenCounter;
        emit MintedNft(_tokenCounter, vid.id);
        _tokenCounter = _tokenCounter + 1;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        Video storage vid = _tokenIdToVideo[tokenId];
        require(bytes(vid.id).length != 0, "No video metadata found for token");

        bytes memory theBytes = bytes.concat(
            abi.encodePacked(
                '{"name":"',
                vid.title,
                '", "description":"',
                vid.description,
                '", "image":"',
                vid.thumbnailUri,
                '", "animation_url":"',
                vid.videoUri,
                '","attributes": [{"trait_type": "Published at", "value":"',
                abi.encodePacked(
                    vid.publishedAt,
                    '"}, {"trait_type": "Video ID", "value":"',
                    vid.id,
                    '"}, {"trait_type": "Channel ID", "value":"',
                    vid.channelId,
                    '"}, {"trait_type": "Channel Name", "value":"',
                    vid.channelName,
                    '"}, {"trait_type": "Views", "value":"',
                    vid.views,
                    '"}, {"trait_type": "Likes", "value":"',
                    vid.likes,
                    '"}, {"trait_type": "Dislikes", "value":"',
                    vid.dislikes,
                    '"}, {"trait_type": "Comment count", "value":"',
                    vid.commentCount,
                    '"}]}'
                )
            )
        );
        return string(abi.encodePacked(_baseURI(), Base64.encode(theBytes)));
    }
}
