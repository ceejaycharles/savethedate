import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Calendar, MapPin, Users, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/utils';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [featuredEvents, setFeaturedEvents] = useState([]);

  const eventTypes = [
    { id: 'wedding', label: 'Wedding' },
    { id: 'birthday', label: 'Birthday' },
    { id: 'anniversary', label: 'Anniversary' },
    { id: 'baby_shower', label: 'Baby Shower' },
    { id: 'graduation', label: 'Graduation' },
  ];

  useEffect(() => {
    fetchEvents();
    fetchFeaturedEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          host:users(full_name, profile_picture_url),
          guests:guests(count),
          rsvps:invitations(
            rsvps(status)
          )
        `)
        .eq('privacy_setting', 'public')
        .order('date_start', { ascending: true });

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      if (selectedType) {
        query = query.eq('type', selectedType);
      }

      const { data, error } = await query;

      if (error) throw error;

      const eventsWithCounts = data.map(event => ({
        ...event,
        guest_count: event.guests?.[0]?.count || 0,
        rsvp_count: event.rsvps?.reduce((acc, inv) => 
          acc + (inv.rsvps?.filter(r => r.status === 'attending').length || 0), 0
        ) || 0
      }));

      setEvents(eventsWithCounts);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          host:users(full_name, profile_picture_url),
          guests:guests(count)
        `)
        .eq('privacy_setting', 'public')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setFeaturedEvents(data);
    } catch (error) {
      console.error('Error fetching featured events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchQuery, selectedType]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Featured Events */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Featured Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map(event => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  {event.cover_image_url && (
                    <div className="h-48 relative">
                      <img
                        src={event.cover_image_url}
                        alt={event.name}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <h3 className="text-white font-semibold text-lg">{event.name}</h3>
                      </div>
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(event.date_start)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {event.location}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5 text-gray-400" />}
            />
          </div>
          <div className="w-full md:w-64">
            <select
              className="w-full h-10 px-3 border border-gray-300 rounded-md"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Event Types</option>
              {eventTypes.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(6).fill(null).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))
          ) : events.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-semibold text-gray-600">No events found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            events.map(event => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  {event.cover_image_url && (
                    <div className="h-48 relative">
                      <img
                        src={event.cover_image_url}
                        alt={event.name}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
                        {event.type}
                      </div>
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{event.name}</h3>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(event.date_start)}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {event.rsvp_count} attending
                      </div>
                    </div>
                    {event.host && (
                      <div className="mt-4 flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          {event.host.profile_picture_url ? (
                            <img
                              src={event.host.profile_picture_url}
                              alt={event.host.full_name}
                              className="w-full h-full rounded-full"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {event.host.full_name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          Hosted by {event.host.full_name}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}