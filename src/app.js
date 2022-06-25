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

server.listen(5000)
