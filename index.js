const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5rfsc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const bookingCollection = client
      .db("infiniteTourism")
      .collection("touristSpots");
    app.post("/addBooking", (req, res) => {
      const name = req.body.name;
      const number = req.body.number;
      const email = req.body.email;
      const message = req.body.message;
      const spot = req.body.spot;
      const price = req.body.price;
      const status = req.body.status;

      bookingCollection
        .insertOne({ name, number, email, message, spot, price, status })
        .then((result) => {
          res.send(result.insertedCount > 0);
        })
        .catch((error) => {
          console.log(error);
        });
    });

    //get single users booking
    app.get("/bookings", (req, res) => {
      bookingCollection
        .find({ email: req.query.email })
        .toArray((err, docs) => {
          res.send(docs);
        });
    });

    //get all users booking
    app.get("/allBookings", (req, res) => {
      bookingCollection.find({}).toArray((err, docs) => res.send(docs));
    });

    app.patch("/update/:id", (req, res) => {
      bookingCollection
        .updateOne(
          { _id: ObjectId(req.params.id) },
          {
            $set: { status: req.body.status },
          }
        )
        .then((result) => res.send(result.modifiedCount > 0));
    });

    const spotCollection = client.db("infiniteTourism").collection("services");
    //delete a spot

    app.delete("/removeSpot/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await spotCollection.deleteOne(query);
      res.send(result);
    });

    //Add new spot to the services

    app.post("/services", async (req, res) => {
      const service = req.body;

      const result = await spotCollection.insertOne(service);
      // console.log(result);
      res.json(result);
    });

    //get all spots from database
    app.get("/spots", (req, res) => {
      spotCollection.find({}).toArray((err, docs) => res.send(docs));
    });
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("Dream World server is running");
});

app.listen(port, () => console.log(`Dream World running on ${port}`));
