'use client'
import AddCategoryForm from "./AddCategoryForm";
import AddProductForm from "./AddProductForm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

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

const Products = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch categories
    const unsubscribeCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      const fetchedCategories = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
      setCategories(fetchedCategories);
      
      // Set active tab to the first category if not set
      if (!activeTab && fetchedCategories.length > 0) {
        setActiveTab(fetchedCategories[0].id);
      }
    });

    // Fetch products
    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const fetchedProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(fetchedProducts);
    });

    return () => {
      unsubscribeCategories();
      unsubscribeProducts();
    };
  }, [activeTab]);

  const handleCategoryAdded = () => {
    setIsCategoryDialogOpen(false);
  };

  const handleProductAdded = () => {
    setIsProductDialogOpen(false);
  };

  const handleAddCategory = () => {
    setIsProductDialogOpen(false); // Close the product dialog
    setIsCategoryDialogOpen(true); // Open the category dialog
  };

  return (
    <div className='p-6 space-y-6'>
      {/* Add Category and Add Product Buttons */}
      <div className='flex space-x-4 mb-6'>
        {/* Add Category Button */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button className='bg-darkBlue text-white'>Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <h2>Add Category</h2>
            </DialogHeader>
            <AddCategoryForm onSuccess={handleCategoryAdded} />
          </DialogContent>
        </Dialog>

        {/* Add Product Button */}
        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogTrigger asChild>
            <Button className='bg-darkBlue text-white'>Add Product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <h2>Add Product</h2>
            </DialogHeader>
            <AddProductForm onSuccess={handleProductAdded} onAddCategory={handleAddCategory} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Product Categories as Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='mb-4'>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Products under each category */}
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {products
                .filter(product => product.categoryName === category.name)
                .map((product) => (
                  <div
                    key={product.id}
                    className='bg-white p-4 rounded-lg shadow-md'
                  >
                    <h3 className='text-lg font-semibold'>{product.name}</h3>
                    <p className='text-sm text-gray-600'>
                      Stock: {product.stock}
                      {product.isDivisible && product.fractionRemaining !== undefined
                        ? ` + ${product.fractionRemaining} ${product.fractionPerUnit}`
                        : ''}
                    </p>
                    {product.isDivisible && (
                      <p className='text-sm text-gray-600'>
                        Fraction per unit: {product.fractionPerUnit}
                      </p>
                    )}
                    <div className='mt-4 flex space-x-2'>
                      {/* Update Button */}
                      <Button className='bg-darkBlue text-white'>Update</Button>
                      {/* Make Sale Button */}
                      <Button className='bg-green-500 text-white'>
                        Make Sale
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Products;
