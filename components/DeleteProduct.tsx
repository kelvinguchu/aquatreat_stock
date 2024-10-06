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
import { doc, deleteDoc } from "firebase/firestore";

interface DeleteProductProps {
  product: {
    id: string;
    name: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const deleteSchema = z.object({
  confirmName: z.string(),
});

type DeleteFormValues = z.infer<typeof deleteSchema>;

const DeleteProduct: React.FC<DeleteProductProps> = ({ product, onSuccess, onCancel }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const form = useForm<DeleteFormValues>({
    resolver: zodResolver(deleteSchema),
    defaultValues: {
      confirmName: '',
    },
  });

  const onSubmit = async (values: DeleteFormValues) => {
    if (values.confirmName !== product.name) {
      setDeleteError("The product name doesn't match. Please try again.");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteDoc(doc(db, "products", product.id));
      onSuccess();
    } catch (error) {
      console.error("Error deleting product:", error);
      setDeleteError("An error occurred while deleting the product. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='confirmName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Product Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder={`Type "${product.name}" to confirm`} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type='button' variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type='submit' 
            className='bg-red-600 text-white hover:bg-red-700' 
            disabled={isDeleting || form.watch('confirmName') !== product.name}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
        {deleteError && <p className="text-red-500">{deleteError}</p>}
      </form>
    </Form>
  );
};

export default DeleteProduct;
