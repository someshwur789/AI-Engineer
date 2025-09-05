# AI Communication Assistant

## Overview

This is a full-stack AI-powered communication assistant designed to intelligently manage customer support emails end-to-end. The application automatically analyzes incoming emails, categorizes them by sentiment and priority, generates context-aware AI responses, and provides a comprehensive dashboard for managing email communications. Built with React on the frontend and Express.js on the backend, it features real-time analytics, automatic email processing, and an intuitive user interface for support teams.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Design System**: Custom design tokens with neutral color scheme and consistent spacing/typography

### Backend Architecture  
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with structured error handling
- **Data Processing**: Asynchronous email processing pipeline with priority queuing
- **Storage Layer**: In-memory storage with interface for database abstraction
- **Service Layer**: Modular services for email processing, AI analysis, and data management

### Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Tables**:
  - `emails`: Stores email metadata, sentiment, priority, and extracted information
  - `ai_responses`: Manages AI-generated responses with quality scoring
  - `analytics`: Tracks system performance and email statistics
- **Features**: UUID primary keys, JSONB for flexible data storage, timestamp tracking

### AI Integration
- **Provider**: OpenAI GPT-5 for natural language processing
- **Capabilities**:
  - Sentiment analysis (positive/negative/neutral)
  - Priority classification (urgent/normal/low) 
  - Email categorization and keyword extraction
  - Context-aware response generation with quality scoring
- **Architecture**: Service-based AI functions with structured prompts and JSON responses

### Email Processing Pipeline
- **Filtering**: Automatic detection of support-related emails based on subject keywords
- **Analysis**: Multi-stage AI processing for sentiment, priority, and categorization
- **Response Generation**: Context-aware draft responses with professional tone
- **Priority Queue**: Urgent emails are processed and displayed first
- **Information Extraction**: Automatic extraction of contact details, requirements, and metadata

## External Dependencies

### Core Framework Dependencies
- **React**: UI framework with hooks and context
- **Express.js**: Web application framework for Node.js
- **TypeScript**: Type safety and development tooling
- **Vite**: Fast build tool and development server

### Database and ORM
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL support
- **Neon Database**: Serverless PostgreSQL (via @neondatabase/serverless)
- **Database URL**: Required environment variable for connection

### AI and External Services
- **OpenAI**: GPT-5 API for natural language processing
- **API Key**: Required environment variable (OPENAI_API_KEY)

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible UI primitives
- **shadcn/ui**: Pre-built component library
- **Class Variance Authority**: Component variant management
- **Lucide React**: Icon library

### State Management and HTTP
- **TanStack React Query**: Server state management and caching
- **Wouter**: Minimalist React router
- **Date-fns**: Date manipulation and formatting utilities

### Development Tools
- **ESBuild**: Fast JavaScript bundler for production
- **TSX**: TypeScript execution for development
- **PostCSS**: CSS processing with Autoprefixer

### Email Integration (Future)
- **IMAP/Gmail/Outlook APIs**: For fetching emails from external providers (referenced in requirements but not yet implemented)