"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import ProductTable from './dashboard/ProductTable';

interface Product {
  id: string;
  name: string;
  stock: number;
  categoryName: string;
  isDivisible: boolean;
  fractionPerUnit?: number;
  fractionRemaining?: number;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToUpdate, setProductToUpdate] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsSnapshot = await getDocs(collection(db, "products"));
        const productList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        console.log("Fetched products:", productList); // Debug log
        setProducts(productList);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to fetch products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDeductSuccess = () => {
    setSelectedProduct(null);
    // Optionally, refresh the products list here
  };

  const handleUpdateSuccess = () => {
    setProductToUpdate(null);
    // Optionally, refresh the products list here
  };

  const handleDeleteSuccess = () => {
    setProductToDelete(null);
    // Optionally, refresh the products list here
  };

  const handleDeleteCancel = () => {
    setProductToDelete(null);
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className='p-6 space-y-6'>
      <h2 className='text-2xl font-semibold mb-4'>All Products</h2>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ProductTable 
          products={products}
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
      )}
    </div>
  );
};

export default Products;