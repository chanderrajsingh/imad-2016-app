var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

// commit
var config = {
   /* user: 'postgres',
    database: 'chanderrajsingh',
    url: 'http://localhost/adminer.php',
    password: '1234'*/
    user: 'chanderrajsingh',
    database: 'chanderrajsingh',
    host: 'db.imad.hasura-app.io',
    port: '5432',
    password: process.env.DB_PASSWORD
};
var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret: 'someRandomSecretValue',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30}
}));

function createTemplate (data) {
    var title = data.title;
    var date = data.date;
    var heading = data.heading;
    var content = data.content;
    
    var htmlTemplate = `
    <!DOCTYPE HTML>
<html>
  <head>
   <title>
     ${title}
    </title>
    <meta http-equiv="content-type" content="text/html; charset=utf-8" />
    <script src="/js/jquery.min.js"></script>
    <script src="/js/skel.min.js"></script>
    <script src="/js/skel-layers.min.js"></script>
    <script src="/js/init.js"></script>


     <link href="/ui/style.css" rel="stylesheet" />
      <link rel="stylesheet" href="/css/skel.css" />
      <link rel="stylesheet" href="/css/style.css" />
      <link rel="stylesheet" href="/css/style-xlarge.css" />
    
  </head>
  <body>
      <header id="header">
        <h1><strong>Foodies Point </strong></h1>
        <nav id="nav">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/ui/about.html">About</a></li>
            <li><a href="/ui/contactus.html">Contact us</a></li>
          </ul>
        </nav>
      </header>
      <section id="main" class="wrapper">
        <div class="container">
        <h3>
                  ${heading}
              </h3>
              <div>
                  ${date.toDateString()}
              </div>
              <center>
              <div style="width:80%"><pre>
                ${content}</pre>
              </div></center>
              <hr/>
              <h4>Comments</h4>
              <div id="comment_form">
              </div>
              <div id="comments">
                <center>Loading comments...</center>
              </div>
          </div>           
        </div>
      </section>
      <footer id="footer">
        <div class="container">
          <ul class="icons">
            <li><a href="#" class="icon fa-facebook"></a></li>
            <li><a href="#" class="icon fa-twitter"></a></li>
            <li><a href="#" class="icon fa-instagram"></a></li>
          </ul>
          <ul class="copyright">
            <li>Foodies Point</li>
            <li>Designer & Developer: <a href="#">CRS</a></li>
            
          </ul>
        </div>
      </footer>
      <script type="text/javascript" src="/ui/article.js"></script>

  </body>
</html>`;
    return htmlTemplate;
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});


function hash (input, salt) {
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return ["pbkdf2", "10000", salt, hashed.toString('hex')].join('$');
}


app.get('/hash/:input', function(req, res) {
   var hashedString = hash(req.params.input, 'this-is-some-random-string');
   res.send(hashedString);
});

app.post('/create-user', function (req, res) {

   var username = req.body.username;
   var password = req.body.password;
   if(username!=""&&password!=""){
   var salt = crypto.randomBytes(128).toString('hex');
   var dbString = hash(password, salt);
   pool.query('INSERT INTO "user" (username, password) VALUES ($1, $2)', [username, dbString], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send('User successfully created: ' + username);
      }
   });}else
   res.status(500).send('Could Not register!');
});

app.post('/login', function (req, res) {
   var username = req.body.username;
   var password = req.body.password;
   
   pool.query('SELECT * FROM "user" WHERE username = $1', [username], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          if (result.rows.length === 0) {
              res.status(403).send('username/password is invalid');
          } else {
              // Match the password
              var dbString = result.rows[0].password;
              var salt = dbString.split('$')[2];
              var hashedPassword = hash(password, salt); 
              if (hashedPassword === dbString) {
                
                req.session.auth = {userId: result.rows[0].id};
            
                
                res.send('credentials correct!');
                
              } else {
                res.status(403).send('username/password is invalid');
              }
          }
      }
   });
});

app.get('/check-login', function (req, res) {
   if (req.session && req.session.auth && req.session.auth.userId) {
       // Load the user object
       pool.query('SELECT * FROM "user" WHERE id = $1', [req.session.auth.userId], function (err, result) {
           if (err) {
              res.status(500).send(err.toString());
           } else {
              res.send(result.rows[0].username);    
           }
       });
   } else {
       res.status(400).send('You are not logged in');
   }
});

app.get('/logout', function (req, res) {
   delete req.session.auth;
   res.redirect("/");
});

var pool = new Pool(config);

app.get('/get-articles', function (req, res) {
   // make a select request
   // return a response with the results
   pool.query('SELECT * FROM article ORDER BY date DESC', function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send(JSON.stringify(result.rows));
      }
   });
});

app.get('/get-comments/:articleName', function (req, res) {
   pool.query('SELECT comment.*, "user".username FROM article, comment, "user" WHERE article.title = $1 AND article.id = comment.article_id AND comment.user_id = "user".id ORDER BY comment.timestamp DESC', [req.params.articleName], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send(JSON.stringify(result.rows));
      }
   });
});

app.post('/submit-comment/:articleName', function (req, res) {
   
    if (req.session && req.session.auth && req.session.auth.userId) {
        pool.query('SELECT * from article where title = $1', [req.params.articleName], function (err, result) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                if (result.rows.length === 0) {
                    res.status(400).send('Article not found');
                } else {
                    var articleId = result.rows[0].id;
                    pool.query(
                        "INSERT INTO comment (comment, article_id, user_id) VALUES ($1, $2, $3)",
                        [req.body.comment, articleId, req.session.auth.userId],
                        function (err, result) {
                            if (err) {
                                res.status(500).send(err.toString());
                            } else {
                                res.status(200).send('Comment inserted!');
                            }
                        });
                }
            }
       });     
    } else {
        res.status(403).send('Only logged in users can comment');
    }
});

app.get('/articles/:articleName', function (req, res) {
  pool.query("SELECT * FROM article WHERE title = $1", [req.params.articleName], function (err, result) {
    if (err) {
        res.status(500).send(err.toString());
    } else {
        if (result.rows.length === 0) {
            res.status(404).send('Article not found');
        } else {
            var articleData = result.rows[0];
            res.send(createTemplate(articleData));
        }
    }
  });
});

app.get('/ui/:fileName', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', req.params.fileName));
});
app.get('/css/:fileName', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui/css', req.params.fileName));
});
app.get('/js/:fileName', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui/js', req.params.fileName));
});
app.get('/images/:fileName', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui/images', req.params.fileName));
});
app.get('/fonts/:fileName', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui/fonts', req.params.fileName));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
