import React from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';

const RsvpPage = () => {
  const { invitationId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-lg mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">RSVP to Event</h1>
        <p className="text-gray-600">RSVP functionality coming soon...</p>
      </Card>
    </div>
  );
};

export default RsvpPage;