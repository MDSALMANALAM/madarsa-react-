# Madrsa Imdadul Uloom Madarsa Management System

A complete web application for managing Islamic educational institution with modern features.

## Features

- **Student Management**: Admission forms, student records
- **Course Management**: Classes 1-10, Islamic studies
- **Digital Library**: PDF materials, study resources
- **Donation System**: Online payments, bank transfers
- **Finance Management**: Income/expense tracking
- **User Authentication**: Login/signup for different roles

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB / MySQL
- **File Upload**: Multer
- **Authentication**: JWT

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB / MySQL
- npm or yarn

### Setup Instructions

1. **Extract the zip file**
2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npm run dev