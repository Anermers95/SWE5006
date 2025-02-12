import { useState } from "react";
import { Link, useNavigate} from "react-router-dom";
const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); 
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("email:", email);
    console.log("password: ", password);
    try {
      const response = await fetch("http://localhost:3000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // Send plaintext password
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Login successful!");
        localStorage.setItem("user", JSON.stringify(data.user)); // Store user details
        navigate("/dashboard"); // Redirect after login
      } else {
        setMessage(data.message || "❌ Invalid email or password.");
      }
    } catch (error) {
      setMessage("❌ Server error, please try again later.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div className="p-8"> {/* Increased padding */}
        <div className="flex justify-center mx-auto">
          <img className="w-auto h-10 sm:h-12" src="https://merakiui.com/images/logo.svg" alt="Logo" />
        </div>

        <h3 className="mt-4 text-2xl font-semibold text-center text-gray-600 dark:text-gray-200">
          Welcome Back
        </h3>

        <p className="mt-2 text-lg text-center text-gray-500 dark:text-gray-400">Login or create an account</p>

        <form onSubmit={handleSubmit}>
          <div className="w-full mt-6">
            <input
              className="block w-full px-6 py-3 mt-2 text-lg text-gray-700 placeholder-gray-500 bg-white border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300"
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
              className="block w-full px-6 py-3 mt-2 text-lg text-gray-700 placeholder-gray-500 bg-white border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300"
              type="password"
              placeholder="Password"
              aria-label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between mt-6">
            <a href="#" className="text-base text-gray-600 dark:text-gray-200 hover:text-gray-500">
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
        <span className="text-lg text-gray-600 dark:text-gray-200">Don't have an account?</span>
        <Link to="/register" className="mx-2 text-lg font-bold text-blue-500 dark:text-blue-400 hover:underline">
          Register
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
