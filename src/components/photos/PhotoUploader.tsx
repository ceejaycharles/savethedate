import React, { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Upload, X, Tag as TagIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface PhotoUploaderProps {
  eventId: string;
  albumId?: string;
  onUploadComplete: () => void;
}

export function PhotoUploader({ eventId, albumId, onUploadComplete }: PhotoUploaderProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${eventId}/${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload photo to storage
        const { error: uploadError } = await supabase.storage
          .from('event_photos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('event_photos')
          .getPublicUrl(fileName);

        // Create photo record
        const { data: photo, error: photoError } = await supabase
          .from('photos')
          .insert({
            event_id: eventId,
            user_id_uploader: user!.id,
            image_url: publicUrl,
            album_id: albumId,
            privacy_setting: 'event'
          })
          .select()
          .single();

        if (photoError) throw photoError;

        // Add tags
        if (tags.length > 0) {
          const { error: tagError } = await supabase
            .from('photo_tags')
            .insert(
              tags.map(tag => ({
                photo_id: photo.id,
                tag
              }))
            );

          if (tagError) throw tagError;
        }
      }

      toast.success('Photos uploaded successfully');
      onUploadComplete();
      setFiles(null);
      setTags([]);
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {files && files.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Selected Files:</h4>
              <ul className="space-y-1">
                {Array.from(files).map((file, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-gray-100"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center">
              <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type a tag and press Enter"
              />
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!files || files.length === 0 || uploading}
            isLoading={uploading}
            className="w-full"
          >
            Upload Photos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}