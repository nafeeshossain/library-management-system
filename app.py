import streamlit as st
import gspread
import toml
from oauth2client.service_account import ServiceAccountCredentials
import pandas as pd

# Load Google service account credentials from TOML
creds = toml.load("creds.toml")

scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
credentials = ServiceAccountCredentials.from_json_keyfile_dict(creds, scope)
client = gspread.authorize(credentials)

# Streamlit App
st.set_page_config(page_title="📚 Library Manager", page_icon="📖", layout="centered")
st.title("📚 Library Management System")
st.markdown("Manage your book collection using Google Sheets in real time!")

# Input: Google Sheet name
sheet_name = st.text_input("Enter your Google Sheet name", placeholder="LibraryBooks")

if sheet_name:
    try:
        sheet = client.open(sheet_name).sheet1
        data = sheet.get_all_records()
        df = pd.DataFrame(data)

        st.subheader("📖 Current Book List")
        if not df.empty:
            st.dataframe(df)
        else:
            st.info("No books in the library yet.")

        st.subheader("➕ Add a New Book")
        col1, col2 = st.columns(2)
        with col1:
            title = st.text_input("Title")
            author = st.text_input("Author")
        with col2:
            year = st.text_input("Year")
            genre = st.text_input("Genre")

        if st.button("Add Book"):
            if title and author and year and genre:
                sheet.append_row([title, author, year, genre])
                st.success(f"Book '{title}' added!")
                st.experimental_rerun()
            else:
                st.warning("Please fill in all fields.")

        st.subheader("🗑️ Delete a Book")
        book_titles = df["Title"].tolist() if not df.empty else []
        book_to_delete = st.selectbox("Select book to delete", options=["--Select--"] + book_titles)

        if st.button("Delete Book") and book_to_delete != "--Select--":
            cell = sheet.find(book_to_delete)
            if cell:
                sheet.delete_rows(cell.row)
                st.success(f"Book '{book_to_delete}' deleted!")
                st.experimental_rerun()
            else:
                st.error("Book not found.")

    except Exception as e:
        st.error(f"Error: {str(e)}")
