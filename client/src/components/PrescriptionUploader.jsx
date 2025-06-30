// 📁 src/components/PrescriptionUploader.jsx
import React, { useState } from 'react';
import { uploadToIPFS } from '../utils/nftStorage';

const PrescriptionUploader = () => {
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const result = await uploadToIPFS(file);
    setLoading(false);

    if (result) {
      setFileUrl(result.url);
      console.log('Uploaded to:', result.url);
    } else {
      alert('Upload failed. Please try again.');
    }
  };

  return (
    <div className="upload-container">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {loading && <p>Uploading...</p>}
      {fileUrl && (
        <div>
          <p>Uploaded File:</p>
          <a href={fileUrl} target="_blank" rel="noreferrer">{fileUrl}</a>
          <br />
          <img src={fileUrl} alt="Uploaded prescription" style={{ maxWidth: '300px' }} />
        </div>
      )}
    </div>
  );
};

export default PrescriptionUploader;
