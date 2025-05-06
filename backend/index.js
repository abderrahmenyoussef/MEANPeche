const express = require('express');
const databse = require('./src/database/db.config');
require('dotenv').config();
const app=express();
app.use(express.urlencoded({extended:true}));
app.use(express.json());
databse.mongoose.connect(databse.url,{
}
).then(()=>{
    console.log('Connected to the database');
}
).catch((err)=>{
    console.log(err);
}
);    

app.get('/',(req,res)=>{
    res.send('Hello World');
}
);
app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
}
);
