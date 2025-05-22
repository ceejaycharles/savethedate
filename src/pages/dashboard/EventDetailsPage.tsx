import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/database.types';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Calendar, MapPin, Clock, Users, Gift, Image, Trash2, Edit2, Save, X } from 'lucide-react';
import { formatDate, formatTime } from '../../lib/utils';
import toast from 'react-hot-toast';

type Event = Database['public']['Tables']['events']['Row'];

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const supabase = useSupabaseClient<Database>();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Partial<Event>>({});
  const [stats, setStats] = useState({
    guests: 0,
    rsvps: 0,
    gifts: 0,
    photos: 0
  });

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      // Fetch event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);
      setEditedEvent(eventData);

      // Fetch event statistics
      const [
        { count: guestsCount },
        { count: rsvpsCount },
        { count: giftsCount },
        { count: photosCount }
      ] = await Promise.all([
        supabase.from('guests').select('*', { count: 'exact' }).eq('event_id', eventId),
        supabase.from('rsvps').select('*', { count: 'exact' }).eq('event_id', eventId),
        supabase.from('gift_items').select('*', { count: 'exact' }).eq('event_id', eventId),
        supabase.from('photos').select('*', { count: 'exact' }).eq('event_id', eventId)
      ]);

      setStats({
        guests: guestsCount || 0,
        rsvps: rsvpsCount || 0,
        gifts: giftsCount || 0,
        photos: photosCount || 0
      });
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditedEvent(event || {});
  };

  const handleCancel = () => {
    setEditing(false);
    setEditedEvent(event || {});
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('events')
        .update(editedEvent)
        .eq('id', eventId);

      if (error) throw error;

      setEvent({ ...event, ...editedEvent } as Event);
      setEditing(false);
      toast.success('Event updated successfully');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this event? This action cannot be undone.');
    
    if (confirmed) {
      try {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventId);

        if (error) throw error;

        toast.success('Event deleted successfully');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Event not found</h2>
        <p className="mt-2 text-gray-600">This event might have been deleted or you don't have access to it.</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {editing ? (
              <Input
                value={editedEvent.name}
                onChange={(e) => setEditedEvent({ ...editedEvent, name: e.target.value })}
                className="text-3xl font-bold"
              />
            ) : (
              event.name
            )}
          </h1>
          <p className="text-gray-500 mt-2">{event.type}</p>
        </div>
        
        <div className="flex space-x-2">
          {editing ? (
            <>
              <Button onClick={handleSave} variant="primary">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleEdit} variant="outline">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleDelete} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {event.cover_image_url && (
        <Card className="mb-8 overflow-hidden">
          <img
            src={event.cover_image_url}
            alt={event.name}
            className="w-full h-64 object-cover"
          />
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Event Details</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {editing ? (
                      <Input
                        type="datetime-local"
                        value={editedEvent.date_start?.slice(0, 16)}
                        onChange={(e) => setEditedEvent({ ...editedEvent, date_start: e.target.value })}
                      />
                    ) : (
                      formatDate(event.date_start)
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">{formatTime(event.date_start)}</p>
                </div>
              </div>

              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">
                    {editing ? (
                      <Input
                        value={editedEvent.location}
                        onChange={(e) => setEditedEvent({ ...editedEvent, location: e.target.value })}
                      />
                    ) : (
                      event.location
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Event Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Users className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.guests}</p>
                <p className="text-sm text-gray-500">Guests</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-6 h-6 text-secondary-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.rsvps}</p>
                <p className="text-sm text-gray-500">RSVPs</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Gift className="w-6 h-6 text-accent-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.gifts}</p>
                <p className="text-sm text-gray-500">Gifts</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Image className="w-6 h-6 text-success-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.photos}</p>
                <p className="text-sm text-gray-500">Photos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {editing ? (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <textarea
              value={editedEvent.description || ''}
              onChange={(e) => setEditedEvent({ ...editedEvent, description: e.target.value })}
              className="w-full h-32 p-2 border rounded-md"
              placeholder="Add a description for your event..."
            />
          </CardContent>
        </Card>
      ) : event.description && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={() => navigate(`/dashboard/events/${eventId}/guests`)}
          className="w-full"
        >
          <Users className="w-4 h-4 mr-2" />
          Manage Guests
        </Button>
        
        <Button
          onClick={() => navigate(`/dashboard/events/${eventId}/gifts`)}
          className="w-full"
        >
          <Gift className="w-4 h-4 mr-2" />
          Gift Registry
        </Button>
        
        <Button
          onClick={() => navigate(`/dashboard/events/${eventId}/photos`)}
          className="w-full"
        >
          <Image className="w-4 h-4 mr-2" />
          Photo Gallery
        </Button>
      </div>
    </div>
  );
};

export default EventDetailsPage;