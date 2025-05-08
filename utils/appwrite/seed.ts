import { Client, Databases, ID, Query } from "node-appwrite";
import {
  DATABASE_ID,
  USERS_COLLECTION_ID,
  BUSINESSES_COLLECTION_ID,
  BUSINESS_HOURS_COLLECTION_ID,
  BUSINESS_IMAGES_COLLECTION_ID,
  REVIEWS_COLLECTION_ID,
  REVIEW_REACTIONS_COLLECTION_ID,
  CATEGORIES_COLLECTION_ID,
  MESSAGES_COLLECTION_ID,
  CONVERSATIONS_COLLECTION_ID,
} from "../../src/lib/appwrite";

// Utility to insert demo data into Appwrite collections
// Run this script after running setupDatabase.ts

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

async function seedCategories() {
  const demoCategories = [
    {
      name: "Cleaning",
      description: "Home and commercial cleaning",
      imageUrl: "https://placehold.co/100x100/cleaning",
      parentId: null,
    },
    {
      name: "Beauty & Spa",
      description: "Personal care and relaxation",
      imageUrl: "https://placehold.co/100x100/beautyspa",
      parentId: null,
    },
    {
      name: "Aluminum Fabrication",
      description: "Custom aluminum products",
      imageUrl: "https://placehold.co/100x100/aluminum",
      parentId: null,
    },
    {
      name: "Mechanic (Auto Repair)",
      description: "Vehicle maintenance and repair",
      imageUrl: "https://placehold.co/100x100/mechanic",
      parentId: null,
    },
    {
      name: "Event",
      description: "Planning and support for events",
      imageUrl: "https://placehold.co/100x100/events",
      parentId: null,
    },
    {
      name: "Electrician",
      description: "Electrical installation and repair",
      imageUrl: "https://placehold.co/100x100/electrician",
      parentId: null,
    },
    {
      name: "Plumbing",
      description: "Water systems installation and repair",
      imageUrl: "https://placehold.co/100x100/plumbing",
      parentId: null,
    },
    {
      name: "Handyman",
      description: "General home repairs and maintenance",
      imageUrl: "https://placehold.co/100x100/handyman",
      parentId: null,
    },
    {
      name: "Painting",
      description: "Interior and exterior painting",
      imageUrl: "https://placehold.co/100x100/painting",
      parentId: null,
    },
    {
      name: "Landscaping / Gardening",
      description: "Outdoor space design and maintenance",
      imageUrl: "https://placehold.co/100x100/landscaping",
      parentId: null,
    },
    {
      name: "Pest Control",
      description: "Pest extermination and prevention",
      imageUrl: "https://placehold.co/100x100/pestcontrol",
      parentId: null,
    },
    {
      name: "HVAC",
      description: "Heating, ventilation, and air conditioning",
      imageUrl: "https://placehold.co/100x100/hvac",
      parentId: null,
    },
    {
      name: "Tutoring",
      description: "Academic assistance and instruction",
      imageUrl: "https://placehold.co/100x100/tutoring",
      parentId: null,
    },
    {
      name: "Pet Grooming / Pet Sitting",
      description: "Care for pets",
      imageUrl: "https://placehold.co/100x100/pets",
      parentId: null,
    },
    {
      name: "Photography",
      description: "Professional photography for various needs",
      imageUrl: "https://placehold.co/100x100/photography",
      parentId: null,
    },
    {
      name: "Catering",
      description: "Food preparation and service for events",
      imageUrl: "https://placehold.co/100x100/catering",
      parentId: null,
    },
    {
      name: "Moving",
      description: "Relocation assistance",
      imageUrl: "https://placehold.co/100x100/moving",
      parentId: null,
    },
    {
      name: "Home Renovation / Contractor",
      description: "Home improvement and construction",
      imageUrl: "https://placehold.co/100x100/renovation",
      parentId: null,
    },
    {
      name: "IT Support / Computer Repair",
      description: "Technical assistance for computers and IT systems",
      imageUrl: "https://placehold.co/100x100/itsupport",
      parentId: null,
    },
    {
      name: "Personal Training / Fitness Instruction",
      description: "Guided fitness programs and instruction",
      imageUrl: "https://placehold.co/100x100/personaltraining",
      parentId: null,
    },
  ];
  for (const cat of demoCategories) {
    const existing = await databases.listDocuments(
      DATABASE_ID,
      CATEGORIES_COLLECTION_ID,
      [Query.equal("name", cat.name)],
    );
    if (existing.total > 0) {
      console.log(`Category '${cat.name}' already exists.`);
      continue;
    }
    await databases.createDocument(
      DATABASE_ID,
      CATEGORIES_COLLECTION_ID,
      ID.unique(),
      cat,
    );
    console.log(`Category '${cat.name}' created.`);
  }
}

async function seedUsers() {
  const demoUsers = [
    {
      fullName: "Alice Demo",
      phone: "+1234567890",
      avatarUrl: "https://placehold.co/100x100/alice",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      fullName: "Bob Demo",
      phone: "+1987654321",
      avatarUrl: "https://placehold.co/100x100/bob",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      fullName: "Charlie Example",
      phone: "+1122334455",
      avatarUrl: "https://placehold.co/100x100/charlie",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      fullName: "Diana Sample",
      phone: "+1222333444",
      avatarUrl: "https://placehold.co/100x100/diana",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      fullName: "Ethan Test",
      phone: "+1555666777",
      avatarUrl: "https://placehold.co/100x100/ethan",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  for (const user of demoUsers) {
    const existing = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("phone", user.phone)],
    );
    if (existing.total > 0) {
      console.log(`User '${user.fullName}' already exists.`);
      continue;
    }
    await databases.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      ID.unique(),
      user,
    );
    console.log(`User '${user.fullName}' created.`);
  }
}

async function seedBusinesses() {
  // Get users and categories for references
  const users = await databases.listDocuments(
    DATABASE_ID,
    USERS_COLLECTION_ID,
    [Query.limit(5)],
  );
  const categories = await databases.listDocuments(
    DATABASE_ID,
    CATEGORIES_COLLECTION_ID,
    [Query.limit(5)],
  );
  if (users.total === 0 || categories.total === 0) {
    console.log(
      "Cannot seed businesses: need at least one user and one category.",
    );
    return;
  }
  const demoBusinesses = [
    {
      name: "Demo Pizza Place",
      description: "Best pizza in town",
      about: "Family-owned pizzeria with fresh ingredients.",
      categories: [categories.documents[0]?.name],
      services: ["Dine-in", "Takeout", "Delivery"],
      isVerified: true,
      rating: 4.5,
      reviewCount: 2,
      addressLine1: "123 Main St",
      addressLine2: "",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
      postalCode: "100001",
      coordinates: JSON.stringify({ latitude: 6.5244, longitude: 3.3792 }),
      phone: "+2348000000000",
      email: "contact@demopizza.com",
      website: "https://demopizza.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: users.documents[0]?.$id,
    },
    {
      name: "Sunrise Bakery",
      description: "Fresh bread and pastries every morning.",
      about: "A cozy bakery with a wide selection of breads and cakes.",
      categories: [categories.documents[3]?.name],
      services: ["Takeout", "Delivery"],
      isVerified: false,
      rating: 4.2,
      reviewCount: 1,
      addressLine1: "45 Baker St",
      addressLine2: "",
      city: "Abuja",
      state: "FCT",
      country: "Nigeria",
      postalCode: "900001",
      coordinates: JSON.stringify({ latitude: 9.0579, longitude: 7.4951 }),
      phone: "+2348112233445",
      email: "info@sunrisebakery.com",
      website: "https://sunrisebakery.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: users.documents[1]?.$id,
    },
    {
      name: "FitLife Gym",
      description: "Modern gym with personal trainers.",
      about: "State-of-the-art equipment and group classes.",
      categories: [categories.documents[2]?.name],
      services: ["Membership", "Personal Training"],
      isVerified: true,
      rating: 4.8,
      reviewCount: 3,
      addressLine1: "88 Fitness Ave",
      addressLine2: "Suite 2",
      city: "Port Harcourt",
      state: "Rivers",
      country: "Nigeria",
      postalCode: "500001",
      coordinates: JSON.stringify({ latitude: 4.8156, longitude: 7.0498 }),
      phone: "+2348123456789",
      email: "contact@fitlifegym.com",
      website: "https://fitlifegym.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: users.documents[2]?.$id,
    },
    {
      name: "Book Haven",
      description: "A paradise for book lovers.",
      about: "Wide range of books and a cozy reading corner.",
      categories: [categories.documents[4]?.name],
      services: ["Reading Room", "Book Sales"],
      isVerified: false,
      rating: 4.0,
      reviewCount: 0,
      addressLine1: "12 Library Lane",
      addressLine2: "",
      city: "Ibadan",
      state: "Oyo",
      country: "Nigeria",
      postalCode: "200001",
      coordinates: JSON.stringify({ latitude: 7.3775, longitude: 3.947 }),
      phone: "+2348098765432",
      email: "hello@bookhaven.com",
      website: "https://bookhaven.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: users.documents[3]?.$id,
    },
    {
      name: "Glamour Salon",
      description: "Beauty and grooming for all.",
      about: "Professional stylists and relaxing atmosphere.",
      categories: [categories.documents[1]?.name],
      services: ["Haircut", "Styling", "Spa"],
      isVerified: true,
      rating: 4.6,
      reviewCount: 2,
      addressLine1: "77 Style Blvd",
      addressLine2: "",
      city: "Enugu",
      state: "Enugu",
      country: "Nigeria",
      postalCode: "400001",
      coordinates: JSON.stringify({ latitude: 6.5244, longitude: 7.5086 }),
      phone: "+2348033344556",
      email: "contact@glamoursalon.com",
      website: "https://glamoursalon.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: users.documents[4]?.$id,
    },
  ];
  for (const biz of demoBusinesses) {
    if (!biz.ownerId || !biz.categories[0]) continue;
    const existing = await databases.listDocuments(
      DATABASE_ID,
      BUSINESSES_COLLECTION_ID,
      [Query.equal("name", biz.name)],
    );
    if (existing.total > 0) {
      console.log(`Business '${biz.name}' already exists.`);
      continue;
    }
    await databases.createDocument(
      DATABASE_ID,
      BUSINESSES_COLLECTION_ID,
      ID.unique(),
      biz,
    );
    console.log(`Business '${biz.name}' created.`);
  }
}

async function seedBusinessHours() {
  const businesses = await databases.listDocuments(
    DATABASE_ID,
    BUSINESSES_COLLECTION_ID,
    [Query.limit(5)],
  );
  if (businesses.total === 0) {
    console.log("Cannot seed business hours: need at least one business.");
    return;
  }
  const days = [
    { day: "Mon", openTime: "9:00 AM", closeTime: "6:00 PM", isClosed: false },
    { day: "Tue", openTime: "9:00 AM", closeTime: "6:00 PM", isClosed: false },
    { day: "Wed", openTime: "9:00 AM", closeTime: "6:00 PM", isClosed: false },
    { day: "Thu", openTime: "9:00 AM", closeTime: "6:00 PM", isClosed: false },
    { day: "Fri", openTime: "9:00 AM", closeTime: "6:00 PM", isClosed: false },
    { day: "Sat", openTime: "10:00 AM", closeTime: "4:00 PM", isClosed: false },
    { day: "Sun", openTime: "Closed", closeTime: "Closed", isClosed: true },
  ];
  for (const business of businesses.documents) {
    for (const d of days) {
      const existing = await databases.listDocuments(
        DATABASE_ID,
        BUSINESS_HOURS_COLLECTION_ID,
        [Query.equal("businessId", business.$id), Query.equal("day", d.day)],
      );
      if (existing.total > 0) {
        continue;
      }
      await databases.createDocument(
        DATABASE_ID,
        BUSINESS_HOURS_COLLECTION_ID,
        ID.unique(),
        {
          businessId: business.$id,
          ...d,
        },
      );
    }
    console.log(`Business hours for '${business.name}' created.`);
  }
}

async function seedBusinessImages() {
  const businesses = await databases.listDocuments(
    DATABASE_ID,
    BUSINESSES_COLLECTION_ID,
    [Query.limit(5)],
  );
  const users = await databases.listDocuments(
    DATABASE_ID,
    USERS_COLLECTION_ID,
    [Query.limit(5)],
  );
  if (businesses.total === 0 || users.total === 0) {
    console.log(
      "Cannot seed business images: need at least one business and one user.",
    );
    return;
  }
  const demoImages = [
    {
      title: "Front View",
      imageUrl: "https://placehold.co/400x300/business1",
      isPrimary: true,
    },
    {
      title: "Interior",
      imageUrl: "https://placehold.co/400x300/business2",
      isPrimary: false,
    },
    {
      title: "Menu Board",
      imageUrl: "https://placehold.co/400x300/business3",
      isPrimary: false,
    },
  ];
  for (let i = 0; i < businesses.documents.length; i++) {
    const business = businesses.documents[i];
    const uploadedBy = users.documents[i % users.documents.length].$id;
    for (const img of demoImages) {
      const existing = await databases.listDocuments(
        DATABASE_ID,
        BUSINESS_IMAGES_COLLECTION_ID,
        [
          Query.equal("businessId", business.$id),
          Query.equal("title", img.title),
        ],
      );
      if (existing.total > 0) {
        continue;
      }
      await databases.createDocument(
        DATABASE_ID,
        BUSINESS_IMAGES_COLLECTION_ID,
        ID.unique(),
        {
          businessId: business.$id,
          imageUrl: img.imageUrl,
          title: img.title,
          isPrimary: img.isPrimary,
          uploadedBy,
          createdAt: new Date().toISOString(),
        },
      );
    }
    console.log(`Business images for '${business.name}' created.`);
  }
}

async function seedConversations() {
  const users = await databases.listDocuments(
    DATABASE_ID,
    USERS_COLLECTION_ID,
    [Query.limit(5)],
  );
  if (users.total < 2) {
    console.log("Cannot seed conversations: need at least two users.");
    return;
  }
  // Create all unique pairs
  for (let i = 0; i < users.documents.length; i++) {
    for (let j = i + 1; j < users.documents.length; j++) {
      const participants = [users.documents[i].$id, users.documents[j].$id];
      // Check for existing conversation with same participants
      const existing = await databases.listDocuments(
        DATABASE_ID,
        CONVERSATIONS_COLLECTION_ID,
      );
      let found = false;
      for (const doc of existing.documents) {
        if (
          Array.isArray(doc.participants) &&
          doc.participants.length === participants.length &&
          doc.participants.every(
            (id: string, idx: number) => id === participants[idx],
          )
        ) {
          found = true;
          break;
        }
      }
      if (found) continue;
      await databases.createDocument(
        DATABASE_ID,
        CONVERSATIONS_COLLECTION_ID,
        ID.unique(),
        {
          participants,
          lastMessageId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      );
    }
  }
  console.log("Conversations created for all user pairs.");
}

async function seedMessages() {
  const conversations = await databases.listDocuments(
    DATABASE_ID,
    CONVERSATIONS_COLLECTION_ID,
    [Query.limit(10)],
  );
  const users = await databases.listDocuments(
    DATABASE_ID,
    USERS_COLLECTION_ID,
    [Query.limit(5)],
  );
  if (conversations.total === 0 || users.total === 0) {
    console.log(
      "Cannot seed messages: need at least one conversation and one user.",
    );
    return;
  }
  const demoMessages = [
    "Hello, is this place open today?",
    "What are your opening hours?",
    "Do you offer delivery?",
    "Can I book an appointment?",
    "Is there parking available?",
  ];
  for (const conv of conversations.documents) {
    for (let i = 0; i < demoMessages.length; i++) {
      const senderId = users.documents[i % users.documents.length].$id;
      const text = demoMessages[i];
      const existing = await databases.listDocuments(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        [
          Query.equal("conversationId", conv.$id),
          Query.equal("senderId", senderId),
          Query.equal("text", text),
        ],
      );
      if (existing.total > 0) continue;
      await databases.createDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        ID.unique(),
        {
          conversationId: conv.$id,
          senderId,
          text,
          imageUrl: "",
          imageName: "",
          imageSize: "",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      );
    }
  }
  console.log("Messages seeded for all conversations.");
}

async function seedReviews() {
  const businesses = await databases.listDocuments(
    DATABASE_ID,
    BUSINESSES_COLLECTION_ID,
    [Query.limit(5)], // Ensure we have businesses to link reviews to
  );
  const users = await databases.listDocuments(
    DATABASE_ID,
    USERS_COLLECTION_ID,
    [Query.limit(5)], // Ensure we have users to write reviews
  );

  if (businesses.total === 0 || users.total === 0) {
    console.log(
      "Cannot seed reviews: need at least one business and one user.",
    );
    return;
  }

  const allBusinesses = businesses.documents;
  const allUsers = users.documents;

  // More diverse demo reviews, linked to specific business/user indices
  const demoReviewsData = [
    // Reviews for Business 0 (Demo Pizza Place)
    {
      businessIndex: 0,
      userIndex: 1, // Bob
      rating: 5,
      title: "Best Pizza Ever!",
      text: "Absolutely fantastic pizza, great crust and fresh toppings. The service was quick and friendly too. Will definitely be back!",
      recommendation: "Try the Margherita.",
      likes: 15,
      dislikes: 1,
    },
    {
      businessIndex: 0,
      userIndex: 2, // Charlie
      rating: 4,
      title: "Solid Pizza Joint",
      text: "Good pizza, decent prices. A reliable spot for a casual meal.",
      recommendation: null,
      likes: 8,
      dislikes: 0,
    },
    // Reviews for Business 1 (Sunrise Bakery)
    {
      businessIndex: 1,
      userIndex: 0, // Alice
      rating: 4,
      title: "Lovely Bakery",
      text: "The croissants were flaky and delicious. A bit pricey, but worth it for the quality.",
      recommendation: "Get there early for the best selection.",
      likes: 12,
      dislikes: 2,
    },
    // Reviews for Business 2 (FitLife Gym)
    {
      businessIndex: 2,
      userIndex: 3, // Diana
      rating: 5,
      title: "Excellent Gym Facilities",
      text: "Clean, modern equipment and helpful staff. The classes are great too!",
      recommendation: "Try the morning yoga class.",
      likes: 25,
      dislikes: 0,
    },
    {
      businessIndex: 2,
      userIndex: 4, // Ethan
      rating: 4,
      title: "Good Workout Spot",
      text: "Gets a bit busy during peak hours, but overall a solid gym with everything you need.",
      recommendation: null,
      likes: 5,
      dislikes: 1,
    },
    {
      businessIndex: 2,
      userIndex: 0, // Alice
      rating: 3,
      title: "Decent, but Crowded",
      text: "The equipment is good, but it's often hard to get on the machines I want in the evening. Wish they had more space.",
      recommendation: "Avoid peak times if possible.",
      likes: 2,
      dislikes: 3,
    },
    // Reviews for Business 4 (Glamour Salon)
    {
      businessIndex: 4,
      userIndex: 1, // Bob
      rating: 5,
      title: "Fantastic Haircut!",
      text: "Got a great haircut here. The stylist listened to what I wanted and did an amazing job. Very professional.",
      recommendation: "Ask for Sarah.",
      likes: 18,
      dislikes: 0,
    },
    {
      businessIndex: 4,
      userIndex: 3, // Diana
      rating: 4,
      title: "Nice Salon Experience",
      text: "Relaxing atmosphere and friendly staff. Happy with my styling.",
      recommendation: null,
      likes: 9,
      dislikes: 1,
    },
  ];

  let createdCount = 0;
  for (const reviewData of demoReviewsData) {
    // Ensure indices are valid
    if (
      reviewData.businessIndex >= allBusinesses.length ||
      reviewData.userIndex >= allUsers.length
    ) {
      console.warn(
        `Skipping review due to invalid index: Business ${reviewData.businessIndex}, User ${reviewData.userIndex}`,
      );
      continue;
    }

    const business = allBusinesses[reviewData.businessIndex];
    const user = allUsers[reviewData.userIndex];

    // Check if this specific user already reviewed this specific business
    const existing = await databases.listDocuments(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      [
        Query.equal("businessId", business.$id),
        Query.equal("userId", user.$id),
      ],
    );

    if (existing.total > 0) {
      // console.log(`Review by ${user.fullName} for ${business.name} already exists.`);
      continue; // Skip if already exists
    }

    // Create the review document
    try {
      await databases.createDocument(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        ID.unique(),
        {
          businessId: business.$id,
          userId: user.$id,
          rating: reviewData.rating,
          title: reviewData.title,
          text: reviewData.text,
          recommendation: reviewData.recommendation,
          createdAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Random date within last 30 days
          ).toISOString(),
          updatedAt: new Date().toISOString(),
          likes: reviewData.likes,
          dislikes: reviewData.dislikes,
        },
      );
      createdCount++;
    } catch (error) {
      console.error(
        `Failed to create review for ${business.name} by ${user.fullName}:`,
        error,
      );
    }
  }
  console.log(`${createdCount} new reviews seeded.`);
}

async function seedReviewReactions() {
  const reviews = await databases.listDocuments(
    DATABASE_ID,
    REVIEWS_COLLECTION_ID,
    [Query.limit(10)],
  );
  const users = await databases.listDocuments(
    DATABASE_ID,
    USERS_COLLECTION_ID,
    [Query.limit(5)],
  );
  if (reviews.total === 0 || users.total === 0) {
    console.log(
      "Cannot seed review reactions: need at least one review and one user.",
    );
    return;
  }
  const types = ["like", "dislike"];
  for (let i = 0; i < reviews.documents.length; i++) {
    const review = reviews.documents[i];
    for (let j = 0; j < users.documents.length; j++) {
      const user = users.documents[j];
      const type = types[(i + j) % types.length];
      const existing = await databases.listDocuments(
        DATABASE_ID,
        REVIEW_REACTIONS_COLLECTION_ID,
        [Query.equal("reviewId", review.$id), Query.equal("userId", user.$id)],
      );
      if (existing.total > 0) continue;
      await databases.createDocument(
        DATABASE_ID,
        REVIEW_REACTIONS_COLLECTION_ID,
        ID.unique(),
        {
          reviewId: review.$id,
          userId: user.$id,
          type,
          createdAt: new Date().toISOString(),
        },
      );
    }
  }
  console.log("Review reactions seeded for all reviews and users.");
}

async function main() {
  await seedCategories();
  // await seedUsers();
  // await seedBusinesses();
  // await seedBusinessHours();
  // await seedBusinessImages();
  // await seedConversations();
  // await seedMessages();
  // await seedReviews();
  // await seedReviewReactions();
  console.log("Demo data seeding complete.");
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
