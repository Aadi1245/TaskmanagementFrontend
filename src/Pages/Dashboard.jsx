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

            console.log('000000000000response', response)

            if (!response.ok) {
                throw new Error(`Failed to fetch tasks: ${response.status} `);
            }

            const data = await response.json();
            setTasks(data || []);
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
    const [customTasks, setCustomTasks] = useState(null);

    // Memoized calculations
    const taskStats = useMemo(() => {
        const currentTasks = customTasks ?? tasks;
        
        if (user.isAdmin) {
            return {
                total: currentTasks.length,
                completed: currentTasks.filter(t => t.isAuthorized === true).length,
                pending: currentTasks.filter(t => t.isAuthorized === false && (!t.permission || !t.permission.includes("rejected"))).length,
                inProgress: currentTasks.filter(t => t.isAuthorized === false && t.permission?.includes("rejected")).length,
            };
        } else {
            return {
                total: currentTasks.length,
                completed: currentTasks.filter(t => t.status === 'completed').length,
                pending: currentTasks.filter(t => t.status === 'pending').length,
                inProgress: currentTasks.filter(t => t.status === 'inProgress').length,
            };
        }
    }, [customTasks, tasks, user.isAdmin]);

    const filteredAndSortedTasks = useMemo(() => {
        const currentTasks = customTasks ?? tasks;
        
        let filtered = currentTasks.filter(task => {
            // Handle status filtering
            let matchesStatus = true;
            if (filterStatus !== 'All') {
                if (user.isAdmin) {
                    // Admin filtering logic
                    if (filterStatus === 'pending') {
                        matchesStatus = task.isAuthorized === false && (!task.permission || !task.permission.includes("rejected"));
                    } else if (filterStatus === 'completed') {
                        matchesStatus = task.isAuthorized === true;
                    } else if (filterStatus === 'inProgress') {
                        matchesStatus = task.isAuthorized === false && task.permission?.includes("rejected");
                    }
                } else {
                    // Regular user filtering logic
                    matchesStatus = task.status === filterStatus;
                }
            }
                let matchesSearch
            // Handle search filtering
            if( user.isAdmin) {
                matchesSearch = !search || 
                task.userName?.toLowerCase().includes(search.toLowerCase())
                //  ||
                // task.email?.toLowerCase().includes(search.toLowerCase()) 
                ; 

            }else{
                 matchesSearch = !search || 
                task.title?.toLowerCase().includes(search.toLowerCase()) 
                // ||
                // task.description?.toLowerCase().includes(search.toLowerCase()) 
                ; 
            
                console.log(`search: ${search} task.title: ${task.title} task.description: ${task.description}`);
            }// For user objects

            return matchesStatus && matchesSearch;
        });

        // Sort the filtered results
        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.updatedAt || b.date || b.createdAt || 0) - new Date(a.updatedAt || a.date || a.createdAt || 0);
                case 'priority':
                    if (user.isAdmin) {
                        // For admin, maybe sort by authorization status or creation date
                        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                    }
                    return (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0);
                case 'title':
                    const aTitle = a.title || a.userName || '';
                    const bTitle = b.title || b.userName || '';
                    return aTitle.localeCompare(bTitle);
                default:
                    return 0;
            }
        });
    }, [customTasks, tasks, filterStatus, search, sortBy, user.isAdmin]);

    const handleTaskEdit = useCallback(async(task) => {
        console.log('handleTaskEdit called with task:', task._id);
        if(user.isAdmin){
            try{const token = localStorage.getItem('token');
            const url = `http://localhost:5001/api/user/${task._id}`

             const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({"isAuthorized": true}),
      });

           if (!response.ok)  console.log(`'Update'---->>>>> task failed`);

      const data = await response.json();
            console.log('Updated task:', data);
            await refetch();
            alert(`User "${task.title || task.userName}" request has been accepted successfully!`);
        } catch (error) {
            console.log('Error updating task:', error);
            alert('Failed to accept request. Please try again.');
        }


    }
        else{
            console.log('Editing task:', task);
        setMethod("edit");
        setUpdateData(task);
        handleOpenCreateModal();
        }
    }, []);

    const handleTaskDelete = useCallback(async (task) => {
        if (user.isAdmin) {
          const confirmDelete = window.confirm(`Are you sure you want to reject  "${task.title || task.name}" request ?`);
            if (!confirmDelete) return;  

 try{const token = localStorage.getItem('token');
            const url = `http://localhost:5001/api/user/${task._id}`

             const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({"permission": ["rejected"]}),
      });

           if (!response.ok)  console.log(`'Update'---->>>>> task failed`);

      const data = await response.json();
            console.log('Updated task:', data);
            await refetch();
            alert(`User "${task.title || task.userName}" request has been accepted successfully!`);
        } catch (error) {
            console.log('Error updating task:', error);
            alert('Failed to accept request. Please try again.');
        }




        }
        
        else{  
            const confirmDelete = window.confirm(`Are you sure you want to delete "${task.title || task.name}"?`);
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
            await refetch();
        } catch (error) {
            console.log('Error deleting task:', error);
            alert('Failed to delete task. Please try again.');
        }}
    }, [refetch]);

    const handleSearch = useCallback(() => {
        console.log('Searching for:', search);
        // Search is handled automatically through filteredAndSortedTasks
    }, [search]);

    const handleOpenCreateModal = () => setShowCreateModal(true);
    const handleCloseCreateModal = () => setShowCreateModal(false);

    const fetchRequestsByType = async (type) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("No authentication token found");

            const user = JSON.parse(localStorage.getItem("userData"));
            if (!user?.isAdmin) return;

            const body =
                type === "all"
                    ? {}
                    : type === "pending"
                    ? { isAuthorized: false }
                    : type === "accepted"
                    ? { isAuthorized: true }
                    : { requestType: "rejected" };

            const response = await fetch(`http://localhost:5001/api/user/unAuthorizedUser`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error(`Failed to fetch ${type} requests`);

            const data = await response.json();
            console.log(`=----->>> Fetched ${type}------->>> requests:`, data);
            setCustomTasks(data || []);
        } catch (error) {
            console.log(`Error fetching ${type} requests:`, error);
            setCustomTasks([]);
        }
    };

    const handleAllRequestsClick = () => fetchRequestsByType("all");
    const handlePendingRequestsClick = () => fetchRequestsByType("pending");
    const handleAcceptedRequestsClick = () => fetchRequestsByType("accepted");
    const handleRejectedRequestsClick = () => fetchRequestsByType("rejected");

    return (
        <div className="flex w-screen h-screen bg-gray-50 font-sans overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                user={user}
                onCreateTaskClick={handleOpenCreateModal}
                allRequests={handleAllRequestsClick}
                pendingRequests={handlePendingRequestsClick} 
                acceptedRequests={handleAcceptedRequestsClick}
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
                {user.isAdmin ? 
                    <StateCards totalTask={taskStats.total} pending={taskStats.pending} completed={taskStats.completed} inProgress={taskStats.inProgress} user={user} /> :
                    <StateCards totalTask={taskStats.total} pending={taskStats.pending} completed={taskStats.completed} inProgress={taskStats.inProgress} />
                }

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
                                    placeholder={user.isAdmin ? "Search users by name, email..." : "Search tasks..."}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-black"
                                    aria-label="Search"
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                                aria-label="Filter by status"
                            >
                                <option value="All">{user.isAdmin ? "All Requests" : "All Status"}</option>
                                <option value="pending">{user.isAdmin ? "Pending Requests" : "Pending"}</option>
                             {  user.isAdmin?"": <option value="inProgress">{user.isAdmin ? "Rejected Requests" : "In Progress"}</option>}
                                <option value="completed">{user.isAdmin ? "Accepted Requests" : "Completed"}</option>
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                                aria-label="Sort"
                            >
                                <option value="date">Sort by Date</option>
                                {!user.isAdmin && <option value="priority">Sort by Priority</option>}
                                <option value="title">{user.isAdmin ? "Sort by Name" : "Sort by Title"}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Task List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {user.isAdmin ? "Users" : "Tasks"} ({filteredAndSortedTasks.length}{filteredAndSortedTasks.length !== taskStats.total && ` of ${taskStats.total}`})
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