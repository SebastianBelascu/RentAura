'use client';

import { ReactNode } from 'react';
import ChatInterface from './ChatInterface';

interface ChatProviderProps {
  children: ReactNode;
}

export default function ChatProvider({ children }: ChatProviderProps) {
  return (
    <>
      {children}
      <ChatInterface />
    </>
  );
}
