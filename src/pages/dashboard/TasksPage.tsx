import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Calendar, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
}

export default function TasksPage() {
  const { eventId } = useParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    assigned_to: null as string | null,
  });

  useEffect(() => {
    fetchTasks();
  }, [eventId]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:users(full_name)
        `)
        .eq('event_id', eventId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            event_id: eventId,
            title: newTask.title,
            description: newTask.description || null,
            due_date: newTask.due_date || null,
            priority: newTask.priority,
            assigned_to: newTask.assigned_to,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setTasks([...tasks, data]);
      setNewTask({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        assigned_to: null,
      });
      toast.success('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const handleUpdateTask = async (taskId: string) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update(taskToUpdate)
        .eq('id', taskId);

      if (error) throw error;

      setEditingId(null);
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status } : task
      ));
      toast.success('Task status updated');
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Task Checklist</h1>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
          <form onSubmit={handleAddTask} className="space-y-4">
            <Input
              label="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />
            <Input
              label="Description (Optional)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              as="textarea"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="datetime-local"
                label="Due Date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  className="input w-full"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Tasks Yet</h2>
            <p className="text-gray-600 mb-4">Start adding tasks to your checklist.</p>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="p-6">
                {editingId === task.id ? (
                  <div className="space-y-4">
                    <Input
                      value={task.title}
                      onChange={(e) => setTasks(tasks.map(t => 
                        t.id === task.id ? { ...t, title: e.target.value } : t
                      ))}
                    />
                    <Input
                      value={task.description || ''}
                      onChange={(e) => setTasks(tasks.map(t => 
                        t.id === task.id ? { ...t, description: e.target.value } : t
                      ))}
                      as="textarea"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="datetime-local"
                        value={task.due_date?.slice(0, 16) || ''}
                        onChange={(e) => setTasks(tasks.map(t => 
                          t.id === task.id ? { ...t, due_date: e.target.value } : t
                        ))}
                      />
                      <select
                        className="input"
                        value={task.priority}
                        onChange={(e) => setTasks(tasks.map(t => 
                          t.id === task.id ? { ...t, priority: e.target.value } : t
                        ))}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleUpdateTask(task.id)}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleStatusChange(
                            task.id,
                            task.status === 'completed' ? 'pending' : 'completed'
                          )}
                          className="mr-3"
                        >
                          {task.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-success-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        <div>
                          <h3 className={`text-lg font-semibold ${
                            task.status === 'completed' ? 'line-through text-gray-500' : ''
                          }`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-gray-600 mt-1">{task.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center mt-4 space-x-4">
                        {task.due_date && (
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            <span className="text-gray-600">
                              Due: {formatDate(task.due_date)}
                            </span>
                          </div>
                        )}
                        <div className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${task.priority === 'high' ? 'bg-error-100 text-error-700' :
                            task.priority === 'medium' ? 'bg-warning-100 text-warning-700' :
                            'bg-success-100 text-success-700'}
                        `}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(task.id)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}