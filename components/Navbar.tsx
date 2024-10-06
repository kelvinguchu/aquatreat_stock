import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { FaSearch, FaBell, FaBars } from "react-icons/fa";
import Sidebar from "./Sidebar";
import Image from "next/image"; // For the logo

const Navbar = () => {
  return (
    <div className='flex justify-between items-center p-4 bg-[#B0D3FF] text-[#001540]'>
      {/* Left: Logo and Menu Trigger */}
      <div className='flex items-center space-x-4 px-4'>
        <div className='text-xl font-bold'>
          <Image src='/logo.png' alt='Logo' width={170} height={100} />
        </div>
        <Sheet>
          <SheetTrigger>
            <FaBars className='w-6 h-6 cursor-pointer ml-8' />
          </SheetTrigger>
          <SheetContent>
            {/* Sidebar Content */}
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Center: Greeting */}
      <div className='text-lg'>Hi, User</div>

      {/* Right: Search and Notifications */}
      <div className='flex items-center space-x-4'>
        <FaSearch className='w-6 h-6 cursor-pointer' />
        <FaBell className='w-6 h-6 cursor-pointer' />
      </div>
    </div>
  );
};

export default Navbar;
