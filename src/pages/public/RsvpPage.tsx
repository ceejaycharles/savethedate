import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { MealSelection } from '../../components/rsvp/MealSelection';
import { CustomQuestions } from '../../components/rsvp/CustomQuestions';
import { Calendar, MapPin, Clock, Users, X, Check } from 'lucide-react';
import { formatDate, formatTime } from '../../lib/utils';
import toast from 'react-hot-toast';

const RsvpPage = () => {
  const { invitationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [rsvpData, setRsvpData] = useState({
    status: '',
    guestCount: 1,
    dietaryRestrictions: '',
    message: '',
  });

  useEffect(() => {
    fetchInvitationDetails();
  }, [invitationId]);

  const fetchInvitationDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          event:events(*),
          guest:guests(*),
          rsvps(*)
        `)
        .eq('id', invitationId)
        .single();

      if (error) throw error;

      setInvitation(data);
      if (data.rsvps?.[0]) {
        setRsvpData({
          status: data.rsvps[0].status,
          guestCount: data.rsvps[0].guest_count,
          dietaryRestrictions: data.rsvps[0].dietary_restrictions || '',
          message: data.rsvps[0].message || '',
        });
      }
    } catch (error) {
      console.error('Error fetching invitation:', error);
      toast.error('Invalid or expired invitation link');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('rsvps')
        .upsert({
          invitation_id: invitationId,
          status: rsvpData.status,
          guest_count: rsvpData.guestCount,
          dietary_restrictions: rsvpData.dietaryRestrictions || null,
          message: rsvpData.message || null,
        });

      if (error) throw error;

      toast.success('Thank you for your response!');
      navigate(`/events/${invitation.event.id}`);
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      toast.error('Failed to submit RSVP');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6">
          <h1 className="text-2xl font-bold mb-4">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">
            This invitation link is invalid or has expired.
          </p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold mb-6">{invitation.event.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(invitation.event.date_start)}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">{formatTime(invitation.event.date_start)}</p>
                </div>
              </div>

              <div className="flex items-center md:col-span-2">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{invitation.event.location}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Will you attend?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className={`flex items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                      rsvpData.status === 'attending'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setRsvpData({ ...rsvpData, status: 'attending' })}
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Yes, I'll be there
                  </button>
                  <button
                    type="button"
                    className={`flex items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                      rsvpData.status === 'declined'
                        ? 'border-error-500 bg-error-50 text-error-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setRsvpData({ ...rsvpData, status: 'declined' })}
                  >
                    <X className="h-5 w-5 mr-2" />
                    No, I can't make it
                  </button>
                </div>
              </div>

              {rsvpData.status === 'attending' && (
                <>
                  <div>
                    <Input
                      type="number"
                      label="Number of Guests"
                      min="1"
                      value={rsvpData.guestCount}
                      onChange={(e) => setRsvpData({ ...rsvpData, guestCount: parseInt(e.target.value) })}
                      leftIcon={<Users className="h-5 w-5 text-gray-400" />}
                    />
                  </div>

                  <MealSelection
                    eventId={invitation.event.id}
                    guestId={invitation.guest.id}
                    guestCount={rsvpData.guestCount}
                  />

                  <CustomQuestions
                    eventId={invitation.event.id}
                    guestId={invitation.guest.id}
                  />

                  <div>
                    <Input
                      label="Dietary Restrictions (Optional)"
                      placeholder="Any food allergies or preferences?"
                      value={rsvpData.dietaryRestrictions}
                      onChange={(e) => setRsvpData({ ...rsvpData, dietaryRestrictions: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div>
                <Input
                  as="textarea"
                  label="Message (Optional)"
                  placeholder="Leave a message for the host..."
                  value={rsvpData.message}
                  onChange={(e) => setRsvpData({ ...rsvpData, message: e.target.value })}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!rsvpData.status || submitting}
                isLoading={submitting}
              >
                Submit RSVP
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RsvpPage;