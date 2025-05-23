import { supabase } from './supabase';

export async function addVendor(eventId: string, data: {
  name: string;
  category: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
}) {
  const { error } = await supabase
    .from('vendors')
    .insert({
      event_id: eventId,
      name: data.name,
      category: data.category,
      contact_name: data.contactName,
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone,
      notes: data.notes
    });

  if (error) throw error;
  return { success: true };
}

export async function getVendorsByCategory(eventId: string) {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('event_id', eventId)
    .order('category');

  if (error) throw error;

  return data.reduce((acc, vendor) => {
    if (!acc[vendor.category]) {
      acc[vendor.category] = [];
    }
    acc[vendor.category].push(vendor);
    return acc;
  }, {});
}