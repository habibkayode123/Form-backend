require("dotenv").config()
const express = require("express")
const app = express()
const uuidv1 = require("uuid/v1")
const nodemailer = require('nodemailer');
const cors = require("cors")

const bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(cors())
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.email,
        pass: process.env.passwoard
    }

});


let {
    Client
} = require("pg");
let client = new Client({
    ssl: true,
    connectionString: "postgres://xhqsgqttgogyht:731c49fa9b4ccf5dcdae839aa6ecf0f1afe3840f31337c89f07b5394284411ff@ec2-174-129-33-75.compute-1.amazonaws.com:5432/d7aj76juks7qk3"
})
client.connect()


app.post("/register", (req, res) => {
    let {
        number,
        email,
        username
    } = req.body
    let uuid = uuidv1().split("-")[4].slice(2)
    console.log("i am here",email,number,username)
    client.query("INSERT INTO user_info (number,email,username,uuid) VALUES($1,$2,$3,$4)", [number, email, username, uuid], (err, resp) => {
        if (err) {
            console.log(err)
          return  res.status(400).json({
                status:"error",
                message:"Unable to connect to database"
            })
        }
        let mailOptions = {
            from: 'habibkayodenew@gmail.com',
            to: email,
            subject: 'Your Unique ID',
            text: uuid
        };
        
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return res.status(400).json({
                    status:"error",
                    message:"Unable to send message"
                })
            } else {
                console.log('Email sent: ' + info.response);
                return res.status(200).json({
                    status: "success",
                    message:"Data saved"
                })
            }
        })
    })
    
})

app.post("/info",(req,res)=>{
    let uuid = req. body.uuid
    client.query("SELECT * FROM user_info WHERE user_info.uuid =$1;", [uuid], (err, resp) => {
        if(err){
            console.log(err)
            return  res.status(400).json({
                status:"error",
                message:"Unable to connect to database"
            })
        }
         console.log(resp.rows[0])
         if(resp.rows[0]== undefined){
            return  res.status(400).json({
                status:"error",
                message:"invalid uuid"
            })
         }
         return res.status(200).json({
             status:"success",
             data:{
                 username:resp.rows[0].username,
                 number:resp.rows[0].number,
                 email:resp.rows[0].email,
                 uuid:resp.rows[0].uuid
             }
         })
    })

})


app.listen(process.env.PORT || 3002, () => {

    console.log("connet", process.env.PORT)
})