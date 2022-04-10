import mongoose from "mongoose"

const { MONGO_URL } = process.env;

export default function connect(url){
    mongoose.connect(url,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log("Successfully connected to database")
    }).catch(error =>{
        console.log("database connection failed. exiting now...");
        console.error(error)
        process.exit(1)
    })
}