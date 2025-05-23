import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Camera, Upload, Trash2, Lock, Globe, Eye, Settings } from 'lucide-react';
import { Database } from '../../lib/database.types';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import toast from 'react-hot-toast';

type Photo = Database['public']['Tables']['photos']['Row'];

const PhotoGalleryPage = () => {
  const { eventId } = useParams();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  useEffect(() => {
    fetchPhotos();
  }, [eventId]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const user = (await supabase.auth.getUser()).data.user;

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${eventId}/${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload to Storage
        const { error: uploadError } = await supabase.storage
          .from('event_photos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('event_photos')
          .getPublicUrl(fileName);

        // Create photo record
        const { error: dbError } = await supabase
          .from('photos')
          .insert({
            event_id: eventId,
            user_id_uploader: user!.id,
            image_url: publicUrl,
            privacy_setting: 'event'
          });

        if (dbError) throw dbError;
      }

      toast.success('Photos uploaded successfully');
      fetchPhotos();
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Failed to upload photos');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      setPhotos(photos.filter(photo => photo.id !== photoId));
      toast.success('Photo deleted successfully');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    }
  };

  const updatePrivacy = async (photoId: string, privacy: string) => {
    try {
      const { error } = await supabase
        .from('photos')
        .update({ privacy_setting: privacy })
        .eq('id', photoId);

      if (error) throw error;

      setPhotos(photos.map(photo => 
        photo.id === photoId ? { ...photo, privacy_setting: privacy } : photo
      ));
      toast.success('Privacy setting updated');
    } catch (error) {
      console.error('Error updating privacy:', error);
      toast.error('Failed to update privacy setting');
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
        <div>
          <h1 className="text-3xl font-bold">Photo Gallery</h1>
          <p className="text-gray-600 mt-1">Share and manage your event photos</p>
        </div>
        <div className="flex items-center space-x-4">
          {selectedPhotos.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => {
                selectedPhotos.forEach(id => handleDelete(id));
                setSelectedPhotos([]);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </Button>
          )}
          <label className="cursor-pointer">
            <Button isLoading={uploading}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Photos
            </Button>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {photos.length === 0 ? (
        <Card className="p-8 text-center">
          <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">No Photos Yet</h2>
          <p className="text-gray-600 mb-4">Start capturing memories by uploading photos of your event.</p>
          <label className="cursor-pointer">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First Photo
            </Button>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden group relative">
              <div className="relative aspect-square">
                <img
                  src={photo.image_url}
                  alt={photo.caption || 'Event photo'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white"
                    onClick={() => {
                      const newPrivacy = photo.privacy_setting === 'public' ? 'event' : 'public';
                      updatePrivacy(photo.id, newPrivacy);
                    }}
                  >
                    {photo.privacy_setting === 'public' ? (
                      <Globe className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(photo.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {photo.caption && (
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">{photo.caption}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoGalleryPage