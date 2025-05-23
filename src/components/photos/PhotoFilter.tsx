import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Tag, Search, Filter } from 'lucide-react';

interface PhotoFilterProps {
  tags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  onSearch: (query: string) => void;
}

export default function PhotoFilter({ tags, selectedTags, onTagSelect, onSearch }: PhotoFilterProps) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center mb-2">
          <Search className="h-4 w-4 text-gray-400 mr-2" />
          <Input
            placeholder="Search photos..."
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center mb-2">
          <Tag className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-700">Filter by Tags</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onTagSelect(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}