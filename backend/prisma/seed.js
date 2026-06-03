import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.donation.deleteMany({});
  await prisma.volunteer.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.dogCamp.deleteMany({});
  await prisma.orphanCenter.deleteMany({});

  console.log('Seeding users...');
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('password123', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@pawhope.org',
      name: 'Aditya Sen',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@pawhope.org',
      name: 'Simran Kaur',
      password: passwordHash,
      role: 'MANAGER',
    },
  });

  const volunteerUser = await prisma.user.create({
    data: {
      email: 'volunteer@pawhope.org',
      name: 'Rahul Verma',
      password: passwordHash,
      role: 'VOLUNTEER',
    },
  });

  console.log('Seeding dog camps...');
  const campsData = [
    { name: 'Happy Tails Shelter', location: 'North Sector, Delhi', capacity: 150, dogsCount: 120, foodCost: 90000, medicalCost: 45000, maintenanceCost: 25000 },
    { name: 'Rescue Paws Camp', location: 'South Valley, Bangalore', capacity: 100, dogsCount: 85, foodCost: 65000, medicalCost: 35000, maintenanceCost: 18000 },
    { name: 'Safe Haven Dogs', location: 'East Coast, Mumbai', capacity: 80, dogsCount: 72, foodCost: 55000, medicalCost: 28000, maintenanceCost: 15000 },
    { name: 'Hope For Paws Center', location: 'West Hills, Pune', capacity: 120, dogsCount: 98, foodCost: 75000, medicalCost: 40000, maintenanceCost: 22000 },
  ];

  const camps = [];
  for (const camp of campsData) {
    const createdCamp = await prisma.dogCamp.create({ data: camp });
    camps.push(createdCamp);
  }

  console.log('Seeding orphan centers...');
  const centersData = [
    { name: 'Bright Future Home', childrenCount: 45, foodCost: 112500, educationCost: 90000, healthcareCost: 67500, utilityCost: 45000, staffSalaryCost: 80000 },
    { name: 'Hope Children\'s Center', childrenCount: 30, foodCost: 75000, educationCost: 60000, healthcareCost: 45000, utilityCost: 30000, staffSalaryCost: 55000 },
    { name: 'New Beginnings Home', childrenCount: 25, foodCost: 62500, educationCost: 50000, healthcareCost: 37500, utilityCost: 25000, staffSalaryCost: 50000 },
  ];

  const centers = [];
  for (const center of centersData) {
    const createdCenter = await prisma.orphanCenter.create({ data: center });
    centers.push(createdCenter);
  }

  console.log('Seeding campaigns...');
  const campaignsData = [
    { title: 'Save A Paw', goal: 500000 },
    { title: 'Feed A Friend', goal: 300000 },
    { title: 'Education For Every Child', goal: 700000 },
    { title: 'Medical Aid Mission', goal: 400000 },
  ];

  const campaigns = [];
  for (const camp of campaignsData) {
    const createdCampaign = await prisma.campaign.create({ data: camp });
    campaigns.push(createdCampaign);
  }

  console.log('Seeding 100+ realistic donations...');
  const donorNames = [
    'Amit Sharma', 'Priya Patel', 'Rajesh Kumar', 'Sneha Reddy', 'Vikram Singh',
    'Neha Gupta', 'Rohan Mehta', 'Ananya Iyer', 'Sanjay Dutt', 'Divya Nair',
    'Arjun Kapoor', 'Kriti Sanon', 'Karan Johar', 'Deepika Padukone', 'Ranbir Kapoor',
    'Alia Bhatt', 'Sid Malhotra', 'Kiara Advani', 'Varun Dhawan', 'Shraddha Kapoor',
    'Sunil Gavaskar', 'Sachin Tendulkar', 'MS Dhoni', 'Virat Kohli', 'Rohit Sharma',
    'Rishabh Pant', 'Hardik Pandya', 'Jasprit Bumrah', 'KLRahul', 'Shreyas Iyer',
    'Aishwarya Rai', 'Abhishek Bachchan', 'Amitabh Bachchan', 'Jaya Bachchan', 'Rajinikanth',
    'Kamal Haasan', 'Vijay Thalapathy', 'Ajith Kumar', 'Suriya Sivakumar', 'Karthi',
    'Mahesh Babu', 'Allu Arjun', 'Ram Charan', 'NTR Jr', 'Prabhas Raju',
    'Anushka Shetty', 'Samantha Ruth', 'Rashmika Mandanna', 'Pooja Hegde', 'Keerthy Suresh'
  ];

  const paymentMethods = ['CREDIT_CARD', 'UPI', 'BANK_TRANSFER', 'PAYPAL'];
  const donationTypes = ['DOGS', 'ORPHANS', 'GENERAL'];

  // Start dates from 6 months ago to now
  const donations = [];
  const now = new Date();
  
  for (let i = 0; i < 110; i++) {
    const donorName = donorNames[i % donorNames.length];
    const amount = Math.floor(Math.random() * 45) * 1000 + 1000; // Between 1000 and 45000
    
    // Distribute date over the last 180 days
    const date = new Date();
    date.setDate(now.getDate() - Math.floor(Math.random() * 180));

    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const donationType = donationTypes[Math.floor(Math.random() * donationTypes.length)];
    
    // Associate 60% of donations with a campaign
    let campaignId = null;
    if (Math.random() > 0.4) {
      // Pick campaign based on donation type or random
      if (donationType === 'DOGS') {
        campaignId = campaigns[Math.random() > 0.5 ? 0 : 1].id; // Save A Paw or Feed A Friend
      } else if (donationType === 'ORPHANS') {
        campaignId = campaigns[Math.random() > 0.5 ? 2 : 3].id; // Education For Every Child or Medical Aid Mission
      } else {
        campaignId = campaigns[Math.floor(Math.random() * campaigns.length)].id;
      }
    }

    const status = Math.random() > 0.05 ? 'COMPLETED' : 'PENDING';

    donations.push({
      donorName,
      amount,
      date,
      paymentMethod,
      campaignId,
      donationType,
      status,
    });
  }

  // Create donations in database
  for (const donation of donations) {
    await prisma.donation.create({ data: donation });
  }

  // Sync campaigns amounts
  console.log('Syncing campaign raised amounts and donors...');
  const allCampaigns = await prisma.campaign.findMany({
    include: { donations: true },
  });

  for (const camp of allCampaigns) {
    const completedDonations = camp.donations.filter(d => d.status === 'COMPLETED');
    const amountRaised = completedDonations.reduce((sum, d) => sum + d.amount, 0);
    const donorsCount = new Set(completedDonations.map(d => d.donorName)).size;

    await prisma.campaign.update({
      where: { id: camp.id },
      data: { amountRaised, donorsCount },
    });
  }

  console.log('Seeding 50 volunteers...');
  const volunteerNames = [
    'Ramesh Rao', 'Suresh Kumar', 'Kavita Joshi', 'Meera Sen', 'Gaurav Jain',
    'Nikhil Nair', 'Pranav Shah', 'Ritu Phogat', 'Geeta Kumari', 'Babita Phogat',
    'Ishaan Khatter', 'Janhavi Kapoor', 'Ananya Panday', 'Sara Ali Khan', 'Kartik Aaryan',
    'Vicky Kaushal', 'Katrina Kaif', 'Ranveer Singh', 'Priyanka Chopra', 'Nick Jonas',
    'Harish Rawat', 'Trivendra Rawat', 'Pushkar Dhami', 'Vijay Bahuguna', 'Bhuwan Chandra',
    'Naveen Patnaik', 'Mamata Banerjee', 'Nitish Kumar', 'Tejashwi Yadav', 'Hemant Soren',
    'Arvind Kejriwal', 'Bhagwant Mann', 'Uddhav Thackeray', 'Devendra Fadnavis', 'Eknath Shinde',
    'Sharad Pawar', 'Ajit Pawar', 'Supriya Sule', 'Raj Thackeray', 'Prithviraj Chavan',
    'Siddaramaiah', 'DK Shivakumar', 'BS Yediyurappa', 'HD Kumaraswamy', 'Basavaraj Bommai',
    'Pinarayi Vijayan', 'MK Stalin', 'KCR', 'KT Rama Rao', 'YS Jagan Mohan'
  ];

  const skillsList = [
    'Animal Handling, First Aid, Rescue Operations',
    'Teaching, Child Psychology, Mentoring',
    'Event Management, Social Media, Fundraising',
    'Medical Care, Nursing, Healthcare',
    'Cooking, Nutrition Planning, Logistics',
    'IT Support, Web Design, Data Analytics',
    'General Help, Driving, Warehouse Management'
  ];

  const availabilities = ['WEEKENDS', 'WEEKDAYS', 'FULL_TIME'];

  for (let i = 0; i < 50; i++) {
    const name = volunteerNames[i % volunteerNames.length];
    const age = Math.floor(Math.random() * 25) + 18; // 18 to 43
    const skills = skillsList[Math.floor(Math.random() * skillsList.length)];
    const availability = availabilities[Math.floor(Math.random() * availabilities.length)];
    
    // Assign 80% of volunteers to a dog camp (some camps, some none)
    const assignedCampId = Math.random() > 0.3 ? camps[Math.floor(Math.random() * camps.length)].id : null;
    const hoursContributed = Math.floor(Math.random() * 120) + 5; // 5 to 125 hours

    await prisma.volunteer.create({
      data: {
        name,
        age,
        skills,
        availability,
        assignedCampId,
        hoursContributed,
        createdAt: new Date(now.getTime() - Math.floor(Math.random() * 120) * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('Seeding historical expenses...');
  // Let's create monthly expenses for the last 6 months
  const expenseCategories = ['FOOD', 'MEDICAL', 'UTILITIES', 'SALARY', 'MAINTENANCE'];
  const months = [5, 4, 3, 2, 1, 0]; // 5 months ago to this month
  
  for (const m of months) {
    const expDate = new Date();
    expDate.setMonth(now.getMonth() - m);

    // Dog Operations Expenses
    await prisma.expense.create({
      data: {
        description: 'Monthly dog food wholesale order',
        amount: 250000 + Math.floor(Math.random() * 40000) - 20000,
        category: 'FOOD',
        date: expDate,
        type: 'DOGS',
      },
    });

    await prisma.expense.create({
      data: {
        description: 'Veterinary services and vaccination kits',
        amount: 130000 + Math.floor(Math.random() * 20000) - 10000,
        category: 'MEDICAL',
        date: expDate,
        type: 'DOGS',
      },
    });

    await prisma.expense.create({
      data: {
        description: 'Shelter repair and sanitation supply',
        amount: 70000 + Math.floor(Math.random() * 15000) - 7500,
        category: 'MAINTENANCE',
        date: expDate,
        type: 'DOGS',
      },
    });

    // Orphan Operations Expenses
    await prisma.expense.create({
      data: {
        description: 'Ration and grocery for children centers',
        amount: 240000 + Math.floor(Math.random() * 30000) - 15000,
        category: 'FOOD',
        date: expDate,
        type: 'ORPHANS',
      },
    });

    await prisma.expense.create({
      data: {
        description: 'School tuition fees and stationery supplies',
        amount: 190000 + Math.floor(Math.random() * 20000) - 10000,
        category: 'EDUCATION', // We can add EDUCATION as a custom category
        date: expDate,
        type: 'ORPHANS',
      },
    });

    await prisma.expense.create({
      data: {
        description: 'Children health checkup and medicine stock',
        amount: 140000 + Math.floor(Math.random() * 20000) - 10000,
        category: 'MEDICAL',
        date: expDate,
        type: 'ORPHANS',
      },
    });

    await prisma.expense.create({
      data: {
        description: 'Electricity, water, and heating utilities',
        amount: 90000 + Math.floor(Math.random() * 10000) - 5000,
        category: 'UTILITIES',
        date: expDate,
        type: 'ORPHANS',
      },
    });

    await prisma.expense.create({
      data: {
        description: 'Center staff salaries',
        amount: 180000,
        category: 'SALARY',
        date: expDate,
        type: 'ORPHANS',
      },
    });
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
