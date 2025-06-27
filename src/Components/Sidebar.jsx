import { Plus, List, CheckCircle, Clock, LogOut } from 'lucide-react';
 // Adjust the import path as needed
import React from 'react';


export default function Sidebar({ isOpen, toggleSidebar, user,onCreateTaskClick}) {
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    return parts[0][0].toUpperCase() + (parts[1]?.[0]?.toUpperCase() || '');
  };

 

  return (
    <div className={`bg-gray-900 text-white w-64 min-h-screen p-6 flex flex-col justify-between transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static z-50 shadow-lg`}>
      <div>
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-700 mx-auto mb-3 flex items-center justify-center">
            <span className="text-3xl text-gray-400">{getInitials(user?.userName)}</span>
          </div>
          <p className="text-xl font-semibold">{user?.userName || 'Guest'}</p>
        </div>
       { user.isAdmin? <ul className="space-y-6">
  <li
    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition"
    onClick={onCreateTaskClick}
  >
    <List className="text-blue-400" /> <span className="text-lg">All Requests</span>
  </li>
  <li className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition">
    <List className="text-yellow-400" /> <span className="text-lg">Pending Requests</span>
  </li>
  <li className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition">
    <List className="text-green-400" /> <span className="text-lg">Accepted Requests</span>
  </li>
  <li className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition">
    <List className="text-red-400" /> <span className="text-lg">User Report</span>
  </li>
</ul>
:
        <ul className="space-y-6">
          <li
            className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition"
            onClick={onCreateTaskClick}
          >
            <Plus className="text-blue-400" /> <span className="text-lg">Create Task</span>
          </li>
          {/* <li className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition">
            <List className="text-green-400" /> <span className="text-lg">All Tasks</span>
          </li>
          <li className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition">
            <Clock className="text-yellow-400" /> <span className="text-lg">Pending Tasks</span>
          </li>
          <li className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition">
            <CheckCircle className="text-green-400" /> <span className="text-lg">Completed Tasks</span>
          </li> */}
        </ul>}
      </div>
      <div className="mt-10">
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-red-800 p-2 rounded-lg transition text-red-400">
          <LogOut /> <span className="text-lg">Logout</span>
        </div>
      </div>

      
    </div>
  );
}