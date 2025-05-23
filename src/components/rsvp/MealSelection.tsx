import React, { useState, useEffect } from 'react';
import { getMealOptions, saveMealSelection } from '../../lib/meals';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface MealSelectionProps {
  eventId: string;
  guestId: string;
  guestCount: number;
}

export function MealSelection({ eventId, guestId, guestCount }: MealSelectionProps) {
  const [mealOptions, setMealOptions] = useState<any[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [dietaryNotes, setDietaryNotes] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMealOptions();
  }, [eventId]);

  const fetchMealOptions = async () => {
    try {
      const options = await getMealOptions(eventId);
      setMealOptions(options);
    } catch (error) {
      console.error('Error fetching meal options:', error);
      toast.error('Failed to load meal options');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await saveMealSelection(guestId, selectedMeal, quantity, dietaryNotes);
      toast.success('Meal selection saved');
    } catch (error) {
      console.error('Error saving meal selection:', error);
      toast.error('Failed to save meal selection');
    }
  };

  if (loading) {
    return <div>Loading meal options...</div>;
  }

  if (mealOptions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Meal Selection</h3>
      
      <div className="grid gap-4">
        {mealOptions.map((meal) => (
          <Card
            key={meal.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedMeal === meal.id
                ? 'border-primary-500 bg-primary-50'
                : 'hover:border-gray-300'
            }`}
            onClick={() => setSelectedMeal(meal.id)}
          >
            <div className="flex items-start">
              <div className="flex-1">
                <h4 className="font-medium">{meal.name}</h4>
                {meal.description && (
                  <p className="text-sm text-gray-600 mt-1">{meal.description}</p>
                )}
                {meal.dietary_info && (
                  <p className="text-xs text-gray-500 mt-1">{meal.dietary_info}</p>
                )}
              </div>
              {selectedMeal === meal.id && (
                <Check className="h-5 w-5 text-primary-500" />
              )}
            </div>
          </Card>
        ))}
      </div>

      {selectedMeal && (
        <div className="space-y-4 mt-6">
          <Input
            type="number"
            label="Number of Servings"
            min={1}
            max={guestCount}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
          />
          
          <Input
            as="textarea"
            label="Dietary Notes or Special Requests"
            placeholder="Any allergies or dietary requirements?"
            value={dietaryNotes}
            onChange={(e) => setDietaryNotes(e.target.value)}
          />

          <Button onClick={handleSubmit} className="w-full">
            Confirm Meal Selection
          </Button>
        </div>
      )}
    </div>
  );
}