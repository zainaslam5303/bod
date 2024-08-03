const mysql = require('mysql');
const con = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'bod'
});

con.connect((err)=>{
    if(!err){
        console.log('Connected Successfully');
    }
    else{
        console.log('Connection failed');
    }
})

module.exports = con;