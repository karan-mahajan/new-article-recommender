const mongoose = require('mongoose');
const User = require('./model/userSchema');
const bcrypt = require("bcrypt");
const Recommendation = require('./model/userRecommendation');
const axios = require('axios');
const ReadArticle = require('./model/readArticle');
const saltRounds = 10

const hashPassword = async (password) => {
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        return hash;
    } catch (error) {
        console.error(err.message);
    }
}

function generateRandomNumbers() {
    const minNumber = 1;
    const maxNumber = 4000;
    const arrayLength = Math.floor(Math.random() * 10) + 1;

    const randomNumbers = Array.from({ length: arrayLength }, () => {
        return Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    });

    return randomNumbers;
}

function generateRandomFirstName() {
    const firstNames = ['Alice', 'Bob', 'Charlie', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Isabel', 'Jack', 'Katherine', 'Leo', 'Mia', 'Nathan', 'Olivia', 'Percy', 'Quinn', 'Rachel', 'Samuel', 'Tessa', 'Ulysses', 'Violet', 'Winston', 'Xena', 'Yasmine', 'Zachary'];
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    return `${randomFirstName}`;
}

function generateRandomLastName() {
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Clark', 'Lewis', 'Lee', 'Walker', 'Hall', 'Young', 'Hill', 'Allen'];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${randomLastName}`;
}


async function populateData() {
    try {
        await mongoose.connect('mongodb+srv://karanmahajan:karan@cluster0.h6yc9uf.mongodb.net/adt', {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
        console.log("Connected to mongodb");
        console.log("Populating the Data");

        const newPassword = await hashPassword('password');

        await User.deleteMany({});
        await Recommendation.deleteMany({});
        await ReadArticle.deleteMany({});

        const promises = [];

        for (let i = 1; i < 50; i++) {
            const first = generateRandomFirstName();
            const last = generateRandomLastName();
            // sample users
            const user = await User.create({
                firstName: first,
                lastName: last,
                email: `${first}.${last}${i}@example.com`,
                password: newPassword,
                mobile: 8375022778,
                dob: '1990-05-24'
            });
            const resultArray = generateRandomNumbers();
            const num = Math.floor(Math.random() * 15) + 1;
            const recommResponse = await axios.post(`http://127.0.0.1:8000/recommend/${num}`, {
                articleIds: resultArray
            });
            const recomArticle = recommResponse.data.recommended_articles;
            resultArray.map(async (val) => {
                const data = {
                    name: `${user.firstName} ${user.lastName}`,
                    user: user._id,
                    readArticle: val,
                }
                await ReadArticle.create(data);
            });
            recomArticle.map(async (val) => {
                const data = {
                    name: `${user.firstName} ${user.lastName}`,
                    user: user._id,
                    recommendation: val.Article_Id,
                    author: val.Author
                }
                await Recommendation.create(data);
                // promises.push(recommendationPromise);
            })

        }

        await Promise.all(promises);

        console.log("Data Populated");
        // mongoose.disconnect();
    } catch (error) {
        console.log(`error while connecting mongodb : ${error}`);
    }
}

populateData();
