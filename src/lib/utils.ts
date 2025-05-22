import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

export function generateInvitationLink(invitationId: string): string {
  return `${window.location.origin}/rsvp/${invitationId}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.floor((current / total) * 100);
}

export const eventTypes = [
  { id: 'wedding', label: 'Wedding' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'anniversary', label: 'Anniversary' },
  { id: 'baby_shower', label: 'Baby Shower' },
  { id: 'graduation', label: 'Graduation' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'housewarming', label: 'Housewarming' },
  { id: 'funeral', label: 'Funeral/Remembrance' },
  { id: 'other', label: 'Other' },
];

export const subscriptionTiers = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Up to 2 active events',
      'Up to 50 guests per event',
      'Basic invitation templates',
      '5% transaction fee on gifts',
      'Standard email support',
    ],
    maxEvents: 2,
    maxGuests: 50,
    transactionFee: 5,
  },
  {
    id: 'silver',
    name: 'Silver',
    price: 2500,
    features: [
      'Up to 5 active events',
      'Up to 250 guests per event',
      'Premium invitation templates',
      '3% transaction fee on gifts',
      'Priority email support',
    ],
    maxEvents: 5,
    maxGuests: 250,
    transactionFee: 3,
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 5000,
    features: [
      'Unlimited active events',
      'Unlimited guests per event',
      'All premium features',
      '1.5% transaction fee on gifts',
      'Dedicated support',
      'Custom domain mapping',
    ],
    maxEvents: null,
    maxGuests: null,
    transactionFee: 1.5,
  },
];