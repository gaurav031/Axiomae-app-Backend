require('dotenv').config();
const mongoose = require('mongoose');
const Banner = require('./src/models/Banner');

const updateBanners = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        // Clear existing banners
        await Banner.deleteMany();
        console.log('Deleted existing banners.');

        // Add 5 new banners
        const banners = await Banner.create([
            {
                title: 'Master IIT-JEE 2026: Physics Excellence',
                image: 'https://images.unsplash.com/photo-1636466483764-16a8561f6763?auto=format&fit=crop&q=80&w=1000',
                link: 'course-jee-physics',
                active: true
            },
            {
                title: 'NEET 2026: Biology Deep Dive Batch',
                image: 'https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&q=80&w=1000',
                link: 'course-neet-biology',
                active: true
            },
            {
                title: 'Board Exam Special: Class 10th Success',
                image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1000',
                link: 'category-class-10',
                active: true
            },
            {
                title: 'Limited Time Offer: 50% Flat Discount',
                image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1000',
                link: 'offers',
                active: true
            },
            {
                title: 'Live Doubt Clearing Sessions Starting Now',
                image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000',
                link: 'live-classes',
                active: true
            },
        ]);
        console.log('Successfully added 5 engaging banners!');
        process.exit();
    } catch (err) {
        console.error('Failed to update banners:', err);
        process.exit(1);
    }
};

updateBanners();
