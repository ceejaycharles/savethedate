import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../lib/database.types';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Gift, Plus, Edit2, Trash2, ExternalLink, Save, X } from 'lucide-react';
import { initializeTransaction } from '../../lib/paystack';
import toast from 'react-hot-toast';

type GiftItem = Database['public']['Tables']['gift_items']['Row'];

const GiftRegistryPage = () => {
  const { eventId } = useParams();
  const supabase = useSupabaseClient<Database>();
  const [giftItems, setGiftItems] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    desired_price: '',
    quantity: '1',
    external_link: '',
    image_url: '',
  });

  useEffect(() => {
    fetchGiftItems();
  }, [eventId]);

  const fetchGiftItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gift_items')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setGiftItems(data || []);
    } catch (error) {
      console.error('Error fetching gift items:', error);
      toast.error('Failed to load gift registry');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('gift_items')
        .insert([
          {
            event_id: eventId,
            name: newItem.name,
            description: newItem.description,
            desired_price: parseFloat(newItem.desired_price),
            quantity: parseInt(newItem.quantity),
            external_link: newItem.external_link,
            image_url: newItem.image_url,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setGiftItems([...giftItems, data]);
      setIsAddingItem(false);
      setNewItem({
        name: '',
        description: '',
        desired_price: '',
        quantity: '1',
        external_link: '',
        image_url: '',
      });
      toast.success('Gift item added successfully');
    } catch (error) {
      console.error('Error adding gift item:', error);
      toast.error('Failed to add gift item');
    }
  };

  const handleUpdateItem = async (itemId: string) => {
    try {
      const itemToUpdate = giftItems.find(item => item.id === itemId);
      if (!itemToUpdate) return;

      const { error } = await supabase
        .from('gift_items')
        .update(itemToUpdate)
        .eq('id', itemId);

      if (error) throw error;

      setEditingItemId(null);
      toast.success('Gift item updated successfully');
    } catch (error) {
      console.error('Error updating gift item:', error);
      toast.error('Failed to update gift item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('gift_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setGiftItems(giftItems.filter(item => item.id !== itemId));
      toast.success('Gift item removed successfully');
    } catch (error) {
      console.error('Error deleting gift item:', error);
      toast.error('Failed to remove gift item');
    }
  };

  const handleContribute = async (item: GiftItem) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      const email = user?.email || '';

      const response = await initializeTransaction(
        item.desired_price,
        email,
        {
          gift_item_id: item.id,
          event_id: eventId,
        }
      );

      if (response.status && response.data.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        throw new Error('Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error('Failed to process payment');
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
        <h1 className="text-3xl font-bold">Gift Registry</h1>
        <Button onClick={() => setIsAddingItem(true)} disabled={isAddingItem}>
          <Plus className="w-4 h-4 mr-2" />
          Add Gift Item
        </Button>
      </div>

      {isAddingItem && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Item Name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required
                />
                <Input
                  label="Desired Price (₦)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.desired_price}
                  onChange={(e) => setNewItem({ ...newItem, desired_price: e.target.value })}
                  required
                />
                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  required
                />
                <Input
                  label="External Link (Optional)"
                  type="url"
                  value={newItem.external_link}
                  onChange={(e) => setNewItem({ ...newItem, external_link: e.target.value })}
                />
                <Input
                  label="Image URL (Optional)"
                  type="url"
                  value={newItem.image_url}
                  onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Description (Optional)"
                    as="textarea"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddingItem(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Item
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {giftItems.length === 0 ? (
        <Card className="p-8 text-center">
          <Gift className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">No Gift Items Yet</h2>
          <p className="text-gray-600 mb-4">Start adding items to your gift registry.</p>
          <Button variant="outline" onClick={() => setIsAddingItem(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Gift Item
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {giftItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <CardContent className="p-6">
                {editingItemId === item.id ? (
                  <div className="space-y-4">
                    <Input
                      value={item.name}
                      onChange={(e) => setGiftItems(giftItems.map(i => 
                        i.id === item.id ? { ...i, name: e.target.value } : i
                      ))}
                    />
                    <Input
                      type="number"
                      value={item.desired_price}
                      onChange={(e) => setGiftItems(giftItems.map(i => 
                        i.id === item.id ? { ...i, desired_price: parseFloat(e.target.value) } : i
                      ))}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingItemId(null)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateItem(item.id)}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                    {item.description && (
                      <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                    )}
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-xl font-bold">₦{item.desired_price.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          {item.purchased_quantity} of {item.quantity} purchased
                        </p>
                      </div>
                      {item.external_link && (
                        <a
                          href={item.external_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-600"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingItemId(item.id)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleContribute(item)}
                        disabled={item.purchased_quantity >= item.quantity}
                      >
                        Contribute
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GiftRegistryPage;