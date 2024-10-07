import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaSearch, FaTrash, FaEdit, FaPlus } from "react-icons/fa";
import ProductTable from './ProductTable';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Product {
  id: string;
  name: string;
  stock: number;
  categoryName: string;
  isDivisible: boolean;
  fractionPerUnit?: number;
  fractionRemaining?: number;
}

interface Category {
  id: string;
  name: string;
}

interface ProductInventoryProps {
  products: Product[];
  categories: Category[];
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  setProductToUpdate: React.Dispatch<React.SetStateAction<Product | null>>;
  setProductToDelete: React.Dispatch<React.SetStateAction<Product | null>>;
  selectedProduct: Product | null;
  productToUpdate: Product | null;
  productToDelete: Product | null;
  handleDeductSuccess: () => void;
  handleUpdateSuccess: () => void;
  handleDeleteSuccess: () => void;
  handleDeleteCancel: () => void;
  handleAddProduct: (category: string) => void;
  onDeleteCategory: (categoryId: string, categoryName: string) => void;
  onRenameCategory: (categoryId: string, newName: string) => void;
  onAddProductToCategory: (categoryName: string) => void;
}

const ProductInventory: React.FC<ProductInventoryProps> = ({ 
  products, 
  categories,
  setSelectedProduct,
  setProductToUpdate,
  setProductToDelete,
  selectedProduct,
  productToUpdate,
  productToDelete,
  handleDeductSuccess,
  handleUpdateSuccess,
  handleDeleteSuccess,
  handleDeleteCancel,
  handleAddProduct,
  onDeleteCategory,
  onRenameCategory,
  onAddProductToCategory
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>('');
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleteCategoryName, setDeleteCategoryName] = useState<string>('');
  const [confirmDeleteName, setConfirmDeleteName] = useState<string>('');
  const [renameCategoryId, setRenameCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState<string>('');

  useEffect(() => {
    if (categories.length > 0 && !activeTab) {
      setActiveTab(categories[0].id);
    }
  }, [categories, activeTab]);

  const filteredProducts = (categoryName: string) =>
    products.filter(
      (product) =>
        product.categoryName === categoryName &&
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    setDeleteCategoryId(categoryId);
    setDeleteCategoryName(categoryName);
    setConfirmDeleteName('');
  };

  const handleRenameCategory = (categoryId: string, currentName: string) => {
    setRenameCategoryId(categoryId);
    setNewCategoryName(currentName);
  };

  const confirmRenameCategory = () => {
    if (renameCategoryId && newCategoryName.trim() !== '') {
      onRenameCategory(renameCategoryId, newCategoryName.trim());
      setRenameCategoryId(null);
      setNewCategoryName('');
    }
  };

  const confirmDeleteCategory = () => {
    if (deleteCategoryId && confirmDeleteName === deleteCategoryName) {
      onDeleteCategory(deleteCategoryId, deleteCategoryName);
      setDeleteCategoryId(null);
      setDeleteCategoryName('');
      setConfirmDeleteName('');
    }
  };

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-semibold'>Product Inventory</h2>
        <div className='flex items-center'>
          <FaSearch className='text-gray-400 mr-2' />
          <Input
            type='text'
            placeholder='Search products...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='max-w-xs'
          />
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {categories.map((category) => (
            <HoverCard key={category.id} openDelay={300} closeDelay={200}>
              <HoverCardTrigger asChild>
                <TabsTrigger 
                  value={category.id}
                  className={`relative ${activeTab === category.id ? 'bg-midLightBlue text-[darkBlue]' : ''}`}
                >
                  {category.name}
                </TabsTrigger>
              </HoverCardTrigger>
              <HoverCardContent className="w-auto" side="top">
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRenameCategory(category.id, category.name)}
                  >
                    <FaEdit className="mr-2" /> Rename Category
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddProductToCategory(category.name)}
                  >
                    <FaPlus className="mr-2" /> Add Product
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id, category.name)}
                  >
                    <FaTrash className="mr-2" /> Delete Category
                  </Button>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </TabsList>
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            {filteredProducts(category.name).length > 0 ? (
              <ProductTable 
                products={filteredProducts(category.name)}
                setSelectedProduct={setSelectedProduct}
                setProductToUpdate={setProductToUpdate}
                setProductToDelete={setProductToDelete}
                selectedProduct={selectedProduct}
                productToUpdate={productToUpdate}
                productToDelete={productToDelete}
                handleDeductSuccess={handleDeductSuccess}
                handleUpdateSuccess={handleUpdateSuccess}
                handleDeleteSuccess={handleDeleteSuccess}
                handleDeleteCancel={handleDeleteCancel}
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <DotLottieReact
                  src="https://lottie.host/cd05d6b5-1bed-4ead-9c5b-51dd473dc491/X9sRzN0NxR.json"
                  loop
                  autoplay
                  style={{ width: '100px', height: '100px' }}
                />
                <p className="mt-4 text-lg font-semibold">No products in this category</p>
                <Button 
                  className='mt-4 bg-darkBlue text-white'
                  onClick={() => handleAddProduct(category.name)}
                >
                  Add Product
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category: {deleteCategoryName}</DialogTitle>
          </DialogHeader>
          <p>Please type the category name to confirm deletion:</p>
          <Input
            value={confirmDeleteName}
            onChange={(e) => setConfirmDeleteName(e.target.value)}
            placeholder="Type category name here"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCategoryId(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteCategory}
              disabled={confirmDeleteName !== deleteCategoryName}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!renameCategoryId} onOpenChange={() => setRenameCategoryId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Category</DialogTitle>
          </DialogHeader>
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Enter new category name"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameCategoryId(null)}>Cancel</Button>
            <Button 
              onClick={confirmRenameCategory}
              disabled={newCategoryName.trim() === ''}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductInventory;