import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface MealOption {
  id: string;
  name: string;
  description: string | null;
  dietary_info: string | null;
  max_quantity: number | null;
}

export default function MealOptionsPage() {
  const { eventId } = useParams();
  const [mealOptions, setMealOptions] = useState<MealOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newMeal, setNewMeal] = useState({
    name: '',
    description: '',
    dietary_info: '',
    max_quantity: ''
  });

  useEffect(() => {
    fetchMealOptions();
  }, [eventId]);

  const fetchMealOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_options')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMealOptions(data || []);
    } catch (error) {
      console.error('Error fetching meal options:', error);
      toast.error('Failed to load meal options');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('meal_options')
        .insert([
          {
            event_id: eventId,
            name: newMeal.name,
            description: newMeal.description || null,
            dietary_info: newMeal.dietary_info || null,
            max_quantity: newMeal.max_quantity ? parseInt(newMeal.max_quantity) : null
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setMealOptions([...mealOptions, data]);
      setNewMeal({
        name: '',
        description: '',
        dietary_info: '',
        max_quantity: ''
      });
      toast.success('Meal option added successfully');
    } catch (error) {
      console.error('Error adding meal option:', error);
      toast.error('Failed to add meal option');
    }
  };

  const handleUpdateMeal = async (mealId: string) => {
    const mealToUpdate = mealOptions.find(meal => meal.id === mealId);
    if (!mealToUpdate) return;

    try {
      const { error } = await supabase
        .from('meal_options')
        .update(mealToUpdate)
        .eq('id', mealId);

      if (error) throw error;

      setEditingId(null);
      toast.success('Meal option updated successfully');
    } catch (error) {
      console.error('Error updating meal option:', error);
      toast.error('Failed to update meal option');
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      const { error } = await supabase
        .from('meal_options')
        .delete()
        .eq('id', mealId);

      if (error) throw error;

      setMealOptions(mealOptions.filter(meal => meal.id !== mealId));
      toast.success('Meal option deleted successfully');
    } catch (error) {
      console.error('Error deleting meal option:', error);
      toast.error('Failed to delete meal option');
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
        <h1 className="text-3xl font-bold">Meal Options</h1>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Meal Option</h2>
          <form onSubmit={handleAddMeal} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Meal Name"
                value={newMeal.name}
                onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                required
              />
              <Input
                label="Maximum Servings (Optional)"
                type="number"
                min="1"
                value={newMeal.max_quantity}
                onChange={(e) => setNewMeal({ ...newMeal, max_quantity: e.target.value })}
              />
              <div className="md:col-span-2">
                <Input
                  label="Description (Optional)"
                  value={newMeal.description}
                  onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  label="Dietary Information (Optional)"
                  value={newMeal.dietary_info}
                  onChange={(e) => setNewMeal({ ...newMeal, dietary_info: e.target.value })}
                  placeholder="e.g., Vegetarian, Contains nuts, Gluten-free"
                />
              </div>
            </div>
            <Button type="submit" className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Meal Option
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {mealOptions.length === 0 ? (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No Meal Options Yet</h2>
            <p className="text-gray-600 mb-4">Start by adding meal options for your guests to choose from.</p>
          </Card>
        ) : (
          mealOptions.map((meal) => (
            <Card key={meal.id} className="overflow-hidden">
              <CardContent className="p-6">
                {editingId === meal.id ? (
                  <div className="space-y-4">
                    <Input
                      value={meal.name}
                      onChange={(e) => setMealOptions(mealOptions.map(m => 
                        m.id === meal.id ? { ...m, name: e.target.value } : m
                      ))}
                    />
                    <Input
                      value={meal.description || ''}
                      onChange={(e) => setMealOptions(mealOptions.map(m => 
                        m.id === meal.id ? { ...m, description: e.target.value } : m
                      ))}
                      placeholder="Description"
                    />
                    <Input
                      value={meal.dietary_info || ''}
                      onChange={(e) => setMealOptions(mealOptions.map(m => 
                        m.id === meal.id ? { ...m, dietary_info: e.target.value } : m
                      ))}
                      placeholder="Dietary Information"
                    />
                    <Input
                      type="number"
                      value={meal.max_quantity || ''}
                      onChange={(e) => setMealOptions(mealOptions.map(m => 
                        m.id === meal.id ? { ...m, max_quantity: parseInt(e.target.value) } : m
                      ))}
                      placeholder="Maximum Quantity"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleUpdateMeal(meal.id)}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{meal.name}</h3>
                        {meal.description && (
                          <p className="text-gray-600 mt-1">{meal.description}</p>
                        )}
                        {meal.dietary_info && (
                          <p className="text-sm text-gray-500 mt-1">{meal.dietary_info}</p>
                        )}
                        {meal.max_quantity && (
                          <p className="text-sm text-gray-500 mt-1">
                            Maximum servings: {meal.max_quantity}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(meal.id)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteMeal(meal.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}