import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import db from '@/utils/db';
import { getAuth } from '@clerk/nextjs/server';
import { calculateTotals } from '@/utils/calculateTotals';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define message types for better type safety
type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// Define the request body structure
interface ChatbotRequest {
  messages: Message[];
  propertyId?: string;
  checkIn?: string;
  checkOut?: string;
}

// Define the response structure
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

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Get authenticated user
    const auth = getAuth(req);
    if (!auth?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile from database
    const profile = await db.profile.findUnique({
      where: { clerkId: auth.userId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const { messages, propertyId, checkIn, checkOut }: ChatbotRequest = await req.json();

    // Create a system message with context
    const systemMessage: Message = {
      role: 'system',
      content: `You are a helpful assistant for Rent Aura, a property rental application. 
      You can help users check property availability and make bookings.
      The current user is ${profile.firstName} ${profile.lastName}.
      Today's date is ${new Date().toISOString().split('T')[0]}.
      Keep responses friendly, concise, and helpful.`
    };

    // Create conversation history for OpenAI
    const conversationHistory = [
      systemMessage,
      ...messages
    ];

    // Extract intent and entities using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        ...conversationHistory,
        {
          role: "system",
          content: `Extract the following information from the user's message if present:
          1. Intent: "check_availability" or "book_property" or "general_query"
          2. Property ID or name
          3. Check-in date (in YYYY-MM-DD format)
          4. Check-out date (in YYYY-MM-DD format)
          
          If the user is asking to book a property or check availability, always classify the intent accordingly.
          If the user mentions booking, reserving, or staying at a property, the intent should be "book_property".
          If the user asks about availability or if a property is free, the intent should be "check_availability".
          
          Respond in JSON format like this:
          {
            "intent": "check_availability" | "book_property" | "general_query",
            "propertyId": "property ID or null",
            "propertyName": "property name or null",
            "checkIn": "YYYY-MM-DD or null",
            "checkOut": "YYYY-MM-DD or null"
          }`
        }
      ],
      temperature: 0.1,
    });

    // Parse the extracted information
    let extractedInfo;
    try {
      extractedInfo = JSON.parse(completion.choices[0].message.content || '{}');
      console.log('Extracted info:', extractedInfo);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      extractedInfo = { intent: 'general_query' };
    }
    
    // Use provided values from request or extracted values
    const targetPropertyId = propertyId || extractedInfo.propertyId;
    const targetCheckIn = checkIn || extractedInfo.checkIn;
    const targetCheckOut = checkOut || extractedInfo.checkOut;
    
    let responseData: ChatbotResponse = {
      message: {
        role: 'assistant',
        content: ''
      }
    };

    console.log('Processing intent:', extractedInfo.intent);
    console.log('Property ID:', targetPropertyId);
    console.log('Check-in:', targetCheckIn);
    console.log('Check-out:', targetCheckOut);

    // Handle different intents
    if (extractedInfo.intent === 'check_availability' && targetPropertyId && targetCheckIn && targetCheckOut) {
      // Check property availability
      const isAvailable = await checkPropertyAvailability(
        targetPropertyId,
        new Date(targetCheckIn),
        new Date(targetCheckOut)
      );
      
      // Get property details
      const propertyDetails = await db.property.findUnique({
        where: { id: targetPropertyId },
        select: {
          id: true,
          name: true,
          price: true,
          guests: true,
          bedrooms: true,
          beds: true,
          baths: true,
        },
      });

      if (!propertyDetails) {
        responseData.message.content = "I couldn't find that property. Could you please provide a valid property ID?";
      } else {
        const { totalNights, orderTotal } = calculateTotals({
          checkIn: new Date(targetCheckIn),
          checkOut: new Date(targetCheckOut),
          price: propertyDetails.price,
        });

        if (isAvailable) {
          responseData.message.content = `Great news! ${propertyDetails.name} is available from ${targetCheckIn} to ${targetCheckOut} (${totalNights} nights). The total cost would be $${orderTotal}. Would you like to book it?`;
          responseData.isAvailable = true;
        } else {
          responseData.message.content = `I'm sorry, but ${propertyDetails.name} is not available for the dates you requested (${targetCheckIn} to ${targetCheckOut}). Would you like to check different dates?`;
          responseData.isAvailable = false;
        }
        
        responseData.propertyId = targetPropertyId;
        responseData.checkIn = targetCheckIn;
        responseData.checkOut = targetCheckOut;
        responseData.propertyDetails = propertyDetails;
      }
    } else if (extractedInfo.intent === 'book_property') {
      // If we don't have a property ID but have a name, try to find the property
      if (!targetPropertyId && extractedInfo.propertyName) {
        const property = await db.property.findFirst({
          where: {
            name: {
              contains: extractedInfo.propertyName,
              mode: 'insensitive',
            },
          },
        });
        
        if (property) {
          responseData.propertyId = property.id;
          
          if (!targetCheckIn || !targetCheckOut) {
            responseData.message.content = `I found ${property.name}. To book this property, I need your check-in and check-out dates. When would you like to stay?`;
            return NextResponse.json(responseData);
          }
        } else {
          responseData.message.content = `I couldn't find a property named "${extractedInfo.propertyName}". Could you please provide more details or the property ID?`;
          return NextResponse.json(responseData);
        }
      }
      
      // If we still don't have a property ID or dates, ask for them
      if (!targetPropertyId) {
        responseData.message.content = "To book a property, I need to know which property you're interested in. Could you provide a property ID or name?";
        return NextResponse.json(responseData);
      }
      
      if (!targetCheckIn || !targetCheckOut) {
        responseData.message.content = "To book this property, I need your check-in and check-out dates. When would you like to stay?";
        return NextResponse.json(responseData);
      }
      
      // Check availability before booking
      const isAvailable = await checkPropertyAvailability(
        targetPropertyId,
        new Date(targetCheckIn),
        new Date(targetCheckOut)
      );

      if (!isAvailable) {
        responseData.message.content = "I'm sorry, but this property is not available for the dates you requested. Would you like to check different dates?";
        responseData.isAvailable = false;
      } else {
        // Create booking
        try {
          // Get property details for price calculation
          const property = await db.property.findUnique({
            where: { id: targetPropertyId },
            select: {
              id: true,
              name: true,
              price: true,
            },
          });
          
          if (!property) {
            responseData.message.content = "I couldn't find that property. Please provide a valid property ID.";
          } else {
            // Calculate totals
            const { orderTotal, totalNights } = calculateTotals({
              checkIn: new Date(targetCheckIn),
              checkOut: new Date(targetCheckOut),
              price: property.price,
            });
            
            console.log('Creating booking for property:', property.name);
            console.log('User ID:', profile.clerkId);
            console.log('Check-in:', targetCheckIn);
            console.log('Check-out:', targetCheckOut);
            
            // Create booking in database
            const booking = await db.booking.create({
              data: {
                checkIn: new Date(targetCheckIn),
                checkOut: new Date(targetCheckOut),
                orderTotal,
                totalNights,
                profileId: profile.clerkId,
                propertyId: targetPropertyId,
                paymentStatus: false, // Set to false initially
              },
            });
            
            console.log('Booking created:', booking.id);
            
            responseData.message.content = `Great! I've created a booking for ${property.name} from ${targetCheckIn} to ${targetCheckOut}. The total cost is $${orderTotal}. You can complete the payment process by going to the checkout page. Your booking ID is: ${booking.id}`;
            responseData.bookingCreated = true;
            responseData.bookingId = booking.id;
          }
        } catch (error) {
          console.error('Error creating booking:', error);
          responseData.message.content = "I'm sorry, there was an error creating your booking. Please try again later.";
        }
      }
      
      responseData.propertyId = targetPropertyId;
      responseData.checkIn = targetCheckIn;
      responseData.checkOut = targetCheckOut;
    } else if (extractedInfo.intent === 'check_availability' && (extractedInfo.propertyName || extractedInfo.propertyId)) {
      // Handle case where we have property but no dates
      const propertyName = extractedInfo.propertyName;
      const propertyId = extractedInfo.propertyId;
      
      // Try to find the property
      let property;
      if (propertyId) {
        property = await db.property.findUnique({
          where: { id: propertyId },
        });
      } else if (propertyName) {
        // Search for property by name (case insensitive)
        property = await db.property.findFirst({
          where: {
            name: {
              contains: propertyName,
              mode: 'insensitive',
            },
          },
        });
      }
      
      if (!property) {
        responseData.message.content = "I couldn't find that property. Could you please provide more details or check the property name?";
      } else {
        responseData.message.content = `I found ${property.name}. To check availability, I'll need your check-in and check-out dates. When would you like to stay?`;
        responseData.propertyId = property.id;
      }
    } else {
      // Generate a response for general queries
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: conversationHistory,
        temperature: 0.7,
      });
      
      responseData.message = {
        role: 'assistant',
        content: chatCompletion.choices[0].message.content || "I'm sorry, I didn't understand that. Can you please rephrase your question?"
      };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to check property availability
async function checkPropertyAvailability(
  propertyId: string,
  checkIn: Date,
  checkOut: Date
): Promise<boolean> {
  // Find overlapping bookings
  const overlappingBookings = await db.booking.findMany({
    where: {
      propertyId,
      OR: [
        // Case 1: Booking starts during requested period
        {
          checkIn: {
            gte: checkIn,
            lt: checkOut,
          },
        },
        // Case 2: Booking ends during requested period
        {
          checkOut: {
            gt: checkIn,
            lte: checkOut,
          },
        },
        // Case 3: Booking completely encompasses requested period
        {
          checkIn: {
            lte: checkIn,
          },
          checkOut: {
            gte: checkOut,
          },
        },
      ],
    },
  });
  
  // If there are no overlapping bookings, the property is available
  return overlappingBookings.length === 0;
}
