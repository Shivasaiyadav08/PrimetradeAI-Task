import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchTasks = async () => {
    try {
      const { data } = await getTasks();
      setTasks(data.tasks);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (taskData) => {
    try {
      await createTask(taskData);
      toast.success('Task created');
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Creation failed');
    }
  };

  const handleUpdate = async (taskData) => {
    try {
      await updateTask(editingTask._id, taskData);
      toast.success('Task updated');
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        await deleteTask(id);
        toast.success('Task deleted');
        fetchTasks();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            My Tasks
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? 'All users tasks' : `Welcome back, ${user?.name}`}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-500">No tasks yet. Create your first task!</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={setEditingTask}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {showForm && <TaskForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
      {editingTask && (
        <TaskForm task={editingTask} onSubmit={handleUpdate} onClose={() => setEditingTask(null)} />
      )}
    </div>
  );
}