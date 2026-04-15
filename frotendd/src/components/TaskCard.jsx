import React from 'react';
import { Edit2, Trash2, Calendar } from 'lucide-react';

const statusConfig = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  'in-progress': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
};

export default function TaskCard({ task, onEdit, onDelete, isAdmin }) {
  return (
    <div className="card group hover:scale-[1.02] transition-transform duration-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{task.title}</h3>
          {task.description && (
            <p className="mt-2 text-gray-600 text-sm line-clamp-2">{task.description}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <span className={`px-2 py-1 text-xs rounded-full ${statusConfig[task.status].bg} ${statusConfig[task.status].text}`}>
              {statusConfig[task.status].label}
            </span>
            {isAdmin && task.user && (
              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                {task.user.email}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="h-3 w-3" />
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition">
          <button onClick={() => onEdit(task)} className="text-blue-600 hover:text-blue-800">
            <Edit2 className="h-4 w-4" />
          </button>
          <button onClick={() => onDelete(task._id)} className="text-red-600 hover:text-red-800">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}