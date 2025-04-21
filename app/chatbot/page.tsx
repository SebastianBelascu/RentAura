import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rent Aura - Chatbot',
  description: 'Talk to our AI assistant to check property availability and make bookings',
};

export default function ChatbotPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Rent Aura Chatbot</h1>
      
      <div className="bg-muted p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">How can our chatbot help you?</h2>
        <p className="mb-4">
          Our AI assistant can help you with the following tasks:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Check the availability of a property for specific dates</li>
          <li>Make a booking for a property</li>
          <li>Answer questions about our properties and services</li>
        </ul>
      </div>
      
      <div className="bg-muted p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Example queries</h2>
        <div className="space-y-4">
          <div className="p-3 bg-background rounded-md">
            "Is property [property ID] available from July 10 to July 15?"
          </div>
          <div className="p-3 bg-background rounded-md">
            "I'd like to book [property name] for next weekend"
          </div>
          <div className="p-3 bg-background rounded-md">
            "What amenities does [property name] have?"
          </div>
        </div>
      </div>
      
      <p className="text-muted-foreground">
        The chatbot is available throughout the site. Click the chat icon in the bottom right corner to start a conversation.
      </p>
    </div>
  );
}
