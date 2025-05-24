import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Image, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

interface Album {
  id: string;
  name: string;
  description: string | null;
  cover_photo_url: string | null;
}

interface AlbumGridProps {
  albums: Album[];
  onCreateAlbum: () => void;
  onSelectAlbum: (albumId: string) => void;
}

const AlbumGrid = ({ albums, onCreateAlbum, onSelectAlbum }: AlbumGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {albums.map((album) => (
        <Card 
          key={album.id} 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onSelectAlbum(album.id)}
        >
          <div className="aspect-square relative">
            {album.cover_photo_url ? (
              <img
                src={album.cover_photo_url}
                alt={album.name}
                className="w-full h-full object-cover rounded-t-lg"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Image className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="font-medium">{album.name}</h3>
            {album.description && (
              <p className="text-sm text-gray-500 mt-1">{album.description}</p>
            )}
          </CardContent>
        </Card>
      ))}

      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed"
        onClick={onCreateAlbum}
      >
        <div className="aspect-square flex items-center justify-center">
          <div className="text-center">
            <Plus className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Create New Album</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AlbumGrid;