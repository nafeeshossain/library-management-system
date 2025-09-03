const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const usersFilePath = path.join(__dirname, 'users.json');
const booksFilePath = path.join(__dirname, 'books.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readUsersData() {
    try {
        const data = fs.readFileSync(usersFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading users data file:', err);
        return { users: [], borrowedBooks: {} };
    }
}

function writeUsersData(data) {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing users data file:', err);
    }
}

function readBooksData() {
    try {
        const data = fs.readFileSync(booksFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading books data file:', err);
        return { books: [] };
    }
}

function writeBooksData(data) {
    try {
        fs.writeFileSync(booksFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing books data file:', err);
    }
}

app.get('/api/users', (req, res) => {
    const data = readUsersData();
    res.json(data);
});

app.post('/api/users', (req, res) => {
    const newData = req.body;
    writeUsersData(newData);
    res.status(200).send('Users data saved successfully.');
});

app.get('/api/books', (req, res) => {
    const data = readBooksData();
    res.json(data);
});

app.post('/api/books', (req, res) => {
    const newData = req.body;
    writeBooksData(newData);
    res.status(200).send('Books data saved successfully.');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});