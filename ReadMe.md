# 👋 A Note to the Reviewer

First and foremost, **Thank You** for taking the time to review my repository. I sincerely appreciate the effort involved in evaluating my work. 🙏

#### 🚧 Project Scope & Focus

For this submission, I have focused my efforts entirely on the **Backend Architecture**. While I am currently expanding my skills in frontend development, my core strength lies in server-side engineering. I chose to prioritize building a robust, thoroughly tested backend over delivering a full-stack application that might not meet the same quality standards on the client side.

**I would be grateful if you could evaluate my technical proficiency based on:**

-   **Test-Driven Development (TDD):** My commitment to writing reliable code with high test coverage.
    
-   **Clean Architecture:** The organization of Controllers, Services, and Models to ensure scalability.
    
-   **Security & Best Practices:** The implementation of secure authentication and data validation.
    

I hope this repository demonstrates my dedication to writing clean, maintainable, and secure backend code. Thank you again for your consideration! 🚀

**Best Regards,** **Pankaj Kumar**

# Sweet Shop Management System

This is the backend application for managing a sweet shop inventory, user purchases, and administrative operations. This project is built using **Test-Driven Development (TDD)** principles and modern backend best practices.

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Backend Documentation](#backend-documentation)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [API Endpoints](#api-endpoints)
- [Tests Report](#tests-report)
- [My AI Usage](#my-ai-usage)

---

## Project Overview
This system allows users to browse sweets, search by category/price, and purchase items using a secure payment flow (Razorpay integration). Administrators have escalated privileges to manage inventory, add new products with images (Cloudinary integration), and restock supplies.

## Tech Stack
**Backend:**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Atlas for Prod, In-Memory for Test)
- **ODM:** Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer & Cloudinary
- **Payments:** Razorpay
- **Testing:** Jest & Supertest

---

## Backend Documentation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas Account (or local MongoDB)
- Cloudinary Account
- Razorpay Account

### Installation & Setup
1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd sweet-shop-management
    ```

2.  **Install Backend Dependencies**
    ```bash
    cd backend
    npm install
    ```
3.  **Set Environment Variables**
	Create a `.env` file in the `backend` directory with the following keys:
	```env
	PORT=5000
	MONGO_URI = your_mongodb_connection_string
	CORS_ORIGIN =  

	--------cloudinary service-------------
	CLOUDINARY_CLOUD_NAME = your_cloud_name
	CLOUDINARY_API_KEY = your_api_key
	CLOUDINARY_API_SECRET = your_api_secret
	
	---------Razorpay service optional-----
	RAZORPAY_KEY_ID = your_razorpay_key_id
	RAZORPAY_KEY_SECRET = your_razorpay_key_secret
	
	---------For admin seeding-------------
	
	ADMIN_FULLNAME =
	ADMIN_USERNAME = 
	ADMIN_EMAIL = 
	ADMIN_PASSWORD =
	```
5.  **Run the Server**
    ```bash
    # Development Mode (uses nodemon)
    npm run dev

    # Production Mode
    npm start
    ```

### API Endpoints
1. **User Authentication  APIs**

| Method | Endpoint | Description | Auth Required |
|------|---------|-------------|---------------|
| POST | `/api/v1/users/register` | Register a new user | No |
| POST | `/api/v1/users/login` | Login (Returns JWT) | No |
| POST | `/api/v1/users/logout` | Logout (Blacklists Token) | Yes |

2. **Sweets APIs**

| Method | Endpoint | Description | Auth Required |
|------|---------|-------------|---------------|
| GET | `/api/v1/sweets` | View all sweets (Search / Filter) | No |
| POST | `/api/v1/sweets` | Add new sweet (with Image Upload) | Admin |
| POST | `/api/v1/sweets/:id/purchase` | Purchase a sweet | Yes |
| POST | `/api/v1/sweets/:id/restock` | Restock inventory | Admin |

### Tests Report
This project strictly follows **Test-Driven Development (TDD)**.

[Click Here for Test Report](https://pkumar9800.github.io/sweet-shop-management/)
---

### Running Tests

```bash
#Run all tests(unit & Integration)
npm test
```
**Note**: Tests use `mongodb-memory-server` for isolation and do not affect the production database.

---

## My AI Usage
**Mandatory Disclosure as per Project Requirements**

I used AI tools (specifically **Gemini**) as a co-author and technical thought partner throughout the development lifecycle. Below is a detailed breakdown of how AI was leveraged:

-   **Gemini (Google):** Used for generating boilerplate code, writing complex test cases, and debugging errors.

-   **TDD Workflow:** I used Gemini to generate the initial "Red" phase test suites using Jest and Supertest. This ensured comprehensive coverage for edge cases before I wrote any implementation code.
    
-   **Mocking External Services:** Gemini assisted in creating Jest mocks for **Cloudinary** and **Razorpay**. This allowed me to test file uploads and payment flows without making actual network requests or needing valid API keys during testing.
    
-   **Refactoring:** I used AI to refactor the User Controller. For example, moving the JWT generation logic from the controller into a Mongoose instance method (`user.generateAuthToken`) to follow "Fat Model, Thin Controller" principles.
    
-   **Debugging:** When I encountered a `ReferenceError` caused by a copy-paste issue (`cite_start`), I pasted the error log into Gemini, which identified the syntax error immediately.
    

 **Reflection on AI Impact**

AI significantly accelerated the development process, particularly in setting up the testing infrastructure. It handled the repetitive task of writing boilerplate test code, allowing me to focus on the business logic. However, manual oversight was crucial. For instance, I had to manually correct environment variable mismatches in the test scripts (`JWT_SECRET` vs `ACCESS_TOKEN_SECRET`) and fix named export issues that the AI initially got wrong. The collaboration resulted in a more robust and well-tested application than I might have built alone in the same timeframe.

---
