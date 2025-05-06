const express = require('express');
const databse = require('./src/database/db.config');
const cors = require('cors');
require('dotenv').config();

const app=express();

// Use CORS middleware
app.use(cors());
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

// Include routes
require('./src/api/routes/routes')(app);

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
}
);
