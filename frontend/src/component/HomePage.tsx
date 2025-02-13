import React from "react";
import Navbar from "./navbar";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="flex-1 container flex px-6 py-16 mx-auto items-center justify-center">
        <div className="items-center lg:flex w-full">
          <div className="w-full lg:w-1/2">
            <div className="lg:max-w-lg">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white lg:text-5xl">
                Best place to manage <br /> your{" "}
                <span className="text-blue-500">bookings</span>
              </h1>
              <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
                Easily book and manage your appointments online. Get started
                today!
              </p>
              <button className="px-8 py-3 text-lg font-semibold tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50">
                Manage Bookings
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center w-full mt-6 lg:mt-0 lg:w-1/2">
            <img
              className="w-full h-auto lg:max-w-3xl drop-shadow-lg"
              src="https://merakiui.com/images/components/Catalogue-pana.svg"
              alt="Dashboard Illustration"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
