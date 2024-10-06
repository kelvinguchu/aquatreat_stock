import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, onSnapshot, query } from "firebase/firestore";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  categoryName: string;
  stock: number;
  isDivisible: boolean;
  fractionPerUnit?: number;
  fractionRemaining?: number;
}

interface UpdateProductProps {
  product: Product;
  onSuccess: () => void;
}

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  categoryName: z.string().min(1, "Category is required"),
  stock: z.number().min(0, "Stock must be a positive number"),
  isDivisible: z.boolean(),
  fractionPerUnit: z.number().min(0).optional(),
  fractionRemaining: z.number().min(0).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const UpdateProduct: React.FC<UpdateProductProps> = ({ product, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      categoryName: product.categoryName,
      stock: product.stock,
      isDivisible: product.isDivisible,
      fractionPerUnit: product.fractionPerUnit,
      fractionRemaining: product.fractionRemaining,
    },
  });

  useEffect(() => {
    const q = query(collection(db, "categories"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const categoryNames = querySnapshot.docs.map(doc => doc.data().name);
      // Ensure "Uncategorized" is always first and only appears once
      setCategories(["Uncategorized", ...categoryNames.filter(name => name !== "Uncategorized")]);
    });

    return () => unsubscribe();
  }, []);

  const isDivisible = form.watch("isDivisible");

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setShowAnimation(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
      await updateDoc(doc(db, "products", product.id), values);
      onSuccess();
    } catch (error) {
      console.error("Error updating product: ", error);
      if (error instanceof Error) {
        setSubmitError(`An error occurred while updating the product: ${error.message}`);
      } else {
        setSubmitError("An unknown error occurred while updating the product. Please try again.");
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
        <p className="mt-4 text-lg font-semibold">Updating Product...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder='Enter product name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='categoryName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='stock'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input 
                  type='number' 
                  placeholder='Enter stock' 
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='isDivisible'
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Is the Product divisible?</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {isDivisible && (
          <>
            <FormField
              control={form.control}
              name='fractionPerUnit'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fraction Per Unit</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='Enter fraction per unit (e.g., kg, liters)'
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='fractionRemaining'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fraction Remaining</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='Enter fraction remaining'
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type='submit' className='bg-darkBlue text-white' disabled={isSubmitting}>
          {isSubmitting ? "Updating Product..." : "Update Product"}
        </Button>

        {submitError && <p className="text-red-500">{submitError}</p>}
      </form>
    </Form>
  );
};

export default UpdateProduct;