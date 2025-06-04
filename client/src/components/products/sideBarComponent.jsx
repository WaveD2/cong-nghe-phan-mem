import { useState, useEffect } from "react";
import { CATEGORIES , BRANDS} from "../../constant.js";

 
export default function SidebarComponent({
  setFilter,
  handlePriceRangeChange,
  minPrice,
  maxPrice,
  className
}) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isSticky, setIsSticky] = useState(true);

  // Optional: if you need to stop sticking near footer, you can use this scroll listener.
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
       setIsSticky(scrollY < docHeight - 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleCategoryClick = (value) => {
    const newValue = selectedCategory === value ? "" : value;
    setSelectedCategory(selectedCategory === value ? null : value);
    setFilter({ target: { name: "category", value: newValue } });
  };

  const handleBrandClick = (value) => {
    const newValue = selectedBrand === value ? "" : value;
    setSelectedBrand(selectedBrand === value ? null : value);
    setFilter({ target: { name: "brands", value: newValue } });
  };

  return (
    <aside
      className={`
        sidebar-container
        w-full md:w-60 lg:w-64 px-4 py-6 bg-white rounded-lg shadow
        ${isSticky ? "md:fixed md:top-20" : "md:relative"}
        ${className}
      `}
    >
      <div className="space-y-8">
        {/* Category Filter */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Category</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryClick(cat.value)}
                  className={`
                    px-3 py-1 rounded-full text-sm transition
                    ${isActive
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                  `}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Brand Filter */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Brands</h2>
          <div className="flex flex-wrap gap-2">
            {BRANDS.map((brand) => {
              const isActive = selectedBrand === brand;
              return (
                <button
                  key={brand}
                  onClick={() => handleBrandClick(brand)}
                  className={`
                    px-3 py-1 rounded-full text-sm transition
                    ${isActive
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                  `}
                >
                  {brand}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range Filter */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Price Range</h2>
          <div className="flex items-center space-x-2">
            <input
              name="min"
              type="number"
              value={minPrice}
              placeholder="Min"
              onChange={handlePriceRangeChange}
              className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <span className="text-gray-500">-</span>
            <input
              name="max"
              type="number"
              value={maxPrice}
              placeholder="Max"
              onChange={handlePriceRangeChange}
              className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
