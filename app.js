const express = require("express");
const bodyParser = require("body-parser");
const mysql =require("mysql");
const ejs = require("ejs");
var ls = require('local-storage');
const multer = require('multer');
const path = require('path');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');



//var swal = require('sweetalert2')





const app=express()

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;
//session middleware
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));

app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use('/file',express.static('public/uploads'));
// cookie parser middleware
app.use(cookieParser());


//set password and mail for admin
const mail="teamSpreadHappiness@gmail.com";
const pass="tasfia1234#";

var session;
//database connection
const connection=mysql.createPool({
    connectionLimit:10,
    host:"localhost",
    user:"root",
    password:"",
    database:"DonationDB"
})



const storage=multer.diskStorage({
    destination:"public/uploads/",
    filename:function(req,file,cb){
      cb(null,file.fieldname+'_'+Date.now()+path.extname(file.originalname));
    }
 });
  
const upload=multer({
    storage:storage
}).single('image');






app.get("/",function(req,res){
   // res.render("index.ejs")
   var approval='Yes'
   var sql="SELECT * FROM Comments WHERE approve=?";
   connection.query(sql,[approval],function(er,comments){
    if(er) res.send(er)
    res.render("index",{
        comments:comments
    })
   })
})


app.post("/comment_section",upload,function(req,res){
    
    if(req.file){
       var data={
           name:req.body.name,
           details:req.body.details,
           image:`http://localhost:4040/file/${req.file.filename}`
        }
     }else{
        var data={
            name:req.body.name,
            details:req.body.details,
            //image:`http://localhost:4040/file/${req.file.filename}`
         }
     }
    

    var sql="INSERT INTO Comments SET ?"
    connection.query(sql,data,function(er,re){
        if(er) res.send(er);
        res.redirect("/");
    });

})




app.get("/clothes-donation",function(req,res){
    res.render("clothesdonation1.ejs")
})

app.get("/education",function(req,res){
    //res.render("education.ejs")
    var sql=`SELECT * FROM education_information where assigned='No'`
    connection.query(sql,function(er,educations){
        if(er) res.send(er)
        res.render("education",{
            educations:educations
        })
    })
})

app.post("/applicants",function(req,res){
    var code=req.body.code
    var data={
        applicant_name:req.body.name,
        mail:req.body.mail,
        address_phone:req.body.details,
        code:code
    }
    //var tablename='information_'+code;
    //var sql=`insert into ${tablename} set ? `
    var sql='insert into view_applicants set?'
    connection.query(sql,data,function(er,r){
        if(er){
            res.send(er)
        }else{
            res.redirect("/education")
        }
    })
})

app.get("/food",function(req,res){
    res.render("food.ejs")
})



app.get("/zakat",function(req,res){
    //res.render("zakat.ejs")
    var sql="select * from zakat"
    connection.query(sql,function(er,zks){
        if(er) res.send(er)
        res.render('zakat',{
            zks:zks
        })
    })
})

app.get("/cloth-donation-by-yourself",function(req,res){
    //res.render("clothway1.ejs")
    var sql='SELECT * FROM cloth_Information'
    connection.query(sql,function(er,cloths){
        if(er) res.send(er)
        res.render("clothway1",{
            cloths:cloths
        })
    })
})

app.get("/cloth-donation-by-delivery-man",function(req,res){
    res.render("way2cloth.ejs")
})

app.post("/cloth_donation_way2",function(req,res){
    var postcode=req.body.postcode
    var data={
        name:req.body.name,
        address:req.body.address,
        phone:req.body.phone,
        no_of_clothes:req.body.clothes,
        postcode:postcode,
        thana:req.body.thana

    }

    var sql="insert into Cloth set?"
    connection.query(sql,data,function(er){
        if(er) {res.send(er)}
        else{
            var sq='select postcode from delivery_man_list where postcode=?'
            connection.query(sq,[postcode],function(er,result){
                if(er){
                    res.send(er)
                }
                if(result.length>0){
                    res.render('result.ejs')
                }else{
                    res.render('sorry.ejs')
                }
            })
          
        }
        //res.render('result.ejs')

        
    })
})





app.get("/food-donate-by-yourself",function(req,res){
   // res.render("foodway1.ejs")
   var sql='SELECT * FROM food_information'
    connection.query(sql,function(er,foods){
        if(er) res.send(er)
        res.render("foodway1",{
            foods:foods
        })
    })
})

app.get("/food-by-delivery-man",function(req,res){
    res.render("foodway2.ejs")
})

app.post("/food_donation_way2",function(req,res){
    var postcode=req.body.postcode;
    var data={
        name:req.body.name,
        address:req.body.address,
        phone:req.body.phone,
        postcode:postcode,
        thana:req.body.thana
        //no_of_clothes:req.body.clothes

    }

    var sql="insert into Food set?"
    connection.query(sql,data,function(er){
        if(er){ res.send(er)}
        else{
            var sq='select postcode from delivery_man_list where postcode=?'
            connection.query(sq,[postcode],function(er,result){
                if(er){
                    res.send(er)
                }
                if(result.length>0){
                    res.render('resultfood.ejs')
                }else{
                    res.render('sorryfood.ejs')
                }
            })
          
        }
        //res.redirect('/food-by-delivery-man')
        
    })
})


//***************************admin panel****************************// 

app.get("/admin-login",function(req,res){
    res.render("login.ejs");
})

app.post("/admin-login",function(req,res){
   var mymail= req.body.email;
   var mypass=req.body.pass;

   //console.log(email);
   // console.log(password);
   //save my mail,pass from form into local storage
   //ls.set("mail",email) 
   //ls.set("pass",password)

   //Get the saved data from local storage.
   //var mymail= ls.get("mail")
   //var mypass=ls.get("pass")
   //console.log(mymail);
   //console.log(mypass);

   if(mymail===mail){
       if(mypass===pass){
        session=req.session;
        session.email=mymail;
        res.redirect("/dashboard")
       }else{
           res.send("password does not matched")
       }
   }else{
    res.send("Your mail address is not correct")
   }
   
   


})
/*app.get("/admin-panel",function(req,res){
    var approval='No';
   var sql="SELECT * FROM Comments WHERE approve=?";
   connection.query(sql,[approval],function(er,cms){
    if(er) res.send(er)
    res.render("dashboard",{
        cms:cms
    })
   })
})*/


app.get("/dashboard",function(req,res){
   // res.render("dashboard.ejs");
   session=req.session;
   if(session.email){ 
   var approval='No';
   var sql="SELECT * FROM Comments WHERE approve=?";
   connection.query(sql,[approval],function(er,cms){
    if(er) res.send(er)
    res.render("dashboard",{
        cms:cms
    })
   })}else{
    res.redirect("/admin-login")
   }
})

app.post("/dashboard/:id",function(req,res){
    var id=req.params.id;
    var approval='Yes'
    var sql="Update Comments Set approve = '"+approval+"' where id="+id;
    connection.query(sql,function(er){
        if(er) res.send(er)
        res.redirect("/dashboard")
    })
})

app.get("/delete_comment/:id",function(req,res){
    var id = req.params.id;
    var sql = `DELETE from Comments where id =${id}`;
    var query = connection.query(sql,function(er){
        if(er) res.send(er);
        res.redirect("/dashboard")
    });
})


app.get('/Delivery-man-information',function(req,res){
    session=req.session;
    if(session.email){
    var sql='select * from delivery_man_list'
    connection.query(sql,function(er,mans){
        if(er){
            res.send(er)
        }else{
            res.render('deliverymanlist',{
                mans:mans
            })
        }
    })}else{
        res.redirect("/admin-login")
    }
})

app.post('/delivery-man-list-info',upload,function(req,res){
    if(req.file){
        var data={
            delivery_man_name:req.body.name,
            birthdate:req.body.birthdate,
            nid:req.body.nid,
            phone:req.body.phone,
            postcode:req.body.postcode,
            duty_area:req.body.area,
            image:`http://localhost:4040/file/${req.file.filename}`
        }
    }else{
        var data={
            delivery_man_name:req.body.name,
            birthdate:req.body.birthdate,
            nid:req.body.nid,
            phone:req.body.phone,
            postcode:req.body.postcode,
            duty_area:req.body.area
            //image:`http://localhost:4040/file/${req.file.filename}`
        }
    }

    var sql="insert into delivery_man_list set?";
    connection.query(sql,data,function(er){
        if(er) res.send(er)
        res.redirect("/Delivery-man-information")
    })
})



app.get("/cloth-donation-information",function(req,res){
    session=req.session
    if(session.email){
    res.render("adminclothway1.ejs");
    }else{
        res.redirect("/admin-login")
    }
})

app.post("/cloth_information",upload,function(req,res){
    if(req.file){
        var data={
            title:req.body.title,
            details:req.body.details,
            website:req.body.website,
            facebook:req.body.facebook,
            image:`http://localhost:4040/file/${req.file.filename}`
        }
    }else{
        var data={
            title:req.body.title,
            details:req.body.details,
            website:req.body.website,
            facebook:req.body.facebook,
            //image:`http://localhost:4040/file/${req.file.filename}`
        }
    }

    var sql="insert into cloth_Information set?";
   
    connection.query(sql,data,function(er){
        if(er) res.send(er)
        res.redirect('/cloth-donation-information')
       
    })
})

app.get("/cloth-donation",function(req,res){
   // res.render("adminclothway2.ejs");
   session=req.session;
   if(session.email){
   var sql=`select * from Cloth where checked='No'`
   connection.query(sql,function(er,Cths){
    if(er) res.send(er)
    res.render('adminclothway2',{
        Cths:Cths
    })

   })}else{
    res.redirect("/admin-login")
   }
})

app.post("/cloth-donation/:id",function(req,res){
    var id=req.params.id;
    var checked='Yes'
    var sql="Update Cloth Set checked = '"+checked+"' where id="+id;
    connection.query(sql,function(er){
        if(er) res.send(er)
        res.redirect("/cloth-donation")
    })
})

app.get("/check-list-of-cloth-donation",function(req,res){
     //res.render("checklistcloth.ejs");
     session=req.session;
     if(session.email){
     var sql=`select * from Cloth where checked='Yes'`
     connection.query(sql,function(er,checks){
      if(er) res.send(er)
      res.render('checklistcloth',{
          checks:checks
      })
  
     })}else{
        res.redirect("/admin-login")
     }
 })

 app.get("/pending-list-of-cloth-donation",function(req,res){
    session=req.session;
    if(session.email){
    var sql=`select * from Cloth where checked='No' and postcode NOT IN (select postcode from delivery_man_list)`
    connection.query(sql,function(er,pnds){
     if(er) res.send(er)
     res.render('pendinglistcloth',{
         pnds:pnds
     })
 
    })}else{
        res.redirect("/admin-login")
    }
})

app.get("/cloth-donation-information-update",function(req,res){
    //res.render("clothinfo.ejs")
    session=req.session;
    if(session.email){
    var sql='select * from cloth_Information'
   connection.query(sql,function(er,clths){
    if(er) res.send(er)
    res.render('clothinfo',{
        clths:clths
    })

   })}else{
    res.redirect("/admin-login")
   }
})

app.get("/delete_clothinfo/:id",function(req,res){
    var id = req.params.id;
    var sql = `DELETE from cloth_Information where id =${id}`;
    var query = connection.query(sql,function(er){
        if(er) res.send(er);
        res.redirect("/cloth-donation-information-update")
    });
})

app.get("/food-donation-information",function(req,res){
    session=req.session;
    if(session.email){
    res.render("adminfoodway1.ejs");}
    else{
        res.redirect("/admin-login")
    }
})

app.post("/food_information",upload,function(req,res){
    if(req.file){
        var data={
            title:req.body.title,
            details:req.body.details,
            website:req.body.website,
            facebook:req.body.facebook,
            image:`http://localhost:4040/file/${req.file.filename}`
        }
    }else{
        var data={
            title:req.body.title,
            details:req.body.details,
            website:req.body.website,
            facebook:req.body.facebook,
            //image:`http://localhost:4040/file/${req.file.filename}`
        }
    }

    var sql="insert into food_information set?";
    connection.query(sql,data,function(er){
        if(er) res.send(er)
        res.redirect("/food-donation-information")
    })
})

app.get("/food-donation",function(req,res){
    //res.render("adminfoodway2.ejs");
    session=req.session;
    if(session.email){
    var sql=`select * from Food where checked='No'`
    connection.query(sql,function(er,fds){
     if(er) res.send(er)
     res.render('adminfoodway2',{
         fds:fds,
       
     })
 
    })}else{
        res.redirect("/admin-login")
    }
})

app.post("/food-donation/:id",function(req,res){
    var id=req.params.id;
    var checked='Yes'
    var sql="Update Food Set checked = '"+checked+"' where id="+id;
    connection.query(sql,function(er){
        if(er) res.send(er)
        res.redirect("/food-donation")
    })
})

app.get("/check-list-of-food-donation",function(req,res){
     //res.render("checklistcloth.ejs");
     session=req.session;
     if(session.email){
     var sql=`select * from Food where checked='Yes'`
     connection.query(sql,function(er,checkfs){
      if(er) res.send(er)
      res.render('checklistfood',{
          checkfs:checkfs
      })
  
     })}else{
        res.redirect("/admin-login")
     }
 })

 app.get("/pending-list-of-food-donation",function(req,res){
   
    session=req.session;
    if(session.email){
    var sql=`select * from Food where checked='No' and postcode NOT IN (select postcode from delivery_man_list)`
    connection.query(sql,function(er,fpnds){
     if(er) res.send(er)
     res.render('pendinglistfood',{
         fpnds:fpnds
     })
 
    })}else{
        res.redirect("/admin-login")
    }
})

app.get("/food-donation-information-update",function(req,res){
    //res.render("foodinfo.ejs")
    session=req.session;
    if(session.email){
    var sql='select * from food_information'
   connection.query(sql,function(er,foodis){
    if(er) res.send(er)
    res.render('foodinfo',{
        foodis:foodis
    })

   })}else{
    res.redirect("/admin-login")
   }
})

app.get("/delete_foodinfo/:id",function(req,res){
    var id = req.params.id;
    var sql = `DELETE from food_information where id =${id}`;
    var query = connection.query(sql,function(er){
        if(er) res.send(er);
        res.redirect("/food-donation-information-update")
    });
})





app.get("/admin-education-information",function(req,res){
    session=req.session;
    if(session.email){
    res.render("admineducation.ejs")
    }else{
    res.redirect("/admin-login")
   }
})

app.post("/education_information",upload,function(req,res){
    var code=req.body.code
    if(req.file){
        var data={
            name:req.body.name,
            age:req.body.age,
            class:req.body.class,
            money:req.body.money,
            details:req.body.details,
            link:req.body.link,
            image:`http://localhost:4040/file/${req.file.filename}`,
            code:code
        }
    }else{
        var data={
            name:req.body.name,
            age:req.body.age,
            class:req.body.class,
            money:req.body.money,
            details:req.body.details,
            link:req.body.link,
            //image:`http://localhost:4040/file/${req.file.filename}`,
            code:code
        }
    }

    var sql="insert into education_information set?"
  
    connection.query(sql,data,function(er){
        if(er)
        {
            res.send(er)
        }else{
            //res.redirect("/education_information")
           /* var tablename='information_'+code;
            var sq=`CREATE TABLE ${tablename} (Applicant_No INT AUTO_INCREMENT  PRIMARY KEY ,name VARCHAR(255) ,email VARCHAR(255),details LONGTEXT ,code VARCHAR(255),) `;
            connection.query(sq,function(er,r){
                if(er)  res.send(er);
                else{
               // console.log("Table created successfully");*/
                res.redirect("/admin-education-information")
            //}
           // });
        }
    })
})

/*app.get("/view-applicants/:code",function(req,res){
   
    var code=req.params.code
    //console.log(code)
    var tablename='information_'+code
    //console.log(tablename)
    var sql=`select * from ${tablename}`
    connection.query(sql,function(er,applicants){
        if(er) res.send(er)
        res.render('viewapplicants',{
            applicants:applicants
        })
    })
})*/



app.get("/approve-user",function(req,res){
    //res.render("approveuser.ejs")
    session=req.session;
    if(session.email){
    var sql=`select * from  education_information where assigned='No'`
     connection.query(sql,function(er,users){
      if(er) res.send(er)
      res.render('approveuser',{
          users:users
      })
  
     })}else{
        res.redirect("/admin-login")
       }
})

app.get("/view-applicants/:code",function(req,res){
    var code=req.params.code
    var sql=`select id,applicant_name,mail,address_phone from view_applicants where assigned='No' and code='${code}'`;
    connection.query(sql,function(er,applicants){
        if(er) res.send(er)
        res.render('viewapplicants',{
            applicants:applicants
        })
    })
})

app.get('/applicant/:id',function(req,res){
    var id=req.params.id
    //console.log(code)
    //var assigned='Yes'
    var sql=`Update view_applicants set assigned='Yes' where id='${id}'`;
    connection.query(sql,function(er){
        if(er){
            res.send(er)
        }else{
            //
            var sql=`update education_information set assigned='Yes' where code=(select code from view_applicants where id='${id}')`
            connection.query(sql,function(er){
                if(er){
                    res.send(er)
                }else{
                    res.redirect('/approve-user')
                }
            })
        }
    })
    
})

app.get('/approve_applicant_list',function(req,res){
    //res.render('applicantlist.ejs')
    session=req.session;
    if(session.email){
    var sql=`select E.id,E.name,E.age,E.class,E.money,E.details,E.link,E.code ,V.id,V.applicant_name,V.mail,V.address_phone from education_information as E inner join view_applicants as V on E.code=V.code where E.assigned='Yes' and V.assigned='Yes'`
    connection.query(sql,function(er,appls){
        if(er){
            res.send(er)
        }else{
            res.render('applicantlist',{
                appls:appls
            })
        }
    })}else{
        res.redirect("/admin-login")
       }
})


app.get('/zakat_Admin',function(req,res){
    session=req.session;
    if(session.email){
    res.render("zakatadmin.ejs")
    }else{
    res.redirect("/admin-login")
   }
});

app.post("/zakat_nisab",function(req,res){
   
    var  nisab =req.body.nisab
    
    var sql="Update zakat set nisab ="+nisab
    connection.query(sql,function(er){
        if(er) res.send(er)
        res.redirect("/zakat_Admin");
    })
})




app.listen(4040)