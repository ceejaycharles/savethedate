import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import { formatDate, formatTime } from '../../lib/utils';
import toast from 'react-hot-toast';

interface TimelineEntry {
  id: string;
  title: string;
  description: string | null;
  date: string;
  order_index: number;
}

export default function TimelinePage() {
  const { eventId } = useParams();
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    fetchTimeline();
  }, [eventId]);

  const fetchTimeline = async () => {
    try {
      const { data, error } = await supabase
        .from('timelines')
        .select('*')
        .eq('event_id', eventId)
        .order('date', { ascending: true });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching timeline:', error);
      toast.error('Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('timelines')
        .insert([
          {
            event_id: eventId,
            title: newEntry.title,
            description: newEntry.description || null,
            date: newEntry.date,
            order_index: entries.length,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setEntries([...entries, data]);
      setNewEntry({
        title: '',
        description: '',
        date: new Date().toISOString().slice(0, 16),
      });
      toast.success('Timeline entry added');
    } catch (error) {
      console.error('Error adding timeline entry:', error);
      toast.error('Failed to add entry');
    }
  };

  const handleUpdateEntry = async (entryId: string) => {
    const entryToUpdate = entries.find(e => e.id === entryId);
    if (!entryToUpdate) return;

    try {
      const { error } = await supabase
        .from('timelines')
        .update(entryToUpdate)
        .eq('id', entryId);

      if (error) throw error;

      setEditingId(null);
      toast.success('Entry updated');
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error('Failed to update entry');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('timelines')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setEntries(entries.filter(e => e.id !== entryId));
      toast.success('Entry deleted');
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
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
        <h1 className="text-3xl font-bold">Event Timeline</h1>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add Timeline Entry</h2>
          <form onSubmit={handleAddEntry} className="space-y-4">
            <Input
              label="Title"
              value={newEntry.title}
              onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
              required
            />
            <Input
              label="Description (Optional)"
              value={newEntry.description}
              onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
              as="textarea"
            />
            <Input
              type="datetime-local"
              label="Date & Time"
              value={newEntry.date}
              onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
              required
            />
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Add Entry
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {entries.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Timeline Entries</h2>
            <p className="text-gray-600 mb-4">Start adding entries to create your event timeline.</p>
          </Card>
        ) : (
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            {entries.map((entry, index) => (
              <div key={entry.id} className="relative pl-16 pb-8">
                <div className="absolute left-6 top-3 w-4 h-4 rounded-full bg-primary-500 border-4 border-white"></div>
                <Card>
                  <CardContent className="p-6">
                    {editingId === entry.id ? (
                      <div className="space-y-4">
                        <Input
                          value={entry.title}
                          onChange={(e) => setEntries(entries.map(ent => 
                            ent.id === entry.id ? { ...ent, title: e.target.value } : ent
                          ))}
                        />
                        <Input
                          value={entry.description || ''}
                          onChange={(e) => setEntries(entries.map(ent => 
                            ent.id === entry.id ? { ...ent, description: e.target.value } : ent
                          ))}
                          as="textarea"
                        />
                        <Input
                          type="datetime-local"
                          value={entry.date.slice(0, 16)}
                          onChange={(e) => setEntries(entries.map(ent => 
                            ent.id === entry.id ? { ...ent, date: e.target.value } : ent
                          ))}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleUpdateEntry(entry.id)}
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">{entry.title}</h3>
                            {entry.description && (
                              <p className="text-gray-600 mt-2">{entry.description}</p>
                            )}
                            <div className="flex items-center mt-4 text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(entry.date)}
                              <Clock className="w-4 h-4 ml-4 mr-1" />
                              {formatTime(entry.date)}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingId(entry.id)}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}