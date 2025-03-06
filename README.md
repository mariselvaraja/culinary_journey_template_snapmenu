# Snapmenu Restaurant Website

A modern, responsive restaurant website built with React, Vite, and Tailwind CSS. Features include menu management, table reservations, content management, and an admin dashboard.

## Features

- Dynamic content management system
- Menu management with categories
- Table reservation system
- Admin dashboard
- Blog section with video support
- Mobile-responsive design
- Cart functionality
- Checkout process
- Story/About section
- Newsletter subscription
- Social media integration

## Tech Stack

- React
- Vite
- Tailwind CSS
- Node.js
- Express
- Supabase

## Getting Started

1. Clone the repository:
```bash
git clone [repository-url]
cd snapmenu
```

2. Install dependencies:
```bash
npm install
cd server && npm install
```

3. Start the development server:
```bash
# Start frontend
npm run dev

# Start backend (in a separate terminal)
cd server && node index.js
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

- `/src` - Frontend source code
  - `/components` - React components
  - `/context` - React context providers
  - `/data` - Static data and content
  - `/hooks` - Custom React hooks
  - `/utils` - Utility functions
- `/server` - Backend source code
  - `content-manager.js` - Content management logic
  - `image-manager.js` - Image upload handling
  - `index.js` - Server entry point

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
# culinary_journey_template_snapmenu
