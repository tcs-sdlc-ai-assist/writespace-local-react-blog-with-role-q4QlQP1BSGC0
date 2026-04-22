# WriteSpace

A modern, distraction-free writing application built with React and Vite.

## Tech Stack

- **React 18** — UI library
- **Vite** — Build tool and dev server
- **Tailwind CSS** — Utility-first CSS framework
- **React Router** — Client-side routing
- **JavaScript (JSX)** — Language

## Features

- Clean, distraction-free writing environment
- Real-time word and character count
- Auto-save functionality with local storage persistence
- Multiple document support with easy navigation
- Responsive design for desktop and mobile
- Dark mode support
- Markdown formatting support
- Export documents as plain text

## Folder Structure

```
writespace/
├── public/                  # Static assets
├── src/
│   ├── assets/              # Images, fonts, and other assets
│   ├── components/          # Reusable UI components
│   ├── context/             # React context providers
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page/route components
│   ├── services/            # API and storage services
│   ├── utils/               # Utility functions
│   ├── App.jsx              # Root component with routing
│   ├── index.css            # Global styles and Tailwind directives
│   └── main.jsx             # Application entry point
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
└── README.md                # Project documentation
```

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x

### Installation

```bash
npm install
```

### Development

Start the development server with hot module replacement:

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

### Build

Create an optimized production build:

```bash
npm run build
```

The output will be in the `dist/` directory.

### Preview

Preview the production build locally:

```bash
npm run preview
```

### Linting

Run ESLint to check for code quality issues:

```bash
npm run lint
```

## Deployment

### Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com](https://vercel.com) and sign in.
3. Click **"Add New Project"** and import your repository.
4. Vercel will auto-detect the Vite framework. Confirm the following settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Click **"Deploy"**.

For subsequent deployments, every push to the main branch will trigger an automatic deployment.

#### Environment Variables

If your app uses environment variables, add them in the Vercel dashboard under **Settings → Environment Variables**. All client-side variables must be prefixed with `VITE_`.

## License

Private — All rights reserved.