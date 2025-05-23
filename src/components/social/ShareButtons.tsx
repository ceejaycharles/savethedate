import React from 'react';
import { Facebook, Twitter, Mail, Share2 } from 'lucide-react';
import Button from '../ui/Button';
import { shareEvent } from '../../lib/social';
import toast from 'react-hot-toast';

interface ShareButtonsProps {
  eventId: string;
  className?: string;
}

const ShareButtons = ({ eventId, className }: ShareButtonsProps) => {
  const handleShare = async (platform: 'facebook' | 'twitter' | 'whatsapp' | 'email') => {
    try {
      await shareEvent({ platform, eventId });
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share event');
    }
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('facebook')}
        leftIcon={<Facebook className="w-4 h-4" />}
      >
        Share
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('twitter')}
        leftIcon={<Twitter className="w-4 h-4" />}
      >
        Tweet
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('email')}
        leftIcon={<Mail className="w-4 h-4" />}
      >
        Email
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: 'Event Invitation',
              url: window.location.href
            });
          } else {
            toast.error('Native sharing not supported on this device');
          }
        }}
        leftIcon={<Share2 className="w-4 h-4" />}
      >
        More
      </Button>
    </div>
  );
};

export default ShareButtons;