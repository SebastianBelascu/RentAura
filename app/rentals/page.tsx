import EmptyList from '@/components/home/EmptyList';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchRentals } from '@/utils/actions';
import { formatCurrency } from '@/utils/format';
import Link from 'next/link';
import React from 'react';

async function RentalsPage() {
  const rentals = await fetchRentals();
  if (rentals.length === 0) {
    return (
      <EmptyList
        heading='No rentals to display'
        message="Don't hesitate to create a rental"
      />
    );
  }
  return (
    <div className='mt-16'>
      <h4 className='mb-4 capitalize'>active properties : {rentals.length}</h4>
      <Table>
        <TableCaption>A list of all your properties.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHeader>Property Name</TableHeader>
            <TableHeader>Nightly Rate</TableHeader>
            <TableHeader>Nights Booked</TableHeader>
            <TableHeader>Total Income</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rentals.map((rental) => {
            const { id: propertyId, name, price } = rental;
            const { totalNightsSum, orderTotalSum } = rental;
            return (
              <TableRow key={propertyId}>
                <TableCell>
                  <Link
                    className='underline text-muted-foreground tracking-wide'
                    href={`/properties/${propertyId}`}
                  />
                </TableCell>
                <TableCell>{formatCurrency(price)}</TableCell>
                <TableCell>{totalNightsSum || 0}</TableCell>
                <TableCell>{formatCurrency(orderTotalSum)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default RentalsPage;
