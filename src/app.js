import express from 'express';
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI_);
let db;

mongoClient.connect(() => {
    db = mongoClient.db("api_uol")
})

const server = express();

server.use(express.json());
server.use(cors());

const user = {name: 'João', lastStatus: 12313123};
const message = {
        from: 'João', 
        to: 'Todos', 
        text: 'oi galera', 
        type: 'message', 
        time: '20:04:37'};

server.listen(5000);
