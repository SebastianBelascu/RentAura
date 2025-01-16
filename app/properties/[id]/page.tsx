import { fetchPropertyDetails } from '@/utils/actions';
import { redirect } from 'next/navigation';
import React from 'react';

async function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const property = await fetchPropertyDetails(params.id);
  if (!property) redirect('/');
  const { baths, bedrooms, beds, guests } = property;
  const details = { baths, bedrooms, beds, guests };
  return <div></div>;
}

export default PropertyDetailsPage;
