# CheckAroundMe - Business Listing Platform

CheckAroundMe is a modern web application designed to connect users with local businesses. It allows users to easily discover, review, and interact with services in their area, providing a seamless and intuitive experience. Built with Next.js and React, the platform aims to be a comprehensive resource for finding and evaluating local businesses.

## Features

- **Business Profiles**: Detailed business pages with essential information including services, hours, location, and contact details
- **Review System**: Read and write reviews with ratings, helping others make informed decisions
- **Photo Gallery**: Browse business photos in an interactive carousel
- **Interactive Maps**: Find businesses with integrated location services
- **Mobile Responsive**: Fully responsive design that works on all devices

## Technology Stack

- **Framework**: Next.js (App Router) - A React framework for building full-stack web applications.
- **UI Components**: Custom UI components with Shadcn UI - Reusable UI components built using Radix UI and Tailwind CSS.
- **Styling**: Tailwind CSS - A utility-first CSS framework for rapid styling.
- **Icons**: Lucide React - A collection of open-source icons for React applications.
- **Image Optimization**: Next.js Image component - An optimized image component for performance.
- **Database/Backend**: Appwrite - A self-hosted backend-as-a-service platform providing authentication, database, storage, and more.
- **API**: tRPC - A typesafe API layer for building end-to-end typesafe APIs without GraphQL or REST.

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/checkaroundme/checkaroundme.git
```

2. Navigate to the project directory

```bash
cd checkaroundme
```

3. Install dependencies

```bash
npm install
```

4. Start the development server

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
checkaroundme/
├── public/                  # Static assets (images, fonts, etc.)
│   ├── images/              # Image assets
│   └── leaflet/             # Leaflet map assets
├── src/                     # Source code
│   ├── app/                 # Next.js app router (pages, layouts, API routes)
│   │   ├── api/             # API route handlers
│   │   │   ├── auth/
│   │   │   ├── trpc/
│   │   │   └── upload/
│   │   ├── auth/            # Authentication related pages
│   │   ├── business/        # Business related pages
│   │   │   ├── [businessId]/
│   │   │   │   ├── edit/
│   │   │   │   └── review/
│   │   │   ├── create/
│   │   │   └── terms-of-service/
│   │   ├── messages/        # Messaging pages
│   │   ├── profile/         # User profile pages
│   │   ├── about-us/
│   │   ├── contact-us/
│   │   ├── listings/
│   │   ├── privacy-policy/
│   │   └── terms-of-service/
│   ├── components/          # Reusable React components
│   │   ├── auth/
│   │   ├── base/            # Basic layout components (header, footer)
│   │   ├── business/
│   │   ├── home/
│   │   ├── listing/
│   │   ├── map/
│   │   ├── messages/
│   │   └── ui/              # UI primitives (Shadcn UI)
│   └── lib/                 # Shared libraries, utilities, hooks
│       ├── appwrite/        # Appwrite client and services
│       │   └── services/
│       ├── hooks/           # Custom React hooks
│       └── trpc/            # tRPC client, router, procedures
├── utils/                   # Utility scripts (e.g., seeding, setup)
│   └── appwrite/
├── .gitignore               # Git ignore rules
├── bun.lock                 # Bun lock file
├── components.json          # Shadcn UI configuration
├── next.config.ts           # Next.js configuration
├── package.json             # Project dependencies and scripts
├── postcss.config.mjs       # PostCSS configuration
├── README.md                # Project README file
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## Key Components

- **Business Page**: Comprehensive view of a business with all relevant information
- **Star Rating**: Visual representation of business ratings
- **Review Cards**: Detailed customer reviews with helpful metrics
- **Service Listings**: Clear presentation of services offered by businesses
- **Image Carousel**: Interactive display of business photos

## Component Breakdown

- **StarRating**: Renders star icons based on rating value
- **RatingBar**: Visual representation of rating distribution
- **BusinessInfo**: Displays business name, rating, verification status
- **PhotoGallery**: Carousel of business photos
- **ServiceList**: Grid layout of services offered
- **LocationHours**: Map and business hours display
- **ReviewSection**: Review summary and individual review cards

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Shadcn UI for the component library
- Lucide React for the icon set
- Next.js team for the amazing framework
