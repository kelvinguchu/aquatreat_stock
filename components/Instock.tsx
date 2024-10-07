"use client";
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit, startAfter } from "firebase/firestore";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface Product {
  id: string;
  name: string;
  stock: number;
  categoryName: string;
  isDivisible: boolean;
  fractionPerUnit?: number;
  fractionRemaining?: number;
}

const ITEMS_PER_PAGE = 10;

const Instock: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    let productsQuery = query(
      collection(db, "products"),
      where("stock", ">", 0),
      orderBy("name"),
      limit(ITEMS_PER_PAGE)
    );

    if (page > 1) {
      const lastVisible = await getLastVisibleDoc(productsQuery, (page - 1) * ITEMS_PER_PAGE);
      if (lastVisible) {
        productsQuery = query(productsQuery, startAfter(lastVisible));
      }
    }

    const productsSnapshot = await getDocs(productsQuery);
    const productList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    setProducts(productList);
    setCurrentPage(page);

    // Get total count for pagination
    const totalSnapshot = await getDocs(query(collection(db, "products"), where("stock", ">", 0)));
    setTotalPages(Math.ceil(totalSnapshot.size / ITEMS_PER_PAGE));

    setLoading(false);
  };

  const getLastVisibleDoc = async (baseQuery: any, offset: number) => {
    const q = query(baseQuery, limit(offset));
    const snapshot = await getDocs(q);
    return snapshot.docs[snapshot.docs.length - 1];
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handlePageChange = (page: number) => {
    fetchProducts(page);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='p-6 space-y-6'>
      <h2 className='text-2xl font-semibold mb-4'>In Stock Products</h2>
      <div className='flex items-center mb-4'>
        <FaSearch className='text-gray-400 mr-2' />
        <Input
          type='text'
          placeholder='Search products...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='max-w-xs'
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.categoryName}</TableCell>
              <TableCell>
                {product.stock}
                {product.isDivisible && product.fractionRemaining !== undefined
                  ? ` + ${product.fractionRemaining} ${product.fractionPerUnit}`
                  : ''}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1 && !loading) {
                  handlePageChange(currentPage - 1);
                }
              }}
            />
          </PaginationItem>
          {[...Array(totalPages)].map((_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(index + 1);
                }}
                isActive={currentPage === index + 1}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages && !loading) {
                  handlePageChange(currentPage + 1);
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default Instock;
