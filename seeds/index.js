const mongoose = require('mongoose');
const carowner = require('../model/carowner');

mongoose.connect('mongodb://localhost:27017/carservice',{
    useNewUrlParser: true,
    useCreateIndex:true,
    useUnifiedTopology:true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const seedDB=async () =>{
    await carowner.deleteMany({});
    const c=new carowner({Owner: 'dehfb',
        Address: 'frfjrnjf',
        Contact: 3487398493,
        Email: 'dbjehfe@vhdj.com'})
    await c.save();    
}

seedDB();
