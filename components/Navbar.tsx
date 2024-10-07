'use client'
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { FaSearch, FaBell, FaBars } from "react-icons/fa";
import Link from "next/link";
import Sidebar from "./Sidebar";
import Image from "next/image"; // For the logo

const Navbar = () => {
  return (
    <div className='flex justify-between sticky top-0 z-50 items-center p-4 bg-[#B0D3FF] text-[#001540]'>
      {/* Left: Logo and Menu Trigger */}
      <div className='flex items-center space-x-4 px-4'>
        <div className='text-xl font-bold'>
          <Link href='/'>
            <Image src='/logo.png' alt='Logo' width={170} height={100} />
          </Link>
        </div>
        <Sheet>
          <SheetTrigger>
            <FaBars className='w-6 h-6 cursor-pointer ml-8' />
          </SheetTrigger>
          <SheetContent>
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Center: Greeting */}
      <div className='text-lg'>Hi, User</div>
    </div>
  );
};

export default Navbar;
