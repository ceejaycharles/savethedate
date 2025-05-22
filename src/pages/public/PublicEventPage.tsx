import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/database.types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

type Event = Database['public']['Tables']['events']['Row'];

const PublicEventPage = () => {
  const { eventId } = useParams();
  const supabase = useSupabaseClient<Database>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .eq('privacy_setting', 'public')
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
        <p className="text-gray-600 mb-8">This event either doesn't exist or is not public.</p>
        <Button href="/" variant="outline">Return Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {event.cover_image_url && (
        <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
          <img
            src={event.cover_image_url}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
        
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start">
              <Calendar className="w-5 h-5 mr-3 text-primary" />
              <div>
                <h3 className="font-semibold">Date</h3>
                <p className="text-gray-600">
                  {new Date(event.date_start).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="w-5 h-5 mr-3 text-primary" />
              <div>
                <h3 className="font-semibold">Time</h3>
                <p className="text-gray-600">
                  {new Date(event.date_start).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="w-5 h-5 mr-3 text-primary" />
              <div>
                <h3 className="font-semibold">Location</h3>
                <p className="text-gray-600">{event.location}</p>
              </div>
            </div>
          </div>
        </Card>

        {event.description && (
          <div className="prose max-w-none mb-8">
            <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
            <p className="text-gray-600">{event.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicEventPage;