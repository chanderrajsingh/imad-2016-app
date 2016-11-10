var express = require('express');
var morgan = require('morgan');
var path = require('path');

var app = express();
app.use(morgan('combined'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

var articles={
'article-one':{
    title:'Article-one | Chander Raj Singh',
    heading:'Article-one',
    content:`<p>This is my 1st Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.</p>
            <p>
                This is my 1st Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.
            </p>`
},
'article-two':{
    title:'Article-two | Chander Raj Singh',
    heading:'Article-two',
    content:`<p>This is my 2nd Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.</p>
            <p>
                This is my 2nd Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.
            </p>`
},
'article-three':{
    title:'Article-three | Chander Raj Singh',
    heading:'Article-three',
    content:`<p>This is my 3rd Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.</p>
            <p>
                This is my 3rd Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.This is my first Article On imad 2016.
            </p>`
}
};
function createTemplate(data)
{
    var title=data.title;
    var heading=data.heading;
    var content=data.content;
    var htmlTemplate=`<html>
    <head>
        <title>
            ${title}
        </title>
        <meta name="viewport" content="width-device-width,intial-scale-1" />
        <link href="/ui/style.css" rel="stylesheet" />
    </head>
    <body>
        <div class="cont">
        <div>
            <a href='/'>HOME</a>
        </div>
        <hr>
        <h3>
            ${heading}
        </h3>
        <div>
            ${content}
        </div></div>
    </body>
</html>`;
return htmlTemplate;
}

app.get('/:articleName',function(req,res){
    //articleName==article-one;
    //articles[articleName]=={} 
   // res.send('Article one has requested and will be served.');
  //  res.sendFile(path.join(__dirname, 'ui', 'article-one.html'));
  var articleName=req.params.articleName;
  res.send(createTemplate(articles[articleName]));
});
/*app.get('/article-two',function(req,res){
   // res.send('Article one has requested and will be served.');
    res.sendFile(path.join(__dirname, 'ui', 'article-two.html'));
});
app.get('/article-three',function(req,res){
   // res.send('Article one has requested and will be served.');
    res.sendFile(path.join(__dirname, 'ui', 'article-three.html'));
});*/

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/me.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'me.jpg'));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
