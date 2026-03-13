require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Course = require('./src/models/Course');
const Lesson = require('./src/models/Lesson');
const Banner = require('./src/models/Banner');
const LiveClass = require('./src/models/LiveClass');
const Announcement = require('./src/models/Announcement');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await Category.deleteMany();
        await Course.deleteMany();
        await Lesson.deleteMany();
        await Banner.deleteMany();
        await LiveClass.deleteMany();
        await Announcement.deleteMany();

        // 1. Seed Banners
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
                title: 'Llimited Time Offer: 50% Flat Discount',
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

        // 2. Seed Announcements
        await Announcement.create([
            { title: 'Physics live test tomorrow at 10 AM', message: 'Be ready!', type: 'info' },
            { title: 'Holi Break: March 24-26', message: 'No classes.', type: 'warning' },
        ]);

        // 3. Seed Categories
        const cat1 = await Category.create({ name: 'JEE', description: 'IIT JEE Prep' });
        const cat2 = await Category.create({ name: 'NEET', description: 'Medical Entrance' });
        const cat3 = await Category.create({ name: 'Class 10', description: 'Board Exams' });

        // 4. Seed Course & Lessons
        const course1 = await Course.create({
            title: 'Complete Physics for JEE Mains',
            description: 'Master Physics for the IIT JEE entrance exam with Alakh Sir clone tutorials.',
            price: 1999,
            thumbnail: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&q=80&w=400',
            instructor: 'Alakh Sir',
            category: 'JEE',
            isPremium: true
        });

        const lesson1a = await Lesson.create({
            title: 'Introduction to Kinematics',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            duration: '15:20',
            isFree: true,
            course: course1._id,
            notes: [
                { title: 'Kinematics PDF Notes', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
            ],
            resources: [
                { title: 'Cheat Sheet - Formulas', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
            ]
        });

        const lesson1b = await Lesson.create({
            title: 'Newton Laws of Motion',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            duration: '45:00',
            isFree: false,
            course: course1._id
        });

        course1.lessons.push(lesson1a._id, lesson1b._id);
        await course1.save();

        // 5. Seed Live Class
        await LiveClass.create({
            title: 'Live Q&A Section: Kinematics',
            course: course1._id,
            instructor: 'Alakh Sir',
            startTime: new Date(Date.now() - 3600000), // Started 1 hour ago
            endTime: new Date(Date.now() + 3600000), // Ending 1 hour from now
            status: 'ongoing',
            meetingId: 'room_jee_physics_1'
        });

        console.log('Seeding complete!');
        process.exit();
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedData();
