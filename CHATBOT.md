# Rent Aura Chatbot Feature

This document provides information on how to use and configure the chatbot feature for the Rent Aura property rental application.

## Overview

The chatbot feature allows users to:
1. Check the availability of a specific property for desired dates
2. Initiate and complete the process of reserving a property for specific dates
3. Get information about properties and services

## Setup

### Environment Variables

To use the chatbot feature, you need to add your OpenAI API key to the `.env.local` file:

```
OPENAI_API_KEY=your_openai_api_key
```

You can get an API key from the [OpenAI platform](https://platform.openai.com/api-keys).

### Dependencies

The chatbot feature uses the following dependencies:
- OpenAI API for natural language processing
- Clerk for user authentication
- Prisma for database interactions

## Usage

### For Users

The chatbot is accessible throughout the application via a chat icon in the bottom right corner of the screen. Users can:

1. Click on the chat icon to open the chat interface
2. Type natural language queries like:
   - "Is property XYZ available from July 10 to July 15?"
   - "I'd like to book property ABC for next weekend"
   - "What amenities does property XYZ have?"
3. Follow the chatbot's prompts to complete actions like checking availability or making bookings

### For Developers

#### API Endpoint

The chatbot functionality is implemented through a Next.js API route at `/api/chatbot`. This endpoint:

- Processes user messages using OpenAI's API
- Extracts intent and entities from user queries
- Performs database operations to check availability and create bookings
- Maintains conversation context

#### Key Components

1. **ChatInterface.tsx**: The frontend component that renders the chat UI and handles user interactions
2. **ChatProvider.tsx**: A provider component that makes the chat interface available throughout the application
3. **/api/chatbot/route.ts**: The API endpoint that processes chat messages and interacts with OpenAI

#### Adding to New Pages

The chat interface is automatically available on all pages through the `ChatProvider` component, which is included in the application's main providers.

## Extending the Chatbot

To extend the chatbot's capabilities:

1. Add new intents in the `/api/chatbot/route.ts` file
2. Update the system prompt to include information about new capabilities
3. Implement the necessary database queries and business logic for new features

## Troubleshooting

Common issues:
- If the chatbot doesn't appear, ensure the `ChatProvider` is properly included in the application's providers
- If the chatbot doesn't respond, check that the OpenAI API key is correctly set in the environment variables
- For database-related errors, verify that the Prisma schema is up to date and migrations have been applied
