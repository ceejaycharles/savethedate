import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import { importGuests } from '../../lib/bulk-import';
import toast from 'react-hot-toast';

interface BulkImportModalProps {
  eventId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const BulkImportModal = ({ eventId, onClose, onSuccess }: BulkImportModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const content = await file.text();
      const result = await importGuests(eventId, content);
      toast.success(`Successfully imported ${result.count} guests`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import guests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Import Guests</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Upload a CSV file with the following columns: name, email, phone (optional), group (optional)
          </p>
          
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700
              hover:file:bg-primary-100"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || loading} isLoading={loading}>
            Import Guests
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BulkImportModal;