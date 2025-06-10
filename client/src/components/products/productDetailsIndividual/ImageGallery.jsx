import { useState } from "react";

const ImageGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  // Ensure images array is valid, fallback to placeholder if empty
  const validImages = Array.isArray(images) && images.length > 0 ? images : ["/placeholder.png"];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center justify-center p-4">
      {/* Thumbnail Gallery */}
      <div className="flex lg:flex-col gap-3 order-2 lg:order-1">
        {validImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`relative flex-shrink-0 rounded-md overflow-hidden transition-all duration-200 ${
              selectedImage === index
                ? "ring-2 ring-blue-500 ring-offset-2"
                : "hover:ring-2 hover:ring-blue-300"
            }`}
          >
            <img
              src={image || "/placeholder.png"}
              alt={`Product thumbnail ${index + 1}`}
              className="w-16 h-16 object-cover rounded-md hover:opacity-90 transition-opacity"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="order-1 lg:order-2 w-full min-w-[550px] max-w-[550px]">
        <img
          src={validImages[selectedImage] || "/placeholder.png"}
          alt="Selected product"
          className="w-full h-auto max-h-[500px] object-contain rounded-xl shadow-lg"
        />
      </div>
    </div>
  );
};

export default ImageGallery;