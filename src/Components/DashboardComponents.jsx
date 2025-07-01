import React from 'react';
import {PRIORITY_COLORS,STATUS_COLORS} from "../Constants";
import { CheckCircle, CheckSquare, Eye, Edit, Trash2, Calendar, AlertCircle,Clock } from 'lucide-react';


// Utility functions
const getStatusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.default;
const getPriorityColor = (priority) => PRIORITY_COLORS[priority] || PRIORITY_COLORS.default;

const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

const StatsCard = React.memo(({ title, value, icon: Icon, color, bgColor }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
      <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
        <Icon className={`${color} text-xl`} size={20} />
      </div>
    </div>
  </div>
));

function StateCards({totalTask,pending,completed,inProgress, user}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title={user?.isAdmin?"All Request":"Total Tasks"}
            value={totalTask}
            icon={CheckSquare}
            color="text-gray-900"
            bgColor="bg-blue-100"
          />
          <StatsCard
            title={user?.isAdmin?"Accepted Request":"Completed"}
            value={completed}
            icon={CheckCircle}
            color="text-green-600"
            bgColor="bg-green-100"
          />
   {user?.isAdmin?"":<StatsCard
            title={user?.isAdmin?"Rejected Request":"In Progress"}
            value={inProgress}
            icon={Clock}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />}
          <StatsCard
            title={user?.isAdmin?"Pending Request":"Pending"}
            value={pending}
            icon={Clock}
            color="text-yellow-600"
            bgColor="bg-yellow-100"
          />
        </div>
    );
}

const TaskCard = React.memo(({ task, onEdit, onDelete,user }) => (
  <div className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(task.priority)}`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h3 className="text-lg font-semibold text-gray-900">{user?.isAdmin?task.userName: task.title}</h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user?.isAdmin?task.isAuthorized?"completed":"pending": task.status)}`}>
            {user?.isAdmin?task.isAuthorized?"Accepted":"Pending": task?.status?.replace(/([A-Z])/g, ' $1').trim()}
          </span>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 capitalize">
            {task.priority}
          </span>
        </div>
        
        {task.description && (
          <p className="text-gray-600 mb-3 line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
          {task.date && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{formatDate(task.date)}</span>
            </div>
          )}
          {task.category && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>{task.category}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        
       {task.isAuthorized?<p className='p-2 text-green-600'>Accepted</p>: user?.isAdmin?<button
              onClick={() => onEdit(task)}
              className="p-2 text-red-600  hover:bg-green-50 rounded-lg transition-colors"
              aria-label={`Accept request from ${task.userName}`}
            >
             Accept ✅
            </button>:
        <button 
          onClick={() => onEdit(task)}
          className=" p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          aria-label={`Edit task: ${task.title}`}
        >
          <Edit size={16} color='gray' />
        </button>}
        {user?.isAdmin? ""
        //  <button
        //       onClick={() => onDelete({ ...task, isAuthorized: false, permission: ['rejected'] })}
        //       className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        //       aria-label={`Reject request from ${task.userName}`}
        //     >
        //       ❌
        //     </button>
        :
          <button 
          onClick={() => onDelete(task)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          aria-label={`Delete task: ${task.title}`}
        >
          <Trash2 size={16} />
        </button>}
      </div>
    </div>
  </div>
));

const EmptyState = () => (
  <div className="p-12 text-center">
    <CheckSquare className="mx-auto text-gray-300 mb-4" size={64} />
    <p className="text-gray-500 text-lg">No tasks found matching your criteria</p>
    <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="p-12 text-center">
    <AlertCircle className="mx-auto text-red-300 mb-4" size={64} />
    <p className="text-red-600 text-lg mb-2">Failed to load tasks</p>
    <p className="text-gray-500 text-sm mb-4">{error}</p>
    <button 
      onClick={onRetry}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Try Again
    </button>
  </div>
);

const LoadingState = () => (
  <div className="p-12 text-center">
    <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
    <p className="text-gray-500">Loading tasks...</p>
  </div>
);

export {LoadingState,ErrorState,EmptyState,TaskCard,StatsCard,StateCards};