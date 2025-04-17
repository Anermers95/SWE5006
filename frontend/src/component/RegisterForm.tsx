import { Link,useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const RegisterForm = () => {
  const navigate = useNavigate(); // Use navigate hook
  const location = useLocation();
  const previousPage = location.state?.from || "/home";
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",  // Changed to match the backend field
    password: "",
    role_id: "0", // Default role as "0" (no selection)
    is_active: true, // Default to active
    confirmPassword: ""
  });

  const [confirmPassword, setConfirmPassword] = useState(""); // To manage confirmPassword field
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountTypeError, setAccountTypeError] = useState(""); // To store account type error

  // Handle input changes
  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e: any) => {
    setConfirmPassword(e.target.value);
  };

  const handleAccountTypeChange = (type: any) => {
    setFormData({ ...formData, role_id: type });
    setAccountTypeError(""); // Clear error when the user selects an account type
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAccountTypeError(""); // Reset account type error on submit

    // Password match check
    if (formData.password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    // Account type validation check
    if (formData.role_id === "0") {
      setAccountTypeError("Please select an account type.");
      setLoading(false);
      return;
    }

    // Send the request to the API with the correct data
    try {
      // Exclude confirmPassword from the request data
      const { confirmPassword, ...dataToSend } = formData; // This removes confirmPassword from formData
      const response = await axios.post(
        `${API_URL}/users`, 
        dataToSend, 
        {
          headers: {
            'Content-Type': 'application/json', // Set the content type to JSON
          },
        }
      );
      console.log("Response:", response.data);
      alert("Registration successful!");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900">
      <section className="bg-white dark:bg-gray-900">
        <div className="flex justify-center min-h-screen">
          <div
            className="hidden bg-cover lg:block lg:w-2/5"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1494621930069-4fd4b2e24a11?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=715&q=80')",
            }}
          ></div>
          <div className="flex items-center w-full max-w-3xl p-8 mx-auto lg:px-12 lg:w-3/5">
            <div className="w-full">
            <button
                onClick={() => navigate(previousPage)}
                className="mb-4 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-semibold tracking-wider text-gray-800 capitalize dark:text-white">
                Get your free account now.
              </h1>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Let’s get you all set up so you can verify your personal account and begin setting up your profile.
              </p>

              {/* Account Type Selection */}
              <div className="mt-6">
                <h1 className="text-gray-500 dark:text-gray-300">Select type of account</h1>
                <div className="mt-3 md:flex md:items-center md:-mx-2">
                  <button
                    onClick={() => handleAccountTypeChange("2")}
                    className={`flex justify-center w-full px-6 py-3 rounded-lg md:w-auto md:mx-2 focus:outline-none ${formData.role_id === "2" ? "bg-blue-500 text-white" : "text-blue-500 bg-white border border-blue-500"}`}
                  >
                    Student
                  </button>
                  <button
                    onClick={() => handleAccountTypeChange("3")}
                    className={`flex justify-center w-full px-6 py-3 mt-4 rounded-lg md:mt-0 md:w-auto md:mx-2 focus:outline-none ${formData.role_id === "3" ? "bg-blue-500 text-white" : "text-blue-500 bg-white border border-blue-500"}`}
                  >
                    Lecturer
                  </button>
                </div>
                {accountTypeError && <p className="text-red-500 mt-2">{accountTypeError}</p>}
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">Full Name</label>
                  <input
                    type="text"
                    name="full_name" // Changed to match the backend field
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="block w-full px-5 py-3 border rounded-lg dark:bg-gray-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="johnsnow@example.com"
                    required
                    className="block w-full px-5 py-3 border rounded-lg dark:bg-gray-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="block w-full px-5 py-3 border rounded-lg dark:bg-gray-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword} // Manage confirmPassword separately
                    onChange={handleConfirmPasswordChange}
                    placeholder="Confirm your password"
                    required
                    className="block w-full px-5 py-3 border rounded-lg dark:bg-gray-900 focus:outline-none"
                  />
                </div>

                {error && <p className="text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center w-full px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none"
                >
                  {loading ? "Signing up..." : "Sign Up"}
                </button>
                
              </form>

              <p className="mt-6 text-gray-500 dark:text-gray-400">
                Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RegisterForm;
