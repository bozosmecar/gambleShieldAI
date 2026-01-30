# GambleShield Supabase Setup

## 📊 Database Schema (3 Tables)

### 1. **users**
Extends Supabase `auth.users`:
- `id` - UUID (references auth.users)
- `username` - Unique username
- `experience` - EXP points (integer)
- `tier` - Auto-calculated from experience (BRONZE/SILVER/GOLD/PLATINUM/DIAMOND)
- `created_at` - Timestamp

**Tier Calculation (Automatic):**
```
BRONZE   → 0-999 EXP
SILVER   → 1000-2999 EXP
GOLD     → 3000-6999 EXP
PLATINUM → 7000-14999 EXP
DIAMOND  → 15000+ EXP
```

### 2. **casinos**
List of available casinos:
- `id` - UUID
- `name` - Casino name
- `logo_url` - Logo image path
- `website_url` - Casino website
- `created_at` - Timestamp

### 3. **user_casino_registrations**
Tracks which casinos users registered at through our affiliate links:
- `id` - UUID
- `user_id` - References users
- `casino_id` - References casinos
- `registered_at` - Timestamp
- `affiliate_code` - Our affiliate tracking code

## 🚀 Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Save your project URL and anon key

### 2. Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### 3. Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Migrations
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste `supabase/migrations/20240101000000_initial_schema.sql`
3. Click "Run"
4. Copy and paste `supabase/migrations/20240101000001_seed_data.sql`
5. Click "Run"

Done! Your database is ready.

## 🔐 Authentication

### Sign Up (Email + Password + Username)
```javascript
import { createClient } from '@/lib/supabase'

const supabase = createClient()

const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    data: {
      username: 'cooluser123'
    }
  }
})
// User profile automatically created via trigger
```

### Sign In
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
})
```

### Get Current User
```javascript
const { data: { user } } = await supabase.auth.getUser()
```

### Sign Out
```javascript
await supabase.auth.signOut()
```

## 📡 API Examples

### Get User Profile
```javascript
const supabase = createClient()

const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()

console.log(user)
// { id, username, experience: 1500, tier: 'SILVER', created_at }
```

### Get User's Registered Casinos
```javascript
const { data: registrations } = await supabase
  .from('user_casino_registrations')
  .select(`
    *,
    casino:casinos (*)
  `)
  .eq('user_id', userId)

console.log(registrations)
// [
//   {
//     id: '...',
//     registered_at: '...',
//     affiliate_code: 'GAMBLESHIELD2024',
//     casino: {
//       name: 'Stake',
//       logo_url: '/logos/stake.png',
//       website_url: 'https://stake.com'
//     }
//   }
// ]
```

### Get All Casinos
```javascript
const { data: casinos } = await supabase
  .from('casinos')
  .select('*')
  .order('name')

console.log(casinos)
// [{ id, name, logo_url, website_url }, ...]
```

### Register User to Casino
```javascript
const { data, error } = await supabase
  .from('user_casino_registrations')
  .insert({
    user_id: userId,
    casino_id: casinoId,
    affiliate_code: 'GAMBLESHIELD2024'
  })
  .select()
  .single()
```

### Add Experience Points
```javascript
// Get current user
const { data: user } = await supabase
  .from('users')
  .select('experience')
  .eq('id', userId)
  .single()

// Add 500 EXP
const { data: updated } = await supabase
  .from('users')
  .update({ 
    experience: user.experience + 500 
  })
  .eq('id', userId)
  .select()
  .single()

console.log(updated.tier) // Tier automatically updated!
```

### Get Leaderboard
```javascript
const { data: leaderboard } = await supabase
  .from('users')
  .select('username, experience, tier')
  .order('experience', { ascending: false })
  .limit(10)

console.log(leaderboard)
// [
//   { username: 'player1', experience: 25000, tier: 'DIAMOND' },
//   { username: 'player2', experience: 12000, tier: 'PLATINUM' },
//   ...
// ]
```

## 🔒 Security (Row Level Security)

All tables have RLS enabled:
- ✅ Everyone can view users, casinos
- ✅ Users can only view their own registrations
- ✅ Users can only update their own profile
- ✅ User profile automatically created on signup

## 📱 Real-time Subscriptions

### Listen for new registrations
```javascript
const channel = supabase
  .channel('registrations')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'user_casino_registrations',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('New casino registered!', payload.new)
    }
  )
  .subscribe()
```

### Listen for tier changes
```javascript
const channel = supabase
  .channel('user-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'users',
      filter: `id=eq.${userId}`
    },
    (payload) => {
      if (payload.new.tier !== payload.old.tier) {
        console.log('Tier up!', payload.new.tier)
      }
    }
  )
  .subscribe()
```

## 🧪 Testing

Test in Supabase Studio:
1. Go to Table Editor
2. View your 3 tables: users, casinos, user_casino_registrations
3. Insert test data
4. Check that tier auto-updates when you change experience

## 📝 Quick Reference

```javascript
// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Get user profile with casinos
const { data } = await supabase
  .from('users')
  .select(`
    *,
    registrations:user_casino_registrations (
      *,
      casino:casinos (*)
    )
  `)
  .eq('id', user.id)
  .single()

console.log(data)
// {
//   username: 'player1',
//   experience: 5000,
//   tier: 'GOLD',
//   registrations: [
//     { casino: { name: 'Stake', ... } },
//     { casino: { name: 'Roobet', ... } }
//   ]
// }
```

That's it! Simple 3-table setup with automatic tier calculation.
