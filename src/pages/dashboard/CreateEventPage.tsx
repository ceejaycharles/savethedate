import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, MapPin, FileText, Image, Users, Globe, Lock, Gift } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { eventTypes } from '../../lib/utils';
import toast from 'react-hot-toast';

const eventSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters'),
  type: z.string().min(1, 'Please select an event type'),
  dateStart: z.string().min(1, 'Please select a start date'),
  dateEnd: z.string().optional(),
  location: z.string().min(3, 'Please enter a location'),
  description: z.string().optional(),
  privacySetting: z.enum(['public', 'private']),
});

type EventFormValues = z.infer<typeof eventSchema>;

const CreateEventPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
    }
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      privacySetting: 'private',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverImageFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!coverImageFile || !user) return null;
    
    setIsUploading(true);
    try {
      const fileExt = coverImageFile.name.split('.').pop();
      const fileName = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('event_covers')
        .upload(fileName, coverImageFile);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('event_covers')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload cover image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: EventFormValues) => {
    setError(null);

    if (!user?.id) {
      setError('You must be logged in to create an event');
      return;
    }

    if (!userProfile) {
      setError('User profile not found. Please try logging out and back in.');
      return;
    }

    try {
      // Upload cover image if provided
      let imageUrl = null;
      if (coverImageFile) {
        imageUrl = await uploadImage();
      }
      
      // Create event in database
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert([
          {
            user_id: user.id,
            name: data.name,
            type: data.type,
            date_start: data.dateStart,
            date_end: data.dateEnd || null,
            location: data.location,
            description: data.description || null,
            cover_image_url: imageUrl,
            privacy_setting: data.privacySetting,
            status: 'active',
          },
        ])
        .select()
        .single();

      if (eventError) throw eventError;

      toast.success('Event created successfully!');
      navigate(`/dashboard/events/${event.id}`);
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event. Please try again.');
      toast.error('Failed to create event');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Create New Event</h1>
        <p className="text-gray-500 mt-1">Set up the details for your special occasion</p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
          <p className="text-error-600">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Input
                          id="name"
                          label="Event Name"
                          placeholder="e.g., Our Wedding Day"
                          leftIcon={<Calendar className="h-5 w-5 text-gray-400" />}
                          error={errors.name?.message}
                          {...register('name')}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Event Type
                        </label>
                        <select
                          id="type"
                          className={`input w-full ${errors.type ? 'border-error-500' : 'border-gray-300'}`}
                          {...register('type')}
                        >
                          <option value="">Select event type</option>
                          {eventTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        {errors.type && (
                          <p className="mt-1 text-sm text-error-500">{errors.type.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Input
                          id="location"
                          label="Location"
                          placeholder="e.g., Lagos, Nigeria"
                          leftIcon={<MapPin className="h-5 w-5 text-gray-400" />}
                          error={errors.location?.message}
                          {...register('location')}
                        />
                      </div>
                      
                      <div>
                        <Input
                          id="dateStart"
                          type="datetime-local"
                          label="Start Date & Time"
                          error={errors.dateStart?.message}
                          {...register('dateStart')}
                        />
                      </div>
                      
                      <div>
                        <Input
                          id="dateEnd"
                          type="datetime-local"
                          label="End Date & Time (Optional)"
                          error={errors.dateEnd?.message}
                          {...register('dateEnd')}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      className="input min-h-32"
                      placeholder="Add details about your event..."
                      {...register('description')}
                    ></textarea>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
                    <div className="flex flex-col space-y-4">
                      <label className="flex items-start">
                        <input
                          type="radio"
                          value="public"
                          className="mt-1 h-4 w-4 text-primary-600 border-gray-300"
                          {...register('privacySetting')}
                        />
                        <div className="ml-3">
                          <span className="block text-sm font-medium text-gray-700 flex items-center">
                            <Globe className="h-4 w-4 mr-2" />
                            Public
                          </span>
                          <span className="text-sm text-gray-500">
                            Anyone with the link can view your event
                          </span>
                        </div>
                      </label>
                      
                      <label className="flex items-start">
                        <input
                          type="radio"
                          value="private"
                          className="mt-1 h-4 w-4 text-primary-600 border-gray-300"
                          {...register('privacySetting')}
                        />
                        <div className="ml-3">
                          <span className="block text-sm font-medium text-gray-700 flex items-center">
                            <Lock className="h-4 w-4 mr-2" />
                            Private
                          </span>
                          <span className="text-sm text-gray-500">
                            Only invited guests can view your event
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Cover Image</h3>
                <div 
                  className={`border-2 border-dashed rounded-lg p-4 text-center ${
                    coverImageUrl ? 'border-primary-300 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {coverImageUrl ? (
                    <div className="relative">
                      <img 
                        src={coverImageUrl} 
                        alt="Cover Preview" 
                        className="mx-auto rounded-lg max-h-64 object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm"
                        onClick={() => {
                          setCoverImageUrl('');
                          setCoverImageFile(null);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <Image className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label
                          htmlFor="cover-upload"
                          className="cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                        >
                          <span>Upload a cover image</span>
                          <input
                            id="cover-upload"
                            name="cover-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Next Steps</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-4">
                      After creating your event, you'll be able to:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Users className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" />
                        <span>Add guests and send invitations</span>
                      </li>
                      <li className="flex items-start">
                        <Gift className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" />
                        <span>Create a gift registry</span>
                      </li>
                      <li className="flex items-start">
                        <Image className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" />
                        <span>Add photos to your gallery</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isUploading}
              >
                Create Event
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage;