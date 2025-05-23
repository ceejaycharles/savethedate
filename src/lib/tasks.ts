import { supabase } from './supabase';

export async function createTask(eventId: string, data: {
  title: string;
  description?: string;
  dueDate?: string;
  assignedTo?: string;
  priority?: 'low' | 'medium' | 'high';
}) {
  const { error } = await supabase
    .from('tasks')
    .insert({
      event_id: eventId,
      title: data.title,
      description: data.description,
      due_date: data.dueDate,
      assigned_to: data.assignedTo,
      priority: data.priority || 'medium',
      status: 'pending'
    });

  if (error) throw error;
  return { success: true };
}

export async function updateTaskStatus(taskId: string, status: string) {
  const { error } = await supabase
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', taskId);

  if (error) throw error;
  return { success: true };
}

export async function getTaskTimeline(eventId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      assigned_to:users(full_name)
    `)
    .eq('event_id', eventId)
    .order('due_date');

  if (error) throw error;
  return data;
}