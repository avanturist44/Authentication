import express from "express";
import mysql from "mysql"
import cors from "cors"
import 'dotenv/config'

const app = express()

app.use(express.json())
app.use(cors())

const db = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

app.post('/register', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    
    db.query("INSERT INTO Users (username,password) VALUES (?,?)", [username, password], (err, result)=> {
        console.log(err);
    })
})

app.post('/login', (req,res) => {
    const username = req.body.username
    const password = req.body.password

    db.query("SELECT * FROM Users WHERE username = ? AND password = ?", [username, password], (err, result)=> {
        if(err) {
          res.send({err})
        } if (result.length > 0) {
              res.send(result)
            } else {
                res.send({message: "Wrong username/password combination"})
            }
        }
    ) 
})

app.listen(3001, ()=>{
    console.log("Connected to backend!")
})