import dotenv from "dotenv"
import connect from "./config/database.js"
import UserModel from "./model/user.js"
import express, { json } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import auth from "./middleware/auth"
dotenv.config()
const { MONGO_URL } = process.env;
connect(MONGO_URL)

const app = express()

app.use(json())

app.post("/register", async(req, res) =>{
    try{
        const {first_name, last_name, email, password} = req.body;

        if(!(email && password && first_name && last_name)){
            res.status(400).send("All input is required")
        }

        const oldUser = await UserModel.findOne({email});

        if (oldUser){
            return res.status(409).send("User Already Exist. Please Login")
        }

        encryptedPassword = await bcrypt.hash(password, 10)

        const user = await UserModel.create({
            first_name,
            last_name,
            email: email.toLowerCase(),
            password: encryptedPassword,
        })

        const token = jwt.sign(
            {user_id: user._id, email},
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h"
            }
        )

        user.token = token;
        res.status(201).json(user)
    }catch(err){
        console.log(err)
    }
})

app.post("/login", async(req, res) =>{
    try {
        const { email, password } = req.body;

        if(!(email && password)){
            res.status(400).send("All inputs is required")
        }

        const user = await UserModel.findOne({email})

        if(user && (await bcrypt.compare(password, user.password))){
            const token = jwt.sign(
                {user_id: user._id, email},
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h"
                }
            )

            user.token = token;

            res.status(200).json(user)
        }
        res.status(400).send("Invalid Credentials");
    } catch (error) {
        console.log(error)
    }
})

app.post("/welcome", auth, (req,res) =>{
    res.status(200).send("Welcome 👋")
})

const { API_PORT } = process.env;

const port = process.env.PORT || API_PORT

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

export default app