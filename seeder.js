const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Course = require('./src/models/Course');
const Category = require('./src/models/Category');
const Banner = require('./src/models/Banner');
const Lesson = require('./src/models/Lesson');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const seedData = async () => {
    try {
        await Category.deleteMany();
        await Course.deleteMany();
        await Banner.deleteMany();
        await Lesson.deleteMany();

        const categories = await Category.create([
            { name: 'Development', icon: 'Code' },
            { name: 'Business', icon: 'Briefcase' },
            { name: 'Design', icon: 'PenTool' },
            { name: 'Marketing', icon: 'TrendingUp' }
        ]);

        const course1 = await Course.create({
            title: 'Full Stack Web Development',
            description: 'Learn MERN stack from scratch. This course covers MongoDB, Express, React, and Node.js. You will build a real-world app.',
            thumbnail: 'https://img.freepik.com/free-vector/web-development-programmer-engineering-coding-website-design-iso-late-flat-illustration-vector-style_1150-51105.jpg',
            price: 499,
            isPremium: true,
            instructor: 'John Doe',
            category: 'Development'
        });

        const course2 = await Course.create({
            title: 'UI/UX Design Masterclass',
            description: 'Master Figma and Adobe XD. Learn color theory, typography, and layout design.',
            thumbnail: 'https://img.freepik.com/free-vector/user-experience-concept-illustration_114360-1282.jpg',
            price: 299,
            isPremium: true,
            instructor: 'Jane Smith',
            category: 'Design'
        });

        const lessons = await Lesson.create([
            {
                title: 'Introduction to MERN',
                description: 'Overview of the course',
                videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                duration: '10:00',
                isFree: true,
                course: course1._id
            },
            {
                title: 'Setting up Environment',
                description: 'Installing Node and MongoDB',
                videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                duration: '15:20',
                isFree: false,
                course: course1._id
            },
            {
                title: 'Design Principles',
                description: 'Basics of UI design',
                videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                duration: '12:00',
                isFree: true,
                course: course2._id
            }
        ]);

        course1.lessons = lessons.filter(l => l.course.equals(course1._id)).map(l => l._id);
        course2.lessons = lessons.filter(l => l.course.equals(course2._id)).map(l => l._id);

        await course1.save();
        await course2.save();

        await Banner.create([
            {
                image: 'https://img.freepik.com/free-vector/flat-design-education-template-presentation_23-2149113636.jpg',
                title: 'Limited Offer: 50% Off on All Courses!',
                link: '/courses'
            }
        ]);

        console.log('Data Seeded Successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
