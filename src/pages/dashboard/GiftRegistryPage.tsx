import React from 'react';
import { useParams } from 'react-router-dom';

const GiftRegistryPage = () => {
  const { eventId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gift Registry</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Loading gift registry for event {eventId}...</p>
      </div>
    </div>
  );
};

export default GiftRegistryPage;