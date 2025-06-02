# Data Steward UI

An AI-powered data review and management platform built with Next.js. This application enables data stewards to review extracted and transformed data, provide feedback to improve AI accuracy, and manage the approval process for data records.

## Key Features

- **Data Record Management**: Filter, search, and manage data records with an intuitive UI
- **Source vs. Transformed Data Comparison**: Side-by-side view of original and AI-transformed data
- **Review & Approval Workflow**: Multi-level approval process with audit trails
- **AI Feedback Collection**: Provide feedback to improve AI accuracy
- **Export Functionality**: Export data in various formats
- **Responsive Design**: Works on all device sizes

## Tech Stack

- **Framework**: Next.js with TypeScript
- **UI Components**: Material UI and TailwindCSS
- **State Management**: React Context API and Zustand
- **Data Fetching**: React Query
- **Charts**: Chart.js with React-Chartjs-2
- **Form Handling**: React Hook Form

## Getting Started

### Prerequisites

- Node.js 14.x or later
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Authentication

For demo purposes, you can use any of these credentials:

- **Admin**: admin@example.com / password
- **Data Steward**: steward@example.com / password
- **Dynpro Team**: dynpro@example.com / password
- **Viewer**: viewer@example.com / password

## Project Structure

```
/src
  /components            # Reusable UI components
    /common              # Generic UI components
    /layout              # Layout components
    /modules             # Feature-specific components
  /context               # React context providers
  /hooks                 # Custom React hooks
  /mock-data             # Mock data for development
  /pages                 # Application pages/routes
  /services              # API services
  /styles                # Global styles
  /types                 # TypeScript type definitions
  /utils                 # Utility functions
```

## Business Requirements

- **BR-016**: Data Review & Correction UI
  - Custom responsive UI with AI tools
  - Review extracted and transformed data
  - Feedback collection
  - Side-by-side comparison

- **BR-017**: AI Feedback and Suggestions
  - Provide feedback to improve AI accuracy
  - Display AI suggestions for data corrections

- **BR-018**: AI Model Training and Performance Tracking
  - Retrain AI models based on user corrections
  - Track AI performance improvements

- **BR-019**: Multi-level Approval Process
  - Route data through approval process
  - Approve/reject functionality
  - Approval audit trails

## License

This project is licensed under the MIT License

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Material UI](https://mui.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [React Query](https://react-query.tanstack.com/)
- [Chart.js](https://www.chartjs.org/)
