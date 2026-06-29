# WanderLog Frontend

A travel blog page that allows users to post about their travels and engage with fellow travellers. 

## Features

- Create travel posts
- Search and filter travel posts 
- Comment and like others posts

## Getting Started

### Prerequisites

Before running the application, ensure you have:

- Node.js (v18 or later recommended)
- npm

### Installation

Clone the repository:

```bash
git clone <repository-url>
```

Navigate to the project directory:

```bash
cd wanderlog-frontend
```

Install dependencies:

```bash
npm install
```

### Configure the API

Create a file named `.env` in the project root.

Add the following if you do not want to set up the local backend:

```env
VITE_API_URL=https://seng365.csse.canterbury.ac.nz/api/v1
```

If you have the local server running instead add this:
```env
VITE_API_BASE_URL=http://localhost:4941/api/v1
```


### Running the Development Server

Start the application:

```bash
npm run dev
```

The application will be available at the address shown in your terminal (typically `http://localhost:5173`).


## Authors

Developed by Caitlin Alexander as part of a software engineering project.
