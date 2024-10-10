"use client";
import React, { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  Timestamp,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { returnDeduction } from "@/lib/firebaseUtils";
import StockAlerts from "./dashboard/StockAlerts";
import TopSelling from "./dashboard/TopSelling";
import ProductInventory from "./dashboard/ProductInventory";
import Deductions from "./dashboard/Deductions";
import { getCachedProducts, setCachedProducts, invalidateProductCache } from '@/lib/productCache';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddProductForm from './AddProductForm';

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

interface TopSellingProduct {
  productName: string;
  totalDeductions: number;
}

const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockAlerts, setStockAlerts] = useState<Product[]>([]);
  const [topSelling, setTopSelling] = useState<TopSellingProduct[]>([]);
  const [latestDeductions, setLatestDeductions] = useState<Deduction[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToUpdate, setProductToUpdate] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);

  const updateTopSelling = useCallback((deductions: Deduction[]) => {
    const productDeductions = deductions.reduce((acc, deduction) => {
      const { productName, amount } = deduction;
      if (!acc[productName]) {
        acc[productName] = 0;
      }
      acc[productName] += amount;
      return acc;
    }, {} as Record<string, number>);

    const topSellingProducts = Object.entries(productDeductions)
      .map(([productName, totalDeductions]) => ({ productName, totalDeductions }))
      .sort((a, b) => b.totalDeductions - a.totalDeductions)
      .slice(0, 5);

    setTopSelling(topSellingProducts);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      // Check cache for products
      const cachedProducts = await getCachedProducts();
      if (cachedProducts) {
        setProducts(cachedProducts);
      }

      // Set up snapshot listeners
      const productsQuery = query(collection(db, "products"));
      const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
        const productList: Product[] = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Product)
        );
        setProducts(productList);
        setCachedProducts(productList);
      });

      const categoriesQuery = query(collection(db, "categories"));
      const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
        const categoryList: Category[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setCategories(categoryList);
      });

      const lowStockQuery = query(
        collection(db, "products"),
        where("stock", "<", 10),
        limit(20)
      );
      const unsubscribeLowStock = onSnapshot(lowStockQuery, (snapshot) => {
        const productList: Product[] = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Product)
        );
        setStockAlerts(productList);
      });

      const latestDeductionsQuery = query(
        collection(db, "deductions"),
        orderBy("date", "desc"),
        limit(100)
      );
      const unsubscribeDeductions = onSnapshot(latestDeductionsQuery, (snapshot) => {
        const deductionList: Deduction[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            productId: data.productId,
            productName: data.productName,
            amount: data.amount,
            date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
          };
        });
        setLatestDeductions(deductionList.slice(0, 5));
        updateTopSelling(deductionList);
      });

      return () => {
        unsubscribeProducts();
        unsubscribeCategories();
        unsubscribeLowStock();
        unsubscribeDeductions();
      };
    };

    fetchInitialData();
  }, [updateTopSelling]);

  const handleReturnDeduction = async (deduction: Deduction) => {
    try {
      await returnDeduction(deduction);
      // Remove the returned deduction from the local state
      setLatestDeductions(prevDeductions => 
        prevDeductions.filter(d => d.id !== deduction.id)
      );
    } catch (error) {
      console.error("Error returning deduction:", error);
    }
  };

  const handleDeleteDeduction = async (deductionId: string) => {
    try {
      await deleteDoc(doc(db, "deductions", deductionId));
    } catch (error) {
      console.error("Error deleting deduction:", error);
    }
  };

  const handleDeductSuccess = async () => {
    setSelectedProduct(null);
    await invalidateProductCache();
  };

  const handleUpdateSuccess = async () => {
    setProductToUpdate(null);
    await invalidateProductCache();
  };

  const handleDeleteSuccess = async () => {
    setProductToDelete(null);
    await invalidateProductCache();
  };

  const handleDeleteCancel = () => {
    setProductToDelete(null);
  };

  const handleProductAdded = () => {
    setIsAddProductDialogOpen(false);
  };

  const handleAddProduct = (category: string) => {
    setSelectedCategory(category);
    setIsAddProductDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    try {
      // Delete the category
      await deleteDoc(doc(db, "categories", categoryId));

      // Update products in this category to "Uncategorized"
      const productsToUpdate = products.filter(p => p.categoryName === categoryName);
      for (const product of productsToUpdate) {
        await updateDoc(doc(db, "products", product.id), {
          categoryName: "Uncategorized"
        });
      }

      // Update local state
      setCategories(prevCategories => prevCategories.filter(cat => cat.id !== categoryId));
      setProducts(prevProducts => prevProducts.map(p => 
        p.categoryName === categoryName ? {...p, categoryName: "Uncategorized"} : p
      ));

      // Ensure "Uncategorized" category exists
      const uncategorizedExists = categories.some(cat => cat.name === "Uncategorized");
      if (!uncategorizedExists) {
        const newUncategorized = await addDoc(collection(db, "categories"), { name: "Uncategorized" });
        setCategories(prevCategories => [...prevCategories, { id: newUncategorized.id, name: "Uncategorized" }]);
      }

    } catch (error) {
      console.error("Error deleting category:", error);
      // Handle the error (show a notification to the user, etc.)
    }
  };

  const handleRenameCategory = async (categoryId: string, newName: string) => {
    try {
      await updateDoc(doc(db, "categories", categoryId), { name: newName });
      
      // Update local state
      setCategories(prevCategories => 
        prevCategories.map(cat => 
          cat.id === categoryId ? { ...cat, name: newName } : cat
        )
      );

      // Update products with the old category name
      const oldCategory = categories.find(cat => cat.id === categoryId);
      if (oldCategory) {
        const productsToUpdate = products.filter(p => p.categoryName === oldCategory.name);
        for (const product of productsToUpdate) {
          await updateDoc(doc(db, "products", product.id), {
            categoryName: newName
          });
        }

        // Update local state for products
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p.categoryName === oldCategory.name ? { ...p, categoryName: newName } : p
          )
        );
      }
    } catch (error) {
      console.error("Error renaming category:", error);
      // Handle the error (show a notification to the user, etc.)
    }
  };

  const handleAddProductToCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setIsAddProductDialogOpen(true);
  };

  return (
    <div className='p-6 space-y-6'>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
        <StockAlerts stockAlerts={stockAlerts} />
        <TopSelling topSelling={topSelling} />
      </div>

      <ProductInventory 
        products={products} 
        categories={categories}
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
        handleAddProduct={handleAddProduct}
        onDeleteCategory={handleDeleteCategory}
        onRenameCategory={handleRenameCategory}
        onAddProductToCategory={handleAddProductToCategory}
      />

      <Deductions
        onReturnDeduction={handleReturnDeduction}
        onDeleteDeduction={handleDeleteDeduction}
        categories={categories} // Pass categories to Deductions component
      />

      {/* Add Product Dialog */}
      <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product to {selectedCategory}</DialogTitle>
          </DialogHeader>
          <AddProductForm 
            onSuccess={handleProductAdded} 
            onAddCategory={() => {}} 
            initialCategory={selectedCategory || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;