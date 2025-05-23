import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Camera, Upload, Trash2, Lock, Globe, Eye, Settings, Download, Tag } from 'lucide-react';
import { Database } from '../../lib/database.types';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { AlbumGrid } from '../../components/photos/AlbumGrid';
import { AlbumModal } from '../../components/photos/AlbumModal';
import { PhotoUploader } from '../../components/photos/PhotoUploader';
import { PhotoFilter } from '../../components/photos/PhotoFilter';
import toast from 'react-hot-toast';

type Photo = Database['public']['Tables']['photos']['Row'];
type Album = Database['public']['Tables']['photo_albums']['Row'];

const PhotoGalleryPage = () => {
  const { eventId } = useParams();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [currentAlbum, setCurrentAlbum] = useState<string | null>(null);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    fetchPhotos();
    fetchAlbums();
    fetchTags();
  }, [eventId]);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('photo_tags')
        .select('tag')
        .distinct()
        .eq('photo_id', 'in', (
          supabase
            .from('photos')
            .select('id')
            .eq('event_id', eventId)
        ));

      if (error) throw error;
      setAvailableTags(data.map(t => t.tag));
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchPhotos = async () => {
    try {
      let query = supabase
        .from('photos')
        .select('*, photo_tags(*)')
        .eq('event_id', eventId);

      if (selectedTags.length > 0) {
        query = query.contains('photo_tags.tag', selectedTags);
      }

      if (searchQuery) {
        query = query.ilike('caption', `%${searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from('photo_albums')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAlbums(data || []);
    } catch (error) {
      console.error('Error fetching albums:', error);
      toast.error('Failed to load albums');
    }
  };

  const handleCreateAlbum = async (albumData: { name: string; description: string }) => {
    try {
      const { data, error } = await supabase
        .from('photo_albums')
        .insert({
          event_id: eventId,
          name: albumData.name,
          description: albumData.description,
        })
        .select()
        .single();

      if (error) throw error;
      setAlbums([...albums, data]);
      setShowAlbumModal(false);
      toast.success('Album created successfully');
    } catch (error) {
      console.error('Error creating album:', error);
      toast.error('Failed to create album');
    }
  };

  const handleUpdateAlbum = async (albumData: { name: string; description: string }) => {
    if (!editingAlbum) return;

    try {
      const { error } = await supabase
        .from('photo_albums')
        .update({
          name: albumData.name,
          description: albumData.description,
        })
        .eq('id', editingAlbum.id);

      if (error) throw error;

      setAlbums(albums.map(album => 
        album.id === editingAlbum.id 
          ? { ...album, ...albumData }
          : album
      ));
      setEditingAlbum(null);
      toast.success('Album updated successfully');
    } catch (error) {
      console.error('Error updating album:', error);
      toast.error('Failed to update album');
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    try {
      const { error } = await supabase
        .from('photo_albums')
        .delete()
        .eq('id', albumId);

      if (error) throw error;

      setAlbums(albums.filter(album => album.id !== albumId));
      if (currentAlbum === albumId) {
        setCurrentAlbum(null);
      }
      toast.success('Album deleted successfully');
    } catch (error) {
      console.error('Error deleting album:', error);
      toast.error('Failed to delete album');
    }
  };

  const handleDownloadPhotos = async () => {
    const photosToDownload = selectedPhotos.length > 0 
      ? photos.filter(photo => selectedPhotos.includes(photo.id))
      : photos;

    for (const photo of photosToDownload) {
      const link = document.createElement('a');
      link.href = photo.image_url;
      link.download = `photo-${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast.success(`${photosToDownload.length} photos queued for download`);
  };

  const handleAddTag = async (photoId: string, tag: string) => {
    try {
      const { error } = await supabase
        .from('photo_tags')
        .insert({
          photo_id: photoId,
          tag: tag.toLowerCase(),
        });

      if (error) throw error;
      fetchPhotos();
      toast.success('Tag added successfully');
    } catch (error) {
      console.error('Error adding tag:', error);
      toast.error('Failed to add tag');
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

        const { error: uploadError } = await supabase.storage
          .from('event_photos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('event_photos')
          .getPublicUrl(fileName);

        const { error: dbError } = await supabase
          .from('photos')
          .insert({
            event_id: eventId,
            user_id_uploader: user!.id,
            image_url: publicUrl,
            privacy_setting: 'event',
            album_id: currentAlbum
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
          {selectedPhotos.length > 0 ? (
            <>
              <Button
                variant="outline"
                onClick={handleDownloadPhotos}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Selected
              </Button>
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
            </>
          ) : (
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
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <PhotoFilter
            tags={availableTags}
            selectedTags={selectedTags}
            onTagSelect={(tag) => {
              setSelectedTags(prev =>
                prev.includes(tag)
                  ? prev.filter(t => t !== tag)
                  : [...prev, tag]
              );
            }}
            onSearch={setSearchQuery}
          />
        </div>

        <div className="lg:col-span-3">
          <PhotoUploader
            eventId={eventId!}
            albumId={currentAlbum}
            onUploadComplete={() => {
              fetchPhotos();
              fetchTags();
            }}
          />

          {currentAlbum === null ? (
            <AlbumGrid
              albums={albums}
              onCreateAlbum={() => setShowAlbumModal(true)}
              onSelectAlbum={setCurrentAlbum}
            />
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
      </div>

      {showAlbumModal && (
        <AlbumModal
          isOpen={showAlbumModal}
          onClose={() => {
            setShowAlbumModal(false);
            setEditingAlbum(null);
          }}
          onSave={editingAlbum ? handleUpdateAlbum : handleCreateAlbum}
          initialData={editingAlbum || undefined}
        />
      )}
    </div>
  );
};

export default PhotoGalleryPage;

export default PhotoGalleryPage