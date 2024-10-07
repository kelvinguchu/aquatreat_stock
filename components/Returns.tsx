'use client'
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, startAfter, getDocs, Timestamp } from "firebase/firestore";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface Return {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  date: Date;
}

const ITEMS_PER_PAGE = 10;

const Returns: React.FC = () => {
  const [returns, setReturns] = useState<Return[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReturns = async (page = 1) => {
    setLoading(true);
    let returnsQuery = query(
      collection(db, "returns"),
      orderBy("date", "desc"),
      limit(ITEMS_PER_PAGE)
    );

    if (page > 1) {
      const lastVisible = await getLastVisibleDoc(returnsQuery, (page - 1) * ITEMS_PER_PAGE);
      if (lastVisible) {
        returnsQuery = query(returnsQuery, startAfter(lastVisible));
      }
    }

    const snapshot = await getDocs(returnsQuery);
    const returnList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date instanceof Timestamp ? doc.data().date.toDate() : new Date(doc.data().date),
    } as Return));

    setReturns(returnList);
    setCurrentPage(page);

    // Get total count for pagination
    const totalSnapshot = await getDocs(query(collection(db, "returns")));
    setTotalPages(Math.ceil(totalSnapshot.size / ITEMS_PER_PAGE));

    setLoading(false);
  };

  const getLastVisibleDoc = async (baseQuery: any, offset: number) => {
    const q = query(baseQuery, limit(offset));
    const snapshot = await getDocs(q);
    return snapshot.docs[snapshot.docs.length - 1];
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handlePageChange = (page: number) => {
    fetchReturns(page);
  };

  const filteredReturns = returns.filter(returnItem =>
    returnItem.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='p-6 space-y-6'>
      <h2 className='text-2xl font-semibold mb-4'>Returns</h2>
      <div className='flex items-center mb-4'>
        <FaSearch className='text-gray-400 mr-2' />
        <Input
          type='text'
          placeholder='Search returns...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='max-w-xs'
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredReturns.map((returnItem) => (
            <TableRow key={returnItem.id}>
              <TableCell>{returnItem.productName}</TableCell>
              <TableCell>{returnItem.amount}</TableCell>
              <TableCell>{returnItem.date.toLocaleString()}</TableCell>
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

export default Returns;
