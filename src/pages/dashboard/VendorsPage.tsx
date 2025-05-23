```typescript
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Plus, Edit2, Trash2, Phone, Mail, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Vendor {
  id: string;
  name: string;
  category: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
}

export default function VendorsPage() {
  const { eventId } = useParams();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newVendor, setNewVendor] = useState({
    name: '',
    category: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: ''
  });

  useEffect(() => {
    fetchVendors();
  }, [eventId]);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('event_id', eventId)
        .order('category', { ascending: true });

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert([
          {
            event_id: eventId,
            name: newVendor.name,
            category: newVendor.category,
            contact_name: newVendor.contact_name || null,
            contact_email: newVendor.contact_email || null,
            contact_phone: newVendor.contact_phone || null,
            notes: newVendor.notes || null
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setVendors([...vendors, data]);
      setNewVendor({
        name: '',
        category: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        notes: ''
      });
      toast.success('Vendor added successfully');
    } catch (error) {
      console.error('Error adding vendor:', error);
      toast.error('Failed to add vendor');
    }
  };

  const handleUpdateVendor = async (vendorId: string) => {
    const vendorToUpdate = vendors.find(v => v.id === vendorId);
    if (!vendorToUpdate) return;

    try {
      const { error } = await supabase
        .from('vendors')
        .update(vendorToUpdate)
        .eq('id', vendorId);

      if (error) throw error;

      setEditingId(null);
      toast.success('Vendor updated successfully');
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast.error('Failed to update vendor');
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', vendorId);

      if (error) throw error;

      setVendors(vendors.filter(v => v.id !== vendorId));
      toast.success('Vendor deleted successfully');
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error('Failed to delete vendor');
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
        <h1 className="text-3xl font-bold">Vendor Management</h1>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Vendor</h2>
          <form onSubmit={handleAddVendor} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Vendor Name"
                value={newVendor.name}
                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                required
              />
              <Input
                label="Category"
                value={newVendor.category}
                onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                required
              />
              <Input
                label="Contact Name"
                value={newVendor.contact_name}
                onChange={(e) => setNewVendor({ ...newVendor, contact_name: e.target.value })}
              />
              <Input
                label="Contact Email"
                type="email"
                value={newVendor.contact_email}
                onChange={(e) => setNewVendor({ ...newVendor, contact_email: e.target.value })}
              />
              <Input
                label="Contact Phone"
                value={newVendor.contact_phone}
                onChange={(e) => setNewVendor({ ...newVendor, contact_phone: e.target.value })}
              />
              <Input
                label="Notes"
                value={newVendor.notes}
                onChange={(e) => setNewVendor({ ...newVendor, notes: e.target.value })}
              />
            </div>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {vendors.length === 0 ? (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No Vendors Yet</h2>
            <p className="text-gray-600 mb-4">Start by adding vendors for your event.</p>
          </Card>
        ) : (
          vendors.map((vendor) => (
            <Card key={vendor.id}>
              <CardContent className="p-6">
                {editingId === vendor.id ? (
                  <div className="space-y-4">
                    <Input
                      value={vendor.name}
                      onChange={(e) => setVendors(vendors => 
                        vendors.map(v => v.id === vendor.id ? { ...v, name: e.target.value } : v)
                      )}
                    />
                    <Input
                      value={vendor.category}
                      onChange={(e) => setVendors(vendors => 
                        vendors.map(v => v.id === vendor.id ? { ...v, category: e.target.value } : v)
                      )}
                    />
                    <Input
                      value={vendor.contact_name || ''}
                      onChange={(e) => setVendors(vendors => 
                        vendors.map(v => v.id === vendor.id ? { ...v, contact_name: e.target.value } : v)
                      )}
                    />
                    <Input
                      value={vendor.contact_email || ''}
                      onChange={(e) => setVendors(vendors => 
                        vendors.map(v => v.id === vendor.id ? { ...v, contact_email: e.target.value } : v)
                      )}
                    />
                    <Input
                      value={vendor.contact_phone || ''}
                      onChange={(e) => setVendors(vendors => 
                        vendors.map(v => v.id === vendor.id ? { ...v, contact_phone: e.target.value } : v)
                      )}
                    />
                    <Input
                      value={vendor.notes || ''}
                      onChange={(e) => setVendors(vendors => 
                        vendors.map(v => v.id === vendor.id ? { ...v, notes: e.target.value } : v)
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleUpdateVendor(vendor.id)}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">{vendor.category}</span>
                        <span className="text-gray-300">•</span>
                        <h3 className="font-medium">{vendor.name}</h3>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        {vendor.contact_name && (
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-2" />
                            {vendor.contact_name}
                          </div>
                        )}
                        {vendor.contact_email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            <a href={`mailto:${vendor.contact_email}`} className="hover:text-primary-600">
                              {vendor.contact_email}
                            </a>
                          </div>
                        )}
                        {vendor.contact_phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            <a href={`tel:${vendor.contact_phone}`} className="hover:text-primary-600">
                              {vendor.contact_phone}
                            </a>
                          </div>
                        )}
                      </div>

                      {vendor.notes && (
                        <p className="text-sm text-gray-600 mt-2">{vendor.notes}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(vendor.id)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteVendor(vendor.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
```