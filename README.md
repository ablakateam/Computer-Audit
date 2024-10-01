# IT Audit Application

## Overview

IT Audit is a comprehensive web application designed to manage and track IT assets, including computers and network devices, within an organization. It provides a user-friendly interface for adding, viewing, and managing IT resources, as well as maintaining an audit trail through a comment system.

<img width="655" alt="Screenshot 2024-10-01 112421" src="https://github.com/user-attachments/assets/d2a54b2d-c673-4ea9-a366-e2feb2cbe207">
<img width="651" alt="Screenshot 2024-10-01 112408" src="https://github.com/user-attachments/assets/e0c3ccc3-0432-4059-966d-e2c65725e795">
<img width="648" alt="Screenshot 2024-10-01 112342" src="https://github.com/user-attachments/assets/1dfa9b48-08b0-4a3a-a4f6-bbb596e4aeef">
<img width="647" alt="Screenshot 2024-10-01 112328" src="https://github.com/user-attachments/assets/1e17aee3-0bdd-4376-ac61-573c0a620b01">
<img width="643" alt="Screenshot 2024-10-01 112023" src="https://github.com/user-attachments/assets/8f7eda03-b399-4c7d-84c5-d6329a32ebc8">
<img width="653" alt="Screenshot 2024-10-01 112011" src="https://github.com/user-attachments/assets/cc2c2b4e-f599-4727-8838-e66a7493be19">
<img width="656" alt="Screenshot 2024-10-01 111957" src="https://github.com/user-attachments/assets/1e6e2e5a-c1c1-41ae-a4db-9fb6a6247631">
<img width="617" alt="Screenshot 2024-10-01 111941" src="https://github.com/user-attachments/assets/727d4811-c400-4fc2-b660-0cad7e96464f">

## Features

- **User Authentication**: Secure login system with role-based access control.
- **Asset Management**: 
  - Add and manage computers with detailed specifications.
  - Add and manage network devices with relevant network information.
- **User Management**: Add and manage users associated with IT assets.
- **Comment System**: Add and view comments for both computers and network devices, enabling better tracking and communication.
- **Dashboard**: View latest computers and network devices with recent comments.
- **Dark Mode**: Toggle between light and dark themes for better user experience.
- **Admin Panel**: Manage site content and authenticated users.

## Technology Stack

- **Frontend**: Next.js with React and TypeScript
- **Backend**: Next.js API routes
- **Database**: SQLite
- **Styling**: Tailwind CSS
- **State Management**: React Context API

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/it-audit.git
   ```

2. Install dependencies:
   ```
   cd it-audit
   npm install
   ```

3. Set up the database:
   The application uses SQLite, which will be automatically set up when you run the application for the first time.

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application. Demo password: 2024

## Deployment

This application can be easily deployed to platforms like Vercel or Netlify. Make sure to set up your environment variables properly for production use.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- This project was developed by [Ablaka Team].
- Special thanks to Eboxlab for their support and contributions.
