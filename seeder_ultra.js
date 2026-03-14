const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load models
const Category = require('./src/models/Category');
const Course = require('./src/models/Course');
const Lesson = require('./src/models/Lesson');
const Banner = require('./src/models/Banner');
const Teacher = require('./src/models/Teacher');
const OfflineCentre = require('./src/models/OfflineCentre');
const Coupon = require('./src/models/Coupon');
const StudentAchievement = require('./src/models/StudentAchievement');
const StudyMaterial = require('./src/models/StudyMaterial');
const Quiz = require('./src/models/Quiz');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to Atlas for seeding...');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('Clearing existing data...');
        await Promise.all([
            Category.deleteMany(),
            Course.deleteMany(),
            Lesson.deleteMany(),
            Banner.deleteMany(),
            Teacher.deleteMany(),
            OfflineCentre.deleteMany(),
            Coupon.deleteMany(),
            StudentAchievement.deleteMany(),
            StudyMaterial.deleteMany(),
            Quiz.deleteMany()
        ]);

        console.log('Seeding Categories...');
        const categories = await Category.create([
            { name: 'Web Development', icon: 'Code' },
            { name: 'Mobile App Development', icon: 'Smartphone' },
            { name: 'Data Science', icon: 'Database' },
            { name: 'Cloud Computing', icon: 'Cloud' },
            { name: 'Cyber Security', icon: 'Lock' }
        ]);

        console.log('Seeding Teachers...');
        const teachers = await Teacher.create([
            {
                name: 'Dr. Gaurav Kumar',
                specialization: 'Full Stack Development',
                image: 'https://img.freepik.com/free-photo/portrait-successful-man-smiling-camera_171337-14991.jpg',
                bio: 'Expert in Node.js and React with 10+ years of corporate experience.',
                rating: 4.9,
                studentsCount: 1500,
                coursesCount: 5
            },
            {
                name: 'Anjali Sharma',
                specialization: 'UI/UX & Mobile Apps',
                image: 'https://img.freepik.com/free-photo/smiling-young-lady-standing-isolated-white-wall_171337-3315.jpg',
                bio: 'Professional designer with a passion for building beautiful user experiences.',
                rating: 4.8,
                studentsCount: 1200,
                coursesCount: 3
            },
            {
                name: 'Vikram Singh',
                specialization: 'DevOps & Cloud',
                image: 'https://img.freepik.com/free-photo/confident-businessman-posing-with-folded-arms_1262-19266.jpg',
                bio: 'Cloud Architect helping students master AWS and Azure.',
                rating: 4.7,
                studentsCount: 2000,
                coursesCount: 4
            }
        ]);

        console.log('Seeding 10 Courses...');
        const coursesData = [
            { title: 'React Native for Absolute Beginners', price: 999, category: 'Mobile App Development', teacher: teachers[1] },
            { title: 'Advanced Node.js & Microservices', price: 1499, category: 'Web Development', teacher: teachers[0] },
            { title: 'Python for Data Science Masterclass', price: 899, category: 'Data Science', teacher: teachers[2] },
            { title: 'AWS Cloud Architect Certification Guide', price: 1999, category: 'Cloud Computing', teacher: teachers[2] },
            { title: 'Ethical Hacking: Zero to Hero', price: 1299, category: 'Cyber Security', teacher: teachers[0] },
            { title: 'MERN Stack Real Estate App Build', price: 799, category: 'Web Development', teacher: teachers[0] },
            { title: 'Flutter & Dart: The Complete Guide', price: 1099, category: 'Mobile App Development', teacher: teachers[1] },
            { title: 'Machine Learning with R', price: 999, category: 'Data Science', teacher: teachers[2] },
            { title: 'Kubernetes & Docker Mastery', price: 1599, category: 'Cloud Computing', teacher: teachers[2] },
            { title: 'Web Application Pentesting 101', price: 1199, category: 'Cyber Security', teacher: teachers[0] }
        ];

        for (const c of coursesData) {
            const course = await Course.create({
                title: c.title,
                description: `Become an expert in ${c.title}. This course includes interactive sessions, real-world projects, and lifetime access to materials.`,
                thumbnail: 'https://img.freepik.com/free-vector/modern-online-education-banner_1262-21175.jpg',
                price: c.price,
                isPremium: true,
                instructor: c.teacher.name,
                category: c.category,
                rating: 4.5 + Math.random() * 0.5,
                duration: '20 hours',
                totalLessons: 5
            });

            // Add 1 Free and 1 Paid Lesson for each course
            const lesson1 = await Lesson.create({
                title: 'Introduction and Setup',
                description: 'Get started with the basics including installations and configuration.',
                videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                duration: '15:00',
                isFree: true,
                course: course._id
            });

            const lesson2 = await Lesson.create({
                title: 'Core Concepts & Logic',
                description: 'Diving deep into the architecture and logic flow.',
                videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                duration: '45:00',
                isFree: false,
                course: course._id
            });

            course.lessons = [lesson1._id, lesson2._id];

            // Add Study Material
            const material = await StudyMaterial.create({
                title: `${c.title} - Complete Notes`,
                type: 'pdf',
                fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                isFree: false,
                course: course._id
            });

            // Add Quiz
            await Quiz.create({
                title: `${c.title} - Final Quiz`,
                description: 'Test your knowledge after completing the module.',
                category: c.category,
                duration: 10,
                course: course._id,
                questions: [
                    {
                        questionText: `What is a primary concept in ${c.title}?`,
                        options: ['Logic Control', 'Data Flow', 'State Management', 'All of above'],
                        correctOption: 3
                    },
                    {
                        questionText: 'Is this course suitable for beginners?',
                        options: ['Yes', 'No', 'Depends', 'Only for Pros'],
                        correctOption: 0
                    }
                ]
            });

            await course.save();
        }

        console.log('Seeding Banners...');
        await Banner.create([
            {
                image: 'https://img.freepik.com/free-vector/gradient-technology-halftone-background_23-2148896010.jpg',
                title: 'Mega IT Sale: Flat 50% Off!',
                link: '/courses',
                active: true
            },
            {
                image: 'https://img.freepik.com/free-vector/futuristic-circuit-board-background_23-2148381422.jpg',
                title: 'New React Native Course Launched!',
                link: '/courses',
                active: true
            },
            {
                image: 'https://img.freepik.com/free-vector/network-mesh-wire-digital-technology-background_1017-27428.jpg',
                title: 'Join our Offline Bootcamp in Delhi!',
                link: '/offline-centres',
                active: true
            }
        ]);

        console.log('Seeding Coupons...');
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 1);

        await Coupon.create([
            { code: 'FREE100', discountType: 'percentage', discountAmount: 100, expiryDate: expiry, usageLimit: 50 },
            { code: 'AXIOMAE50', discountType: 'percentage', discountAmount: 50, expiryDate: expiry, usageLimit: 100 },
            { code: 'OFF10', discountType: 'percentage', discountAmount: 10, expiryDate: expiry, usageLimit: 500 }
        ]);

        console.log('Seeding Offline Centres...');
        await OfflineCentre.create([
            { title: 'Axiomae - Delhi Centre', address: 'Plot 4, Laxmi Nagar, New Delhi - 110092', phone: '9999999991', image: 'https://img.freepik.com/free-photo/modern-office-space-with-desks_23-2149219213.jpg' },
            { title: 'Axiomae - Noida Centre', address: 'Sec 62, Noida, Uttar Pradesh - 201301', phone: '9999999992', image: 'https://img.freepik.com/free-photo/young-business-people-meeting-modern-office_23-2148817028.jpg' },
            { title: 'Axiomae - Gurgaon Centre', address: 'Cyber City, Phase 2, Gurgaon - 122002', phone: '9999999993', image: 'https://img.freepik.com/free-photo/group-diverse-people-working-together_23-2148817015.jpg' }
        ]);

        console.log('Seeding Achievements...');
        await StudentAchievement.create([
            { title: 'Placed at Google', studentName: 'Rahul Verma', description: 'Rahul completed our Web Development course and landed a 25 LPA package.', image: 'https://img.freepik.com/free-photo/waist-up-portrait-happy-young-male-student_273609-27339.jpg' },
            { title: 'Senior Dev at Microsoft', studentName: 'Sneha Kapur', description: 'Sneha mastered AWS through Axiomae and got promoted within 6 months.', image: 'https://img.freepik.com/free-photo/indoor-shot-pretty-smiling-student-girl_273609-20359.jpg' }
        ]);

        console.log('--- SEEDING COMPLETE ON ATLAS ---');
        process.exit(0);
    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seedData();
