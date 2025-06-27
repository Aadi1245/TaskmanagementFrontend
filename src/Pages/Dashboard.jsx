    import React, { useState,useEffect } from 'react';
    import { useLocation } from "react-router-dom";
    import { Search, CheckSquare, Plus, List, CheckCircle, Clock, LogOut, Eye, Edit, Trash2, Calendar } from 'lucide-react';

    const Sidebar = ({ isOpen, toggleSidebar,user }) => {
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
                {/* Placeholder for profile image */}
                <span className="text-3xl text-gray-400">{getInitials(user?.userName)}</span>
            </div>
            <p className="text-xl font-semibold">{user?.userName||"Guest"}</p>
            </div>
            <ul className="space-y-6">
            <li className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition">
                <Plus className="text-blue-400" /> <span className="text-lg">Create Task</span>
            </li>
            <li className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition">
                <List className="text-green-400" /> <span className="text-lg">All Tasks</span>
            </li>
            <li className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition">
                <Clock className="text-yellow-400" /> <span className="text-lg">Pending Tasks</span>
            </li>
            <li className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition">
                <CheckCircle className="text-green-400" /> <span className="text-lg">Completed Tasks</span>
            </li>
            </ul>
        </div>
        <div className="mt-10">
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-red-800 p-2 rounded-lg transition text-red-400">
            <LogOut /> <span className="text-lg">Logout</span>
            </div>
        </div>
        </div>
    );
    };

    const Dashboard = () => {
        const location = useLocation();
    const user = location.state?.user;
    const [search, setSearch] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [sortBy, setSortBy] = useState('date');
    const [tasks, setTasks] = useState([]);


    const handleSearch = () => {
        console.log('Searching for:', search);
        // Add search logic here
    };

    useEffect(() => {
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5001/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data || []); // assuming API returns { tasks: [...] }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  fetchTasks();
}, []);


    const filteredTasks = tasks.filter(task => 
        (filterStatus === 'All' || task.status === filterStatus) &&
        task.title.toLowerCase().includes(search.toLowerCase())
    );

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (sortBy === 'date') return new Date(b.updatedAt) - new Date(a.updatedAt);
        if (sortBy === 'priority') {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return a.title.localeCompare(b.title);
    });

    const getStatusColor = (status) => {
        switch (status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'inProgress': return 'bg-blue-100 text-blue-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
        case 'high': return 'border-l-red-500';
        case 'medium': return 'border-l-yellow-500';
        case 'low': return 'border-l-green-500';
        default: return 'border-l-gray-500';
        }
    };

    const taskStats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'inProgress').length,
    };


    return (
        <div className="flex w-screen h-screen bg-gray-50 font-sans overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />

        {/* Content */}
        <div className="flex-1 ml-0 p-4 overflow-auto">
            {/* Mobile Toggle */}
            <div className="md:hidden mb-6">
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="bg-gray-900 text-white p-3 rounded-lg shadow-md hover:bg-gray-800 transition"
            >
                ☰ Menu
            </button>
            </div>

            {/* Header Section */}
            <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{user.isAdmin?"Admin Dashboard": "Task Dashboard"}</h1>
            <p className="text-gray-600">{user.isAdmin?"Manage and track users":"Manage and track your tasks efficiently"}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CheckSquare className="text-blue-600 text-xl" />
                </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-green-600 text-xl" />
                </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-blue-600 text-xl" />
                </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{taskStats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-yellow-600 text-xl" />
                </div>
                </div>
            </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                <div className="relative">
                    <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tasks..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-black"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                </div>
                <div className="flex gap-3">
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                >
                    <option value="All">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="inProgress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                >
                    <option value="date">Sort by Date</option>
                    <option value="priority">Sort by Priority</option>
                    <option value="title">Sort by Title</option>
                </select>
                </div>
            </div>
            </div>

            {/* Task List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Tasks ({sortedTasks.length})</h2>
            </div>
            <div className="divide-y divide-gray-200">
                {sortedTasks.map((task) => (
                <div
                    key={task.id}
                    className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(task.priority)}`}
                >
                    <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                            {task.priority}
                        </span>
                        </div>
                        <p className="text-gray-600 mb-3">{task.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <Calendar className="text-xs w-3 h-3" />
                            <span>{task.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span>{task.category}</span>
                        </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    </div>
                </div>
                ))}
            </div>
            {sortedTasks.length === 0 && (
                <div className="p-12 text-center">
                <CheckSquare className="mx-auto text-4xl text-gray-300 mb-4 w-16 h-16" />
                <p className="text-gray-500">No tasks found matching your criteria</p>
                </div>
            )}
            </div>
        </div>
        </div>
    );
    };

    export default Dashboard;