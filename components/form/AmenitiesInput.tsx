'use client';

import { amenities, Amenity } from '@/utils/amenities';
import { useState } from 'react';
import { Checkbox } from '../ui/checkbox';

function AmenitiesInput({ defaultValue }: { defaultValue?: Amenity[] }) {
  const amenitiesWithIcons = defaultValue?.map(({ name, selected }) => {
    return {
      name,
      selected,
      icon: amenities.find((amenity) => amenity.name === name)!.icon,
    };
  });
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>(
    amenitiesWithIcons || amenities
  );

  const handleChange = (amenity: Amenity) => {
    setSelectedAmenities((prev) =>
      prev.map((a) =>
        a.name === amenity.name ? { ...a, selected: !a.selected } : a
      )
    );
  };

  return (
    <section>
      <input
        type='hidden'
        name='amenities'
        value={JSON.stringify(selectedAmenities)}
      />
      <div className='grid grid-cols-2 gap-4'>
        {selectedAmenities.map((amenity) => {
          return (
            <div key={amenity.name} className='flex items-center space-x-2'>
              <Checkbox
                id={amenity.name}
                checked={amenity.selected}
                onCheckedChange={() => handleChange(amenity)}
              ></Checkbox>
              <label
                htmlFor={amenity.name}
                className='text-sm font-medium leading-none capitalize flex gap-x-2 items-center'
              >
                {amenity.name} <amenity.icon className='w-4 h-4' />
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default AmenitiesInput;
