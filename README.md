# 🍔 Smart Food-Court Queue Allocation System

A full-stack web application designed to streamline food-court ordering, manage order queues, and track order status in real time. The system provides separate access for administrators, staff, and students to improve food-order management and reduce waiting time.

## 📌 Overview

Managing food-court orders manually can lead to long queues, order confusion, and delays in food preparation.

The **Smart Food-Court Queue Allocation System** addresses these challenges through a centralized web application. Students can place and track orders, staff can manage food preparation, and administrators can monitor and manage the overall order queue.

The application uses a React.js frontend, a Spring Boot backend, and a MySQL database, with JWT-based authentication and role-based access control.

## 🎯 Objectives

- Reduce waiting time and congestion in food-court queues.
- Simplify food ordering and order tracking.
- Generate and manage unique order tokens.
- Help staff organize food preparation efficiently.
- Provide administrators with centralized order management.
- Secure application access using authentication and role-based permissions.

## ✨ Key Features

- 🛒 **Order Management:** Manage food orders through a centralized system.
- 🎟️ **Token-Based Queue:** Identify and track orders using unique tokens.
- 📋 **Order Status Tracking:** Monitor order progress through different stages.
- 👨‍💼 **Admin Dashboard:** Manage and monitor food-court orders.
- 👨‍🍳 **Staff Order Management:** View orders and update their preparation status.
- 🎓 **Student Ordering:** Allow students to place orders and track their status.
- 🔐 **JWT Authentication:** Secure API access using JSON Web Tokens.
- 🛡️ **Role-Based Access Control:** Restrict features according to ADMIN, STAFF, and STUDENT roles.
- 🗄️ **Database Integration:** Store and manage order information using MySQL.
- 🔄 **REST API Integration:** Connect the React frontend with the Spring Boot backend.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Styling | Tailwind CSS |
| Backend | Java |
| Backend Framework | Spring Boot |
| Database | MySQL |
| Database Name | `foodcourt_db` |
| Authentication | Spring Security, JWT |
| API Architecture | REST APIs |
| Build Tool | Maven |
| Version Control | Git and GitHub |

## 🏗️ System Architecture

The application follows a client-server architecture.

1. **Frontend:** React.js provides the user interface for students, staff, and administrators.
2. **Backend:** Spring Boot processes requests and implements application business logic.
3. **Security:** Spring Security and JWT handle authentication and role-based access.
4. **Database:** MySQL stores order details, user information, tokens, and order statuses.
5. **REST APIs:** Facilitate communication between the frontend and backend.

## 🔄 Application Workflow

```text
              User Login
                  |
                  v
        JWT Authentication
                  |
                  v
        Role-Based Dashboard
                  |
          +-------+-------+
          |       |       |
          v       v       v
        ADMIN   STAFF   STUDENT
          |       |       |
          v       v       v
        Manage  Prepare  Place &
        Orders  Orders   Track Orders
          |       |       |
          +-------+-------+
                  |
                  v
          Spring Boot REST APIs
                  |
                  v
              MySQL DB
```

## 📦 Order Status Lifecycle

Orders progress through the following statuses, depending on the actions performed in the application:

`PLACED` → `PREPARING` → `READY` → `DELIVERED`

An order can also be marked as `CANCELLED` when cancellation is permitted by the application's rules.

## 👥 User Roles

### 1. Administrator (ADMIN)

- Monitor and manage food-court orders.
- Oversee the order queue.
- Access administrative functionality permitted by the application.

### 2. Staff (STAFF)

- View assigned or available orders.
- Update order preparation status.
- Mark orders as ready or delivered according to the workflow.

### 3. Student (STUDENT)

- Place food orders.
- Receive an order token.
- Track order progress.
- View order information available to the student.

## 🗃️ Database

The application uses MySQL with the database name `foodcourt_db`.

The database supports the storage and management of application data, such as:

- User and role information.
- Food-order details.
- Order tokens.
- Order status and tracking information.

The actual tables and relationships depend on the implemented database schema.

## 📁 Project Structure

The following is an illustrative structure. Update it to match your actual repository.

```text
Smart-Food-Court-Queue-Allocation-System/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/FoodCourtSystem/management/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
│
├── .gitignore
└── README.md
```

## ⚙️ Prerequisites

Install the following before running the project:

- Node.js and npm
- Java JDK compatible with the project configuration
- Maven
- MySQL Server
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

Replace the placeholders with your actual GitHub repository URL and project directory name.

### 2. Configure the Database

Start MySQL and create the database:

```sql
CREATE DATABASE foodcourt_db;
```

Configure the database connection in the backend's `application.properties` or `application.yml` file according to your project setup.

Example configuration:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/foodcourt_db
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

Ensure the corresponding environment variables are configured before starting the backend.

### 3. Run the Backend

Navigate to the backend directory:

```bash
cd backend
mvn spring-boot:run
```

### 4. Run the Frontend

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local development URL displayed by the frontend terminal.

> **Note:** These commands assume separate `frontend` and `backend` directories. Adjust the paths and configuration to match your actual project.

## 🖥️ Application Screenshots

Add screenshots of your actual application below to demonstrate its interface and functionality.

### Admin Dashboard

<!-- Upload your admin dashboard screenshot here -->

### Student Order Page

<!-- Upload your student ordering screenshot here -->

### Staff Order Management

<!-- Upload your staff dashboard screenshot here -->

## 🧩 Challenges Faced

- **Duplicate Order Tokens:** Addressed issues involving duplicate token generation to improve order identification.
- **Frontend and Backend Integration:** Worked through integration issues while connecting the React frontend and Spring Boot backend running on different local development ports.
- **Authentication and Access Control:** Integrated JWT authentication and role-based access to protect application functionality.
- **Order Status Management:** Structured order tracking around defined statuses to support the food-preparation workflow.

## 🔮 Future Enhancements

- Live queue updates and notifications.
- Estimated food-preparation and waiting times.
- Online payment integration.
- Food menu and availability management.
- Order history and analytics dashboard.
- Mobile-friendly improvements and accessibility enhancements.

## 🎓 Learning Outcomes

Through this project, I gained practical experience in:

- Full-stack web application development.
- Building REST APIs using Java and Spring Boot.
- Frontend development with React.js and Tailwind CSS.
- Database integration using MySQL.
- Implementing JWT authentication and role-based authorization.
- Integrating frontend and backend services.
- Debugging API integration and order-management issues.

## Application Outcome

Uploading Project_output_clean.mp4…

1.Login page
![Uploading Screenshot 2026-10-15 142359.png…]()

2.User dashboard 
![Uploading Screenshot 2026-10-15 142454.png…]()

3.Staff Dashboard
![Uploading Screenshot 2026-10-15 142539.png…]()

4.Analytics 
<img width="1917" height="1078" alt="Screenshot 2026-10-15 142627" src="https://github.com/user-attachments/assets/5e1847e0-a44c-4ae6-8119-69641b035f88" />

## 👩‍💻 Author

Shanmugapriya S
B.Tech – Artificial Intelligence and Data Science

