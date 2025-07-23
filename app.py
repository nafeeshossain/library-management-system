import streamlit as st
import gspread
import toml
from datetime import datetime

# Load Google API credentials from creds.toml
creds = toml.load("creds.toml")

gc = gspread.service_account_from_dict(creds)
sh = gc.open("LibraryBooks")
worksheet = sh.sheet1

# Helper Functions
def get_books():
    records = worksheet.get_all_records()
    return records

def add_book(title, author, genre, copies):
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    worksheet.append_row([title, author, genre, copies, now])

def delete_book(title):
    data = worksheet.get_all_values()
    for i, row in enumerate(data):
        if row and row[0].lower() == title.lower():
            worksheet.delete_rows(i+1)
            return True
    return False

# Streamlit UI
st.title("📚 Library Management System")

menu = ["Add Book", "View Books", "Delete Book"]
choice = st.sidebar.selectbox("Menu", menu)

if choice == "Add Book":
    st.subheader("➕ Add a New Book")
    title = st.text_input("Book Title")
    author = st.text_input("Author")
    genre = st.text_input("Genre")
    copies = st.number_input("Number of Copies", min_value=1, value=1)

    if st.button("Add Book"):
        if title and author and genre:
            add_book(title, author, genre, copies)
            st.success(f"✅ '{title}' added successfully!")
        else:
            st.warning("⚠️ Please fill all fields!")

elif choice == "View Books":
    st.subheader("📖 View Book List")
    books = get_books()
    if books:
        st.dataframe(books)
    else:
        st.info("No books available.")

elif choice == "Delete Book":
    st.subheader("❌ Delete a Book")
    books = get_books()
    book_titles = [book["title"] for book in books]
    selected = st.selectbox("Select a Book Title", options=book_titles)

    if st.button("Delete Book"):
        if delete_book(selected):
            st.success(f"✅ '{selected}' deleted successfully!")
        else:
            st.error("❌ Book not found.")
