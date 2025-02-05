import { Link } from "react-router-dom";

const RegisterForm = () => {
  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900">
      <section className="bg-white dark:bg-gray-900">
        <div className="flex justify-center min-h-screen">
          {/* Left Image Section */}
          <div
            className="hidden bg-cover lg:block lg:w-2/5"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1494621930069-4fd4b2e24a11?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=715&q=80')",
            }}
          ></div>

          {/* Form Section */}
          <div className="flex items-center w-full max-w-3xl p-8 mx-auto lg:px-12 lg:w-3/5">
            <div className="w-full">
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
                  <button className="flex justify-center w-full px-6 py-3 text-blue-500 bg-white rounded-lg md:w-auto md:mx-2 focus:outline-none">
                    <span>Student</span>
                  </button>

                  <button className="flex justify-center w-full px-6 py-3 mt-4 text-blue-500 border border-blue-500 rounded-lg md:mt-0 md:w-auto md:mx-2 focus:outline-none">
                    <span>Lecturer</span>
                  </button>
                </div>
              </div>

              {/* Registration Form */}
              <form className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    className="block w-full px-5 py-3 text-gray-700 bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:text-gray-300 focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">Last Name</label>
                  <input
                    type="text"
                    placeholder="Snow"
                    className="block w-full px-5 py-3 text-gray-700 bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:text-gray-300 focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">Phone Number</label>
                  <input
                    type="text"
                    placeholder="XXX-XX-XXXX-XXX"
                    className="block w-full px-5 py-3 text-gray-700 bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:text-gray-300 focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">Email Address</label>
                  <input
                    type="email"
                    placeholder="johnsnow@example.com"
                    className="block w-full px-5 py-3 text-gray-700 bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:text-gray-300 focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="block w-full px-5 py-3 text-gray-700 bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:text-gray-300 focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="block w-full px-5 py-3 text-gray-700 bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:text-gray-300 focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-between w-full px-6 py-3 text-sm tracking-wide text-white bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <span>Sign Up</span>
                </button>
              </form>

              {/* Back to Login */}
              <p className="mt-6 text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-500 hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RegisterForm;
