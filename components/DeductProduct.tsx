import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { db } from "@/lib/firebase";
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

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
}

const deductSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
});

type DeductFormValues = z.infer<typeof deductSchema>;

const DeductProduct: React.FC<DeductProductProps> = ({ product, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  const form = useForm<DeductFormValues>({
    resolver: zodResolver(deductSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const onSubmit = async (values: DeductFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setShowAnimation(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay

      const productRef = doc(db, "products", product.id);
      let newStock = product.stock;
      let newFractionRemaining = product.fractionRemaining;

      if (product.isDivisible && product.fractionPerUnit) {
        const totalFractions =
          product.stock * product.fractionPerUnit +
          (product.fractionRemaining || 0);
        const deductFractions = values.amount * product.fractionPerUnit;

        if (deductFractions > totalFractions) {
          throw new Error("Not enough stock to deduct");
        }

        const remainingFractions = totalFractions - deductFractions;
        newStock = Math.floor(remainingFractions / product.fractionPerUnit);
        newFractionRemaining = remainingFractions % product.fractionPerUnit;
      } else {
        if (values.amount > product.stock) {
          throw new Error("Not enough stock to deduct");
        }
        newStock = product.stock - values.amount;
      }

      // Update the product stock
      await updateDoc(productRef, {
        stock: newStock,
        fractionRemaining: newFractionRemaining,
      });

      // Add a record to the deductions collection
      await addDoc(collection(db, "deductions"), {
        productId: product.id,
        productName: product.name,
        amount: values.amount,
        date: serverTimestamp(),
      });

      form.reset();
      onSuccess(); // Call the onSuccess callback to close the dialog
    } catch (error) {
      console.error("Error deducting product:", error);
      if (error instanceof Error) {
        setSubmitError(`An error occurred while deducting the product: ${error.message}`);
      } else {
        setSubmitError("An unknown error occurred while deducting the product. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      setShowAnimation(false);
    }
  };

  if (showAnimation) {
    return (
      <div className="flex flex-col items-center justify-center">
        <DotLottieReact
          src="https://lottie.host/087bb01c-3bf4-4463-8d3d-0ef3fb27ab78/GSb5oInvmU.json"
          loop
          autoplay
          style={{ width: '300px', height: '300px' }}
        />
        <p className="mt-4 text-lg font-semibold">Deducting Product...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='amount'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount to Deduct</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  step={product.isDivisible ? 0.01 : 1}
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' className='bg-darkBlue text-white' disabled={isSubmitting}>
          {isSubmitting ? "Deducting..." : "Deduct"}
        </Button>
        {submitError && <p className="text-red-500">{submitError}</p>}
      </form>
    </Form>
  );
};

export default DeductProduct;
