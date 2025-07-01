import React, { useState } from "react";
import {  Link, useNavigate } from "react-router-dom";
import AuthLayout from "../Components/AuthLayout";
import Dashboard from "./Dashboard";
import "../Styles/Login.css";


export default function Login  ()  {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:5001/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const data = await response.json();
    console.log("Login successful:------->>>> ", data);

    // ✅ Store token (assuming your API returns it as `data.token`)
    localStorage.setItem("token", data["accessToken"]);
    localStorage.setItem("userData",JSON.stringify(data["user"]))

    // Optionally store user info if returned
    // localStorage.setItem("user", JSON.stringify(data.user));

    // Navigate to dashboard or home
  navigate("/dashboard", {
  state: {
    user: data.user
  }
});
  } catch (err) {
    console.error("Login error:", err.message);
    alert(err.message);
  }
};


  return (
    <AuthLayout title="Login">
      <form onSubmit={handleLogin} className="space-y-4 ">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border-2 border-gray-500 rounded-md placeholder-gray-500 placeholder:text-sm placeholder:normal focus:outline-none focus:border-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
       <input
  type="password"
  placeholder="Password"
  className="w-full px-4 py-2 border-2 border-gray-500 rounded-md placeholder-gray-500 placeholder:text-sm placeholder:normal focus:outline-none focus:border-black"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
/>
        <button type="submit" className="w-full bg-orange-600 text-gray-300 py-2 rounded-md hover:bg-orange-700">
          Login
        </button>
        <p className="text-center text-sm text-gray-300 mt-4">
          Don't have an account? <Link to="/register" className="text-orange-600 font-semibold">Register</Link>
        </p>
      </form>
    </AuthLayout>
  );
};