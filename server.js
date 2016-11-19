var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

var config = {
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
secret : 'someRandomSecretValue',
cookie : { maxAge: 1000 * 60 *60 * 24* 30}
}));
           
var articles = {
'article-one' : {
   title : 'Internet',
   heading : 'Internet',
   date : 'Nov 17, 2016',
   content :`wow `
   
},
'article-two' : {
   title : 'HTML ',
   heading : 'HTML',
   date : 'Nov 17, 2016',
   content :`fghj`
   },
'article-three' : {
       title : 'Javascript',
   heading : 'Javascript',
   date : 'Nov 17, 2016',
   content :`fghjhjgh` }
};
      
function createTemplate (data) {
    var title = data.title;
    var date = data.date;
    var heading = data.heading;
    var content = data.content;
var htmlTemplate = `
<html>
<head>
<title>
${title}
</title>
<meta name="viewport" content="width-device-width", initial-scale-1" />
<link href="/ui/style.css" rel="stylesheet" />
</head>
<body>
<div class="container">
<div>
<a href='/'>Home</a>
</div>
<hr/>
<h3>
${heading}
</h3>
<div>
${date.toDateString()}
</div>
<div>
${content}
</div>
</div>
</body>
</html>
`;
return htmlTemplate;
}
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

function hash (input, salt) {
    // how do we create a hash?
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return ['pbkdf2', '10000', salt, hashed.toString('hex')].join('$');
}
app.get('/hash/:input', function (req, res){
var hashedString = hash(req.params.input, 'this-is-some-random-string');
res.send(hashedString);
});

app.post('/create-user', function (req, res){
    var username = req.body.username;
    var password = req.body.password;
   pool.query('SELECT * FROM "user" WHERE username = $1,', [username], function(err, result) {
   if (err) {
            res.status(500).send(err.stringify());
        } else {
            if (result.rows.length === 0) {
                res.send(400).send('username/password is invalid!');
            } else {
             var dbString = result.rows[0].password;
             var salt = dbString.split('$')[2];
             var hashedPassword = hash(password, salt); //creating a hash on the password submitted and the original salt
             if (hashedPassword === dbString) {
                 req.session.auth= {userId: result.rows[0].id};
             
            res.send('Credentials correct!');
            } else {
                res.send(403).send('username/password is invalid');
            }
        }}
   }    
); 
});

app.post('/check-login', function (req, res){
    if (req.session && req.session.auth && req.session.userId) {
        res.send('You are logged in:' + req.session.auth.userId.toString());
    } else {
        ('You are not logged in');
    }
});

app.get('/logout', function (req, res) {
    delete req.session.auth;
    res.send('Logged out!');
});

var pool = new Pool(config);
app.get('/test-db', function (req, res) {
    // make a select request
    // return a response with the results
    pool.query('SELECT * FROM test', function(err, result) {
        if (err) {
            res.status(500).send(err.toString());
        } else {
            res.send(JSON.stringify(result.rows));
        }
        }
);
});


app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});


app.get('/about-me.html', function (req, res) {
    res.sendFile(path.join(__dirname, 'ui', 'about-me.html'));
});
app.get('/articles/:articleName', function (req, res) {
    //articleName == article-one
    //articles(articleName) =={} content object for article-one
    //SELECT * FROM article WHERE title = 'article-one'
    var articleName =req.params.articleName;
 pool.query("SELECT * FROM article WHERE title = $1", [req.params.articleName], function (err, result){
     if (err) {
         res.status(500).send(err.toString());
     } else {
         if (result.rows.length === 0) {
             res.status(404).send('Article not found');
     } else {
        var articleData= result.rows[0];
        res.send(createTemplate(articleData));
     }
         
     }
 });
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
