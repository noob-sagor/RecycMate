# 📒 RecycMate
### *An E-Waste Collection And Recycling Tracker Web Application*

**Software Requirements Specification**
**Link to the SRS Document: https://tinyurl.com/RecycMate**
**SRS Version: V.01**

---

### Prepared By

| ID | Name |
|---|---|
| 22201081 | Abdullah Al Mahmud Sagor |
| 22201083 | Sunjana Huq |
| 22201427 | Wasif Billah Tanoy |
| 23301038 | Luban Latif |
| 23201464 | Abu Bakar Siddique |

---

## 1. Introduction

### 1.1 Purpose

This Software Requirement Specification (SRS) document outlines the requirements for developing **"RecycMate,"** an all-in-one e-waste management and recycling web application using the **MERN stack** (MongoDB, Express.js, React.js, Node.js). The primary goal is to facilitate a secure and efficient ecosystem for e-waste disposal, enabling users to schedule pickups, track recycling status, and earn "Green Points" while ensuring environmental compliance.

### 1.2 Scope

The scope of this project includes the design, development, testing, and deployment of the platform catering to:

- **Users (Public):** Can register, request e-waste pickups, track their recycling history, and view earned rewards.
- **Collection Agents:** Can manage assigned pickups, update item status, and verify waste categories.
- **Recycling Center Staff:** Can manage inventory, generate recycling reports, and process materials.
- **Administrators:** Oversee system operations, manage user roles, and monitor environmental compliance standards.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|---|---|
| **MERN** | MongoDB, Express.js, React.js, Node.js |
| **E-Waste** | Electronic waste, including discarded electrical or electronic devices |
| **OTP** | One-Time Password used for secure authentication |
| **RBAC** | Role-Based Access Control, used to restrict system access to authorized users |
| **MVC** | Model-View-Controller, an architectural pattern for organizing code |
| **WEEE** | Waste Electrical and Electronic Equipment (international standard for e-waste) |

### 1.4 References

- **MongoDB** – For document-based data storage: https://www.mongodb.com/
- **Express.js** – For building the backend web framework: https://expressjs.com/
- **React.js** – For creating the interactive user interface: https://react.dev/
- **Node.js** – As the JavaScript runtime environment: https://nodejs.org/en
- **Environmental Standards** – Guidelines for safe disposal of toxic electronic materials

### 1.5 Overview

- **Section 2** provides an overall description of RecycMate, its user classes (User, Agent, Admin), and its operating environment.
- **Section 3** details the functional requirements (like pickup scheduling and Green Points) and non-functional requirements (security and performance).
- **Section 4** outlines the technology stack and the high-level MVC architectural overview.
- **Section 5** presents the development plan, including the 8-week sprint-wise breakdown and deliverables.

---

## 2. Overall Description

### 2.1 Product Features

1. **Location Services:** Real-time display of nearby e-waste collection centers based on user location.
2. **OTP-Based Authentication:** Secure login for users and agents using email or phone.
3. **Role Management:** Distinct dashboards for Users, Agents, Center Staff, and Admins.
4. **Pickup Management:** Scheduling, rescheduling, and cancellation of waste collection requests.
5. **Toxicity & Categorization:** Automated flagging of high-hazard items (e.g., Lead-acid batteries).
6. **Green Point System:** Logic to calculate and award loyalty points based on the weight and type of waste recycled.
7. **Status Tracking:** Real-time status updates from "Requested" to "Recycled".
8. **Environmental Reports:** Analytics for Admins on total weight collected and toxicity heatmaps.

### 2.2 User Classes

- **Users:** Individuals seeking to dispose of electronic junk. Require a simple interface to book pickups.
- **Collection Agents:** Field workers who manage logistics and update pickup status in real-time.
- **Administrators:** System overseers responsible for data analytics and center management.

### 2.3 User Classes and Characteristics

1. **Users (Public):** Individuals looking to dispose of electronic junk or earn rewards. They are typically non-technical and require a user-friendly interface to schedule pickups and view their "Green Point" balance.
2. **Collection Agents:** Field workers who manage logistics, visit user locations, and verify the type of waste being collected. They require an intuitive, mobile-friendly interface to update pickup statuses and verify serial numbers on the go.
3. **Recycling Center Staff:** Administrative and technical staff at the processing facility. They handle the physical receiving of waste, manage inventory, and need access to waste management features and limited user data for logistics.
4. **Administrators:** System overseers responsible for managing user roles, verifying collection centers, and monitoring environmental impact analytics. They have full access to system settings and the master analytics dashboard.

### 2.4 Operating Environment

- **Web Application:** Accessible on all modern web browsers, including Chrome, Firefox, Edge, and Safari.
- **Mobile Compatibility:** The application will use a responsive design to ensure it is fully functional on smartphones and tablets.
- **Server-Side:** Built using Node.js and Express.js, designed to run in a containerized or cloud-based environment.
- **Database:** A MongoDB cluster (cloud-managed via MongoDB Atlas) to ensure data scalability and automatic backups.
- **Hosting:** The application will be deployed on cloud environments like AWS, Azure, or Google Cloud.

### 2.5 Constraints

- **Regulatory Compliance:** The system must adhere to environmental regulations (like WEEE) and general data privacy standards (GDPR) for handling user contact information.
- **Security:** Implementation of encryption at rest (database) and in transit (HTTPS/SSL) is mandatory.
- **Performance:** The system must support a growing user base with minimal latency for real-time status updates and location services.
- **Scalability:** The architecture must allow for horizontal scaling of the Node.js server to handle peak recycling periods.
- **Time & Resource:** The project must be completed within the 8–9 week semester timeline with the assigned team.

### 2.6 Assumptions and Dependencies

- **Internet Connectivity:** It is assumed that users and agents have a stable internet connection to access the portal and update statuses.
- **Third-Party Services:** The project depends on the reliability of external services for SMS notifications (Twilio), Email (SendGrid), and Maps (Google Maps API).
- **GPS Permissions:** Mobile users are expected to grant GPS access to allow the system to find the nearest collection points.
- **Staff Training:** It is assumed that recycling center staff have basic computer literacy and can be trained to use the dashboard.

---

## 3. System Requirements

### 3.1 Functional Requirements

#### 3.1.1 Authentication & Authorization

**OTP Authentication:**
- **FR-1:** The system shall generate and send a time-bound OTP to the user's email or phone number for secure registration and login.
- **FR-2:** The system shall invalidate OTPs after a configurable time period, such as 5 minutes, to maintain security.

**Role-Based Access Control (RBAC):**
- **FR-3:** The system shall provide differentiated dashboards for Users (Public), Collection Agents, Center Staff, and Administrators.
- **FR-4:** The system shall restrict each user's access to features according to their assigned role; for example, a standard user cannot access administrative environmental impact reports.

#### 3.1.2 E-Waste Pickup & Logistics

**Pickup Management:**
- **FR-5:** Users shall be able to search for the nearest collection centers based on their current location or the specialty of waste handled.
- **FR-6:** Users shall be able to schedule, reschedule, or cancel e-waste pickup appointments.
- **FR-7:** Collection Agents shall be able to update their availability in real-time to accept new pickup tasks.
- **FR-8:** The system shall display a real-time status tracker for walk-in disposals and scheduled pickups.

#### 3.1.3 Waste Processing & Environmental Logic

**Item Tracking & Toxicity:**
- **FR-9:** The system shall maintain a secure, encrypted record of all disposed items, including item name, category, weight, and serial number.
- **FR-10:** Authorized staff and administrators shall be able to view and update the processing status of e-waste (e.g., "Sorted," "Refurbished," or "Recycled").

**Green Point & Reward System:**
- **FR-11:** The system shall automatically calculate "Green Points" for users based on the weight and category of the recycled item.
- **FR-12:** Users shall be able to view their total accumulated points and history of environmental impact in their dashboard.

#### 3.1.4 Additional Services

**Payments & Documentation:**
- **FR-13:** The system shall integrate with a major payment gateway for potential rewards, payouts, or handling fees.
- **FR-14:** The system shall allow users to generate and download a digital "Recycling Certificate" upon successful disposal of hazardous waste.

**Feedback & Monitoring:**
- **FR-15:** Users shall be able to provide feedback and ratings for the collection agents and recycling centers.
- **FR-16:** Administrators shall have access to an aggregated view of feedback and recycling efficiency for quality monitoring.

---

### 3.2 Non-Functional Requirements (NFR)

#### 3.2.1 Performance Requirements

- **NFR-1:** The system shall handle multiple concurrent status updates and location-based searches without significant degradation in performance.
- **NFR-2:** Average page load time for the dashboard and pickup request forms shall not exceed a defined time limit under normal network conditions.

#### 3.2.2 Security Requirements

- **NFR-3:** All communication between the client (React) and the server (Node.js) shall occur over HTTPS (SSL/TLS).
- **NFR-4:** Sensitive fields in the database, such as user contact details and device serial numbers, shall be encrypted at rest.
- **NFR-5:** The system must comply with local environmental data regulations and general data privacy regarding user consent and breach notifications.

#### 3.2.3 Reliability & Availability

- **NFR-6:** The system shall maintain 99.9% uptime to ensure users can request pickups at any time, excluding scheduled maintenance.
- **NFR-7:** Data backups of the MongoDB cluster shall be taken daily to ensure minimal data loss in case of system failure.

#### 3.2.4 Maintainability

- **NFR-8:** The codebase shall follow consistent naming conventions and the **MVC design pattern** to ease future maintenance by different developers.
- **NFR-9:** Documentation of the RESTful APIs, Mongoose data models, and architecture shall be kept current.

#### 3.2.5 Scalability

- **NFR-10:** The system architecture shall accommodate horizontal scaling of the Node.js application and MongoDB cluster to handle increases in e-waste disposal requests.

---

### 3.3 External Interface Requirements

#### 3.3.1 User Interfaces

- **UI-1:** A responsive web interface built with React.js that adjusts seamlessly to desktop, tablet, and mobile viewports.
- **UI-2:** Intuitive navigation featuring separate, specialized dashboards for the User, Collection Agent, and Admin roles.

#### 3.3.2 Hardware Interfaces

- **HI-1:** No specific hardware is required; the system will run on standard cloud-based server instances (e.g., AWS EC2 or Heroku).

#### 3.3.3 Software Interfaces

- **SI-1:** Integration with Payment Gateway APIs (e.g., Stripe) for potential reward redemptions or premium services.
- **SI-2:** Integration with SMS/Email services (e.g., Twilio or Nodemailer) for OTP authentication and pickup notifications.
- **SI-3:** Integration with Map APIs (e.g., Google Maps) for real-time display of nearby collection centers.

#### 3.3.4 Communication Interfaces

- **CI-1:** RESTful APIs will be used for all communication between the React.js frontend and the Node.js/Express.js backend.

---

## 4. Technology Stack & Architectural Overview (MVC)

| Layer | Technology | Role |
|---|---|---|
| **Model** | MongoDB | Document-oriented database to store user profiles, waste item schemas, and transaction logs |
| **View** | React.js | A responsive web interface that adjusts to desktop and mobile viewports for all user roles |
| **Controller** | Node.js / Express.js | Processes business logic, such as toxicity flagging and point calculations |

---

## 5. Conclusion

This SRS provides a detailed outline for **"RecycMate"** ensuring a user-centric approach to e-waste management. By integrating core functionalities like pickup scheduling, toxicity logic, and a reward system, the project aims to deliver a robust and environmentally impactful solution within the 8-week timeline.
