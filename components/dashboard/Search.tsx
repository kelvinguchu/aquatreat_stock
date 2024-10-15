import React, { useState, useEffect, useRef } from 'react';
import { FaSearch } from "react-icons/fa";

interface Product {
  id: string;
  name: string;
  categoryName: string;
}

interface SearchProps {
  products: Product[];
  onSelect: (productId: string, categoryName: string) => void;
}

const Search: React.FC<SearchProps> = ({ products, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filteredProducts);
      setIsOpen(true);
    } else {
      setSearchResults([]);
      setIsOpen(false);
    }
  }, [searchTerm, products]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (product: Product) => {
    onSelect(product.id, product.categoryName);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full px-4 py-2 border rounded-md pr-10"
        />
        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          {searchResults.length > 0 ? (
            <ul className="max-h-[300px] overflow-auto py-2">
              {searchResults.map((product) => (
                <li 
                  key={product.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelect(product)}
                >
                  {product.name} - {product.categoryName}
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-gray-500">No results found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
