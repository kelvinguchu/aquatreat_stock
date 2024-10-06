import {
  FaHome,
  FaBoxOpen,
  FaShoppingCart,
  FaCashRegister,
  FaUndo,
} from "react-icons/fa"; // React Icons

const Sidebar = () => {
  return (
    <div className='flex flex-col p-4 space-y-6 text-gray-800'>
      <a href='/' className='flex items-center space-x-2'>
        <FaHome className='w-6 h-6' />
        <span>Dashboard</span>
      </a>
      <a href='/in-stock' className='flex items-center space-x-2'>
        <FaBoxOpen className='w-6 h-6' />
        <span>In Stock</span>
      </a>
      <a href='/products' className='flex items-center space-x-2'>
        <FaShoppingCart className='w-6 h-6' />
        <span>Products</span>
      </a>
      <a href='/sales' className='flex items-center space-x-2'>
        <FaCashRegister className='w-6 h-6' />
        <span>Sales</span>
      </a>
      <a href='/returns' className='flex items-center space-x-2'>
        <FaUndo className='w-6 h-6' />
        <span>Returns</span>
      </a>
    </div>
  );
};

export default Sidebar;
