import { supabase } from './supabase';

export async function createAlbum(eventId: string, name: string) {
  const { data, error } = await supabase
    .from('photo_albums')
    .insert({
      event_id: eventId,
      name,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadPhotos(albumId: string, files: File[]) {
  const uploads = files.map(async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${albumId}/${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);

    return supabase
      .from('photos')
      .insert({
        album_id: albumId,
        file_name: fileName,
        url: publicUrl
      });
  });

  await Promise.all(uploads);
  return { success: true };
}