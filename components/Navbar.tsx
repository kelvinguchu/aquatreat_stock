"use client";
import { useState, useEffect } from "react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { FaBars, FaChartLine, FaExclamationTriangle } from "react-icons/fa";
import Link from "next/link";
import Sidebar from "./Sidebar";
import Image from "next/image";
import Logout from "./Logout";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  Timestamp,
  where,
} from "firebase/firestore";

interface Product {
  id: string;
  name: string;
  stock: number;
}

interface TopSellingProduct {
  productName: string;
  totalDeductions: number;
}

interface Deduction {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  date: Date;
}

const Navbar = () => {
  const [stockAlerts, setStockAlerts] = useState<Product[]>([]);
  const [topSelling, setTopSelling] = useState<TopSellingProduct[]>([]);

  useEffect(() => {
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
    const unsubscribeDeductions = onSnapshot(
      latestDeductionsQuery,
      (snapshot) => {
        const deductionList: Deduction[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            productId: data.productId,
            productName: data.productName,
            amount: data.amount,
            date:
              data.date instanceof Timestamp
                ? data.date.toDate()
                : new Date(data.date),
          };
        });
        updateTopSelling(deductionList);
      }
    );

    return () => {
      unsubscribeLowStock();
      unsubscribeDeductions();
    };
  }, []);

  const updateTopSelling = (deductions: Deduction[]) => {
    const productDeductions = deductions.reduce((acc, deduction) => {
      const { productName, amount } = deduction;
      if (!acc[productName]) {
        acc[productName] = 0;
      }
      acc[productName] += amount;
      return acc;
    }, {} as Record<string, number>);

    const topSellingProducts = Object.entries(productDeductions)
      .map(([productName, totalDeductions]) => ({
        productName,
        totalDeductions,
      }))
      .sort((a, b) => b.totalDeductions - a.totalDeductions)
      .slice(0, 5);

    setTopSelling(topSellingProducts);
  };

  return (
    <div className='flex justify-between sticky top-0 z-50 items-center p-4 bg-[#B0D3FF] text-[#001540]'>
      {/* Left: Logo and Menu Trigger */}
      <div className='flex items-center space-x-4 px-4'>
        <div className='text-xl font-bold'>
          <Link href='/'>
            <Image src='/logo.png' alt='Logo' width={170} height={100} />
          </Link>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <FaBars className='w-6 h-6' />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <Sidebar />
                </SheetContent>
              </Sheet>
            </TooltipTrigger>
            <TooltipContent>
              <p>Menu</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Center: Popovers for Top Selling and Stock Alerts */}
      <div className='flex items-center space-x-4'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <FaChartLine className='text-darkBlue w-6 h-6' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className='bg-white'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <FaChartLine className='text-darkBlue w-5 h-5' />
                      <h2 className='text-lg font-semibold'>Top Selling</h2>
                    </div>
                    <div>
                      {topSelling.length > 0 ? (
                        topSelling.map((product, index) => (
                          <p key={index}>
                            {product.productName}: <span className='font-bold'>{product.totalDeductions}</span> units
                          </p>
                        ))
                      ) : (
                        <p>No top selling products data available.</p>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent>
              <p>Top Selling</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <FaExclamationTriangle className='text-red-500 w-6 h-6' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className='bg-white'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <FaExclamationTriangle className='text-red-500 w-5 h-5' />
                      <h2 className='text-lg font-semibold'>Stock Alert</h2>
                    </div>
                    <div>
                      {stockAlerts.length > 0 ? (
                        stockAlerts.map((alert) => (
                          <p key={alert.id}>
                            {alert.name}: <span className='font-bold'>{alert.stock}</span> units remaining
                          </p>
                        ))
                      ) : (
                        <p>No products with low stock.</p>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent>
              <p>Stock Alerts</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Right: Logout */}
      <div className='flex justify-end p-4'>
        <Logout />
      </div>
    </div>
  );
};

export default Navbar;
