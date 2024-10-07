import React from 'react';
import { FaChartLine } from "react-icons/fa";

interface TopSellingProduct {
  productName: string;
  totalDeductions: number;
}

interface TopSellingProps {
  topSelling: TopSellingProduct[];
}

const TopSelling: React.FC<TopSellingProps> = ({ topSelling }) => (
  <div className='bg-lightBlue p-4 rounded-lg shadow-md'>
    <div className='flex items-center space-x-2 mb-2'>
      <FaChartLine className='text-darkBlue w-5 h-5' />
      <h2 className='text-lg font-semibold'>Top Selling</h2>
    </div>
    <div>
      {topSelling.length > 0 ? (
        topSelling.map((product, index) => (
          <p key={index}>
            {product.productName}: <span className='font-bold'>{product.totalDeductions}</span> deductions
          </p>
        ))
      ) : (
        <p>No top selling products data available.</p>
      )}
    </div>
  </div>
);

export default TopSelling;