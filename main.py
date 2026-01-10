import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import time
from datetime import datetime, timedelta
from pathlib import Path

import jwt
import uvicorn
from fastapi import Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles
from fastapi_offline import FastAPIOffline
from pydantic import BaseModel, Field
from starlette.exceptions import HTTPException as StarletteHTTPException

app = FastAPIOffline(title="MindMaster思维导图大师API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_PATH = os.environ.get("MINDMASTER_DB", "data/mindmaster.db")
JWT_SECRET = os.environ.get("JWT_SECRET", "change-me-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 7
PASSWORD_ITERATIONS = 200_000

security = HTTPBearer()


class AuthPayload(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=128)


class TokenResponse(BaseModel):
    token: str
    username: str


class SyncPushRequest(BaseModel):
    data: dict
    client_updated_at: int | None = None


class SyncPullResponse(BaseModel):
    data: dict | None
    updated_at: int | None


class FileCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    data: dict


class FileRenameRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)


class FileUpdateRequest(BaseModel):
    data: dict


class FileResponse(BaseModel):
    id: int
    name: str
    created_at: int
    updated_at: int


class FileDetailResponse(FileResponse):
    data: dict


class PasswordResetRequest(BaseModel):
    password: str = Field(..., min_length=6, max_length=128)


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(..., min_length=6, max_length=128)
    new_password: str = Field(..., min_length=6, max_length=128)


class SPAStaticFiles(StaticFiles):
    async def get_response(self, path, scope):
        try:
            response = await super().get_response(path, scope)
        except StarletteHTTPException as exc:
            if exc.status_code == 404:
                return await super().get_response("index.html", scope)
            raise
        if response.status_code == 404:
            return await super().get_response("index.html", scope)
        return response


def get_db():
    db_dir = os.path.dirname(DATABASE_PATH)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at INTEGER NOT NULL
            )
            """
        )
        columns = conn.execute("PRAGMA table_info(users)").fetchall()
        column_names = {col["name"] for col in columns}
        if "is_admin" not in column_names:
            conn.execute("ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS mindmaps (
                user_id INTEGER PRIMARY KEY,
                data_json TEXT NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                data_json TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
            """
        )
        conn.commit()
    finally:
        conn.close()


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS)
    return f"{salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt_hex, digest_hex = stored.split("$", 1)
    except ValueError:
        return False
    salt = bytes.fromhex(salt_hex)
    expected = bytes.fromhex(digest_hex)
    candidate = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS)
    return hmac.compare_digest(candidate, expected)


def create_token(user_id: int, username: str) -> str:
    expires = datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS)
    payload = {"sub": str(user_id), "username": username, "exp": expires}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired") from exc
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
    user_id = int(payload.get("sub", "0"))
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT id, username, is_admin FROM users WHERE id = ?", (user_id,)
        ).fetchone()
    finally:
        conn.close()
    if not row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return {"id": row["id"], "username": row["username"], "is_admin": row["is_admin"]}


def require_admin(current_user=Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return current_user


def ensure_admin_account():
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT id, is_admin FROM users WHERE username = ?", ("admin",)
        ).fetchone()
        if row:
            if not row["is_admin"]:
                conn.execute("UPDATE users SET is_admin = 1 WHERE id = ?", (row["id"],))
                conn.commit()
            return
        password_hash = hash_password("password")
        created_at = int(time.time())
        conn.execute(
            "INSERT INTO users (username, password_hash, created_at, is_admin) VALUES (?, ?, ?, 1)",
            ("admin", password_hash, created_at),
        )
        conn.commit()
    finally:
        conn.close()


@app.on_event("startup")
def startup():
    init_db()
    ensure_admin_account()


@app.get("/api/health")
def health():
    return {"status": "ok", "timestamp": int(time.time())}


@app.post("/api/auth/register", response_model=TokenResponse)
def register(payload: AuthPayload):
    conn = get_db()
    try:
        exists = conn.execute(
            "SELECT 1 FROM users WHERE username = ?", (payload.username,)
        ).fetchone()
        if exists:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
        password_hash = hash_password(payload.password)
        created_at = int(time.time())
        cursor = conn.execute(
            "INSERT INTO users (username, password_hash, created_at, is_admin) VALUES (?, ?, ?, 0)",
            (payload.username, password_hash, created_at),
        )
        conn.commit()
        user_id = cursor.lastrowid
    finally:
        conn.close()
    token = create_token(user_id, payload.username)
    return TokenResponse(token=token, username=payload.username)


@app.post("/api/auth/login", response_model=TokenResponse)
def login(payload: AuthPayload):
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT id, username, password_hash FROM users WHERE username = ?",
            (payload.username,),
        ).fetchone()
    finally:
        conn.close()
    if not row or not verify_password(payload.password, row["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    token = create_token(row["id"], row["username"])
    return TokenResponse(token=token, username=row["username"])


@app.get("/api/auth/me")
def me(current_user=Depends(get_current_user)):
    return current_user


@app.post("/api/auth/reset-password")
def reset_password(payload: PasswordChangeRequest, current_user=Depends(get_current_user)):
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT password_hash FROM users WHERE id = ?",
            (current_user["id"],),
        ).fetchone()
        if not row or not verify_password(payload.current_password, row["password_hash"]):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
        password_hash = hash_password(payload.new_password)
        conn.execute(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            (password_hash, current_user["id"]),
        )
        conn.commit()
    finally:
        conn.close()
    return {"status": "ok"}


@app.get("/api/files", response_model=list[FileResponse])
def list_files(current_user=Depends(get_current_user)):
    conn = get_db()
    try:
        rows = conn.execute(
            """
            SELECT id, name, created_at, updated_at
            FROM files
            WHERE user_id = ?
            ORDER BY updated_at DESC
            """,
            (current_user["id"],),
        ).fetchall()
    finally:
        conn.close()
    return [FileResponse(**dict(row)) for row in rows]


@app.post("/api/files", response_model=FileDetailResponse)
def create_file(payload: FileCreateRequest, current_user=Depends(get_current_user)):
    conn = get_db()
    try:
        now = int(time.time())
        data_json = json.dumps(payload.data, ensure_ascii=False)
        cursor = conn.execute(
            """
            INSERT INTO files (user_id, name, data_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (current_user["id"], payload.name, data_json, now, now),
        )
        conn.commit()
        file_id = cursor.lastrowid
    finally:
        conn.close()
    return FileDetailResponse(
        id=file_id,
        name=payload.name,
        created_at=now,
        updated_at=now,
        data=payload.data,
    )


@app.get("/api/files/{file_id}", response_model=FileDetailResponse)
def get_file(file_id: int, current_user=Depends(get_current_user)):
    conn = get_db()
    try:
        row = conn.execute(
            """
            SELECT id, name, data_json, created_at, updated_at
            FROM files
            WHERE id = ? AND user_id = ?
            """,
            (file_id, current_user["id"]),
        ).fetchone()
    finally:
        conn.close()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return FileDetailResponse(
        id=row["id"],
        name=row["name"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
        data=json.loads(row["data_json"]),
    )


@app.put("/api/files/{file_id}/rename", response_model=FileResponse)
def rename_file(file_id: int, payload: FileRenameRequest, current_user=Depends(get_current_user)):
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT id, created_at FROM files WHERE id = ? AND user_id = ?",
            (file_id, current_user["id"]),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
        updated_at = int(time.time())
        conn.execute(
            "UPDATE files SET name = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            (payload.name, updated_at, file_id, current_user["id"]),
        )
        conn.commit()
    finally:
        conn.close()
    return FileResponse(
        id=file_id,
        name=payload.name,
        created_at=row["created_at"],
        updated_at=updated_at,
    )


@app.put("/api/files/{file_id}/data", response_model=FileResponse)
def update_file(file_id: int, payload: FileUpdateRequest, current_user=Depends(get_current_user)):
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT id, name, created_at FROM files WHERE id = ? AND user_id = ?",
            (file_id, current_user["id"]),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
        updated_at = int(time.time())
        data_json = json.dumps(payload.data, ensure_ascii=False)
        conn.execute(
            "UPDATE files SET data_json = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            (data_json, updated_at, file_id, current_user["id"]),
        )
        conn.commit()
    finally:
        conn.close()
    return FileResponse(
        id=file_id,
        name=row["name"],
        created_at=row["created_at"],
        updated_at=updated_at,
    )


@app.delete("/api/files/{file_id}")
def delete_file(file_id: int, current_user=Depends(get_current_user)):
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT id FROM files WHERE id = ? AND user_id = ?",
            (file_id, current_user["id"]),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
        conn.execute(
            "DELETE FROM files WHERE id = ? AND user_id = ?",
            (file_id, current_user["id"]),
        )
        conn.commit()
    finally:
        conn.close()
    return {"status": "ok"}


@app.get("/api/sync/pull", response_model=SyncPullResponse)
def sync_pull(current_user=Depends(get_current_user)):
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT data_json, updated_at FROM mindmaps WHERE user_id = ?",
            (current_user["id"],),
        ).fetchone()
    finally:
        conn.close()
    if not row:
        return SyncPullResponse(data=None, updated_at=None)
    return SyncPullResponse(data=json.loads(row["data_json"]), updated_at=row["updated_at"])


@app.post("/api/sync/push")
def sync_push(payload: SyncPushRequest, current_user=Depends(get_current_user)):
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT updated_at FROM mindmaps WHERE user_id = ?",
            (current_user["id"],),
        ).fetchone()
        if row and payload.client_updated_at is not None:
            if row["updated_at"] > payload.client_updated_at:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Remote data is newer, pull first",
                )
        updated_at = int(time.time())
        data_json = json.dumps(payload.data, ensure_ascii=False)
        if row:
            conn.execute(
                "UPDATE mindmaps SET data_json = ?, updated_at = ? WHERE user_id = ?",
                (data_json, updated_at, current_user["id"]),
            )
        else:
            conn.execute(
                "INSERT INTO mindmaps (user_id, data_json, updated_at) VALUES (?, ?, ?)",
                (current_user["id"], data_json, updated_at),
            )
        conn.commit()
    finally:
        conn.close()
    return {"updated_at": updated_at}


@app.get("/api/admin/users")
def admin_list_users(admin_user=Depends(require_admin)):
    conn = get_db()
    try:
        rows = conn.execute(
            """
            SELECT u.id, u.username, u.created_at, u.is_admin,
                   COUNT(f.id) AS file_count
            FROM users u
            LEFT JOIN files f ON f.user_id = u.id
            GROUP BY u.id
            ORDER BY u.created_at DESC
            """
        ).fetchall()
    finally:
        conn.close()
    return [dict(row) for row in rows]


@app.post("/api/admin/users/{user_id}/reset-password")
def admin_reset_password(
    user_id: int, payload: PasswordResetRequest, admin_user=Depends(require_admin)
):
    conn = get_db()
    try:
        row = conn.execute("SELECT id FROM users WHERE id = ?", (user_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        password_hash = hash_password(payload.password)
        conn.execute(
            "UPDATE users SET password_hash = ? WHERE id = ?", (password_hash, user_id)
        )
        conn.commit()
    finally:
        conn.close()
    return {"status": "ok"}


@app.get("/api/admin/files")
def admin_list_files(admin_user=Depends(require_admin)):
    conn = get_db()
    try:
        rows = conn.execute(
            """
            SELECT f.id, f.name, f.created_at, f.updated_at, u.username, u.id as user_id
            FROM files f
            JOIN users u ON u.id = f.user_id
            ORDER BY f.updated_at DESC
            """
        ).fetchall()
    finally:
        conn.close()
    return [dict(row) for row in rows]


@app.delete("/api/admin/files/{file_id}")
def admin_delete_file(file_id: int, admin_user=Depends(require_admin)):
    conn = get_db()
    try:
        row = conn.execute("SELECT id FROM files WHERE id = ?", (file_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
        conn.execute("DELETE FROM files WHERE id = ?", (file_id,))
        conn.commit()
    finally:
        conn.close()
    return {"status": "ok"}


STATIC_DIR = Path(__file__).resolve().parent / "frontend" / "dist"
app.mount("/", SPAStaticFiles(directory=str(STATIC_DIR), html=True), name="frontend")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
