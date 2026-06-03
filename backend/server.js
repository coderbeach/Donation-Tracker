import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretpawhopekey';

app.use(cors());
app.use(express.json());

// Token Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// --- AUTHENTICATION ROUTES ---

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// --- DONATIONS ROUTES ---

// GET /api/donations
app.get('/api/donations', async (req, res) => {
  const { search, type, status, campaignId } = req.query;

  try {
    const where = {};
    if (search) {
      where.donorName = { contains: search };
    }
    if (type) {
      where.donationType = type;
    }
    if (status) {
      where.status = status;
    }
    if (campaignId) {
      where.campaignId = campaignId;
    }

    const donations = await prisma.donation.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { campaign: true }
    });

    res.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Failed to retrieve donations' });
  }
});

// POST /api/donations
app.post('/api/donations', async (req, res) => {
  const { donorName, amount, paymentMethod, campaignId, donationType, status } = req.body;

  if (!donorName || !amount || !paymentMethod || !donationType) {
    return res.status(400).json({ error: 'Missing required donation fields' });
  }

  const donationAmount = parseFloat(amount);
  if (isNaN(donationAmount) || donationAmount <= 0) {
    return res.status(400).json({ error: 'Donation amount must be a positive number' });
  }

  try {
    // 1. Save the donation
    const donation = await prisma.donation.create({
      data: {
        donorName,
        amount: donationAmount,
        paymentMethod,
        campaignId: campaignId || null,
        donationType,
        status: status || 'COMPLETED',
        date: new Date(),
      },
    });

    // 2. If donation is COMPLETED, update campaigns if linked
    if (donation.status === 'COMPLETED' && campaignId) {
      const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
      if (campaign) {
        // Calculate new metrics
        const relatedDonations = await prisma.donation.findMany({
          where: { campaignId, status: 'COMPLETED' }
        });
        const amountRaised = relatedDonations.reduce((sum, d) => sum + d.amount, 0);
        const donorsCount = new Set(relatedDonations.map(d => d.donorName)).size;

        await prisma.campaign.update({
          where: { id: campaignId },
          data: { amountRaised, donorsCount },
        });
      }
    }

    // 3. Apply Fund Distribution calculations
    // Rule 1: 50% Dog Camps, 50% Orphan Centers
    const dogShare = donationAmount * 0.5;
    const orphanShare = donationAmount * 0.5;

    // Rule 2: Distribute equally inside each category
    const dogCamps = await prisma.dogCamp.findMany();
    const orphanCenters = await prisma.orphanCenter.findMany();

    const sharePerCamp = dogCamps.length > 0 ? dogShare / dogCamps.length : 0;
    const sharePerCenter = orphanCenters.length > 0 ? orphanShare / orphanCenters.length : 0;

    const distribution = {
      total: donationAmount,
      dogRescueTotal: dogShare,
      orphanWelfareTotal: orphanShare,
      campsDistribution: dogCamps.map(camp => ({
        id: camp.id,
        name: camp.name,
        amountAllocated: sharePerCamp
      })),
      centersDistribution: orphanCenters.map(center => ({
        id: center.id,
        name: center.name,
        amountAllocated: sharePerCenter
      }))
    };

    res.status(201).json({
      donation,
      distribution
    });
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ error: 'Failed to record donation' });
  }
});

// --- CAMPS ROUTES (DOGS) ---

// GET /api/camps
app.get('/api/camps', async (req, res) => {
  try {
    const camps = await prisma.dogCamp.findMany({
      include: {
        volunteers: true
      }
    });

    // Format output with volunteer counts
    const formattedCamps = camps.map(camp => ({
      ...camp,
      volunteersAssigned: camp.volunteers.length,
      monthlyTotalCost: camp.foodCost + camp.medicalCost + camp.maintenanceCost
    }));

    res.json(formattedCamps);
  } catch (error) {
    console.error('Error fetching camps:', error);
    res.status(500).json({ error: 'Failed to retrieve dog camps' });
  }
});

// POST /api/camps
app.post('/api/camps', async (req, res) => {
  const { name, location, capacity, dogsCount, foodCost, medicalCost, maintenanceCost } = req.body;

  if (!name || !location || capacity === undefined || dogsCount === undefined) {
    return res.status(400).json({ error: 'Missing required camp details' });
  }

  try {
    const camp = await prisma.dogCamp.create({
      data: {
        name,
        location,
        capacity: parseInt(capacity),
        dogsCount: parseInt(dogsCount),
        foodCost: parseFloat(foodCost || 0),
        medicalCost: parseFloat(medicalCost || 0),
        maintenanceCost: parseFloat(maintenanceCost || 0)
      }
    });
    res.status(201).json(camp);
  } catch (error) {
    console.error('Error creating camp:', error);
    res.status(500).json({ error: 'Failed to create dog camp' });
  }
});

// --- ORPHAN CENTERS ROUTES ---

// GET /api/centers
app.get('/api/centers', async (req, res) => {
  try {
    const centers = await prisma.orphanCenter.findMany();
    const formattedCenters = centers.map(center => ({
      ...center,
      monthlyTotalCost: center.foodCost + center.educationCost + center.healthcareCost + center.utilityCost + center.staffSalaryCost
    }));
    res.json(formattedCenters);
  } catch (error) {
    console.error('Error fetching centers:', error);
    res.status(500).json({ error: 'Failed to retrieve orphan centers' });
  }
});

// POST /api/centers
app.post('/api/centers', async (req, res) => {
  const { name, childrenCount, foodCost, educationCost, healthcareCost, utilityCost, staffSalaryCost } = req.body;

  if (!name || childrenCount === undefined) {
    return res.status(400).json({ error: 'Missing required center details' });
  }

  try {
    const center = await prisma.orphanCenter.create({
      data: {
        name,
        childrenCount: parseInt(childrenCount),
        foodCost: parseFloat(foodCost || 0),
        educationCost: parseFloat(educationCost || 0),
        healthcareCost: parseFloat(healthcareCost || 0),
        utilityCost: parseFloat(utilityCost || 0),
        staffSalaryCost: parseFloat(staffSalaryCost || 0)
      }
    });
    res.status(201).json(center);
  } catch (error) {
    console.error('Error creating center:', error);
    res.status(500).json({ error: 'Failed to create orphan center' });
  }
});

// --- VOLUNTEERS ROUTES ---

// GET /api/volunteers
app.get('/api/volunteers', async (req, res) => {
  const { search, availability } = req.query;

  try {
    const where = {};
    if (search) {
      where.name = { contains: search };
    }
    if (availability) {
      where.availability = availability;
    }

    const volunteers = await prisma.volunteer.findMany({
      where,
      include: { assignedCamp: true },
      orderBy: { hoursContributed: 'desc' }
    });

    res.json(volunteers);
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({ error: 'Failed to retrieve volunteers' });
  }
});

// POST /api/volunteers
app.post('/api/volunteers', async (req, res) => {
  const { name, age, skills, availability, assignedCampId, hoursContributed } = req.body;

  if (!name || !age || !skills || !availability) {
    return res.status(400).json({ error: 'Missing required volunteer fields' });
  }

  try {
    const volunteer = await prisma.volunteer.create({
      data: {
        name,
        age: parseInt(age),
        skills,
        availability,
        assignedCampId: assignedCampId || null,
        hoursContributed: parseFloat(hoursContributed || 0)
      }
    });
    res.status(201).json(volunteer);
  } catch (error) {
    console.error('Error creating volunteer:', error);
    res.status(500).json({ error: 'Failed to register volunteer' });
  }
});

// --- CAMPAIGNS ROUTES ---

// GET /api/campaigns
app.get('/api/campaigns', async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        _count: {
          select: { donations: true }
        }
      }
    });
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to retrieve campaigns' });
  }
});

// POST /api/campaigns
app.post('/api/campaigns', async (req, res) => {
  const { title, goal } = req.body;

  if (!title || !goal) {
    return res.status(400).json({ error: 'Title and goal are required' });
  }

  try {
    const campaign = await prisma.campaign.create({
      data: {
        title,
        goal: parseFloat(goal),
        amountRaised: 0,
        donorsCount: 0
      }
    });
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// --- REPORTING & ANALYTICS ROUTES ---

// GET /api/reports/monthly
app.get('/api/reports/monthly', async (req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { status: 'COMPLETED' }
    });

    const expenses = await prisma.expense.findMany({});

    // Group by month names
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Group monthly donations and expenses for the last 6 months
    const monthlySummary = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`;
      monthlySummary[key] = { monthName: key, donations: 0, expenses: 0, net: 0, rawDate: d };
    }

    donations.forEach(donation => {
      const date = new Date(donation.date);
      const key = `${months[date.getMonth()]} ${date.getFullYear().toString().substr(-2)}`;
      if (monthlySummary[key]) {
        monthlySummary[key].donations += donation.amount;
      }
    });

    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const key = `${months[date.getMonth()]} ${date.getFullYear().toString().substr(-2)}`;
      if (monthlySummary[key]) {
        monthlySummary[key].expenses += expense.amount;
      }
    });

    const data = Object.values(monthlySummary).map(m => {
      m.net = m.donations - m.expenses;
      return m;
    });

    res.json(data);
  } catch (error) {
    console.error('Error generating monthly report:', error);
    res.status(500).json({ error: 'Failed to retrieve monthly report' });
  }
});

// GET /api/reports/yearly
app.get('/api/reports/yearly', async (req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { status: 'COMPLETED' }
    });

    const expenses = await prisma.expense.findMany({});
    
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const dogCamps = await prisma.dogCamp.findMany({});
    const orphanCenters = await prisma.orphanCenter.findMany({});

    const totalDogs = dogCamps.reduce((sum, c) => sum + c.dogsCount, 0);
    const totalChildren = orphanCenters.reduce((sum, c) => sum + c.childrenCount, 0);
    const totalBeneficiaries = totalDogs + totalChildren;

    res.json({
      totalDonations,
      totalExpenses,
      netBalance: totalDonations - totalExpenses,
      totalBeneficiaries,
      dogsCount: totalDogs,
      orphansCount: totalChildren
    });
  } catch (error) {
    console.error('Error generating annual report:', error);
    res.status(500).json({ error: 'Failed to retrieve yearly report' });
  }
});

// GET /api/reports/predictions
app.get('/api/reports/predictions', async (req, res) => {
  try {
    // 1. Fetch historical donations
    const donations = await prisma.donation.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { date: 'asc' }
    });

    // Compute monthly aggregation
    const monthlyTotals = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    donations.forEach(d => {
      const date = new Date(d.date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!monthlyTotals[key]) monthlyTotals[key] = 0;
      monthlyTotals[key] += d.amount;
    });

    const donationSeries = Object.values(monthlyTotals);
    
    // Calculate forecasting
    let predictedDonations = 450000; // Fallback
    if (donationSeries.length >= 2) {
      // Basic linear weighted slope
      const last = donationSeries[donationSeries.length - 1];
      const secondLast = donationSeries[donationSeries.length - 2];
      const slope = last - secondLast;
      predictedDonations = last + slope * 0.4 + (last * 0.05); // standard projection
    } else if (donationSeries.length === 1) {
      predictedDonations = donationSeries[0] * 1.03;
    }
    
    // Clamp minimum predicted value to be realistic
    if (predictedDonations <= 0) predictedDonations = 300000;

    // 2. Fetch costs from DB to calculate exact Monthly Survival Cost
    const dogCamps = await prisma.dogCamp.findMany();
    const orphanCenters = await prisma.orphanCenter.findMany();

    const dogCampsCost = dogCamps.reduce((sum, c) => sum + c.foodCost + c.medicalCost + c.maintenanceCost, 0);
    const orphanCentersCost = orphanCenters.reduce((sum, c) => sum + c.foodCost + c.educationCost + c.healthcareCost + c.utilityCost + c.staffSalaryCost, 0);
    
    const monthlySurvivalCost = dogCampsCost + orphanCentersCost;
    
    // 3. Shortage Risk Analysis
    const shortagePercentage = Math.max(0, ((monthlySurvivalCost - predictedDonations) / monthlySurvivalCost) * 100);
    let fundingShortageRisk = 'LOW';
    if (shortagePercentage > 20) {
      fundingShortageRisk = 'CRITICAL';
    } else if (shortagePercentage > 0) {
      fundingShortageRisk = 'HIGH';
    } else if (predictedDonations < monthlySurvivalCost * 1.15) {
      fundingShortageRisk = 'MEDIUM';
    }

    // 4. Resource Deficit calculations
    const resourceDeficit = [];
    // If the 50% split for dogs is less than camp expenses:
    const dogFundingPool = predictedDonations * 0.5;
    if (dogFundingPool < dogCampsCost) {
      resourceDeficit.push({
        category: 'Dog Rescue operations',
        deficit: dogCampsCost - dogFundingPool,
        description: `Predicted dog camp funding of ₹${dogFundingPool.toLocaleString()} is below the required operating cost of ₹${dogCampsCost.toLocaleString()}.`
      });
    }

    // If 50% split for orphans is less than center expenses:
    const orphanFundingPool = predictedDonations * 0.5;
    if (orphanFundingPool < orphanCentersCost) {
      resourceDeficit.push({
        category: 'Orphan welfare operations',
        deficit: orphanCentersCost - orphanFundingPool,
        description: `Predicted orphan center funding of ₹${orphanFundingPool.toLocaleString()} is below the required operating cost of ₹${orphanCentersCost.toLocaleString()}.`
      });
    }

    // 5. Volunteer Requirements
    const totalDogs = dogCamps.reduce((sum, c) => sum + c.dogsCount, 0);
    const totalChildren = orphanCenters.reduce((sum, c) => sum + c.childrenCount, 0);

    const requiredDogsVolunteers = Math.ceil(totalDogs / 10);
    const requiredOrphansVolunteers = Math.ceil(totalChildren / 5);
    const totalRequiredVolunteers = requiredDogsVolunteers + requiredOrphansVolunteers;

    const activeVolunteersCount = await prisma.volunteer.count();
    const volunteerDeficit = Math.max(0, totalRequiredVolunteers - activeVolunteersCount);

    res.json({
      predictedDonations: Math.round(predictedDonations),
      fundingShortageRisk,
      shortagePercentage: Math.round(shortagePercentage),
      resourceDeficit,
      volunteerRequirement: {
        required: totalRequiredVolunteers,
        active: activeVolunteersCount,
        deficit: volunteerDeficit,
        recommendation: volunteerDeficit > 0 
          ? `Urgent: Recruit at least ${volunteerDeficit} more volunteers to maintain care standards.` 
          : 'Volunteer counts currently meet general operational guidelines.'
      }
    });
  } catch (error) {
    console.error('Error generating predictions:', error);
    res.status(500).json({ error: 'Failed to generate mock AI predictions' });
  }
});

// Start backend server
app.listen(PORT, () => {
  console.log(`PawHope backend API is running on port ${PORT}`);
});

export default app;
