import sqlite3

def update_schema():
    conn = sqlite3.connect('scholarships.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN deskripsi_diri TEXT")
        print("Added deskripsi_diri")
    except sqlite3.OperationalError as e:
        print("Column deskripsi_diri might already exist:", e)

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN foto_profil VARCHAR")
        print("Added foto_profil")
    except sqlite3.OperationalError as e:
        print("Column foto_profil might already exist:", e)
        
    conn.commit()
    conn.close()

if __name__ == '__main__':
    update_schema()
