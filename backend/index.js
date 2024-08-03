const express = require('express');
const app = express();
const con = require('./config');
const cors = require('cors');
const bcrypt = require('bcrypt');
const Jwt = require('jsonwebtoken');
const jwtKey = '?safkjasfjkasn/safajasjfoasj12412412???asfjasjaksl@?';

app.use(cors());
app.use(express.json());


app.get('',(req,res)=>{
    con.query("select * from test",(err,result)=>{
        if(!err){
            res.send(result);
        }
        else{
            res.send(err);
        }
    })
    // res.send('Hello World');
});

app.post("/register",(req,res)=>{
    const password = req.body.password;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) res.send({status:false,message:err});
        req.body.password = hash;
        const data = req.body;

        con.query("insert into users set ?",data,(error,result)=>{
                if(error) res.send(error);
                // console.log('fields:',fields);
                res.send(result);
            })
        
      }); 
    
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // res.send();
  con.query("select * from users where username = '"+username+"'",(err,user)=>{
    if(err) throw res.json({ success: false, message: err });
    if (user.length > 0) {
        let userData = user[0];
        let passwordHash = userData.password;
        bcrypt.compare(password, passwordHash, (err, result) => {
            if (err) {
              res.json({ success: false, message: err });
            }
            if (result) {
                delete userData.password;
                Jwt.sign({ userData }, jwtKey , {expiresIn:'12h'},(err,token)=>{

                    if (err) {
                        res.json({ success: false, message: err });
                      }
                      res.json({ success: true, message: 'Login successful',user: userData, token: token });
                })
                
            } else {
                res.json({ success: false, message: 'Invalid username or password' });
            }
          }); 

    } else {
        // Handle case where no user found with the provided email
        res.json({ success: false, message: 'Invalid username or password' });
    }
  })
    // if (users[username] && users[username].password === password) {
    //   res.json({ success: true, message: 'Login successful' });
    // } else {
    //   res.json({ success: false, message: 'Invalid username or password' });
    // }
  });

  app.post("/auth",(req,res)=>{
    const token = req.headers['authorization'];
    
    // res.send(token);
    if(token){
        Jwt.verify(token,jwtKey,(err,valid)=>{
        if (err) return res.send({result:err,success:false})
        return res.send({success:true});
        })
    }
    
    // })    
    // console.log('here');
//    return res.send({result:true});
    
});

app.get('/merchants',verifyToken,(req,res)=>{
    con.query("select * from merchants",(err,merchants)=>{
        if (err) return res.send({success:false,message:err});
        return res.send({success:true,merchants:merchants});
    })
})

app.post('/add-merchant', verifyToken, (req, res) => {
    const data = req.body;
    const merchantName = data.name; 

    con.query("SELECT COUNT(*) as count FROM merchants WHERE name = ?", [merchantName], (error, results) => {
        if (error) {
            return res.send({ success: false, message: 'Database query error' });
        }

        if (results[0].count > 0) {
            return res.send({ success: false, message: 'Merchant name already exists' });
        }

        con.query("INSERT INTO merchants SET ?", data, (error, result) => {
            if (error) {
                return res.send({ success: false, message: 'Error inserting data',error:error });
            }
            if (result.affectedRows > 0) {
                return res.send({ success: true, message: 'Merchant has been created' });
            } else {
                return res.send({ success: false, message: 'Something went wrong, please try again later' });
            }
        });
    });
});


app.get('/merchant/:id',verifyToken,(req,res)=>{
    const id = req.params.id;
    con.query("select * from merchants where id ="+id,(err,merchant)=>{
        if (err) return res.send({success:false,message:err});
        return res.send({success:true,merchant});
    })
})

app.put('/update-merchant/:id',verifyToken,(req,res)=>{
    const id = req.params.id;
    const name = req.body.name;
    const mobile_number = req.body.mobile_number;
    con.query("UPDATE merchants set name = ?, mobile_number =? where id = ?",[name,mobile_number,id],(err,result)=>{
        if (err) return res.send({success:false,message:err});
        if(result.protocol41){
            return res.send({success:true,message:"Merchant Successfully Updated"});
        }else{
            return res.send({success:false,message:"Something went wrong please try again later"});
        }
    })
})

app.delete('/delete-merchant/:id',verifyToken,(req,res)=>{
    const id = req.params.id;
    con.query("delete from merchants where id ="+id,(err,result)=>{
        if (err) return res.send({success:false,message:err});
        if(result.protocol41){
            return res.send({success:true,message:'Merchant Successfully deleted.'});
        }else{
            return res.send({success:false,message:'Something went wrong please try again'});
        }
    })
})

app.post('/merchant-balance',verifyToken,(req,res)=>{
    const merchantId = req.body.merchantId;
    con.query("select sarsoo_balance.*,merchants.name from sarsoo_balance inner join merchants on sarsoo_balance.merchant_id = merchants.id where merchant_id ="+merchantId,(err,data)=>{
        if (err) return res.send({success:false,message:err});
        return res.send({success:true,data});
    })
})

app.post('/add-entry-mustard',verifyToken,async(req,res)=>{
    const data = req.body;
    const option = req.body.option;
    delete data.option;
    var total;
    data.other_charges = data.other_charges ? data.other_charges : 0;
    if(option == 2){
         total = parseFloat(data.rate) + parseFloat(data.other_charges);
        data.weight = null;
        data.quantity = null;
    }else{
         total = (data.rate * data.weight) + parseFloat(data.other_charges);
    }
    
    if(total != data.total){
        return res.send({success: false, message: "Security Issues"});
    }
    if(option == 1){
        data.debit = req.body.total;
        data.credit = 0;
    }else{
        data.credit = req.body.total;
        data.debit = 0;
    }
    try {
        var maxId = await getMaxId(data.merchant_id);
    } catch (err) {
        return res.send({success: false, message: err});
    }

    
    if(maxId != null){

        try {
            var closingBalance = await getClosingBalance(data.merchant_id,maxId);
        } catch (err) {

            return res.send({success: false, message: err});
        }
        data.opening = closingBalance;
        data.closing = parseFloat(data.opening) + parseFloat(data.debit) - parseFloat(data.credit);

        con.query("insert into sarsoo_balance SET ?", data, (error, result) => {
            if (error) {
                return res.send({ success: false, message: 'Error inserting data',error:error });
            }
            if (result.affectedRows > 0) {
                return res.send({ success: true, message: 'Merchant Balance(Mustard) Entry has been inserted.' });
            } else {
                return res.send({ success: false, message: 'Something went wrong, please try again later' });
            }
        });
    }else{
        data.opening = 0;
        data.closing = parseFloat(data.opening) + parseFloat(data.debit) - parseFloat(data.credit);
        // return res.send(data);

        con.query("insert into sarsoo_balance SET ?", data, (error, result) => {
            if (error) {
                return res.send({ success: false, message: 'Error inserting data',error:error });
            }
            if (result.affectedRows > 0) {
                return res.send({ success: true, message: 'Merchant Balance(Mustard) Entry has been inserted.' });
            } else {
                return res.send({ success: false, message: 'Something went wrong, please try again later' });
            }
        });
    }

});

app.get('/get-balance-details-sarsoo/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    try {
        const result = await getResults(
            "SELECT m.name, sb.* FROM sarsoo_balance sb INNER JOIN merchants m ON sb.merchant_id = m.id WHERE sb.id = ?",
            [id]
        );
        if (result.length === 0) {
            return res.send({ success: false, message: "No records found" });
        }
        const merchant_id = result[0].merchant_id;

        const getPreviousData = await getResults(
            "SELECT * FROM sarsoo_balance WHERE id < ? AND merchant_id = ?",
            [id, merchant_id]
        );
        if(getPreviousData.length != 0){
            return res.send({success:true,result,showOpening:false});
        }else{
            return res.send({success:true,result,showOpening:true});
        }
    } catch (err) {
        return res.send({ success: false, message: err.message });
    }
});




app.put('/update-balance-details-sarsoo/:id',verifyToken,async (req, res)=>{
    const id = req.params.id;
    const data = req.body;
    const merchant_id = req.body.merchant_id;
    const option = req.body.option;
    delete data.option;
    var total;
    data.other_charges = data.other_charges ? data.other_charges : 0;
    if(option == 2){
         total = parseFloat(data.rate) + parseFloat(data.other_charges);
        data.weight = null;
        data.quantity = null;
    }else{
         total = (data.rate * data.weight) + parseFloat(data.other_charges);
    }
    
    if(total != data.total){
        return res.send({success: false, message: "Security Issues"});
    }
    if(option == 1){
        data.debit = req.body.total;
        data.credit = 0;
    }else{
        data.credit = req.body.total;
        data.debit = 0;
    }
    data.closing = parseFloat(data.opening) + parseFloat(data.debit) - parseFloat(data.credit);
    var closingBalance = data.closing;
    // return res.send(data);
    try{
        const result = await getResults("UPDATE sarsoo_balance set ? where id = ?",[data,id]);
        if(result.protocol41){
            const nextData = await getResults("SELECT * from sarsoo_balance where id > ? and merchant_id = ?;",[id,merchant_id]);
            for (const element of nextData) {
                element.opening = closingBalance;
                element.closing = parseFloat(element.opening) + parseFloat(element.debit) - parseFloat(element.credit);
                closingBalance = element.closing;
                const update = await getResults("UPDATE sarsoo_balance SET ? WHERE id = ?", [element, element.id]);
    
                if (!update.protocol41) {
                    return res.send({ success: false, message: "Something went wrong, please try again later" });
                }
            }
    
            return res.send({ success: true, message: "Mustard Balance Updated Successfully" });
        }else{
            return res.send({success: false, message: "Please Try Again"});
        }  
    }catch(err){
        return res.send({ success: false, message: err.message });
    }

    // con.query("UPDATE sarsoo_balance set ? where id = ?",[data,id],(err,result)=>{
    //     if (err) return res.send({success:false,message:err});
    //     if(result.protocol41){
    //         return res.send({success:true,message:"Merchant Successfully Updated"});
    //     }else{
    //         return res.send({success:false,message:"Something went wrong please try again later"});
    //     }
    // })
    // con.query("SELECT * from sarsoo_balance where id ")
    // return res.send(data);
    // con.query("UPDATE merchants set name = ?, mobile_number =? where id = ?",[name,mobile_number,id],(err,result)=>{
    //     if (err) return res.send({success:false,message:err});
    //     if(result.protocol41){
    //         return res.send({success:true,message:"Merchant Successfully Updated"});
    //     }else{
    //         return res.send({success:false,message:"Something went wrong please try again later"});
    //     }
    // })
});


  function verifyToken(req,res,next){
    let token = req.headers['authorization'];
    // console.log(token); 
        if (token){
        Jwt.verify(token,jwtKey,(err,valid)=>{
            if (err) return res.send({result:err})
            return next();
        })
    }else{
        return res.status(403).send({result:"Please add token with header"})
    }
  }

  function getMaxId(merchant_id) {
    return new Promise((resolve, reject) => {
        var query = "SELECT MAX(id) as maxId FROM sarsoo_balance WHERE merchant_id =" + merchant_id;
        con.query(query, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result[0].maxId);
        });
    });
}

function getClosingBalance(merchant_id,maxId) {
    return new Promise((resolve, reject) => {
        var query = "select closing as closingBalance from sarsoo_balance where merchant_id =" + merchant_id+" and id ="+maxId;
        con.query(query, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result[0].closingBalance);
        });
    });
}
function getResults(query, params) {
    return new Promise((resolve, reject) => {
        con.query(query, params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

app.listen(5000);