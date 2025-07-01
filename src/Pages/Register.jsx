import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../Components/AuthLayout";
import Dashboard from "./Dashboard";  

const Register = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

const handleRegister = async (e) => {
  e.preventDefault();
  setError(null); // Reset error state

  console.log("Registering--------->>", { userName, email, password, isAdmin });

  try {
    const response = await fetch("http://localhost:5001/api/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userName, email, password, isAdmin }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Registration failed");
    }

    const data = await response.json();
    console.log("Registration successful:", data);

    navigate("/dashboard");
  } catch (err) {
    console.error("Registration error:", err.message);
    setError(err.message);

    // ✅ Show popup dialog
    alert(err.message);  // This shows a system alert box
  }
};


  return (
    <AuthLayout title="Register">
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          className="w-full px-4 py-2 border-2 border-gray-400 rounded-md placeholder-gray-400 placeholder:text-sm focus:outline-none focus:border-black"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border-2 border-gray-400 rounded-md placeholder-gray-400 placeholder:text-sm focus:outline-none focus:border-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border-2 border-gray-400 rounded-md placeholder-gray-400 placeholder:text-sm focus:outline-none focus:border-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* ✅ Toggle switch for Admin */}
   <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-400">Register as Admin</label>
      <label htmlFor="admin-toggle" className="relative inline-flex items-center cursor-pointer">
        <input
          id="admin-toggle"
          type="checkbox"
          className="sr-only peer"
          checked={isAdmin}
          onChange={() => setIsAdmin((prev) => !prev)}
        />
        <div className="w-10 h-5  rounded-full bg-gray-400 transition-colors duration-300 ease-in-out">
          <div
            className={`absolute top-[2px]  ${!isAdmin ? "left-[2px]" : "left-[22px]"} w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out peer-checked:translate-x-5`}
          />
        </div>
        <span className="ml-3 text-sm font-medium text-gray-400">
          {isAdmin ? "Yes" : "No"}
        </span>
      </label>
    </div>








        <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700">
          Register
        </button>
        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-orange-600 font-semibold">Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;