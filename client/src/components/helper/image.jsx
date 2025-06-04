import { useState, useRef } from 'react';

const ImageUpload = ({ maxImages = 5, singleImage = false, setImages, imagesDefault= [] }) => {
  const [internalImages, setInternalImages] = useState(imagesDefault);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('images', file);
    try {
      //import.meta.env.VITE_API_URL
      const response = await fetch(`http://localhost:80/api/product-service/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'ngrok-skip-browser-warning': 'true', 
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }
      return data.files[0].url;
    } catch (err) {
      throw new Error('Failed to upload image: ' + err.message);
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (singleImage && files.length > 1) {
      setError('Chỉ được upload 1 hình ảnh.');
      return;
    }
    if (!singleImage && internalImages.length + files.length > maxImages) {
      setError(`Không được upload hình arnhn nhiêu hơn ${maxImages} images.`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const uploadPromises = files.map(file => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      let newImages;
      if (singleImage) {
        newImages = uploadedUrls;
      } else {
        newImages = [...internalImages, ...uploadedUrls];
      }
      
      setInternalImages(newImages);
      setImages(newImages);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index) => {
    const newImages = internalImages.filter((_, i) => i !== index);
    setInternalImages(newImages);
    setImages(newImages);
    setError('');
  };

  return (
    <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2 text-gray-800">
        {singleImage ? 'Tải hình ảnh' : `Tải hình ảnh (Max ${maxImages})`}
      </h3>
      
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          multiple={!singleImage}
          onChange={handleFileChange}
          ref={fileInputRef}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={isLoading || (!singleImage && internalImages.length >= maxImages)}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 rounded-md">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {internalImages.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {internalImages.map((url, index) => (
            <div key={index} className="relative group">
              {
                url && 
                  <img
                    src={url}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
              }
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;