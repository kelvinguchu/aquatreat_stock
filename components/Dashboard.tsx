"use client"
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaExclamationTriangle, FaChartLine, FaSearch, FaTrash, FaEdit, FaMinus, FaEllipsisV, FaUndo } from "react-icons/fa";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit, Timestamp, deleteDoc, doc, where } from "firebase/firestore";
import DeductProduct from './DeductProduct';
import DeleteProduct from './DeleteProduct';
import UpdateProduct from './UpdateProduct';
import AddProductForm from './AddProductForm';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { returnDeduction } from '@/lib/firebaseUtils';

interface Product {
  id: string;
  name: string;
  stock: number;
  categoryName: string;
  isDivisible: boolean;
  fractionPerUnit?: number;
  fractionRemaining?: number;
}

interface Deduction {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  date: Date;
}

interface Category {
  id: string;
  name: string;
}

const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockAlerts, setStockAlerts] = useState<Product[]>([]);
  const [topSelling, setTopSelling] = useState<{ product: string; sales: number }[]>([]);
  const [latestDeductions, setLatestDeductions] = useState<Deduction[]>([]);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productToUpdate, setProductToUpdate] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    console.log("Dashboard useEffect triggered");

    // Fetch only products with low stock
    const lowStockQuery = query(
      collection(db, "products"),
      where("stock", "<", 10),
      limit(20) // Adjust this number as needed
    );

    const unsubscribeLowStock = onSnapshot(lowStockQuery, (snapshot) => {
      console.log("Low stock products snapshot received", snapshot.size);
      const productList: Product[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      console.log("Processed low stock products:", productList);
      setStockAlerts(productList);
    }, (error) => {
      console.error("Error fetching low stock products:", error);
    });

    // Fetch latest deductions
    const deductionsQuery = query(
      collection(db, "deductions"),
      orderBy("date", "desc"),
      limit(5)
    );
    const unsubscribeDeductions = onSnapshot(deductionsQuery, (snapshot) => {
      console.log("Deductions snapshot received", snapshot.size);
      const deductionList: Deduction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        deductionList.push({
          id: doc.id,
          productId: data.productId,
          productName: data.productName,
          amount: data.amount,
          date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
        });
      });
      console.log("Processed deductions:", deductionList);
      setLatestDeductions(deductionList);
    }, (error) => {
      console.error("Error fetching deductions:", error);
    });

    // Fetch categories
    const categoriesQuery = query(collection(db, "categories"));
    const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
      console.log("Categories snapshot received", snapshot.size);
      const categoryList: Category[] = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
      console.log("Processed categories:", categoryList);
      setCategories(categoryList);

      // Set active tab to the first category if not set
      if (!activeTab && categoryList.length > 0) {
        setActiveTab(categoryList[0].id);
      }
    }, (error) => {
      console.error("Error fetching categories:", error);
    });

    return () => {
      unsubscribeLowStock();
      unsubscribeDeductions();
      unsubscribeCategories();
    };
  }, []);

  const filteredProducts = (categoryName: string) => 
    categoryName === 'All' 
      ? products.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : products.filter(product => 
          product.categoryName === categoryName && 
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const handleDeductSuccess = () => {
    setSelectedProduct(null);
  };

  const handleUpdateSuccess = () => {
    setProductToUpdate(null);
  };

  const handleDeleteSuccess = () => {
    setProductToDelete(null);
  };

  const handleDeleteCancel = () => {
    setProductToDelete(null);
  };

  const handleDeleteDeduction = async (deductionId: string) => {
    try {
      await deleteDoc(doc(db, "deductions", deductionId));
      // The UI will update automatically due to the real-time listener
    } catch (error) {
      console.error("Error deleting deduction:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleAddProduct = (category: string) => {
    setSelectedCategory(category);
    setIsAddProductDialogOpen(true);
  };

  const handleProductAdded = () => {
    setIsAddProductDialogOpen(false);
  };

  const handleReturnDeduction = async (deduction: Deduction) => {
    try {
      await returnDeduction(deduction);
      // The UI will update automatically due to the real-time listener
    } catch (error) {
      console.error("Error returning deduction:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className='p-6 space-y-6'>
      {/* Debug information */}
      <div className="bg-yellow-100 p-4 rounded-md">
        <h3 className="font-bold">Debug Info:</h3>
        <p>Products: {products.length}</p>
        <p>Categories: {categories.length}</p>
        <p>Stock Alerts: {stockAlerts.length}</p>
        <p>Latest Deductions: {latestDeductions.length}</p>
      </div>

      {/* Stock Alerts and Top Selling Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
        {/* Stock Alert Card */}
        <div className='bg-midLightBlue p-4 rounded-lg shadow-md'>
          <div className='flex items-center space-x-2 mb-2'>
            <FaExclamationTriangle className='text-red-500 w-5 h-5' />
            <h2 className='text-lg font-semibold'>Stock Alert</h2>
          </div>
          <div>
            {stockAlerts.length > 0 ? (
              stockAlerts.map((alert) => (
                <p key={alert.id}>
                  {alert.name}: <span className='font-bold'>{alert.stock}</span> remaining
                </p>
              ))
            ) : (
              <p>No products with low stock.</p>
            )}
          </div>
        </div>

        {/* Top Selling Card */}
        <div className='bg-lightBlue p-4 rounded-lg shadow-md'>
          <div className='flex items-center space-x-2 mb-2'>
            <FaChartLine className='text-darkBlue w-5 h-5' />
            <h2 className='text-lg font-semibold'>Top Selling</h2>
          </div>
          <div>
            {topSelling.map((product, index) => (
              <p key={index}>
                {product.product}: <span className='font-bold'>{product.sales}</span> sales
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Product Inventory Section */}
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
            <TabsTrigger value="All">All</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="All">
            <ProductTable 
              products={filteredProducts('All')}
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
          </TabsContent>
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
                    style={{ width: '300px', height: '300px' }}
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
      </div>

      {/* Latest Deductions Section */}
      <div className='bg-white p-6 rounded-lg shadow-md'>
        <h2 className='text-xl font-semibold mb-4'>Latest Deductions</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {latestDeductions.map((deduction) => (
              <TableRow key={deduction.id}>
                <TableCell>{deduction.productName}</TableCell>
                <TableCell>{deduction.amount}</TableCell>
                <TableCell>{deduction.date.toLocaleString()}</TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <FaEllipsisV className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56">
                      <div className="grid gap-4">
                        <Button
                          className="w-full justify-start"
                          variant="ghost"
                          onClick={() => handleReturnDeduction(deduction)}
                        >
                          <FaUndo className="mr-2 h-4 w-4" />
                          Return
                        </Button>
                        <Button
                          className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-100"
                          variant="ghost"
                          onClick={() => handleDeleteDeduction(deduction.id)}
                        >
                          <FaTrash className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product to {selectedCategory}</DialogTitle>
          </DialogHeader>
          <AddProductForm 
            onSuccess={handleProductAdded} 
            onAddCategory={() => {}} 
            initialCategory={selectedCategory}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Separate component for the product table
interface ProductTableProps {
  products: Product[];
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
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  setSelectedProduct,
  setProductToUpdate,
  setProductToDelete,
  selectedProduct,
  productToUpdate,
  productToDelete,
  handleDeductSuccess,
  handleUpdateSuccess,
  handleDeleteSuccess,
  handleDeleteCancel
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>{product.name}</TableCell>
            <TableCell>{product.categoryName}</TableCell>
            <TableCell>
              {product.stock}
              {product.isDivisible && product.fractionRemaining !== undefined
                ? ` + ${product.fractionRemaining} ${product.fractionPerUnit}`
                : ''}
            </TableCell>
            <TableCell>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <FaEllipsisV className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                  <div className="grid gap-4">
                    <Button
                      className="w-full justify-start"
                      variant="ghost"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <FaMinus className="mr-2 h-4 w-4" />
                      Deduct
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="ghost"
                      onClick={() => setProductToUpdate(product)}
                    >
                      <FaEdit className="mr-2 h-4 w-4" />
                      Update
                    </Button>
                    <Button
                      className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-100"
                      variant="ghost"
                      onClick={() => setProductToDelete(product)}
                    >
                      <FaTrash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Deduct Dialog */}
              <Dialog open={selectedProduct?.id === product.id} onOpenChange={(open) => !open && setSelectedProduct(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Deduct Product: {selectedProduct?.name}</DialogTitle>
                  </DialogHeader>
                  {selectedProduct && (
                    <DeductProduct 
                      product={selectedProduct} 
                      onSuccess={handleDeductSuccess}
                    />
                  )}
                </DialogContent>
              </Dialog>

              {/* Update Dialog */}
              <Dialog open={productToUpdate?.id === product.id} onOpenChange={(open) => !open && setProductToUpdate(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Product: {productToUpdate?.name}</DialogTitle>
                  </DialogHeader>
                  {productToUpdate && (
                    <UpdateProduct 
                      product={productToUpdate}
                      onSuccess={handleUpdateSuccess}
                    />
                  )}
                </DialogContent>
              </Dialog>

              {/* Delete Dialog */}
              <Dialog open={productToDelete?.id === product.id} onOpenChange={(open) => !open && setProductToDelete(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Product: {productToDelete?.name}</DialogTitle>
                  </DialogHeader>
                  {productToDelete && (
                    <DeleteProduct 
                      product={productToDelete}
                      onSuccess={handleDeleteSuccess}
                      onCancel={handleDeleteCancel}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default Dashboard;