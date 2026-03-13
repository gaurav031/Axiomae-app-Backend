require('dotenv').config();
const mongoose = require('mongoose');
const StudentAchievement = require('./src/models/StudentAchievement');
const connectDB = require('./src/config/db');

const seedAchievements = async () => {
    try {
        await connectDB();

        // Clear existing
        await StudentAchievement.deleteMany();

        const achievements = [
            {
                studentName: 'Rahul Kumar',
                title: 'AIR 45 - JEE Advanced',
                image: 'https://randomuser.me/api/portraits/men/1.jpg',
                description: 'Achieved an All India Rank 45 in JEE Advanced 2024. Rahul joined our foundation batch and consistently performed top in mocks.',
                active: true
            },
            {
                studentName: 'Priya Sharma',
                title: '720/720 - NEET UG',
                image: 'https://randomuser.me/api/portraits/women/2.jpg',
                description: 'A perfect score in NEET UG 2024. Priya cracked the code to perfection with our biology and chemistry modules.',
                active: true
            },
            {
                studentName: 'Amit Singh',
                title: 'Gold Medalist - INPhO',
                image: 'https://randomuser.me/api/portraits/men/3.jpg',
                description: 'Brought glory by winning a gold medal at the International Physics Olympiad representing India.',
                active: true
            },
            {
                studentName: 'Sneha Gupta',
                title: '99.99%ile - CAT 2023',
                image: 'https://randomuser.me/api/portraits/women/4.jpg',
                description: 'Sneha scored 99.99 percentile in CAT 2023. She praises our Quant and DILR comprehensive classes.',
                active: true
            },
            {
                studentName: 'Vikas Patel',
                title: 'KVPY Scholar',
                image: 'https://randomuser.me/api/portraits/men/5.jpg',
                description: 'Selected for the prestigious KVPY fellowship in the SA stream with an all India rank of 12.',
                active: true
            },
            {
                studentName: 'Anjali Verma',
                title: 'Topper - CBSE Class 12',
                image: 'https://randomuser.me/api/portraits/women/6.jpg',
                description: 'Scored 99.6% in CBSE Class 12 board examinations, topping her state.',
                active: true
            },
            {
                studentName: 'Karan Mehra',
                title: 'NTSE Scholar',
                image: 'https://randomuser.me/api/portraits/men/7.jpg',
                description: 'Successfully cleared NTSE Stage 2 and is now a recognized NTSE scholar.',
                active: true
            },
            {
                studentName: 'Riya Singh',
                title: 'AIR 12 - CLAT 2024',
                image: 'https://randomuser.me/api/portraits/women/8.jpg',
                description: 'Secured admission in NLSIU Bangalore by securing an All India Rank 12 in CLAT.',
                active: true
            },
            {
                studentName: 'Rohit Das',
                title: 'Silver Medal - IMO',
                image: 'https://randomuser.me/api/portraits/men/9.jpg',
                description: 'Won the Silver medal at the International Mathematical Olympiad after years of careful preparation.',
                active: true
            },
            {
                studentName: 'Nisha Raj',
                title: 'AIR 5 - AIIMS Delhi',
                image: 'https://randomuser.me/api/portraits/women/10.jpg',
                description: 'Cracked AIIMS entrance with an all India rank 5, securing her dream seat at AIIMS New Delhi.',
                active: true
            }
        ];

        await StudentAchievement.insertMany(achievements);
        console.log('Successfully seeded 10 student achievements!');

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedAchievements();
