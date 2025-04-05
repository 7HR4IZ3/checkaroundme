# CheckAroundMe - Business Listing Platform

CheckAroundMe is a modern web application that allows users to discover, review, and interact with local businesses. Built with Next.js and React, it provides a seamless experience for users to find services in their area.

## Features

- **Business Profiles**: Detailed business pages with essential information including services, hours, location, and contact details
- **Review System**: Read and write reviews with ratings, helping others make informed decisions
- **Photo Gallery**: Browse business photos in an interactive carousel
- **Interactive Maps**: Find businesses with integrated location services
- **Mobile Responsive**: Fully responsive design that works on all devices

## Technology Stack

- **Framework**: Next.js (App Router)
- **UI Components**: Custom UI components with Shadcn UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Image Optimization**: Next.js Image component

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/checkaroundme.git
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
├── public/                  # Static assets
│   ├── images/              # Image assets
│   │   ├── cat-placeholder.png
│   │   └── service-placeholder.png
│   └── placeholder-avatar1.jpg
│
├── src/                     # Source code
│   ├── app/                 # Next.js app router pages
│   │   ├── business/        # Business listing pages
│   │   │   └── page.tsx     # Main business profile page
│   │   └── layout.tsx       # Root layout component
│   │
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # UI component library
│   │   │   ├── avatar.tsx   # User avatar component
│   │   │   ├── badge.tsx    # Badge component for categories/tags
│   │   │   ├── button.tsx   # Button component
│   │   │   ├── card.tsx     # Card component for reviews/listings
│   │   │   ├── carousel.tsx # Image carousel component
│   │   │   └── separator.tsx # Visual separator component
│   │   │
│   │   └── [other components]
│   │
│   └── lib/                 # Utility functions and shared logic
│
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Git ignore file
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies and scripts
├── postcss.config.js       # PostCSS configuration for Tailwind
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
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
