```typescript
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Plus, Edit2, Trash2, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface BudgetItem {
  id: string;
  category: string;
  item_name: string;
  estimated_amount: number;
  actual_amount: number | null;
  paid_amount: number;
  notes: string | null;
}

export default function BudgetPage() {
  const { eventId } = useParams();
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    category: '',
    item_name: '',
    estimated_amount: '',
    notes: ''
  });

  useEffect(() => {
    fetchBudgetItems();
  }, [eventId]);

  const fetchBudgetItems = async () => {
    try {
      const { data, error } = await supabase
        .from('event_budgets')
        .select('*')
        .eq('event_id', eventId)
        .order('category', { ascending: true });

      if (error) throw error;
      setBudgetItems(data || []);
    } catch (error) {
      console.error('Error fetching budget items:', error);
      toast.error('Failed to load budget');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('event_budgets')
        .insert([
          {
            event_id: eventId,
            category: newItem.category,
            item_name: newItem.item_name,
            estimated_amount: parseFloat(newItem.estimated_amount),
            notes: newItem.notes || null
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setBudgetItems([...budgetItems, data]);
      setNewItem({
        category: '',
        item_name: '',
        estimated_amount: '',
        notes: ''
      });
      toast.success('Budget item added successfully');
    } catch (error) {
      console.error('Error adding budget item:', error);
      toast.error('Failed to add budget item');
    }
  };

  const handleUpdateItem = async (itemId: string) => {
    const itemToUpdate = budgetItems.find(item => item.id === itemId);
    if (!itemToUpdate) return;

    try {
      const { error } = await supabase
        .from('event_budgets')
        .update(itemToUpdate)
        .eq('id', itemId);

      if (error) throw error;

      setEditingId(null);
      toast.success('Budget item updated successfully');
    } catch (error) {
      console.error('Error updating budget item:', error);
      toast.error('Failed to update budget item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('event_budgets')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setBudgetItems(budgetItems.filter(item => item.id !== itemId));
      toast.success('Budget item deleted successfully');
    } catch (error) {
      console.error('Error deleting budget item:', error);
      toast.error('Failed to delete budget item');
    }
  };

  const getTotalBudget = () => {
    return budgetItems.reduce((sum, item) => sum + item.estimated_amount, 0);
  };

  const getTotalSpent = () => {
    return budgetItems.reduce((sum, item) => sum + (item.actual_amount || 0), 0);
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
        <h1 className="text-3xl font-bold">Budget Tracker</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <h3 className="text-2xl font-bold">₦{getTotalBudget().toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-primary-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <h3 className="text-2xl font-bold">₦{getTotalSpent().toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-success-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-success-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <h3 className="text-2xl font-bold">
                  ₦{(getTotalBudget() - getTotalSpent()).toLocaleString()}
                </h3>
              </div>
              <div className="p-2 bg-warning-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-warning-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add Budget Item</h2>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Category"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                required
              />
              <Input
                label="Item Name"
                value={newItem.item_name}
                onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                required
              />
              <Input
                label="Estimated Amount (₦)"
                type="number"
                value={newItem.estimated_amount}
                onChange={(e) => setNewItem({ ...newItem, estimated_amount: e.target.value })}
                required
              />
              <Input
                label="Notes (Optional)"
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              />
            </div>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {budgetItems.length === 0 ? (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No Budget Items Yet</h2>
            <p className="text-gray-600 mb-4">Start by adding items to your budget.</p>
          </Card>
        ) : (
          budgetItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                {editingId === item.id ? (
                  <div className="space-y-4">
                    <Input
                      value={item.category}
                      onChange={(e) => setBudgetItems(items => 
                        items.map(i => i.id === item.id ? { ...i, category: e.target.value } : i)
                      )}
                    />
                    <Input
                      value={item.item_name}
                      onChange={(e) => setBudgetItems(items => 
                        items.map(i => i.id === item.id ? { ...i, item_name: e.target.value } : i)
                      )}
                    />
                    <Input
                      type="number"
                      value={item.estimated_amount}
                      onChange={(e) => setBudgetItems(items => 
                        items.map(i => i.id === item.id ? { ...i, estimated_amount: parseFloat(e.target.value) } : i)
                      )}
                    />
                    <Input
                      value={item.notes || ''}
                      onChange={(e) => setBudgetItems(items => 
                        items.map(i => i.id === item.id ? { ...i, notes: e.target.value } : i)
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
                        onClick={() => handleUpdateItem(item.id)}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">{item.category}</span>
                        <span className="text-gray-300">•</span>
                        <h3 className="font-medium">{item.item_name}</h3>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                      )}
                      <div className="mt-2 space-x-4">
                        <span className="text-sm">
                          Estimated: <span className="font-medium">₦{item.estimated_amount.toLocaleString()}</span>
                        </span>
                        {item.actual_amount && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-sm">
                              Actual: <span className="font-medium">₦{item.actual_amount.toLocaleString()}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(item.id)}
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