import express from 'express';
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import dayjs from "dayjs";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect(() => {
    db = mongoClient.db("api_uol");
})

const server = express();

server.use(express.json());
server.use(cors());

const userSchema = joi.object({ name: joi.string().required() });

const messageSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().required(),
    from: joi.string().required()
});

server.get("/participants", async (req, res) => {

    const nowUsers = await db.collection('users').find().toArray();
    res.send(nowUsers)

})

server.post("/participants", async (req, res) => {
    const userName = req.body;

    const validation = userSchema.validate(userName, { abortEarly: true });

    if (validation.error) {
        res.sendStatus(422);
        return;
    }

    try {

        const nowUsers = await db.collection('users').find().toArray();

        if (nowUsers.some(v => v.name === userName.name)) {
            res.sendStatus(409);
            return;
        }

        await db.collection("users").insertOne({ ...userName, lastStatus: Date.now() });

        const time = `${dayjs().hour()}:${dayjs().minute()}:${dayjs().second()}`

        await db.collection("messages").insertOne({
            from: userName.name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: time
        })

        res.sendStatus(201);

    } catch (error) {
        console.log(error);
    }

})

server.get("/messages", async (req, res) => {

    const user = req.headers.user;

    const nowMessages = await db.collection('messages').find().toArray();

    const limit = (req.query.limit !== undefined)
        ? Number(req.query.limit) : nowMessages.length;

    nowMessages.reverse();

    const filterMsg = nowMessages.filter(v => v.to === user || v.from === user || v.to === "Todos")

    res.send(filterMsg.slice(0, limit));

})

server.post("/messages", async (req, res) => {

    const nowUsers = await db.collection('users').find().toArray();
    const from = req.headers.user;
    const partMessage = req.body;

    const types = ["message", "private_message"];

    if (!nowUsers.some(v => v.name === from)) {
        res.sendStatus(422);
        return;
    }

    if (!types.some(v => v === partMessage.type)) {
        res.sendStatus(422);
        return;
    }

    const message = { ...partMessage, from };
    const validation = messageSchema.validate(message, { abortEarly: true })

    if (validation.error) {
        res.sendStatus(422);
        return;
    }

    try {

        const time = `${dayjs().hour()}:${dayjs().minute()}:${dayjs().second()}`
        await db.collection("messages").insertOne({ ...message, time })

        res.sendStatus(201);

    } catch (error) {
        console.log(error);
    }
})

server.post("/status", async (req, res) => {
    const name = req.headers.user;
    const users = await db.collection("users")
    const nowUserFilter = await users.findOne({ name });

    if (!nowUserFilter) {
        res.sendStatus(404);
        return;
    }

    try {
        const filter = { name };
        const options = { upsert: true };
    
        const updateDoc = {
    
          $set: {
    
            lastStatus: Date.now()
    
          },
    
        };
    
        await users.updateOne(filter, updateDoc, options);
    
        res.sendStatus(200);

    } catch(error) {
        console.log(error);
    }

})

server.listen(5000);
