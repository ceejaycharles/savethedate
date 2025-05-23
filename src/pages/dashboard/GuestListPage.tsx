import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import BulkImportModal from '../../components/guests/BulkImportModal';
import { Plus, Trash2, Mail, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export default function GuestListPage() {
  const { eventId } = useParams();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    fetchGuests();
  }, [eventId]);

  async function fetchGuests() {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setGuests(data || []);
    } catch (error) {
      toast.error('Failed to fetch guest list');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addGuest(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('guests')
        .insert([
          {
            event_id: eventId,
            name: newGuest.name,
            email: newGuest.email,
            phone: newGuest.phone || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setGuests([...guests, data]);
      setNewGuest({ name: '', email: '', phone: '' });
      toast.success('Guest added successfully');
    } catch (error) {
      toast.error('Failed to add guest');
      console.error('Error:', error);
    }
  }

  async function deleteGuest(guestId: string) {
    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', guestId);

      if (error) throw error;

      setGuests(guests.filter(guest => guest.id !== guestId));
      toast.success('Guest removed successfully');
    } catch (error) {
      toast.error('Failed to remove guest');
      console.error('Error:', error);
    }
  }

  async function sendInvitation(guest: Guest) {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .insert([
          {
            event_id: eventId,
            guest_id: guest.id,
            invitation_link: `${window.location.origin}/rsvp/${crypto.randomUUID()}`,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      toast.success(`Invitation sent to ${guest.email}`);
    } catch (error) {
      toast.error('Failed to send invitation');
      console.error('Error:', error);
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Guest List</h1>
        <Button onClick={() => setShowImportModal(true)} leftIcon={<Upload className="w-4 h-4" />}>
          Import Guests
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <form onSubmit={addGuest} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder="Guest Name"
              value={newGuest.name}
              onChange={e => setNewGuest({ ...newGuest, name: e.target.value })}
              required
            />
            <Input
              type="email"
              placeholder="Email Address"
              value={newGuest.email}
              onChange={e => setNewGuest({ ...newGuest, email: e.target.value })}
              required
            />
            <Input
              type="tel"
              placeholder="Phone Number (Optional)"
              value={newGuest.phone}
              onChange={e => setNewGuest({ ...newGuest, phone: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Guest
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        {guests.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No guests added yet</p>
        ) : (
          guests.map(guest => (
            <Card key={guest.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{guest.name}</h3>
                  <p className="text-sm text-gray-600">{guest.email}</p>
                  {guest.phone && (
                    <p className="text-sm text-gray-600">{guest.phone}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => sendInvitation(guest)}
                    variant="outline"
                    size="sm"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitation
                  </Button>
                  <Button
                    onClick={() => deleteGuest(guest.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {showImportModal && (
        <BulkImportModal
          eventId={eventId!}
          onClose={() => setShowImportModal(false)}
          onSuccess={fetchGuests}
        />
      )}
    </div>
  );
}