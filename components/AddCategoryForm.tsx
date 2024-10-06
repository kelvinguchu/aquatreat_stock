import React from 'react';
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
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface AddCategoryFormProps {
  onSuccess: () => void;
}

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const AddCategoryForm: React.FC<AddCategoryFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [showAnimation, setShowAnimation] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    const createUncategorized = async () => {
      const q = query(collection(db, "categories"), where("name", "==", "Uncategorized"));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        try {
          await addDoc(collection(db, "categories"), { name: "Uncategorized" });
          console.log("Uncategorized category created");
        } catch (error) {
          console.error("Error creating Uncategorized category:", error);
        }
      }
    };

    createUncategorized();

    // Set up real-time listener for categories
    const unsubscribe = onSnapshot(collection(db, "categories"), (snapshot) => {
      const categoryNames = snapshot.docs.map(doc => doc.data().name);
      setCategories(categoryNames);
    });

    return () => unsubscribe();
  }, []);

  const onSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setShowAnimation(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
      if (categories.includes(values.name)) {
        throw new Error("Category already exists");
      }
      await addDoc(collection(db, "categories"), values);
      form.reset();
      onSuccess(); // Call the onSuccess callback
    } catch (error) {
      console.error("Error adding category: ", error);
      if (error instanceof Error) {
        setSubmitError(`An error occurred while adding the category: ${error.message}`);
      } else {
        setSubmitError("An unknown error occurred while adding the category. Please try again.");
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
        <p className="mt-4 text-lg font-semibold">Adding Category...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        {/* Category Name Field */}
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder='Enter category name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type='submit' className='bg-darkBlue text-white' disabled={isSubmitting}>
          {isSubmitting ? "Adding Category..." : "Add Category"}
        </Button>

        {submitError && <p className="text-red-500">{submitError}</p>}
      </form>
    </Form>
  );
};

export default AddCategoryForm;
