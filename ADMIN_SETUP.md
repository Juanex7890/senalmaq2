# Admin Panel Setup

This document explains how to set up and use the admin panel for the Senalmaq e-commerce website.

## Overview

The admin panel has been fully integrated into the Next.js TypeScript application with the following features:

- **Authentication**: Firebase Auth integration with email/password login
- **Product Management**: Full CRUD operations for products
- **Category Management**: Create, edit, and delete product categories
- **Social Media Management**: Manage YouTube videos, Instagram, TikTok links, and YouTube Shorts
- **Real-time Updates**: All changes sync with Firestore in real-time

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   └── page.tsx                 # Admin page route
│   └── login/
│       └── page.tsx                 # Login page route
├── components/
│   ├── admin/
│   │   ├── admin-link.tsx           # Admin link component (shows when logged in)
│   │   ├── admin-panel-complete.tsx # Main admin panel component
│   │   └── social-section.tsx       # Social media management section
└── lib/
    └── firebase.ts                  # Firebase configuration and utilities
```

## Setup Instructions

### 1. Firebase Configuration

The Firebase configuration is already set up in `src/lib/firebase.ts` with the following collections:
- `products` - Product data
- `categories` - Product categories
- `settings/social` - Social media links and YouTube Shorts

### 2. Authentication

The admin panel uses Firebase Authentication. To access the admin panel:

1. Navigate to `/login`
2. Use your Firebase Auth credentials
3. After successful login, you'll be redirected to `/admin`

### 3. Admin Panel Features

#### Social Media Management
- **Video Principal**: Set the main YouTube video ID
- **Canal de YouTube**: YouTube channel URL
- **Instagram**: Instagram profile URL
- **TikTok**: TikTok profile URL
- **YouTube Shorts**: Manage a list of YouTube Short IDs

#### Category Management
- Create new categories with custom icons
- Edit existing categories
- Delete categories
- Categories are used to organize products

#### Product Management
- Add new products with images, descriptions, and pricing
- Edit existing products
- Mark products as "best sellers"
- Manage product images via URLs
- Set product categories

## Usage

### Accessing the Admin Panel

1. **From the main website**: Look for the "Admin Panel" button in the header (only visible when logged in)
2. **Direct URL**: Navigate to `/admin`
3. **Login required**: If not logged in, you'll be redirected to `/login`

### Managing Content

1. **Social Media**: Update the social media links and YouTube content
2. **Categories**: Create and manage product categories
3. **Products**: Add, edit, or remove products from the catalog

### Real-time Updates

All changes are automatically saved to Firestore and will be reflected on the main website immediately.

## Security

- Admin panel is protected by Firebase Authentication
- Only authenticated users can access admin functionality
- All admin routes redirect to login if not authenticated

## Dependencies

The admin panel uses the following key dependencies:
- `firebase` - Firebase SDK
- `react-firebase-hooks` - React hooks for Firebase
- `next` - Next.js framework
- `typescript` - TypeScript support

## Troubleshooting

### Common Issues

1. **Login not working**: Check Firebase Auth configuration
2. **Data not saving**: Verify Firestore rules and permissions
3. **Images not loading**: Ensure image URLs are valid and accessible

### Firebase Rules

Make sure your Firestore rules allow authenticated users to read/write to the collections:
- `products`
- `categories` 
- `settings/social`

## Development

To extend the admin panel:

1. Add new components in `src/components/admin/`
2. Update the main admin panel in `src/components/admin/admin-panel-complete.tsx`
3. Add new Firebase functions in `src/lib/firebase.ts`
4. Create new pages in `src/app/admin/` for additional admin features
