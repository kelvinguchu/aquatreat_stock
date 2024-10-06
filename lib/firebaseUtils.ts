import { db } from './firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp, runTransaction } from "firebase/firestore";

interface Deduction {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  date: Date;
}

export const returnDeduction = async (deduction: Deduction) => {
  await runTransaction(db, async (transaction) => {
    // Get the product document
    const productRef = doc(db, "products", deduction.productId);
    const productDoc = await transaction.get(productRef);

    if (!productDoc.exists()) {
      throw new Error("Product does not exist!");
    }

    const productData = productDoc.data();

    // Calculate new stock
    let newStock = productData.stock + deduction.amount;
    let newFractionRemaining = productData.fractionRemaining || 0;

    if (productData.isDivisible && productData.fractionPerUnit) {
      const totalFractions = newStock * productData.fractionPerUnit + newFractionRemaining;
      newStock = Math.floor(totalFractions / productData.fractionPerUnit);
      newFractionRemaining = totalFractions % productData.fractionPerUnit;
    }

    // Update the product stock
    transaction.update(productRef, {
      stock: newStock,
      fractionRemaining: newFractionRemaining,
    });

    // Add a record to the returns collection
    const returnsCollectionRef = collection(db, "returns");
    const newReturnRef = doc(returnsCollectionRef);
    transaction.set(newReturnRef, {
      productId: deduction.productId,
      productName: deduction.productName,
      amount: deduction.amount,
      date: serverTimestamp(),
    });

    // Delete the deduction
    const deductionRef = doc(db, "deductions", deduction.id);
    transaction.delete(deductionRef);
  });
};