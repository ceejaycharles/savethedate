import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';

const EventDetailsPage = () => {
  const { eventId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Event Details</h1>
      <Card className="p-6">
        <p className="text-gray-600">Loading event details...</p>
      </Card>
    </div>
  );
};

export default EventDetailsPage;