import { NFTStorage } from 'nft.storage';

const token = 'YOUR_NFT_STORAGE_API_KEY'; // 🔐 Replace with your token
const client = new NFTStorage({ token });

export const uploadToIPFS = async (file) => {
  try {
    const blob = new Blob([file], { type: file.type });
    const cid = await client.storeBlob(blob);
    const url = `https://${cid}.ipfs.dweb.link`;
    return { cid, url };
  } catch (error) {
    console.error('IPFS upload failed:', error);
    return null;
  }
};