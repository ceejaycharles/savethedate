import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ExportButton } from '../../components/analytics/ExportButton';
import { AnalyticsCard } from '../../components/analytics/AnalyticsCard';
import { supabase } from '../../lib/supabase';
import { Users, Calendar, Gift, Mail, Download, PieChart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GuestAnalyticsPage() {
  const { eventId } = useParams();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGuests: 0,
    rsvpStats: {
      attending: 0,
      declined: 0,
      pending: 0,
    },
    mealPreferences: {},
    giftStats: {
      totalAmount: 0,
      averageContribution: 0,
    },
    dietaryRestrictions: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [eventId]);

  const fetchAnalytics = async () => {
    try {
      // Fetch basic guest stats with RSVPs through invitations
      const { data: guests, error: guestsError } = await supabase
        .from('guests')
        .select(`
          *,
          invitations!inner(
            id,
            status,
            event_id,
            rsvps(
              status,
              guest_count,
              dietary_restrictions
            )
          )
        `)
        .eq('invitations.event_id', eventId);

      if (guestsError) throw guestsError;

      // Fetch meal preferences through invitations
      const { data: mealSelections, error: mealsError } = await supabase
        .from('guest_meals')
        .select(`
          *,
          meal:meal_options(name),
          guest!inner(
            invitations!inner(
              event_id
            )
          )
        `)
        .eq('guest.invitations.event_id', eventId);

      if (mealsError) throw mealsError;

      // Fetch gift statistics
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('amount, status')
        .eq('status', 'completed')
        .eq('gift_item_id', 'in', (
          supabase
            .from('gift_items')
            .select('id')
            .eq('event_id', eventId)
        ));

      if (transactionsError) throw transactionsError;

      // Process statistics
      const rsvpStats = {
        attending: 0,
        declined: 0,
        pending: guests?.length || 0,
      };

      const dietaryRestrictions = new Set();
      const mealPreferences = {};

      guests?.forEach(guest => {
        const rsvp = guest.invitations?.[0]?.rsvps?.[0];
        if (rsvp) {
          rsvpStats[rsvp.status]++;
          rsvpStats.pending--;
          
          if (rsvp.dietary_restrictions) {
            dietaryRestrictions.add(rsvp.dietary_restrictions);
          }
        }
      });

      mealSelections?.forEach(selection => {
        const mealName = selection.meal?.name;
        if (mealName) {
          mealPreferences[mealName] = (mealPreferences[mealName] || 0) + selection.quantity;
        }
      });

      const totalAmount = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
      const averageContribution = transactions?.length 
        ? totalAmount / transactions.length 
        : 0;

      setStats({
        totalGuests: guests?.length || 0,
        rsvpStats,
        mealPreferences,
        giftStats: {
          totalAmount,
          averageContribution,
        },
        dietaryRestrictions: Array.from(dietaryRestrictions),
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select(`
          *,
          invitations!inner(
            status,
            event_id,
            rsvps(
              status,
              guest_count,
              dietary_restrictions,
              message
            )
          )
        `)
        .eq('invitations.event_id', eventId);

      if (error) throw error;

      const csvData = data.map(guest => ({
        Name: guest.name,
        Email: guest.email,
        Phone: guest.phone || '',
        'RSVP Status': guest.invitations?.[0]?.rsvps?.[0]?.status || 'Pending',
        'Guest Count': guest.invitations?.[0]?.rsvps?.[0]?.guest_count || 1,
        'Dietary Restrictions': guest.invitations?.[0]?.rsvps?.[0]?.dietary_restrictions || '',
        'Message': guest.invitations?.[0]?.rsvps?.[0]?.message || '',
      }));

      return csvData;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
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
        <div>
          <h1 className="text-3xl font-bold">Guest Analytics</h1>
          <p className="text-gray-600 mt-1">Track your event's attendance and engagement</p>
        </div>
        <ExportButton
          onExport={exportData}
          filename="guest-analytics"
          label="Export Data"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          title="Total Guests"
          value={stats.totalGuests}
          icon={<Users className="h-6 w-6 text-primary-600" />}
        />
        
        <AnalyticsCard
          title="Confirmed Attending"
          value={stats.rsvpStats.attending}
          icon={<Calendar className="h-6 w-6 text-success-600" />}
          change={{
            value: Math.round((stats.rsvpStats.attending / stats.totalGuests) * 100),
            type: 'increase'
          }}
        />
        
        <AnalyticsCard
          title="Total Contributions"
          value={`₦${stats.giftStats.totalAmount.toLocaleString()}`}
          icon={<Gift className="h-6 w-6 text-accent-600" />}
        />
        
        <AnalyticsCard
          title="Response Rate"
          value={`${Math.round(((stats.rsvpStats.attending + stats.rsvpStats.declined) / stats.totalGuests) * 100)}%`}
          icon={<Mail className="h-6 w-6 text-secondary-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">RSVP Breakdown</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Attending</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                    <div 
                      className="h-full bg-success-500 rounded-full"
                      style={{ width: `${(stats.rsvpStats.attending / stats.totalGuests) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {stats.rsvpStats.attending} ({Math.round((stats.rsvpStats.attending / stats.totalGuests) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span>Declined</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                    <div 
                      className="h-full bg-error-500 rounded-full"
                      style={{ width: `${(stats.rsvpStats.declined / stats.totalGuests) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {stats.rsvpStats.declined} ({Math.round((stats.rsvpStats.declined / stats.totalGuests) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span>Pending</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                    <div 
                      className="h-full bg-gray-400 rounded-full"
                      style={{ width: `${(stats.rsvpStats.pending / stats.totalGuests) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {stats.rsvpStats.pending} ({Math.round((stats.rsvpStats.pending / stats.totalGuests) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Meal Preferences</h2>
            {Object.entries(stats.mealPreferences).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(stats.mealPreferences).map(([meal, count]) => (
                  <div key={meal} className="flex justify-between items-center">
                    <span>{meal}</span>
                    <div className="flex items-center">
                      <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${(count / stats.rsvpStats.attending) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {count} ({Math.round((count / stats.rsvpStats.attending) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">No meal preferences recorded yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Dietary Restrictions</h2>
            {stats.dietaryRestrictions.length > 0 ? (
              <ul className="space-y-2">
                {stats.dietaryRestrictions.map((restriction, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                    {restriction}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center">No dietary restrictions reported</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Gift Contributions</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold">₦{stats.giftStats.totalAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Contribution</p>
                <p className="text-2xl font-bold">₦{Math.round(stats.giftStats.averageContribution).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}