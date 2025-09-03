const modal = document.getElementById("myModal");
const modalMessage = document.getElementById("modal-message");
const closeBtn = document.getElementsByClassName("close-btn")[0];

function showModal(message) {
    modalMessage.textContent = message;
    modal.style.display = "block";
}
closeBtn.onclick = function() {
    modal.style.display = "none";
}
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

const LIBRARIAN_PASSWORD = "mysecretpassword123";
let users = [];
let books = [];
let borrowedBooks = {};
let currentUser = null;

const authSection = document.getElementById('auth-section');
const librarianDashboard = document.getElementById('librarian-dashboard');
const readerDashboard = document.getElementById('reader-dashboard');
const logoutBtn = document.getElementById('logout-btn');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const signupRoleSelect = document.getElementById('signup-role');
const librarianPassInput = document.getElementById('librarian-pass-input');
const addBookForm = document.getElementById('add-book-form');
const librarianBookList = document.getElementById('librarian-book-list');
const readerBookList = document.getElementById('reader-book-list');
const borrowedBooksContainer = document.getElementById('borrowed-books-container');
const recommendationsContainer = document.getElementById('recommendations-container');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

async function fetchAllData() {
    try {
        const [usersResponse, booksResponse] = await Promise.all([
            fetch('/api/users'),
            fetch('/api/books')
        ]);
        if (!usersResponse.ok || !booksResponse.ok) throw new Error('Network response was not ok');
        const usersData = await usersResponse.json();
        const booksData = await booksResponse.json();
        users = usersData.users || [];
        books = booksData.books || [];
        borrowedBooks = usersData.borrowedBooks || {};
        updateUI();
    } catch (error) {
        console.error('Failed to fetch data:', error);
        showModal('Failed to load data from server.');
    }
}

async function saveUsersData() {
    const data = { users, borrowedBooks };
    try {
        await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    } catch (error) {
        console.error('Failed to save user data:', error);
        showModal('Failed to save user data to server.');
    }
}

async function saveBooksData() {
    const data = { books };
    try {
        await fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    } catch (error) {
        console.error('Failed to save book data:', error);
        showModal('Failed to save book data to server.');
    }
}

function showSection(section) {
    authSection.classList.add('hidden');
    librarianDashboard.classList.add('hidden');
    readerDashboard.classList.add('hidden');
    section.classList.remove('hidden');
}

function updateUI() {
    if (currentUser) {
        logoutBtn.style.display = 'block';
        if (currentUser.role === 'librarian') {
            showSection(librarianDashboard);
            renderLibrarianBooks();
        } else {
            showSection(readerDashboard);
            renderReaderBooks(books);
            renderBorrowedBooks();
            renderRecommendations();
        }
    } else {
        showSection(authSection);
        logoutBtn.style.display = 'none';
    }
}

signupRoleSelect.addEventListener('change', () => {
    if (signupRoleSelect.value === 'librarian') {
        librarianPassInput.style.display = 'block';
    } else {
        librarianPassInput.style.display = 'none';
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        showModal(`Welcome back, ${currentUser.name}!`);
        updateUI();
    } else {
        showModal('Invalid email or password.');
    }
});

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const role = signupRoleSelect.value;
    const librarianPass = document.getElementById('librarian-pass-input').value;

    if (users.some(u => u.email === email)) {
        showModal('An account with this email already exists.');
        return;
    }
    if (role === 'librarian' && librarianPass !== LIBRARIAN_PASSWORD) {
        showModal('Incorrect librarian password.');
        return;
    }
    const newUser = { id: Date.now(), name, email, password, role };
    users.push(newUser);
    await saveUsersData();
    showModal('Account created successfully! Please log in.');
    signupForm.reset();
});

logoutBtn.addEventListener('click', () => {
    currentUser = null;
    updateUI();
});

function renderLibrarianBooks() {
    librarianBookList.innerHTML = '';
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');
        bookCard.innerHTML = `
            <img src="${book.image}" alt="${book.title}">
            <h4>${book.title}</h4>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>Copies:</strong> ${book.copies}</p>
            <p><strong>Year:</strong> ${book.year}</p>
            <div class="librarian-actions">
                <button onclick="editBook(${book.id})">Edit</button>
                <button onclick="deleteBook(${book.id})">Delete</button>
            </div>
        `;
        librarianBookList.appendChild(bookCard);
    });
}

addBookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('book-id-input').value;
    const title = document.getElementById('book-name-input').value;
    const author = document.getElementById('book-author-input').value;
    const copies = parseInt(document.getElementById('book-copies-input').value);
    const image = document.getElementById('book-photo-input').value;
    const year = new Date(document.getElementById('book-date-input').value).getFullYear();
    
    if (id) {
        const bookIndex = books.findIndex(b => b.id == id);
        if (bookIndex > -1) {
            books[bookIndex] = { ...books[bookIndex], title, author, copies, image, year };
        }
    } else {
        const newBook = { id: Date.now(), title, author, copies, image, year };
        books.push(newBook);
    }
    await saveBooksData();
    addBookForm.reset();
    document.getElementById('book-id-input').value = '';
    document.querySelector('#add-book-form button').textContent = 'Add Book';
    renderLibrarianBooks();
});

function editBook(id) {
    const book = books.find(b => b.id === id);
    if (book) {
        document.getElementById('book-id-input').value = book.id;
        document.getElementById('book-name-input').value = book.title;
        document.getElementById('book-author-input').value = book.author;
        document.getElementById('book-copies-input').value = book.copies;
        document.getElementById('book-photo-input').value = book.image;
        document.getElementById('book-date-input').value = `${book.year}-01-01`;
        document.querySelector('#add-book-form button').textContent = 'Update Book';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

async function deleteBook(id) {
    if (confirm('Are you sure you want to delete this book?')) {
        const bookIndex = books.findIndex(b => b.id === id);
        if (bookIndex > -1) {
            books.splice(bookIndex, 1);
            await saveBooksData();
            renderLibrarianBooks();
            showModal('Book deleted successfully.');
        }
    }
}

function renderReaderBooks(bookArray) {
    readerBookList.innerHTML = '';
    if (bookArray.length === 0) {
        readerBookList.innerHTML = '<p>No books found.</p>';
        return;
    }
    bookArray.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');
        const isBorrowed = (borrowedBooks[currentUser.id] || []).some(b => b.bookId === book.id);
        const copiesAvailable = book.copies > 0;
        bookCard.innerHTML = `
            <img src="${book.image}" alt="${book.title}">
            <h4>${book.title}</h4>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>Copies:</strong> ${book.copies}</p>
            <p><strong>Year:</strong> ${book.year}</p>
            <button ${isBorrowed || !copiesAvailable ? 'disabled' : ''} onclick="borrowBook(${book.id})">
                ${isBorrowed ? 'Already Borrowed' : (copiesAvailable ? 'Borrow' : 'No Copies Left')}
            </button>
        `;
        readerBookList.appendChild(bookCard);
    });
}

function renderBorrowedBooks() {
    borrowedBooksContainer.innerHTML = '';
    const userBorrowed = borrowedBooks[currentUser.id] || [];
    if (userBorrowed.length === 0) {
        borrowedBooksContainer.innerHTML = '<p>You have not borrowed any books yet.</p>';
        return;
    }
    userBorrowed.forEach(borrowed => {
        const book = books.find(b => b.id === borrowed.bookId);
        if (book) {
            const borrowedCard = document.createElement('div');
            borrowedCard.classList.add('book-card');
            borrowedCard.innerHTML = `
                <img src="${book.image}" alt="${book.title}">
                <h4>${book.title}</h4>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>Borrowed Date:</strong> ${borrowed.borrowDate}</p>
                <button onclick="returnBook(${borrowed.bookId})">Return</button>
            `;
            borrowedBooksContainer.appendChild(borrowedCard);
        }
    });
}

async function borrowBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (book && book.copies > 0) {
        if (!borrowedBooks[currentUser.id]) {
            borrowedBooks[currentUser.id] = [];
        }
        if (borrowedBooks[currentUser.id].some(b => b.bookId === bookId)) {
            showModal('You have already borrowed this book.');
            return;
        }
        book.copies -= 1;
        borrowedBooks[currentUser.id].push({ bookId, borrowDate: new Date().toLocaleDateString() });
        await saveBooksData();
        await saveUsersData();
        showModal(`You have successfully borrowed "${book.title}".`);
        updateUI();
    } else {
        showModal('Sorry, no copies of this book are available.');
    }
}

async function returnBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    const userBorrowed = borrowedBooks[currentUser.id];
    const borrowedIndex = userBorrowed.findIndex(b => b.bookId === bookId);
    if (borrowedIndex > -1) {
        book.copies += 1;
        userBorrowed.splice(borrowedIndex, 1);
        await saveBooksData();
        await saveUsersData();
        showModal(`You have successfully returned "${book.title}".`);
        updateUI();
    }
}

function getRecommendations() {
    const userBorrowed = borrowedBooks[currentUser.id] || [];
    if (userBorrowed.length === 0) {
        return [];
    }
    const borrowedBookIds = userBorrowed.map(b => b.bookId);
    const borrowedAuthors = [...new Set(borrowedBookIds.map(id => books.find(b => b.id === id)?.author).filter(Boolean))];
    const recommendedBooks = books.filter(book => 
        !borrowedBookIds.includes(book.id) && 
        borrowedAuthors.includes(book.author)
    );
    return recommendedBooks;
}

function renderRecommendations() {
    recommendationsContainer.innerHTML = '';
    const recommendedBooks = getRecommendations();
    if (recommendedBooks.length === 0) {
        recommendationsContainer.innerHTML = '<p>No new recommendations based on your borrowed books.</p>';
    } else {
        renderReaderBooksInContainer(recommendedBooks, recommendationsContainer);
    }
}

searchBtn.addEventListener('click', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm) || 
        book.author.toLowerCase().includes(searchTerm)
    );
    renderReaderBooks(filteredBooks);
});

function renderReaderBooksInContainer(bookArray, container) {
    container.innerHTML = '';
    bookArray.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');
        const isBorrowed = (borrowedBooks[currentUser.id] || []).some(b => b.bookId === book.id);
        const copiesAvailable = book.copies > 0;
        bookCard.innerHTML = `
            <img src="${book.image}" alt="${book.title}">
            <h4>${book.title}</h4>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>Copies:</strong> ${book.copies}</p>
            <p><strong>Year:</strong> ${book.year}</p>
            <button ${isBorrowed || !copiesAvailable ? 'disabled' : ''} onclick="borrowBook(${book.id})">
                ${isBorrowed ? 'Already Borrowed' : (copiesAvailable ? 'Borrow' : 'No Copies Left')}
            </button>
        `;
        container.appendChild(bookCard);
    });
}

fetchAllData();