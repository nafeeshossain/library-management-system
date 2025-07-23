import streamlit as st
import gspread
import toml
import json
import pandas as pd
from oauth2client.service_account import ServiceAccountCredentials

# ------------------ Load credentials ------------------ #
creds_data = toml.load("creds.toml")
gcp_json = json.loads(creds_data["gcp_service_account"])
sheet_name = creds_data["sheet_name"]

# ------------------ Connect to Google Sheet ------------------ #
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
credentials = ServiceAccountCredentials.from_json_keyfile_dict(gcp_json, scope)
client = gspread.authorize(credentials)
sheet = client.open(sheet_name).sheet1

# ------------------ Streamlit UI ------------------ #
st.title("📚 Library Management System")

menu = ["Add Book", "View All Books", "Delete Book"]
choice = st.sidebar.selectbox("Select Action", menu)

def get_books():
    records = sheet.get_all_records()
    return pd.DataFrame(records)

def add_book(name, author, year):
    sheet.append_row([name, author, str(year)])

def delete_book(index):
    sheet.delete_rows(index + 2)  # +2 because row 1 is header, and 1-based index

# ------------------ Add Book ------------------ #
if choice == "Add Book":
    st.subheader("➕ Add a New Book")
    name = st.text_input("Book Name")
    author = st.text_input("Author")
    year = st.number_input("Year", min_value=1000, max_value=9999, step=1)

    if st.button("Add Book"):
        if name and author and year:
            add_book(name, author, year)
            st.success(f"✅ Book '{name}' added successfully.")
        else:
            st.error("❌ Please fill all fields.")

# ------------------ View All Books ------------------ #
elif choice == "View All Books":
    st.subheader("📖 Book List")
    df = get_books()
    if not df.empty:
        st.dataframe(df)
    else:
        st.info("Library is empty.")

# ------------------ Delete Book ------------------ #
elif choice == "Delete Book":
    st.subheader("❌ Delete Book")
    df = get_books()

    if df.empty:
        st.info("No books to delete.")
    else:
        st.dataframe(df)
        selected = st.number_input("Enter Book Index to Delete (starting from 0)", min_value=0, max_value=len(df)-1, step=1)
        if st.button("Delete"):
            book = df.iloc[selected]["Book Name"]
            delete_book(selected)
            st.success(f"✅ Book '{book}' deleted.")
