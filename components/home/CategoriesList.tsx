'use client';

import { categories } from '@/utils/categories';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import Link from 'next/link';
import React from 'react';
import { ScrollBar } from '../ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';

function CategoriesList({
  category,
  search,
}: {
  category?: string;
  search?: string;
}) {
  const searchTerm = search ? `&search=${search}` : '';
  
  return (
    <>
      {/* Button for screens < 1200px */}
      <section className="w-full py-4 block xl:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full flex justify-between items-center">
              <span>{category ? category : 'All Categories'}</span>
              <Filter className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/" className="w-full cursor-pointer">
                  <span className={!category ? 'font-medium text-primary' : ''}>All Categories</span>
                </Link>
              </DropdownMenuItem>
              {categories.map((item) => {
                const isActive = item.label === category;
                return (
                  <DropdownMenuItem key={item.label} asChild>
                    <Link 
                      href={`/?category=${item.label}${searchTerm}`}
                      className="w-full cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span className={`capitalize ${isActive ? 'font-medium text-primary' : ''}`}>
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      {/* Horizontal scroll for screens >= 1200px */}
      <section className="w-full overflow-hidden hidden xl:block">
        <ScrollArea className="py-6 w-full">
          <div className="flex gap-x-4">
            {categories.map((item) => {
              const isActive = item.label === category;
              return (
                <Link
                  key={item.label}
                  href={`/?category=${item.label}${searchTerm}`}
                >
                  <article
                    className={`p-3 flex flex-col items-center cursor-pointer duration-300 hover:text-primary w-[100px] ${
                      isActive ? 'text-primary' : ''
                    }`}
                  >
                    <item.icon className="w-8 h-8" />
                    <p className="capitalize text-sm mt-1">{item.label}</p>
                  </article>
                </Link>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>
    </>
  );
}

export default CategoriesList;
