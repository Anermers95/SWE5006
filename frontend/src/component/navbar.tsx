import React, { useEffect } from "react";
import { isTokenValid } from "../security/ProtectedRoute";

const Navbar: React.FC = () => {
  const [loggedIn, setLoggedIn] = React.useState(false);

  // Run when the localStorage changes
  useEffect(() => {
    if (sessionStorage.getItem("user")) {
      const token = JSON.parse(sessionStorage.getItem("user") || "").token;
      if(isTokenValid(token))
      {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    } else {
      setLoggedIn(false);
    }
  }, [sessionStorage.getItem("user")]);

  // Function to log user out
  const clickLogout = () => {
    if (!sessionStorage.getItem("user")) {
      return;
    }
    sessionStorage.removeItem("user");
    window.location.href = "/home";
  };

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
          {!loggedIn && (
            <div>
              <a
                className="my-2 text-gray-700 dark:text-gray-200 hover:text-blue-500 md:mx-4 md:my-0"
                href="/home"
              >
                Home
              </a>
              <a
                className="my-2 text-gray-700 dark:text-gray-200 hover:text-blue-500 md:mx-4 md:my-0"
                href="/register"
              >
                Register
              </a>
              <a
                className="my-2 text-gray-700 dark:text-gray-200 hover:text-blue-500 md:mx-4 md:my-0"
                href="/login"
              >
                Login
              </a>
            </div>
          )}

          {loggedIn && (
            <div>
              <a
                className="my-2 text-gray-700 dark:text-gray-200 hover:text-blue-500 md:mx-4 md:my-0"
                href="/dashboard"
              >
                Dashboard
              </a>
              <a
                className="my-2 text-gray-700 dark:text-gray-200 hover:text-blue-500 md:mx-4 md:my-0"
                href="/book"
              >
                Book Room
              </a>
              <a
                className="my-2 text-gray-700 dark:text-gray-200 hover:text-blue-500 md:mx-4 md:my-0"
                href="/room"
              >
                Manage Room
              </a>
              <a
                className="my-2 text-gray-700 dark:text-gray-200 hover:text-blue-500 md:mx-4 md:my-0"
                href="#"
                onClick={clickLogout}
              >
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
