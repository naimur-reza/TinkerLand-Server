const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();

// middle wares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Pump, Server is Running");
});
console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2cofc5d.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const toysDb = client.db("toysDb").collection("toysCollection");
const toysSub = client.db("toysDb").collection("toySub");
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    // await client.connect();

    // get toys from db
    app.get("/toys", async (req, res) => {
      const search = req.query.search || "";
      const page = parseInt(req.query.page) || 0;
      const skip = page * 20;
      const query = { name: { $regex: search, $options: "i" } };

      const result = await toysDb.find(query).skip(skip).limit(20).toArray();
      res.send(result);
    });

    // post in db
    app.post("/toys", async (req, res) => {
      const body = req.body;
      const result = await toysDb.insertOne(body);
      res.send(result);
    });

    // find single data from db
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await toysDb.findOne(query);
      res.send(result);
    });

    // find my toys data from db
    app.get("/myToys", async (req, res) => {
      const email = req.query.email;
      const sortText = req.query.text;
      const query = { email: email };

      if (sortText == "Price: High To Low") {
        const result = await toysDb.find(query).sort({ price: -1 }).toArray();
        return res.send(result);
      } else if (sortText == "Price: Low To High") {
        const result = await toysDb.find(query).sort({ price: 1 }).toArray();
        return res.send(result);
      }
      console.log(sortText);

      const result = await toysDb.find(query).toArray();
      res.send(result);
    });

    // delete from my toys
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      console.log(id);
      const result = await toysDb.deleteOne(query);
      res.send(result);
    });

    // get sub category items
    app.get("/subToys", async (req, res) => {
      const query = req.query.sub;
      const filter = { sub_category: query };
      const result = await toysDb.find(filter).limit(6).toArray();
      res.send(result);
    });

    // updating single toy from here
    app.patch("/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const body = req.body;
      const updatedToy = {
        $set: {
          ...body,
        },
      };
      const result = await toysDb.updateOne(filter, updatedToy);
      res.send(result);
    });

    // get length of all toys
    app.get("/totalToys", async (req, res) => {
      const result = await toysDb.estimatedDocumentCount();
      res.send({ totalToys: result });
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("Server is running at port", port);
});
