# Pathshala Online Learning Portal

Pathshala is an online learning portal. This repository contains the frontend and backend codebase for the application.

## Project Structure

- `frontend/`: Contains the frontend application code (HTML, CSS, Vanilla JS).
- `pathshala-backend/`: Enterprise Backend API (Node.js, Express, MongoDB).
- `docker-compose.yml`: Docker Compose configuration for running both frontend and backend locally.

## Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

## Getting Started

1. Clone the repository.
2. Ensure you have Docker installed and running.
3. Start the application using Docker Compose:

   ```bash
   docker-compose up --build
   ```

4. Access the frontend at [http://localhost:8081](http://localhost:8081).
5. The backend API will be available at [http://localhost:5000](http://localhost:5000).

## Backend Development

To run the backend locally without Docker:

1. Navigate to the `pathshala-backend` directory:
   ```bash
   cd pathshala-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file based on the environment variables required.
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Run tests:
   ```bash
   npm test
   ```

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT for authentication
- **Containerization**: Docker, Docker Compose
