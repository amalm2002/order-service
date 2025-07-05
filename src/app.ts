import {Application} from 'express'
import connectDB from './config/mongo.config'
import express from 'express'
import http from "http";
import 'dotenv/config'
import RabbitMQClient from './messaging/rabbitmq/client'

const PORT=process.env.PORT

class App {
    public app:Application;
    public server;
    constructor() {
        this.app=express()
        this.server=http.createServer(this.app)
        this.server.listen(PORT,()=>{
            console.log(`server running on http://localhost:${PORT}`);
            
        })

        RabbitMQClient.initialize()
        connectDB()
    }
}

export default App