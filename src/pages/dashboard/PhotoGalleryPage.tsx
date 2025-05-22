import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Camera, Upload, Trash2 } from 'lucide-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/database.types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

type Photo = Database['public']['Tables']['photos']['Row'];

const PhotoGalleryPage = () => {
  const { eventId } = useParams();
  const supabase = useSupabaseClient<Database>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Photo Gallery</h1>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Photos
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : photos.length === 0 ? (
        <Card className="p-8 text-center">
          <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">No Photos Yet</h2>
          <p className="text-gray-600 mb-4">Start capturing memories by uploading photos of your event.</p>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Upload Your First Photo
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden group relative">
              <img
                src={photo.image_url}
                alt={photo.caption || 'Event photo'}
                className="w-full h-64 object-cover"
              />
              {photo.caption && (
                <div className="p-4">
                  <p className="text-sm text-gray-600">{photo.caption}</p>
                </div>
              )}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="destructive" size="icon">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoGalleryPage;