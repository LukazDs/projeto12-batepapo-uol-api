import express from 'express';
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect(() => {
    db = mongoClient.db("api_uol");
})

const server = express();

server.use(express.json());
server.use(cors());

const userSchema = joi.object({ name: joi.string().required() }); /// colocar latusers

server.post("/participants", async (req, res) => {
    const userName = req.body;

    const validation = userSchema.validate(userName, {abortEarly: true});

    if(validation.error) {
        res.sendStatus(422);
        return;
    }

    try {
        const nowUsers = await db.collection('users').find().toArray();

        if(nowUsers.some(v => v.name === userName.name)) {
            res.sendStatus(409);
            return;
        }

        await db.collection("users").insertOne({...userName, lastStatus: Date.now()});
        
        console.log(nowUsers);
        
        res.sendStatus(201);

    } catch(error) {
        console.log(error)
    }

})

server.listen(5000);
