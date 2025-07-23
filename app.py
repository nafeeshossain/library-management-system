import streamlit as st
import json

# ----- Book Class -----
class Book:
    def __init__(self, title, author, copies=1):
        self.title = title
        self.author = author
        self.copies = copies

    def to_dict(self):
        return {"title": self.title, "author": self.author, "copies": self.copies}

    @staticmethod
    def from_dict(data):
        return Book(data["title"], data["author"], data["copies"])

# ----- Library Class -----
class Library:
    def __init__(self):
        self.books = []

    def load_data(self, filename="library.json"):
        try:
            with open(filename, "r") as file:
                data = json.load(file)
                self.books = [Book.from_dict(b) for b in data]
        except FileNotFoundError:
            self.books = []

    def save_data(self, filename="library.json"):
        with open(filename, "w") as file:
            json.dump([book.to_dict() for book in self.books], file, indent=4)

    def add_book(self, title, author, copies=1):
        for book in self.books:
            if book.title.lower() == title.lower():
                book.copies += copies
                return f"Updated copies of '{title}'."
        self.books.append(Book(title, author, copies))
        return f"Added book '{title}'."

    def view_books(self):
        return [f"{i+1}. {b.title} by {b.author} - {b.copies} copy(ies)" for i, b in enumerate(self.books)]

    def borrow_book(self, title):
        for book in self.books:
            if book.title.lower() == title.lower():
                if book.copies > 0:
                    book.copies -= 1
                    return f"You borrowed '{title}'."
                return f"'{title}' is not available now."
        return f"'{title}' not found."

    def return_book(self, title):
        for book in self.books:
            if book.title.lower() == title.lower():
                book.copies += 1
                return f"You returned '{title}'."
        return self.add_book(title, "Unknown")

    def remove_book(self, title):
        for book in self.books:
            if book.title.lower() == title.lower():
                self.books.remove(book)
                return f"Removed '{title}'."
        return f"'{title}' not found."

# ----- Streamlit UI -----
st.title("📚 Library Management System")
lib = Library()
lib.load_data()

option = st.sidebar.selectbox("Select an option", ["View Books", "Add Book", "Borrow Book", "Return Book", "Remove Book"])

if option == "View Books":
    st.subheader("Available Books")
    books = lib.view_books()
    if books:
        st.write("\n".join(books))
    else:
        st.info("No books in the library.")

elif option == "Add Book":
    st.subheader("Add a New Book")
    title = st.text_input("Title")
    author = st.text_input("Author")
    copies = st.number_input("Copies", min_value=1, value=1)
    if st.button("Add Book"):
        result = lib.add_book(title, author, copies)
        lib.save_data()
        st.success(result)

elif option == "Borrow Book":
    st.subheader("Borrow a Book")
    title = st.text_input("Title of the book to borrow")
    if st.button("Borrow"):
        result = lib.borrow_book(title)
        lib.save_data()
        st.success(result)

elif option == "Return Book":
    st.subheader("Return a Book")
    title = st.text_input("Title of the book to return")
    if st.button("Return"):
        result = lib.return_book(title)
        lib.save_data()
        st.success(result)

elif option == "Remove Book":
    st.subheader("Remove a Book")
    title = st.text_input("Title of the book to remove")
    if st.button("Remove"):
        result = lib.remove_book(title)
        lib.save_data()
        st.success(result)
