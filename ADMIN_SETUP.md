# Admin Panel Setup Guide

## Quick Start

### 1. Start the Backend

```bash
cd ../nova-habitation-backend
npm run start:dev
```

The backend will run on `http://localhost:3000`

### 2. Seed Initial Admin User

In a new terminal:
```bash
cd ../nova-habitation-backend
npm run seed
```

This creates an admin user:
- **Username:** admin
- **Password:** admin123

### 3. Start the Frontend

In another terminal:
```bash
cd nova-habitation-piscine
npm run start
```

The frontend will run on `http://localhost:4200`

### 4. Access Admin Panel

1. Click the **Admin** link in the navbar (bottom-right of navigation menu)
2. Or navigate directly to: `http://localhost:4200/admin/login`
3. Login with:
   - Username: `admin`
   - Password: `admin123`

## Admin Panel Features

### Dashboard Overview
- View all realisations in one place
- Organize by categories: Piscines, Rénovations de bâtiments, Peinture et finitions
- Each realisation shows associated photos

### Managing Realisations

#### Add New Realisation
1. Click **+ Ajouter une nouvelle réalisation**
2. Fill in:
   - **Titre** (Title)
   - **Description** (Detailed description)
   - **Catégorie** (Category)
3. Click **Enregistrer** (Save)

#### Edit Realisation
1. Click **Modifier** on any realisation card
2. Update the fields
3. Click **Enregistrer**

#### Delete Realisation
1. Click **Supprimer** on any realisation card
2. Confirm deletion

### Managing Photos

#### Upload Photos
1. Find the realisation you want to add photos to
2. In the "Photos" section, click **📤 Ajouter une photo**
3. Select an image file from your computer
4. The photo will upload and appear in the grid

#### Delete Photos
1. Hover over any photo in the grid
2. Click the **✕** button in the top-right corner
3. Confirm deletion

## Security Notes

- **Change default password:** After first login, update the admin password in the database (hash with bcryptjs)
- **Environment variables:** Store JWT_SECRET in the backend `.env` file
- **Token storage:** Tokens are stored in browser localStorage (valid for 7 days)
- **CORS:** Backend accepts requests from `http://localhost:4200`

## API Integration

The admin panel connects to these backend endpoints:

**Authentication:**
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Create new admin

**Realisations:**
- `GET /api/realisations` - List all
- `POST /api/realisations` - Create (protected)
- `PUT /api/realisations/:id` - Update (protected)
- `DELETE /api/realisations/:id` - Delete (protected)

**Photos:**
- `POST /api/realisations/:id/photos` - Upload (protected)
- `GET /api/realisations/:id/photos` - List
- `DELETE /api/photo/:photoId` - Delete (protected)

## Troubleshooting

### Backend connection refused
- Ensure NestJS backend is running on port 3000
- Check `.env` file has correct database credentials

### Photos not displaying
- Verify photos are uploading (check network tab)
- Ensure `/uploads` directory exists on backend
- Check file permissions on uploads folder

### Login fails
- Verify database has admin user (run `npm run seed`)
- Check JWT_SECRET is set in backend `.env`
- Clear browser localStorage if token is corrupted

## Database Models

### Admin
```typescript
id: number (PK)
username: string (unique)
password: string (hashed)
email: string (optional)
createdAt: timestamp
```

### Realisation
```typescript
id: number (PK)
title: string
description: text
category: enum (Piscines | Rénovations | Peinture)
createdAt: timestamp
updatedAt: timestamp
photos: Photo[] (relation)
```

### Photo
```typescript
id: number (PK)
filename: string
filepath: string
mimetype: string
size: number
realisationId: number (FK)
uploadedAt: timestamp
```
