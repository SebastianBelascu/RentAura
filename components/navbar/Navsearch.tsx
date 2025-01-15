'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

function Navsearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [search, setSearch] = useState(
    searchParams.get('search')?.toString() || ''
  );

  return (
    <Input
      type='text'
      placeholder='find a property...'
      className='max-w-xs dark:bg-muted'
    />
  );
}

export default Navsearch;
