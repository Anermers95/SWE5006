import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("email:", email);
    console.log("password: ", password);
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // Send plaintext password
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMessage("✅ Login successful!");
        sessionStorage.setItem("user", JSON.stringify(data.user)); // Store user details
        console.log(data);
        navigate("/dashboard"); // Redirect after login
      } else {
        setSuccess(false);
        setMessage(data.message || "❌ Invalid email or password.");
      }
    } catch (error) {
      setSuccess(false);
      setMessage("❌ Server error, please try again later.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
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
            <a
              className="my-2 text-gray-700 dark:text-gray-200 hover:text-blue-500 md:mx-4 md:my-0"
              href="/home"
            >
              Home
            </a>
          </div>
        </div>
      </nav>
      <div className="p-8">
        {" "}
        {/* Increased padding */}
        <div className="flex justify-center mx-auto">
          <img
            className="w-auto h-10 sm:h-12"
            src="https://merakiui.com/images/logo.svg"
            alt="Logo"
          />
        </div>
        <h3 className="mt-4 text-2xl font-semibold text-center text-gray-600 dark:text-gray-200">
          Welcome Back
        </h3>
        <p className="mt-2 text-lg text-center text-gray-500 dark:text-gray-400">
          Login or create an account
        </p>
        {message && (
          <div
            className={`flex w-full max-w-sm overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800 mt-4 ${
              success ? "border border-emerald-500" : ""
            }`}
          >
            <div
              className={`flex items-center justify-center w-12 ${
                success ? "bg-emerald-500" : "bg-red-500"
              }`}
            >
              <svg
                className="w-6 h-6 text-white fill-current"
                viewBox="0 0 40 40"
                xmlns="http://www.w3.org/2000/svg"
              >
                {success ? (
                  <path d="M20 3.33331C10.8 3.33331 3.33337 10.8 3.33337 20C3.33337 29.2 10.8 36.6666 20 36.6666C29.2 36.6666 36.6667 29.2 36.6667 20C36.6667 10.8 29.2 3.33331 20 3.33331ZM16.6667 28.3333L8.33337 20L10.6834 17.65L16.6667 23.6166L29.3167 10.9666L31.6667 13.3333L16.6667 28.3333Z" />
                ) : (
                  <path d="M20 3.36667C10.8167 3.36667 3.3667 10.8167 3.3667 20C3.3667 29.1833 10.8167 36.6333 20 36.6333C29.1834 36.6333 36.6334 29.1833 36.6334 20C36.6334 10.8167 29.1834 3.36667 20 3.36667ZM19.1334 33.3333V22.9H13.3334L21.6667 6.66667V17.1H27.25L19.1334 33.3333Z" />
                )}
              </svg>
            </div>
            <div className="px-4 py-2 -mx-3 flex justify-between w-full">
              <div className="mx-3">
                <span
                  className={`font-semibold ${
                    success
                      ? "text-emerald-500 dark:text-emerald-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {success ? "Success" : "Error"}
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-200">
                  {message}
                </p>
              </div>
              <button
                onClick={() => setMessage("")}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-bold"
              >
                ✖
              </button>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="w-full mt-6">
            <input
              className="block w-full px-6 py-3 mt-2 text-lg text-white placeholder-gray-500 bg-white border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300"
              type="email"
              placeholder="Email Address"
              aria-label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="w-full mt-6">
            <input
              className="block w-full px-6 py-3 mt-2 text-lg text-white placeholder-gray-500 bg-white border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300"
              type="password"
              placeholder="Password"
              aria-label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between mt-6">
            <a
              href="#"
              className="text-base text-gray-600 dark:text-gray-200 hover:text-gray-500"
            >
              Forgot Password?
            </a>

            <button
              type="submit"
              className="px-8 py-3 text-lg font-semibold tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-center py-6 text-center bg-gray-50 dark:bg-gray-700">
        <span className="text-lg text-gray-600 dark:text-gray-200">
          Don't have an account?
        </span>
        <Link
          to="/register"
          className="mx-2 text-lg font-bold text-blue-500 dark:text-blue-400 hover:underline"
        >
          Register
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
