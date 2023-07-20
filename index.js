const http = require('http');
const https = require('https');
const url = require('url');
const { parse } = require('querystring');
const fs = require('fs');
const nodemailer = require('nodemailer')
const Nexmo = require('nexmo');
 //подкл модуль мскл для работы с бд

http.createServer((req, res) => {
    let urlParts = url.parse(req.url);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    console.log("uu",urlParts);
    if (req.method == 'GET') {
            res.end('get server work');
    }
    else {
        // POST

        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            let params =[]
            if(body!==''){
         params = JSON.parse(body);
            console.log(params,'params')
        }
    //конфигурация подключ
    const mysql = require('mysql');
    const conn = mysql.createConnection({ //в качестве параметров передаем обьект
        host: "localhost",
        user: "root",
        database: "smileer",
        password: ""
    });
    //создание подключения
    conn.connect(err =>{
        if(err){
            console.log(err);
        }
        else {
            console.log("database----ok");
        }
    });


    var nexmo = new Nexmo({apiKey: "52960b55", apiSecret:"nC0Wh5BAsdI8TOIE"}, {
      debug: true
    });
    var verifyRequestId = null; // use in the check process
    
    function sendSms(){
      nexmo.verify.request({number:"79278888716", brand: 'smiler'}, function(err, result) {
          if(err) { console.error(err); }
          else {
            verifyRequestId = result. request_id;
            console.log(verifyRequestId)
          }
        });
       /* vonage.verify.request({
          number: "79278888716",
          brand: 'SMILEER'
        }, (err, result) => {
          if (err) {
            console.error(err);
          } else {
            verifyRequestId = result.request_id;
            console.log('request_id', result);
          }
        });*/
      }
        /*function rightCod(code){
            console.log(code)
          vonage.verify.check({request_id: verifyRequestId,code:code}, (err, result) => {
              if (err) {
                console.error(err);
              } else {
                console.log(result);
              }
            });
          nexmo.verify.control({request_id: verifyRequestId, cmd: 'cancel', code:code}, function(err, result) {
              if(err) { console.error(err); }
              else {
                console.log(result);
              }
            });
        }*/
    
       async function check() {
            console.log(params.code)
          return new Promise(function(resolve, reject) {
            nexmo.verify.check({
              request_id:verifyRequestId,
              code:params.code
            }, (err, result) => {
              if (err) {
                console.error(err)
                reject(err)
              } else {
                resolve(result)
              }
            })
          })
        }
    
    
    
    async function sendMails() {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
          user: "dariavladimirowna@gmail.com",
          pass: "nubgeheseaepmwit"
      }
    });
    let mailOptions = {
      from: 'dariavladimirowna@gmail.com',
      to:params.mail,
      subject: "Смайлер:D",
      text: 'Вам ответили на комментарий. Зайдите в приложение!',
      html: `<h1>Вам ответили на комментарий. Зайдите в приложение!</h1>`
    }
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
         return console.log(error.message);
      }
    console.log('success');
    }); 
    console.log(transporter.verify())
    }

    

     
switch(urlParts.pathname){ //если ссылка post запроса ведет на:   
  case "/sendmess": 
  sendMails()
  res.end('0')
  break
  case "/sendsms": 
  sendSms()
  res.end('0')
  break
  case "/rightcod": 
  check()
  res.end('0')
  break
  case "/loadlikes": 
 const query = "SELECT * FROM likes"; //делаем запрос sql к таблице бд..идет выбор всех данных из таблицы
  conn.query(query,(err,result,field)=>{
     console.log(err);
    console.log(result); //здесь лежит массив данных из таблицы
    /* let names =[];
     for(let i=0; i<result.length;i++){
      names.push(result[i].name);
     }
     names = names.toString();//преобр массив в строку
     console.log(names);*/
     res.end(JSON.stringify(result))
     //console.log(field); //содерж данные о полях таблицы
  })
  break
  case "/addlike":
      const query1 = `INSERT INTO likes (idpost, likes) VALUES (${params.idpost}, '${params.likes}')`;
      conn.query(query1,(err,result,field)=>{
          console.log(err);
          console.log(result.insertId);
          res.end(result.insertId.toString())
          //console.log(field); //содерж данные о полях таблицы
      })
      break
      case "/deleteallikes":
     const query2 = `DELETE FROM likes`;
      conn.query(query2,(err,result,field)=>{
          console.log(err);
          res.end('1')
          //console.log(field); //содерж данные о полях таблицы
      })
      break
      case "/deletelike":
       const query3 =  `DELETE FROM likes WHERE idpost=${params.id}`;
        conn.query(query3,(err,result,field)=>{
            console.log(err);
            res.end('1')
            //console.log(field); //содерж данные о полях таблицы
        })
        break
        case "/updatelike":
          const query4 = `UPDATE data SET likes ='${params.likes}' WHERE id = ${params.id}`;
         // query = `UPDATE user SET friends ='${params.friends}'  WHERE id = '${params.id}'`; 
          conn.query(query4,(err,result,field)=>{
              console.log(err);
              res.end('1')
              //console.log(field); //содерж данные о полях таблицы
          })
          break
          case "/updateview":
            const query7 = `UPDATE data SET views = ${params.views} WHERE id = ${params.id}`;
           // query = `UPDATE user SET friends ='${params.friends}'  WHERE id = '${params.id}'`; 
            conn.query(query7,(err,result,field)=>{
                console.log(err);
                res.end('1')
                //console.log(field); //содерж данные о полях таблицы
            })
            break
            case "/oneart":
              const querySel = `SELECT * FROM data WHERE id = ${params.id}`;
              conn.query(querySel,(err,result,field)=>{
                  console.log(err);
                  console.log(result);
                  res.end(JSON.stringify(result))
                  //console.log(field); //содерж данные о полях таблицы
              })
              break
          case "/loadview":
          const query5 =  `SELECT * FROM views`;
            conn.query(query5,(err,result,field)=>{
                console.log(err);
                res.end(JSON.stringify(result))
                //console.log(field); //содерж данные о полях таблицы
            })
            break
            case "/addview":
            const query6 = `INSERT INTO views (idpost, amount) VALUES (${params.idpost}, ${params.amount})`;
              conn.query(query6,(err,result,field)=>{
                  console.log(err);
                  console.log(result.insertId);
                  res.end(result.insertId.toString())
                  //console.log(field); //содерж данные о полях таблицы
              })
              break
              /*case "/updateview":
              const query7 = `UPDATE views SET amount = ${params.amount} WHERE idpost = ${params.idpost}`;
                conn.query(query7,(err,result,field)=>{
                    console.log(err);
                    res.end('1')
                    //console.log(field); //содерж данные о полях таблицы
                })
                break*/
                case "/addata":
                  const query8 = `INSERT INTO data (category, title, about, tags, time, image, video) VALUES ('${params.category}', '${params.title}', '${params.about}', '${params.tags}', '${params.time}', '${params.image}', '${params.video}')`;
                  conn.query(query8,(err,result,field)=>{
                      console.log(err);
                      console.log(result.insertId);
                      res.end(result.insertId.toString())
                      //console.log(field); //содерж данные о полях таблицы
                  })
                  break
                  case "/updatepost":
query = `UPDATE data SET name = "${params.category}", title = "${params.title}", about = "${params.about}", tags = "${params.tags}", time = "${params.time}", image = "${params.image}" WHERE id = ${params.id}`;
conn.query(query,(err,result,field)=>{
console.log(err);
console.log(result.insertId);
res.end(result.insertId.toString())
//console.log(field); //содерж данные о полях таблицы
})
break
                    case "/selectdata":
                      const query10 = `SELECT *
                      FROM data
                     WHERE id BETWEEN ${params.first} AND ${params.last}`;
                   //const query10 = `SELECT * FROM data`;
                      conn.query(query10,(err,result,field)=>{
                          console.log(err);
                          res.end(JSON.stringify(result))
                          console.log(JSON.stringify(result),'data'); //содерж данные о полях таблицы
                      })
                      break
                      case "/selectcat":
                        const query11 = `SELECT * FROM data WHERE category="${params.cat}" LIMIT 2 OFFSET ${params.off}`;
                        conn.query(query11,(err,result,field)=>{
                            console.log(err);
                            res.end(JSON.stringify(result))
                            //console.log(field); //содерж данные о полях таблицы
                        })
                        /*SELECT * FROM data 
                      WHERE category="${params.cat}"
                      LIMIT 3 OFFSET ${params.off} */
                        break
                        case "/deletedata":
                         const query12 = `DELETE FROM data`;
                          conn.query(query12,(err,result,field)=>{
                              console.log(err);
                              res.end('1')
                              //console.log(field); //содерж данные о полях таблицы
                          })
                          break
                          case "/deletecomments":
                           const query13 = `DELETE FROM comments`;
                            conn.query(query13,(err,result,field)=>{
                                console.log(err);
                                res.end('1')
                                //console.log(field); //содерж данные о полях таблицы
                            })
                            break
                            case "/deletecomment":
                             const query14 = `DELETE FROM comments WHERE id=${params.id}`;
                              conn.query(query14,(err,result,field)=>{
                                  console.log(err);
                                  res.end('1')
                                  //console.log(field); //содерж данные о полях таблицы
                              })
                              break
                              case "/deletecatcomment":
                               const query15 =  `DELETE FROM comments WHERE idpost=${params.id}`;
                                conn.query(query15,(err,result,field)=>{
                                    console.log(err);
                                    res.end('1')
                                    //console.log(field); //содерж данные о полях таблицы
                                })
                                break
                                case "/deletepost":
                                  const query16 =  `DELETE FROM data WHERE id=${params.id}`;
                                  conn.query(query16,(err,result,field)=>{
                                      console.log(err);  
                                      res.end('1')
                                      //console.log(field); //содерж данные о полях таблицы
                                  })
                                  break
                                  case "/loadcomments":
                                    const query17 =  `SELECT * FROM comments`;
                                    conn.query(query17,(err,result,field)=>{
                                        console.log(err);
                                        res.end(JSON.stringify(result))
                                        //console.log(field); //содерж данные о полях таблицы
                                    })
                                    break
                                    case "/loadpostcomments":
                                     const query18 = `SELECT * FROM comments WHERE idpost=${params.idpost}`;
                                      conn.query(query18,(err,result,field)=>{
                                          console.log(err);
                                          res.end(JSON.stringify(result))
                                          //console.log(field); //содерж данные о полях таблицы
                                      })
                                      break
                                      case "/addcomment":
                                        const query19 = `INSERT INTO comments (name, mail, comment, time, idpost, whom, notification) VALUES ('${params.name}', '${params.mail}', '${params.comment}', '${params.time}', ${params.idpost}, '${params.whom}', '${params.notification}')`;
                                        conn.query(query19,(err,result,field)=>{
                                            console.log(err);
                                            console.log(result.insertId);
                                            res.end(result.insertId.toString())
                                            //console.log(field); //содерж данные о полях таблицы
                                        })
                                        break
      default:
      res.end('404')
      break
}
//`UPDATE user SET login = ?, password = ?, name = ?, surname = ?, country = ?, city = ?, age = ?, instagram = ?, facebook = ?, work = ?, activity = ?, about = ?, motherlan = ?, level = ?, myachives = ?, time = ?, image = ?, phone = ?, email = ?, friends = ? fullname = ? WHERE id = ?`,
/////закрытие подключения
conn.end(err =>{
    if(err){
        console.log(err);
    }
    else {
        console.log("database----close");
    }
           
        });
    })  
  }
}).listen(3500);

/*SELECT * FROM products 
WHERE count > 0 
ORDER BY price DESC 
LIMIT 5 OFFSET 5 */

/*SELECT *
  FROM contacts
 WHERE contact_id BETWEEN 50 AND 100;*/

/*const http = require('http');
const https = require('https');
const url = require('url');
const { parse } = require('querystring');
const fs = require('fs');
const nodemailer = require('nodemailer')
const Vonage = require('@vonage/server-sdk')
const Nexmo = require('nexmo');
 //подкл модуль мскл для работы с бд

http.createServer((req, res) => {
    let urlParts = url.parse(req.url);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true);
    console.log("uu",urlParts);
    if (req.method == 'GET') {
            res.end('get server work');
    }
    else {
        // POST

        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            let params =[]
            if(body!==''){
         params = JSON.parse(body);
            console.log(params,'params')
        }
    //конфигурация подключ
    const mysql = require('mysql');
    const conn = mysql.createConnection({ //в качестве параметров передаем обьект
        host: "localhost",
        user: "root",
        database: "smileer",
        password: ""
    });
    //создание подключения
    conn.connect(err =>{
        if(err){
            console.log(err);
        }
        else {
            console.log("database----ok");
        }
    });
    let query  
   /* const vonage = new Vonage({
        apiKey: "52960b55",
        apiSecret: "nC0Wh5BAsdI8TOIE"
      }, {
        debug: true
      })

      const from = "Vonage APIs"
      const to = "79278888716"
      const text = 'A text message sent using the Vonage SMS API'*/
      

     /*var nexmo = new Nexmo({apiKey: "52960b55", apiSecret:"nC0Wh5BAsdI8TOIE"}, {
        debug: true
      });
    var verifyRequestId = null; // use in the check process

      function sendSms(){
        nexmo.verify.request({number:"79278888716", brand: 'smiler'}, function(err, result) {
            if(err) { console.error(err); }
            else {
              verifyRequestId = result. request_id;
              console.log(verifyRequestId)
            }
          });
         /* vonage.verify.request({
            number: "79278888716",
            brand: 'SMILEER'
          }, (err, result) => {
            if (err) {
              console.error(err);
            } else {
              verifyRequestId = result.request_id;
              console.log('request_id', result);
            }
          });*/
       // }
          /*function rightCod(code){
              console.log(code)
            vonage.verify.check({request_id: verifyRequestId,code:code}, (err, result) => {
                if (err) {
                  console.error(err);
                } else {
                  console.log(result);
                }
              });
            nexmo.verify.control({request_id: verifyRequestId, cmd: 'cancel', code:code}, function(err, result) {
                if(err) { console.error(err); }
                else {
                  console.log(result);
                }
              });
          }*/

       /*  async function check() {
              console.log(params.code)
            return new Promise(function(resolve, reject) {
              nexmo.verify.check({
                request_id:verifyRequestId,
                code:params.code
              }, (err, result) => {
                if (err) {
                  console.error(err)
                  reject(err)
                } else {
                  resolve(result)
                }
              })
            })
          }
 
    

   async function sendMails() {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: "dariavladimirowna@gmail.com",
            pass: "nubgeheseaepmwit"
        }
    });
    let mailOptions = {
        from: 'dariavladimirowna@gmail.com',
        to:params.mail,
        subject: "Смайлер:D",
        text: 'Вам ответили на комментарий. Зайдите в приложение!',
        html: `<h1>Вам ответили на комментарий. Зайдите в приложение!</h1>`
      }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
           return console.log(error.message);
        }
      console.log('success');
      }); 
     console.log(transporter.verify())
}

   

      
    

switch(urlParts.pathname){ //если ссылка post запроса ведет на:   
   case "/sendmess": 
sendMails()
res.end('0')
break
case "/sendsms": 
sendSms()
res.end('0')
break
case "/rightcod": 
check()
res.end('0')
break
case "/loadlikes": 
query = "SELECT * FROM likes"; //делаем запрос sql к таблице бд..идет выбор всех данных из таблицы
conn.query(query,(err,result,field)=>{
   console.log(err);
  console.log(result); //здесь лежит массив данных из таблицы
  /* let names =[];
   for(let i=0; i<result.length;i++){
    names.push(result[i].name);
   }
   names = names.toString();//преобр массив в строку
   console.log(names);*/
   //res.end(JSON.stringify(result))
   //console.log(field); //содерж данные о полях таблицы
//})
//break
//case "/addlike":
    /*query = `INSERT INTO likes (idpost, likes) VALUES ('${params.idpost}', '${params.likes}')`;
    conn.query(query,(err,result,field)=>{
        console.log(err);
        console.log(result.insertId);
        res.end(result.insertId.toString())
        //console.log(field); //содерж данные о полях таблицы
    })
    break
    case "/deleteallikes":
    query = `DELETE FROM likes`;
    conn.query(query,(err,result,field)=>{
        console.log(err);
        res.end('1')
        //console.log(field); //содерж данные о полях таблицы
    })
    break
    case "/deletelike":
      query =  `DELETE FROM likes WHERE idpost=${params.id}`;
      conn.query(query,(err,result,field)=>{
          console.log(err);
          res.end('1')
          //console.log(field); //содерж данные о полях таблицы
      })
      break
      case "/updatelike":
        query =  `UPDATE like SET likes ='${params.likes}' ? WHERE idpost = '${params.idpost}'`;
        conn.query(query,(err,result,field)=>{
            console.log(err);
            res.end('1')
            //console.log(field); //содерж данные о полях таблицы
        })
        break
        case "/loadview":
          query =  `SELECT * FROM views`;
          conn.query(query,(err,result,field)=>{
              console.log(err);
              res.end(JSON.stringify(result))
              //console.log(field); //содерж данные о полях таблицы
          })
          break
          case "/addview":
            query = `INSERT INTO views (idpost, amount) VALUES (${params.idpost}, ${params.amount})`;
            conn.query(query,(err,result,field)=>{
                console.log(err);
                console.log(result.insertId);
                res.end(result.insertId.toString())
                //console.log(field); //содерж данные о полях таблицы
            })
            break
            case "/updateview":
              query = `UPDATE views SET amount = ${params.amount} WHERE idpost = ${params.idpost}`;
              conn.query(query,(err,result,field)=>{
                  console.log(err);
                  res.end('1')
                  //console.log(field); //содерж данные о полях таблицы
              })
              break
              case "/addata":
                query = `INSERT INTO data (category, data) VALUES ('${params.category}', '${params.data}')`;
                conn.query(query,(err,result,field)=>{
                    console.log(err);
                    console.log(result.insertId);
                    res.end(result.insertId.toString())
                    //console.log(field); //содерж данные о полях таблицы
                })
                break
                case "/updatepost":
                  query = `UPDATE data SET data ='${params.data}' WHERE id=${params.id}`;
                  conn.query(query,(err,result,field)=>{
                      console.log(err);
                      res.end('1')
                      //console.log(field); //содерж данные о полях таблицы
                  })
                  break
                  case "/selectdata":
                    query = `SELECT * FROM data`;
                    conn.query(query,(err,result,field)=>{
                        console.log(err);
                        res.end(JSON.stringify(result))
                        console.log(JSON.stringify(result),'data'); //содерж данные о полях таблицы
                    })
                    break
                    case "/selectcat":
                      query = `SELECT * FROM data WHERE category="${params.cat}"`;
                      conn.query(query,(err,result,field)=>{
                          console.log(err);
                          res.end(JSON.stringify(result))
                          //console.log(field); //содерж данные о полях таблицы
                      })
                      break
                      case "/deletedata":
                        query = `DELETE FROM data`;
                        conn.query(query,(err,result,field)=>{
                            console.log(err);
                            res.end('1')
                            //console.log(field); //содерж данные о полях таблицы
                        })
                        break
                        case "/deletecomments":
                          query = `DELETE FROM comments`;
                          conn.query(query,(err,result,field)=>{
                              console.log(err);
                              res.end('1')
                              //console.log(field); //содерж данные о полях таблицы
                          })
                          break
                          case "/deletecomment":
                            query = `DELETE FROM comments WHERE id=${params.id}`;
                            conn.query(query,(err,result,field)=>{
                                console.log(err);
                                res.end('1')
                                //console.log(field); //содерж данные о полях таблицы
                            })
                            break
                            case "/deletecatcomment":
                              query =  `DELETE FROM comments WHERE idpost=${params.id}`;
                              conn.query(query,(err,result,field)=>{
                                  console.log(err);
                                  res.end('1')
                                  //console.log(field); //содерж данные о полях таблицы
                              })
                              break
                              case "/deletepost":
                                query =  `DELETE FROM data WHERE id=${params.id}`;
                                conn.query(query,(err,result,field)=>{
                                    console.log(err);  
                                    res.end('1')
                                    //console.log(field); //содерж данные о полях таблицы
                                })
                                break
                                case "/loadcomments":
                                  query =  `SELECT * FROM comments`;
                                  conn.query(query,(err,result,field)=>{
                                      console.log(err);
                                      res.end(JSON.stringify(result))
                                      //console.log(field); //содерж данные о полях таблицы
                                  })
                                  break
                                  case "/loadpostcomments":
                                    query = `SELECT * FROM comments WHERE idpost=${params.id}`;
                                    conn.query(query,(err,result,field)=>{
                                        console.log(err);
                                        res.end(JSON.stringify(result))
                                        //console.log(field); //содерж данные о полях таблицы
                                    })
                                    break
                                    case "/addcomment":
                                      query = `INSERT INTO comments (name, mail, comment, time, idpost, whom, notification) VALUES ('${params.name}', '${params.mail}', '${params.comment}', '${params.time}', ${params.idpost}, '${params.whom}', '${params.notification}')`;
                                      conn.query(query,(err,result,field)=>{
                                          console.log(err);
                                          console.log(result.insertId);
                                          res.end(result.insertId.toString())
                                          //console.log(field); //содерж данные о полях таблицы
                                      })
                                      break
    default:
    res.end('404')
    break
}
/////закрытие подключения
/*conn.end(err =>{
    if(err){
        console.log(err);
    }
    else {
        console.log("database----close");
    }
           
        });*/
   // })  
 /// }
//}).listen(3306);


/* case "/loadusers": 
 query = "SELECT * FROM user"; //делаем запрос sql к таблице бд..идет выбор всех данных из таблицы
conn.query(query,(err,result,field)=>{
    console.log(err);
   console.log(result); //здесь лежит массив данных из таблицы
   /* let names =[];
    for(let i=0; i<result.length;i++){
     names.push(result[i].name);
    }
    names = names.toString();//преобр массив в строку
    console.log(names);
    res.end(JSON.stringify(result))
    //console.log(field); //содерж данные о полях таблицы
})
break
case "/adduser":
    query = `INSERT INTO user (login, password, name, surname, country, city, age, instagram, facebook, work, activity, about, motherlan, level, myachives, time, image, phone, email, friends, fullname) VALUES ('${params.login}', '${params.password}', '${params.name}', '${params.surname}', '${params.country}', '${params.city}', '${params.age}', '${params.instagram}', '${params.facebook}', '${params.work}', '${params.activity}', '${params.about}', '${params.motherlan}', '${params.level}', '${params.myachives}', '${params.time}', '${params.image}', '${params.phone}', '${params.email}', '${params.friends}', '${params.fullname}')`;
    conn.query(query,(err,result,field)=>{
        console.log(err);
        console.log(result.insertId);
        res.end(result.insertId.toString())
        //console.log(field); //содерж данные о полях таблицы
    })
    break
case "/delete":
     query = `DELETE FROM user`;
    conn.query(query,(err,result,field)=>{
        console.log(err);
        console.log(result);
        res.end('1')
        //console.log(field); //содерж данные о полях таблицы
    })
    break   
    // query = `UPDATE user SET login ="${params.login}", password ="${params.password}", name ="${params.name}", surname ="${params.surname}", country ="${params.country}", city ="${params.city}", age ="${params.age}", instagram ="${params.instagram}", facebook ="${params.facebook}", work ="${params.work}", activity ="${params.activity}", about ="${params.about}", motherlan ="${params.motherlan}", level ="${params.level}", myachives ='${params.myachives}', time ="${params.time}", image ="${params.image}", phone ="${params.phone}", email ="${params.email}", friends ="${params.friends}" fullname = "f" WHERE id = ${params.id}`; 
    // `UPDATE user SET login ='${params.login}', password ='${params.password}', name ='${params.name}', surname ='${params.surname}', country ='${params.country}', city ='${params.city}', age ='${params.age}', instagram ='${params.instagram}', facebook ='${params.facebook}', work ='${params.work}', activity ='${params.activity}', about ='${params.about}', motherlan ='${params.motherlan}', level ='${params.level}', myachives ='${params.myachives}', time ='${params.time}', image ='${params.image}', phone ='${params.phone}', email ='${params.email}', friends ='${params.friends}' fullname ='${params.fullname}' WHERE id = ${params.id} `; 
case "/updateuser":
    query = `UPDATE user SET name ="${params.name}", surname ="${params.surname}", country ="${params.country}", city ="${params.city}", age ="${params.age}", instagram ="${params.instagram}", facebook ="${params.facebook}", work ="${params.work}", activity ="${params.activity}", about ="${params.about}", motherlan ="${params.motherlan}", level ="${params.level}", myachives ='${params.myachives}', time ="${params.time}", image ="${params.image}" , phone ="${params.phone}", email ="${params.email}", friends ="${params.friends}", fullname ="${params.fullname}"  WHERE id = ${params.id}`;
 //   let data =  [params.login, params.password, params.name, params.surname, params.country, params.city, params.age, params.instagram, params.facebook, params.work, params.activity, params.about, params.motherlan, params.level, params.myachives, params.time, params.image, params.phone, params.email, params.friends, params.fullname, params.id];
    conn.query(query, (err,result,field)=>{
        console.log(err);
        console.log(result);
        res.end('1')
        //console.log(field); //содерж данные о полях таблицы
    })
    break
    case "/addtoken":
        query = `UPDATE user SET token ='${params.token}'  WHERE id = '${params.id}'`; 
        conn.query(query, (err,result,field)=>{
            console.log(err);
            console.log(result);
            res.end('1')
            //console.log(field); //содерж данные о полях таблицы
        })
        break 
    case "/updatefriend":
        query = `UPDATE user SET friends ='${params.friends}'  WHERE id = '${params.id}'`; 
        conn.query(query, (err,result,field)=>{
            console.log(err);
            console.log(result);
            res.end('1')
            //console.log(field); //содерж данные о полях таблицы
        })
        break 
    case "/loadreqfriend":
        query = `SELECT * FROM requestfriend`; 
        conn.query(query,(err,result,field)=>{
            console.log(err);
           console.log(result); //здесь лежит массив данных из таблицы
            res.end(JSON.stringify(result))
        })
        break
    case "/addreqfriend":
        query = `INSERT INTO requestfriend (who, whom) VALUES ('${params.who}', '${params.whom}')`;
        conn.query(query,(err,result,field)=>{
            console.log(err);
            console.log(result.insertId);
            res.end(result.insertId.toString())
            //console.log(field); //содерж данные о полях таблицы
        })
        break 
    case "/delreqfriend":
        query = `DELETE FROM requestfriend WHERE  id = ${params.id}`;
        conn.query(query,(err,result,field)=>{
            console.log(err);
            console.log(result);
            res.end('1')
            //console.log(field); //содерж данные о полях таблицы
        })      
        break      */