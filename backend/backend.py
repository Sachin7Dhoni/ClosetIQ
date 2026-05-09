from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import pandas as pd
import razorpay

# ---------------- APP ----------------
app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- JWT ----------------
SECRET_KEY = "closetiq_secret"
ALGORITHM = "HS256"

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

# ---------------- FAKE DATABASE ----------------
users_db = {}
db = {}

# ---------------- RAZORPAY ----------------
RAZORPAY_KEY_ID = "rzp_test_SjneKbJaBKw1BW"
RAZORPAY_SECRET = "UFd5i6A5o5h0uurWvKzw7e3C"

client = razorpay.Client(
    auth=(RAZORPAY_KEY_ID, RAZORPAY_SECRET)
)

# ---------------- MODELS ----------------
class User(BaseModel):
    username: str
    password: str


class Item(BaseModel):
    user: str
    product: dict


# ---------------- JWT TOKEN ----------------
def create_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(days=1)

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ---------------- PRODUCTS API ----------------
@app.get("/products")
def get_products():

    df = pd.read_csv("ecommerce_products.csv")

    # TYPE MAPPING
    type_map = {

        # TOPS
        "tank top": "top",
        "crop top": "top",
        "tshirt": "top",
        "hoodie": "top",
        "jacket": "top",
        "shirt": "top",
        "kurta": "top",
        "sweater": "top",

        # BOTTOMS
        "jeans": "bottom",
        "cargo": "bottom",
        "shorts": "bottom",
        "skirt": "bottom",
        "leggings": "bottom",
        "trousers": "bottom",

        # SHOES
        "sneakers": "shoes",
        "heels": "shoes",
        "boots": "shoes",
        "sandals": "shoes",

        # FULL OUTFITS
        "dress": "full",
        "gown": "full"
    }

    # CREATE TYPE COLUMN AUTOMATICALLY
    df["type"] = (
        df["category"]
        .str.lower()
        .map(type_map)
    )

    # FILL EMPTY TYPES
    df["type"] = df["type"].fillna("other")

    return df.to_dict(orient="records")


# ---------------- SIGNUP ----------------
@app.post("/signup")
def signup(user: User):

    if user.username in users_db:

        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    hashed = pwd_context.hash(user.password[:72])

    users_db[user.username] = {
        "username": user.username,
        "password": hashed
    }

    return {
        "msg": "Signup success"
    }


# ---------------- LOGIN ----------------
@app.post("/login")
def login(user: User):

    db_user = users_db.get(user.username)

    if not db_user:

        raise HTTPException(
            status_code=400,
            detail="Invalid username"
        )

    if not pwd_context.verify(
        user.password[:72],
        db_user["password"]
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid password"
        )

    token = create_token({
        "sub": user.username
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# ---------------- CART ----------------
@app.post("/cart/add")
def add_cart(item: Item):

    db.setdefault(
        item.user,
        {"cart": [], "wishlist": []}
    )

    db[item.user]["cart"].append(item.product)

    return {
        "msg": "added"
    }


@app.get("/cart/{user}")
def get_cart(user: str):

    return db.get(
        user,
        {"cart": []}
    )["cart"]


# ---------------- WISHLIST ----------------
@app.post("/wishlist/toggle")
def toggle_wishlist(item: Item):

    db.setdefault(
        item.user,
        {"cart": [], "wishlist": []}
    )

    wishlist = db[item.user]["wishlist"]

    if item.product in wishlist:
        wishlist.remove(item.product)

    else:
        wishlist.append(item.product)

    return {
        "wishlist": wishlist
    }


# ---------------- CREATE ORDER ----------------
@app.post("/create-order")
async def create_order(request: Request):

    data = await request.json()

    amount = int(data["amount"]) * 100

    order = client.order.create({
        "amount": amount,
        "currency": "INR",
        "payment_capture": 1
    })

    return {
        "order_id": order["id"],
        "amount": amount,
        "key": RAZORPAY_KEY_ID
    }


# ---------------- VERIFY PAYMENT ----------------
@app.post("/verify-payment")
async def verify_payment(request: Request):

    data = await request.json()

    params = {
        "razorpay_order_id": data["order_id"],
        "razorpay_payment_id": data["payment_id"],
        "razorpay_signature": data["signature"]
    }

    try:

        client.utility.verify_payment_signature(params)

        return {
            "status": "success"
        }

    except:

        return {
            "status": "failed"
        }