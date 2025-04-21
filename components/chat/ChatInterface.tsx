'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, MessageSquare, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Define message types
type MessageRole = 'user' | 'assistant' | 'system';

interface Message {
  role: MessageRole;
  content: string;
}

interface ChatbotResponse {
  message: Message;
  propertyId?: string;
  checkIn?: string;
  checkOut?: string;
  propertyDetails?: any;
  isAvailable?: boolean;
  bookingCreated?: boolean;
  bookingId?: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I can help you check property availability and make bookings. How can I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [propertyContext, setPropertyContext] = useState<{
    propertyId?: string;
    checkIn?: string;
    checkOut?: string;
  }>({});
  const [redirecting, setRedirecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { role: 'user' as MessageRole, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message to API
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          ...propertyContext
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data: ChatbotResponse = await response.json();
      
      // Update messages with assistant response
      setMessages(prev => [...prev, data.message]);
      
      // Update property context if provided
      if (data.propertyId || data.checkIn || data.checkOut) {
        setPropertyContext({
          propertyId: data.propertyId || propertyContext.propertyId,
          checkIn: data.checkIn || propertyContext.checkIn,
          checkOut: data.checkOut || propertyContext.checkOut,
        });
      }

      // If booking was created, redirect to checkout
      if (data.bookingCreated && data.bookingId) {
        setRedirecting(true);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'Redirecting you to the checkout page to complete your booking...'
          }
        ]);
        
        // Add a slight delay before redirecting to allow the user to see the message
        setTimeout(() => {
          router.push(`/checkout?bookingId=${data.bookingId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again later.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Format message content with property details if available
  const formatMessage = (message: Message) => {
    return message.content;
  };

  return (
    <>
      {/* Chat button */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 rounded-full p-3 h-12 w-12 shadow-lg z-50"
        variant="default"
      >
        {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </Button>

      {/* Chat interface */}
      {isChatOpen && (
        <Card className="fixed bottom-20 right-4 w-80 md:w-96 h-[500px] shadow-xl z-50 flex flex-col">
          <CardHeader className="px-4 py-2 border-b">
            <CardTitle className="text-lg flex items-center">
              <MessageSquare size={18} className="mr-2" />
              Rent Aura Assistant
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0 flex-grow overflow-hidden">
            <ScrollArea className="h-[380px] p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex mb-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src="/images/logo.svg" alt="Rent Aura" />
                      <AvatarFallback>RA</AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`px-3 py-2 rounded-lg max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {formatMessage(message)}
                  </div>
                  
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 ml-2">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src="/images/logo.svg" alt="Rent Aura" />
                    <AvatarFallback>RA</AvatarFallback>
                  </Avatar>
                  <div className="px-3 py-2 rounded-lg bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              
              {redirecting && (
                <div className="flex justify-center my-2">
                  <div className="px-3 py-2 rounded-lg bg-primary/10 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    Redirecting to checkout...
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="p-2">
            <div className="flex w-full items-center space-x-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading || redirecting}
                className="flex-1"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={isLoading || redirecting || !input.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
