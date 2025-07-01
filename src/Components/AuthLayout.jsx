// src/components/AuthLayout.jsx
import React from "react";

const AuthLayout = ({ title, children }) => {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-600">
  <div className="bg-white/10 backdrop-blur-md  shadow-lg rounded-lg w-full max-w-md p-8 mx-4">
    <h2 className="text-2xl font-bold mb-6 text-center text-orange-600">{title}</h2>
    {children}
  </div>
</div>

  );
};

export default AuthLayout;