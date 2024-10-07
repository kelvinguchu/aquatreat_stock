import {
  FaHome,
  FaBoxOpen,
  FaShoppingCart,
  FaUndo,
  FaPlus,
} from "react-icons/fa"; // React Icons
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader } from "@/components/ui/dialog";
import AddCategoryForm from "./AddCategoryForm";
import AddProductForm from "./AddProductForm";
import { useState } from "react";

const Sidebar = () => {
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  const handleCategoryAdded = () => {
    setIsCategoryDialogOpen(false);
  };

  const handleProductAdded = () => {
    setIsProductDialogOpen(false);
  };

  const handleAddCategory = () => {
    setIsProductDialogOpen(false);
    setIsCategoryDialogOpen(true);
  };

  return (
    <div className='flex flex-col p-4 space-y-6 text-gray-800'>
      <a href='/' className='flex items-center space-x-2'>
        <FaHome className='w-6 h-6' />
        <span>Dashboard</span>
      </a>
      <a href='/in-stock' className='flex items-center space-x-2'>
        <FaBoxOpen className='w-6 h-6' />
        <span>In Stock</span>
      </a>
      <a href='/products' className='flex items-center space-x-2'>
        <FaShoppingCart className='w-6 h-6' />
        <span>Products</span>
      </a>
      <a href='/returns' className='flex items-center space-x-2'>
        <FaUndo className='w-6 h-6' />
        <span>Returns</span>
      </a>

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogTrigger asChild>
          <Button className='bg-darkBlue text-white'>
            <FaPlus className="mr-2" /> Add Category
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <h2>Add Category</h2>
          </DialogHeader>
          <AddCategoryForm onSuccess={handleCategoryAdded} />
        </DialogContent>
      </Dialog>

      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogTrigger asChild>
          <Button className='bg-darkBlue text-white'>
            <FaPlus className="mr-2" /> Add Product
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <h2>Add Product</h2>
          </DialogHeader>
          <AddProductForm
            onSuccess={handleProductAdded}
            onAddCategory={handleAddCategory}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sidebar;
