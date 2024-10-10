import React, { useState, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";

interface Product {
  id: string;
  name: string;
  categoryName: string;
}

interface SearchPopoverProps {
  products: Product[];
  onSelect: (productId: string, categoryName: string) => void;
}

const SearchPopover: React.FC<SearchPopoverProps> = ({ products, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filteredProducts);
      setIsOpen(filteredProducts.length > 0);
    } else {
      setSearchResults([]);
      setIsOpen(false);
    }
  }, [searchTerm, products]);

  const handleSelect = (product: Product) => {
    onSelect(product.id, product.categoryName);
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="pr-10"
          />
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
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
      </PopoverContent>
    </Popover>
  );
};

export default SearchPopover;
