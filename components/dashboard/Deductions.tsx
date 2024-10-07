import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FaEllipsisV,
  FaUndo,
  FaTrash,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  Timestamp,
  where,
  Query,
  DocumentData,
} from "firebase/firestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Deduction {
  id: string;
  productId: string;
  productName: string;
  categoryName: string;
  amount: number;
  date: Date;
}

interface DeductionsProps {
  onReturnDeduction: (deduction: Deduction) => void;
  onDeleteDeduction: (deductionId: string) => void;
}

interface SearchParams {
  category?: string;
  startDate?: Date;
  endDate?: Date;
}

const ITEMS_PER_PAGE = 10;

const Deductions: React.FC<DeductionsProps> = ({
  onReturnDeduction,
  onDeleteDeduction,
}) => {
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDeductions = async (searchParams: SearchParams = {}, page = 1) => {
    setLoading(true);
    let deductionsQuery: Query<DocumentData> = query(
      collection(db, "deductions"),
      orderBy("date", "desc"),
      limit(ITEMS_PER_PAGE)
    );

    if (searchParams.category) {
      deductionsQuery = query(
        deductionsQuery,
        where("categoryName", "==", searchParams.category)
      );
    }
    if (searchParams.startDate) {
      deductionsQuery = query(
        deductionsQuery,
        where("date", ">=", searchParams.startDate)
      );
    }
    if (searchParams.endDate) {
      deductionsQuery = query(
        deductionsQuery,
        where("date", "<=", searchParams.endDate)
      );
    }

    if (page > 1) {
      const lastVisible = await getLastVisibleDoc(
        deductionsQuery,
        (page - 1) * ITEMS_PER_PAGE
      );
      if (lastVisible) {
        deductionsQuery = query(deductionsQuery, startAfter(lastVisible));
      }
    }

    const snapshot = await getDocs(deductionsQuery);
    const deductionList = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
          date:
            doc.data().date instanceof Timestamp
              ? doc.data().date.toDate()
              : new Date(doc.data().date),
        } as Deduction)
    );

    setDeductions(deductionList);
    setCurrentPage(page);

    // Get total count for pagination
    const totalSnapshot = await getDocs(query(collection(db, "deductions")));
    setTotalPages(Math.ceil(totalSnapshot.size / ITEMS_PER_PAGE));

    setLoading(false);
  };

  const getLastVisibleDoc = async (
    baseQuery: Query<DocumentData>,
    offset: number
  ) => {
    const q = query(baseQuery, limit(offset));
    const snapshot = await getDocs(q);
    return snapshot.docs[snapshot.docs.length - 1];
  };

  useEffect(() => {
    fetchDeductions();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const categoriesSnapshot = await getDocs(collection(db, "categories"));
    const categoryList = categoriesSnapshot.docs.map((doc) => doc.data().name);
    setCategories(["All", ...categoryList]);
  };

  const handleSearch = () => {
    const searchParams: SearchParams = {
      category: selectedCategory !== "All" ? selectedCategory : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };
    fetchDeductions(searchParams);
  };

  const handlePageChange = (page: number) => {
    fetchDeductions(
      {
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      page
    );
  };

  const filteredDeductions = deductions.filter((deduction) =>
    deduction.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setStartDate("");
    setEndDate("");
    fetchDeductions();
  };

  return (
    <div className='p-6 space-y-6 bg-white rounded-lg'>
      <h2 className='text-2xl font-semibold mb-4'>Deductions</h2>
      <div className='flex space-x-4 mb-4'>
        <Input
          type='text'
          placeholder='Search by product name...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='max-w-xs'
        />
        <Select onValueChange={setSelectedCategory} value={selectedCategory}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Select category' />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type='date'
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className='max-w-xs'
        />
        <Input
          type='date'
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className='max-w-xs'
        />
        <Button onClick={handleSearch}>
          <FaSearch className='mr-2' /> Search
        </Button>
        <Button onClick={clearSearch} variant='outline'>
          <FaTimes className='mr-2' /> Clear Search
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDeductions.map((deduction) => (
            <TableRow key={deduction.id}>
              <TableCell>{deduction.productName}</TableCell>
              <TableCell>{deduction.categoryName}</TableCell>
              <TableCell>{deduction.amount}</TableCell>
              <TableCell>{deduction.date.toLocaleString()}</TableCell>
              <TableCell>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant='ghost' className='h-8 w-8 p-0'>
                      <FaEllipsisV className='h-4 w-4' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-56'>
                    <div className='grid gap-4'>
                      <Button
                        className='w-full justify-start'
                        variant='ghost'
                        onClick={() => onReturnDeduction(deduction)}>
                        <FaUndo className='mr-2 h-4 w-4' />
                        Return
                      </Button>
                      <Button
                        className='w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-100'
                        variant='ghost'
                        onClick={() => onDeleteDeduction(deduction.id)}>
                        <FaTrash className='mr-2 h-4 w-4' />
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
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href='#'
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
                href='#'
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(index + 1);
                }}
                isActive={currentPage === index + 1}>
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href='#'
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

export default Deductions;
