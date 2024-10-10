import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Product {
  id: string;
  name: string;
  stock: number;
  isDivisible: boolean;
  fractionPerUnit?: number;
  fractionRemaining?: number;
}

interface DeductProductProps {
  product: Product;
  onSuccess: () => void;
  handleDeduct: (amount: number) => Promise<void>;
}

const DeductProduct: React.FC<DeductProductProps> = ({ product, onSuccess, handleDeduct }) => {
  const [amount, setAmount] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && parseFloat(amount) > 0) {
      await handleDeduct(parseFloat(amount));
      onSuccess();
    }
  };

  return (
    <form onSubmit={onSubmit} className='text-darkerNavy'>
      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount to deduct"
        min="0"
        step={product.isDivisible ? '0.01' : '1'}
        className='mb-4'
      />
      <Button type="submit" className=' bg-darkBlue'>Deduct</Button>
    </form>
  );
};

export default DeductProduct;
