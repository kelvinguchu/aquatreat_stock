import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FaEllipsisV, FaMinus, FaEdit, FaTrash } from "react-icons/fa";
import DeductProduct from '../DeductProduct';
import UpdateProduct from '../UpdateProduct';
import DeleteProduct from '../DeleteProduct';

interface Product {
  id: string;
  name: string;
  stock: number;
  categoryName: string;
  isDivisible: boolean;
  fractionPerUnit?: number;
  fractionRemaining?: number;
}

interface ProductTableProps {
  products: Product[];
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  setProductToUpdate: React.Dispatch<React.SetStateAction<Product | null>>;
  setProductToDelete: React.Dispatch<React.SetStateAction<Product | null>>;
  selectedProduct: Product | null;
  productToUpdate: Product | null;
  productToDelete: Product | null;
  handleDeductSuccess: () => void;
  handleUpdateSuccess: () => void;
  handleDeleteSuccess: () => void;
  handleDeleteCancel: () => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  setSelectedProduct,
  setProductToUpdate,
  setProductToDelete,
  selectedProduct,
  productToUpdate,
  productToDelete,
  handleDeductSuccess,
  handleUpdateSuccess,
  handleDeleteSuccess,
  handleDeleteCancel
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>{product.name}</TableCell>
            <TableCell>
              {product.stock}
              {product.isDivisible && product.fractionRemaining !== undefined
                ? ` + ${product.fractionRemaining} ${product.fractionPerUnit}`
                : ''}
            </TableCell>
            <TableCell>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <FaEllipsisV className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                  <div className="grid gap-4">
                    <Button
                      className="w-full justify-start"
                      variant="ghost"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <FaMinus className="mr-2 h-4 w-4" />
                      Deduct
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="ghost"
                      onClick={() => setProductToUpdate(product)}
                    >
                      <FaEdit className="mr-2 h-4 w-4" />
                      Update
                    </Button>
                    <Button
                      className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-100"
                      variant="ghost"
                      onClick={() => setProductToDelete(product)}
                    >
                      <FaTrash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Deduct Dialog */}
              <Dialog open={selectedProduct?.id === product.id} onOpenChange={(open) => !open && setSelectedProduct(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Deduct Product: {selectedProduct?.name}</DialogTitle>
                  </DialogHeader>
                  {selectedProduct && (
                    <DeductProduct 
                      product={selectedProduct} 
                      onSuccess={handleDeductSuccess}
                    />
                  )}
                </DialogContent>
              </Dialog>

              {/* Update Dialog */}
              <Dialog open={productToUpdate?.id === product.id} onOpenChange={(open) => !open && setProductToUpdate(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Product: {productToUpdate?.name}</DialogTitle>
                  </DialogHeader>
                  {productToUpdate && (
                    <UpdateProduct 
                      product={productToUpdate}
                      onSuccess={handleUpdateSuccess}
                    />
                  )}
                </DialogContent>
              </Dialog>

              {/* Delete Dialog */}
              <Dialog open={productToDelete?.id === product.id} onOpenChange={(open) => !open && setProductToDelete(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Product: {productToDelete?.name}</DialogTitle>
                  </DialogHeader>
                  {productToDelete && (
                    <DeleteProduct 
                      product={productToDelete}
                      onSuccess={handleDeleteSuccess}
                      onCancel={handleDeleteCancel}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProductTable;