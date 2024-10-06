import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit, Timestamp } from "firebase/firestore";

interface Return {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  date: Date;
}

const Returns: React.FC = () => {
  const [returns, setReturns] = useState<Return[]>([]);

  useEffect(() => {
    const returnsQuery = query(
      collection(db, "returns"),
      orderBy("date", "desc"),
      limit(10) // Adjust this number as needed
    );

    const unsubscribe = onSnapshot(returnsQuery, (snapshot) => {
      const returnList: Return[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        returnList.push({
          id: doc.id,
          productId: data.productId,
          productName: data.productName,
          amount: data.amount,
          date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
        });
      });
      setReturns(returnList);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className='p-6 space-y-6'>
      <h2 className='text-xl font-semibold mb-4'>Recent Returns</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {returns.map((returnItem) => (
            <TableRow key={returnItem.id}>
              <TableCell>{returnItem.productName}</TableCell>
              <TableCell>{returnItem.amount}</TableCell>
              <TableCell>{returnItem.date.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Returns;
