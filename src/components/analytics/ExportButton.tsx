import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '../ui/Button';

interface ExportButtonProps {
  onExport: () => Promise<string>;
  filename: string;
  label: string;
}

export function ExportButton({ onExport, filename, label }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const csvContent = await onExport();
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      isLoading={loading}
    >
      <Download className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}

export default ExportButton;