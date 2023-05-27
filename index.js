const express = require('express');
const mongoose = require('mongoose')
var bodyParser = require('body-parser');
const port = process.env.PORT || 5000;
const path = require('path');

const app = express();

const Posts = require('./Posts.js')

// conecção com o banco de dados
mongoose.connect('mongodb+srv://kaiodoficial:hmn615SmT6@cluster0.hdkvcpc.mongodb.net/portalDanki',{useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>console.log('conectado com sucesso'))
.catch((err)=>console.log(err))

//ro support JSON-encoded bodies and URL-encoded bodies
app.use( bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.engine('html', require('ejs').renderFile);
app.set('view engine','html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/pages'));

//pagina inicial
app.get('/',(req,res)=> {

    //validação busca
    if (req.query.busca == null) {
        // requisição do banco de dados
        Posts.find({})
            .sort({ _id: -1 })
            .then((posts) => {
            res.render('home', {posts:posts});
          })
          .catch((err) => {
            console.log(err);
            res.render('home', {});
          });
      } else {
        res.render('busca', {});
      }
})

//slug noticia
app.get('/:slug',(req,res)=>{
    res.render('single',{nome:req.params.slug})
})

// servidor
app.listen(port,()=> {
    console.log('server is running on port 5000');
})

