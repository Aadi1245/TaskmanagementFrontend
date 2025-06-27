import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from "react-router-dom";
import { Search } from 'lucide-react';
import Sidebar from '../Components/Sidebar';
import CreateTaskModal from '../Components/CreateTaskModal';
import { LoadingState, ErrorState, EmptyState, TaskCard, StateCards } from "../Components/DashboardComponents";
// Constants
import { PRIORITY_ORDER } from "../Constants";

// Custom hooks
const useTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTasks = useCallback(async () => {
        const user = JSON.parse(localStorage.getItem("userData"))
        console.log(`${user}----------`)
        console.log(`${user?.isAdmin}----------`)
        // alert(user);
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("No authentication token found");
            }
            let response;

            if (user?.isAdmin) {

                response = await fetch("http://localhost:5001/api/user/unAuthorizedUser", {
                    method: "POST",

                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}),
                });
            } else {
                response = await fetch(
                    "http://localhost:5001/api/tasks", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            }

            // const response = user?.isAdmin ? await fetch("http://localhost:5001/api/user/unAuthorizedUser", {
            //     method: "POST",

            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({}),
            // }) : await fetch(
            //     "http://localhost:5001/api/tasks", {
            //     headers: {
            //         Authorization: `Bearer ${token}`,
            //         'Content-Type': 'application/json',
            //     },
            // });
            console.log('000000000000response', response)

            if (!response.ok) {
                throw new Error(`Failed to fetch tasks: ${response.status} `);
            }

            const data = await response.json();
            setTasks(data || []); // assuming API returns { tasks: [...] 

            // setTasks(Array.isArray(data) ? data : data.tasks || []);
        } catch (error) {
            console.log("Error fetching tasks:", error);
            setError(error.message);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    return { tasks, loading, error, refetch: fetchTasks };
};


// Main Dashboard Component
const Dashboard = () => {
    const location = useLocation();
    const user = location.state?.user || {};
    const { tasks, loading, error, refetch } = useTasks();

    // State
    const [search, setSearch] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [sortBy, setSortBy] = useState('date');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [method, setMethod] = useState("create");
    const [updateData, setUpdateData] = useState();
    // Memoized calculations
    const taskStats = useMemo(() => ({
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'inProgress').length,
    }), [tasks]);

    const filteredAndSortedTasks = useMemo(() => {
        let filtered = tasks.filter(task => {
            const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
            const matchesSearch = !search ||
                task.title?.toLowerCase().includes(search.toLowerCase()) ||
                task.description?.toLowerCase().includes(search.toLowerCase()) ||
                task.category?.toLowerCase().includes(search.toLowerCase());

            return matchesStatus && matchesSearch;
        });

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.updatedAt || b.date || 0) - new Date(a.updatedAt || a.date || 0);
                case 'priority':
                    return (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0);
                case 'title':
                    return (a.title || '').localeCompare(b.title || '');
                default:
                    return 0;
            }
        });
    }, [tasks, filterStatus, search, sortBy]);

    // // Event handlers
    // const handleTaskView = useCallback((task) => {
    //     console.log('Viewing task:', task);
    //     // Implement view logic
    // }, []);

    const handleTaskEdit = useCallback((task) => {
        console.log('Editing task:', task);


        setMethod("edit");
        setUpdateData(task);
        handleOpenCreateModal();
        // Implement edit logic
    }, []);

    const handleTaskDelete = useCallback(async (task) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete "${task.title}"?`);
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/tasks/${task._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to delete task: ${response.status}`);
            }

            console.log('Deleted task:', task._id);
            await refetch(); // Refresh task list after deletion
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Failed to delete task. Please try again.');
        }
    }, [refetch]);


    const handleSearch = useCallback(() => {
        console.log('Searching for:', search);
        // Search is handled automatically through filteredAndSortedTasks
    }, [search]);



    const handleOpenCreateModal = () => setShowCreateModal(true);
    const handleCloseCreateModal = () => setShowCreateModal(false);

    return (
        <div className="flex w-screen h-screen bg-gray-50 font-sans overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                user={user}
                onCreateTaskClick={handleOpenCreateModal}
            />

            {/* Render the CreateTaskModal */}
            <CreateTaskModal
                isOpen={showCreateModal}
                onClose={handleCloseCreateModal}
                onTaskSaved={refetch}
                mode={method}
                initialData={updateData} />

            {/* Content */}
            <div className="flex-1 ml-0 p-4 overflow-auto">
                {/* Mobile Toggle */}
                <div className="md:hidden mb-6">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="bg-gray-900 text-white p-3 rounded-lg shadow-md hover:bg-gray-800 transition"
                        aria-label="Toggle menu"
                    >
                        ☰ Menu
                    </button>
                </div>

                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {user.isAdmin ? "Admin Dashboard" : "Task Dashboard"}
                    </h1>
                    <p className="text-gray-600">
                        {user.isAdmin ? "Manage and track users" : "Manage and track your tasks efficiently"}
                    </p>
                </div>

                {/* Stats Cards */}
                {user.isAdmin ? "" :
                    <StateCards totalTask={taskStats.total} pending={taskStats.pending} completed={taskStats.completed} inProgress={taskStats.inProgress} />}

                {/* Search and Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search tasks ..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-black"
                                    aria-label="Search tasks"
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            </div>
                        </div>
                        {user.isAdmin ? "" :
                            <div className="flex gap-3">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                                    aria-label="Filter by status"
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
                                    aria-label="Sort tasks"
                                >
                                    <option value="date">Sort by Date</option>
                                    <option value="priority">Sort by Priority</option>
                                    <option value="title">Sort by Title</option>
                                </select>
                            </div>}
                    </div>
                </div>

                {/* Task List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Tasks ({filteredAndSortedTasks.length}{filteredAndSortedTasks.length !== taskStats.total && ` of ${taskStats.total}`})
                        </h2>
                    </div>

                    {loading ? (
                        <LoadingState />
                    ) : error ? (
                        <ErrorState error={error} onRetry={refetch} />
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredAndSortedTasks.map((task) => (
                                <TaskCard
                                    key={task.id || task._id}
                                    task={task}
                                    onEdit={handleTaskEdit}
                                    onDelete={handleTaskDelete}
                                    user={user}
                                />
                            ))}
                            {filteredAndSortedTasks.length === 0 && !loading && !error && <EmptyState />}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;