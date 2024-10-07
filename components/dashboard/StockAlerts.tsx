import React from 'react';
import { FaExclamationTriangle } from "react-icons/fa";

interface StockAlertsProps {
  stockAlerts: any[];
}

const StockAlerts: React.FC<StockAlertsProps> = ({ stockAlerts }) => (
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
);

export default StockAlerts;