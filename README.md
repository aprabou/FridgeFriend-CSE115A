# 🌟 Fridge Friend

A smart food waste reduction app that helps you track your food inventory, get expiration notifications, and discover recipes based on what you have.

## 🚀 Features

- 📝 Track food items with expiration dates
- ⏰ Get notifications for items about to expire
- 👨‍👩‍👧‍👦 Share inventory with household members
- 🥘 Get recipe suggestions based on available ingredients
- 💡 Receive food storage tips
- 📊 View inventory analytics and storage distribution

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Supabase (Authentication, Database, Real-time updates)
- **Deployment**: Netlify

## 🏁 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Supabase account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/fridge-friend.git
   cd fridge-friend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📦 Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React context providers
├── lib/           # Utility functions and configurations
├── pages/         # Application pages/routes
└── types/         # TypeScript type definitions
```

## 🔑 Authentication

The app uses Supabase Authentication with email/password login. Demo credentials:

- Email: demo@example.com
- Password: password123

## 🗄️ Database Schema

### Tables

- `profiles`: User profiles
- `households`: Household groups
- `food_items`: Food inventory items
- `storage_tips`: Food storage recommendations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
- [Lucide](https://lucide.dev/) for the beautiful icons
