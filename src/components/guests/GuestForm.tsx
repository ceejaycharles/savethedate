import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Plus, X } from 'lucide-react';

interface GuestFormProps {
  guest: {
    name: string;
    email: string;
    phone: string;
    plus_one_allowed: boolean;
    plus_one_name: string;
    plus_one_email: string;
  };
  onChange: (guest: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing?: boolean;
  onCancel?: () => void;
}

const GuestForm = ({ guest, onChange, onSubmit, isEditing, onCancel }: GuestFormProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Guest Name"
            value={guest.name}
            onChange={(e) => onChange({ ...guest, name: e.target.value })}
            required
          />
          
          <Input
            type="email"
            label="Email Address"
            value={guest.email}
            onChange={(e) => onChange({ ...guest, email: e.target.value })}
            required
          />
          
          <Input
            type="tel"
            label="Phone Number (Optional)"
            value={guest.phone}
            onChange={(e) => onChange({ ...guest, phone: e.target.value })}
          />

          <div className="space-y-4 border-t pt-4 mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="plus_one_allowed"
                checked={guest.plus_one_allowed}
                onChange={(e) => onChange({ ...guest, plus_one_allowed: e.target.checked })}
                className="h-4 w-4 text-primary-600 rounded border-gray-300"
              />
              <label htmlFor="plus_one_allowed" className="ml-2 text-sm font-medium text-gray-700">
                Allow Plus One
              </label>
            </div>

            {guest.plus_one_allowed && (
              <div className="pl-6 space-y-4">
                <Input
                  label="Plus One Name"
                  value={guest.plus_one_name}
                  onChange={(e) => onChange({ ...guest, plus_one_name: e.target.value })}
                />
                
                <Input
                  type="email"
                  label="Plus One Email"
                  value={guest.plus_one_email}
                  onChange={(e) => onChange({ ...guest, plus_one_email: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            {isEditing && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              {isEditing ? 'Save Changes' : 'Add Guest'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export { GuestForm };