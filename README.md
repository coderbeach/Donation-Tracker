# 🐾 PawHope Foundation

### Smart Donation & Welfare Management Platform

PawHope Foundation is a full-stack NGO management platform designed to help organizations efficiently manage donations, dog rescue shelters, orphan welfare centers, volunteers, fundraising campaigns, and financial operations through a centralized dashboard.

The platform promotes transparency, accountability, and efficient resource allocation by automating donation distribution, tracking expenses, monitoring welfare facilities, and providing actionable insights through real-time analytics.

---

## 🌟 Features

### 💰 Donation Management

* Record and track donations from multiple donors
* Support for various payment methods
* Donation history and filtering
* Campaign-linked donations
* Automated fund allocation

### 🐶 Dog Rescue Camp Management

* Manage multiple rescue camps and shelters
* Track shelter capacity and dog population
* Monitor food, medical, and maintenance expenses
* View funding allocation across camps

### 🏠 Orphan Welfare Management

* Manage orphan centers and beneficiaries
* Track educational, healthcare, and operational expenses
* Monitor funding requirements and resource allocation

### 🤝 Volunteer Management

* Register and manage volunteers
* Track skills, availability, and assignments
* Monitor contribution hours
* View volunteer performance statistics

### 🎯 Campaign Management

* Create and manage fundraising campaigns
* Track fundraising goals and progress
* Monitor donor participation
* Campaign performance insights

### 📊 Financial & Operational Analytics

* Monthly and yearly financial reports
* Donation trend analysis
* Expense tracking
* Net balance calculations
* Fund distribution monitoring
* Survival cost estimation
* Financial sustainability insights

### 🧠 AI-Based Forecasting

* Donation predictions
* Funding shortage alerts
* Volunteer requirement estimation
* Resource planning recommendations

---

# 🏗️ Tech Stack

## Frontend

* React.js
* Vite
* Vanilla CSS
* Recharts
* Lucide React

## Backend

* Node.js
* Express.js
* JWT Authentication
* bcryptjs

## Database

* SQLite
* Prisma ORM

---

# 📂 Project Structure

```bash
pawhope-foundation/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── index.css
│   │
│   └── package.json
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   │
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# 🗄️ Database Models

The application uses a relational database structure powered by Prisma ORM.

### Core Models

* User
* Donation
* Campaign
* DogCamp
* OrphanCenter
* Volunteer
* Expense

### Relationships

* Campaign → Donations
* DogCamp → Volunteers
* Donation → Campaign
* Volunteer → Assigned Camp

---

# 🔄 Automatic Fund Distribution

Every donation is automatically allocated using predefined rules.

## Allocation Logic

### Rule 1

* 50% of the donation is allocated to Dog Rescue Operations.
* 50% of the donation is allocated to Orphan Welfare Operations.

### Rule 2

Funds are distributed equally among all active facilities.

### Example

Donation Received: ₹100,000

Dog Rescue Operations:

* ₹50,000 allocated
* 4 active camps
* ₹12,500 per camp

Orphan Welfare Operations:

* ₹50,000 allocated
* 3 active centers
* ₹16,666 per center

This ensures transparent and balanced fund distribution.

---

# 📉 Survival Cost Calculator

The platform estimates the minimum budget required to sustain all beneficiaries.

## Dog Welfare Costs

* Food
* Vaccination
* Medicines
* Shelter Maintenance

## Orphan Welfare Costs

* Food
* Education
* Healthcare
* Utilities
* Staff Salaries

### Generated Metrics

* Monthly Survival Cost
* Yearly Survival Cost
* Emergency Reserve Fund
* Recommended Financial Buffer

---

# 🔌 API Endpoints

## Authentication

```http
POST /api/auth/login
```

## Donations

```http
GET /api/donations
POST /api/donations
```

## Dog Camps

```http
GET /api/camps
POST /api/camps
```

## Orphan Centers

```http
GET /api/centers
POST /api/centers
```

## Volunteers

```http
GET /api/volunteers
POST /api/volunteers
```

## Campaigns

```http
GET /api/campaigns
POST /api/campaigns
```

## Reports

```http
GET /api/reports/monthly
GET /api/reports/yearly
GET /api/reports/predictions
```

---

# 📊 Dashboard Modules

### Admin Dashboard

* Total Donations
* Total Beneficiaries
* Active Campaigns
* Volunteer Statistics
* Financial Overview

### Donations Dashboard

* Donation Records
* Distribution Simulator
* CSV Export

### Camps & Centers Dashboard

* Facility Management
* Resource Cost Tracking
* Capacity Monitoring

### Volunteer Dashboard

* Volunteer Directory
* Activity Tracking
* Assignments & Hours

### Campaign Dashboard

* Campaign Progress
* Goal Tracking
* Donor Statistics

### Analytics Dashboard

* Donation Trends
* Expense Analysis
* Fund Distribution Reports
* Survival Cost Analysis
* AI Forecasting
* Funding Risk Alerts
* Monthly & Annual Reports

---

# 🔐 User Roles

## Admin

* Full system access
* Manage users and facilities
* View reports and analytics
* Manage donations and campaigns

## Manager

* Manage camps and centers
* Assign volunteers
* Monitor operations

## Volunteer

* View assignments
* Update activity logs
* Participate in campaigns

---

# 🌙 User Experience

* Responsive Design
* Mobile-Friendly Interface
* Dark & Light Mode
* Modern Glassmorphism UI
* Interactive Charts
* Smooth Animations
* CSV Export Support
* Print-to-PDF Reports

---

# 🌱 Sample Data Included

### Dog Camps

* Happy Tails Shelter
* Rescue Paws Camp
* Safe Haven Dogs
* Hope For Paws Center

### Orphan Centers

* Bright Future Home
* Hope Children's Center
* New Beginnings Home

### Additional Data

* 100+ Donation Records
* 50 Volunteer Profiles
* 4 Fundraising Campaigns
* 30 Expense Records

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/your-username/pawhope-foundation.git
cd pawhope-foundation
```

## Backend Setup

```bash
cd backend

npm install

npx prisma migrate dev

node prisma/seed.js

npm run dev
```

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# 🔮 Future Enhancements

* Payment Gateway Integration
* Email Notifications
* SMS Alerts
* Mobile Application
* Advanced AI Forecast Models
* Multi-NGO Support
* Blockchain-Based Donation Transparency

---

# ❤️ Mission

PawHope Foundation aims to improve transparency, accountability, and operational efficiency in welfare organizations through technology-driven solutions.

By combining automation, analytics, and centralized management, the platform empowers organizations to focus on what truly matters:

**Saving animals, supporting children, and creating a better future.**

---

⭐ If you found this project useful, consider giving it a star on GitHub.

🐾 Every donation matters. Every life matters.
