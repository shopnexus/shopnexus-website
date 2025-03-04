# ShopNexus Client

A modern e-commerce web application built with React, TypeScript, and Vite, specializing in footwear retail.

## 🚀 Features

- **User Authentication**
  - Email/Password login and registration
  - Google OAuth integration
  - Protected routes
  - User dashboard

- **Product Management**
  - Featured products showcase
  - Category-based browsing (Men, Women, Kids, Sport)
  - Detailed product views
  - Interactive product cards with hover effects

- **Shopping Cart**
  - Add/Remove items
  - Quantity adjustments
  - Real-time price calculations
  - Tax computation
  - Order summary

- **UI/UX Features**
  - Animated text effects using SplitText
  - macOS-style dock navigation
  - Responsive design
  - Newsletter subscription
  - Loading animations
  - Interactive hover effects

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.3
- **Language**: TypeScript 5.6
- **Build Tool**: Vite 6.0
- **Styling**: Tailwind CSS 4.0
- **Authentication**: Firebase 11.2
- **Animations**: 
  - Framer Motion 11.18
  - React Spring 9.7
- **Routing**: React Router DOM 7.2
- **Icons**: React Icons 5.5, Lucide React

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/shopnexus-client.git
cd shopnexus-client
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a Firebase project
   - Copy your Firebase configuration
   - Update the configuration in:
```typescript:src/app/firebase.ts
startLine: 4
endLine: 12
```

4. Start the development server:
```bash
npm run dev
```

## 🏗️ Project Structure

```
src/
├── app/                  # Main application components
│   ├── Home/            # Home page
│   ├── Product/         # Product-related components
│   ├── Cart/            # Shopping cart
│   └── Login_Register/  # Authentication pages
├── blocks/              # Reusable UI blocks
│   ├── Components/      # Complex components
│   └── TextAnimations/  # Animation components
├── components/          # Shared components
│   └── ui/             # Base UI components
└── utils/              # Utility functions
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🎨 UI Components

The application includes several custom UI components:

- **SplitText**: Text animation component with configurable effects
- **Dock**: macOS-style navigation dock with hover animations
- **TiltedCard**: Interactive card component with 3D effects
- **Button**: Customizable button with variants (primary, secondary, outline)
- **Input**: Form input component with validation support
- **Card**: Flexible card layout component with header and body sections

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1024px and above)
- Tablet (768px to 1023px)
- Mobile (320px to 767px)

## 🔐 Authentication Flow

1. Users can register using email/password or Google OAuth
2. Login with existing credentials
3. Protected routes require authentication
4. User session management
5. Secure logout functionality

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚠️ Prerequisites

- Node.js >= 18
- npm >= 9

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- UI Components from [reactbits.dev](https://reactbits.dev)
- Icons from React Icons and Lucide React
- Animation libraries: Framer Motion and React Spring
