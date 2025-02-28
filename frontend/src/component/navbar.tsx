import React from "react";

const Navbar: React.FC = () => {
    return (
      <nav className="relative bg-transparent">
        <div className="container px-6 py-4 mx-auto md:flex md:justify-between md:items-center">
          <div className="flex items-center justify-between">
            <a href="#">
              <img
                className="w-auto h-10 sm:h-12 drop-shadow-lg"
                src="/src/assets/logo.png"
                alt="SpaceMax RBMS Logo"
              />
            </a>
          </div>
          <div className="flex flex-col md:flex-row md:mx-6">
            <a className="my-2 text-gray-700 dark:text-gray-200 hover:text-blue-500 md:mx-4 md:my-0" href="/home">Home</a>
            <a className="my-2 text-gray-700 dark:text-gray-200 hover:text-blue-500 md:mx-4 md:my-0" href="/register">Register</a>
            <a className="my-2 text-gray-700 dark:text-gray-200 hover:text-blue-500 md:mx-4 md:my-0" href="/login">Login</a>
          </div>
        </div>
      </nav>
    );
  };
  
  export default Navbar;