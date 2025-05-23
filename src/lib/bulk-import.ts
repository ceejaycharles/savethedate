import { supabase } from './supabase';
import Papa from 'npm:papaparse';

export async function importGuests(eventId: string, csvContent: string) {
  try {
    const { data } = Papa.parse(csvContent, { header: true });
    
    const guests = data.map(row => ({
      event_id: eventId,
      name: row.name,
      email: row.email,
      phone: row.phone || null,
      group_name: row.group || null
    }));

    const { error } = await supabase
      .from('guests')
      .insert(guests);

    if (error) throw error;
    return { success: true, count: guests.length };
  } catch (error) {
    console.error('Guest import error:', error);
    throw error;
  }
}