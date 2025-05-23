import React from 'react';
import { Share2, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import { Button } from '../ui/Button';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    const link = shareLinks[platform];
    if (platform === 'email') {
      window.location.href = link;
    } else {
      window.open(link, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare('facebook')}
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare('twitter')}
        aria-label="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare('linkedin')}
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare('email')}
        aria-label="Share via Email"
      >
        <Mail className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default ShareButtons