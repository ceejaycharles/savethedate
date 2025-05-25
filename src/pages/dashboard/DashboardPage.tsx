import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Gift, Users, PlusCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../lib/utils';

const DashboardPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            guests:guests(count),
            gift_items:gift_items(count)
          `)
          .eq('user_id', user.id)
          .order('date_start', { ascending: true });

        if (error) {
          console.error('Error fetching events:', error);
          return;
        }

        // Transform the count aggregates into numbers
        const eventsWithCounts = data?.map(event => ({
          ...event,
          guests_count: event.guests?.[0]?.count || 0,
          gift_items_count: event.gift_items?.[0]?.count || 0
        })) || [];

        setEvents(eventsWithCounts);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your events and track your RSVPs</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/dashboard/create-event">
            <Button leftIcon={<PlusCircle className="h-5 w-5" />}>
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        // Loading state
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="pt-6">
                <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
                <div className="flex space-x-4">
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        // Empty state
        <Card className="bg-gray-50 border-dashed border-2 border-gray-300">
          <CardContent className="py-16">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Create your first event and start sending invitations to your guests.
              </p>
              <Link to="/dashboard/create-event">
                <Button variant="primary" leftIcon={<PlusCircle className="h-5 w-5" />}>
                  Create Your First Event
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Events list
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-md transition-all">
              <div className="h-48 bg-gray-100 relative">
                {event.cover_image_url ? (
                  <img 
                    src={event.cover_image_url} 
                    alt={event.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-50">
                    <Calendar className="h-16 w-16 text-primary-300" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
                  {event.type}
                </div>
              </div>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2 truncate">{event.name}</h3>
                <p className="text-gray-500 text-sm mb-4">
                  {formatDate(event.date_start)}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{event.guests_count} guests</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Gift className="h-4 w-4 mr-1" />
                    <span>{event.gift_items_count} gifts</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Link to={`/dashboard/events/${event.id}`}>
                    <Button variant="primary" className="w-full">
                      Manage Event
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Create new event card */}
          <Card className="bg-gray-50 border-dashed border-2 border-gray-300 hover:bg-gray-100 transition-colors">
            <Link to="/dashboard/create-event">
              <CardContent className="h-full flex flex-col items-center justify-center py-16">
                <PlusCircle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Create New Event</h3>
              </CardContent>
            </Link>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;