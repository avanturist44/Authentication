import express from "express";
import mysql from "mysql"
import cors from "cors"
import 'dotenv/config'
import bcrypt, { hash } from 'bcrypt'
import bodyParser from "body-parser";
import cookieParser  from "cookie-parser";
import session from "express-session";

const saltRounds = 10

const app = express()
 
app.use(express.json())
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}))
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))

app.use(session({
    key: process.env.key,
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24
    }
}))


const db = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

app.post('/register', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    
    bcrypt.hash(password, saltRounds, (err, hash) => {

        if(err) {
            console.log(err)
        }

        db.query("INSERT INTO Users (username,password) VALUES (?,?)", [username, hash], (err, result)=> {
            console.log(err);
        })
    })
})

app.get('/login', (req, res) => {
    if (req.session.user) {
        res.send({loggedIn: true, user: req.session.user})
    } else {
        res.send({loggedIn: false})
    }
})

app.post('/login', (req,res) => {
    const username = req.body.username
    const password = req.body.password

    db.query("SELECT * FROM Users WHERE username = ?;", username, (err, result)=> {
        if(err) {
          res.send({err})
        } if (result.length > 0) {
              bcrypt.compare(password, result[0].password, (error, response) => {
                if(response){
                    req.session.user = result 
                    console.log(req.session.user)
                    res.send(result)
                } 
                else {
                    res.send({message: "Wrong username/password combination"})
                } 
              })
            } else {
                res.send({message: "User doesn't exist"})
            }
        }
    ) 
})

app.listen(3001, ()=>{
    console.log("Connected to backend!")
})