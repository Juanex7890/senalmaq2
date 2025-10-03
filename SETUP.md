# 🚀 Quick Setup Guide

## **Step 1: Install Dependencies**
```bash
npm install
```

## **Step 2: Create Environment File**
Create a `.env.local` file in your project root with your Firebase credentials:

```env
# Firebase Web SDK (get these from Firebase Console > Project Settings > General)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (get these from Firebase Console > Project Settings > Service Accounts)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Revalidation (any random string)
REVALIDATE_TOKEN=your_secure_random_token_here
```

## **Step 3: Get Firebase Credentials**

### Web SDK Credentials:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Go to **General** tab
5. Scroll down to **Your apps** section
6. Copy the config values

### Admin SDK Credentials:
1. In Firebase Console, go to **Project Settings**
2. Go to **Service Accounts** tab
3. Click **Generate new private key**
4. Download the JSON file
5. Copy the values from the JSON file

## **Step 4: Apply Security Rules**

### Firestore Rules:
1. Go to **Firestore Database** → **Rules** tab
2. Replace the existing rules with the content from `firestore.rules`

### Storage Rules (optional):
1. Go to **Storage** → **Rules** tab
2. Replace the existing rules with the content from `storage.rules`

## **Step 5: Set Up Indexes**
1. Go to **Firestore Database** → **Indexes** tab
2. Click **Import** and upload the `firestore.indexes.json` file

## **Step 6: Run the Application**
```bash
npm run dev
```

## **Step 7: Set Up Admin User (Optional)**
If you want to use the admin panel:
```bash
npm run setup-admin your-email@example.com
```

## **Troubleshooting**

### If you get "Could not load the default credentials" error:
- Make sure your `.env.local` file is in the project root
- Check that all environment variables are correctly set
- Make sure there are no extra spaces or quotes in your values

### If you get "Event handlers cannot be passed to Client Component props" error:
- This should be fixed with the server components I created
- Make sure you're using `ProductCardServer` in server components

### If the app loads but shows no data:
- Check that your Firebase project has data in the `categories` and `products` collections
- Run the migration script: `npm run migrate`

## **Your Database Structure**

The app expects this structure in Firestore:

### Categories Collection:
```json
{
  "name": "Máquinas de Coser",
  "slug": "maquinas-de-coser",
  "description": "Description here",
  "heroImagePath": "https://example.com/image.jpg",
  "position": 1,
  "active": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Products Collection:
```json
{
  "name": "Product Name",
  "slug": "product-name",
  "description": "Product description",
  "price": 299.99,
  "compareAtPrice": 349.99,
  "brand": "Brand Name",
  "sku": "SKU123",
  "categoryId": "category_doc_id",
  "imagePaths": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "specs": [{"key": "Spec", "value": "Value"}],
  "active": true,
  "isBestseller": true,
  "isFeatured": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "search": "search tokens here"
}
```

## **Need Help?**
If you're still having issues, check:
1. Your Firebase project is set up correctly
2. Authentication is enabled
3. Firestore is enabled
4. Your environment variables are correct
5. The security rules are applied

The app should now work with your existing database structure! 🎉
