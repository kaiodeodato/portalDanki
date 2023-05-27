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

          Posts.find({})
            .sort({ view: -1 })
            .limit(4)
            .then((topPosts) => {
              res.render('home', { posts: posts, postsTop: topPosts });
            });

        })
          .catch((err) => {
            console.log(err);
            res.render('home', {});
          });
      } else {
        // selecionar do banco de dados como palavra busca
          // renderizar itens de busca
          Posts.find({titulo: {$regex: req.query.busca, $options: "i"}})
          .then(postsBusca => {
            res.render('busca', {postsBusca:postsBusca});
          })
      }
})

//slug noticia
app.get('/:slug',(req,res)=>{

    Posts.findOneAndUpdate(
      {slug: req.params.slug}, 
      {$inc : { view:1}}, 
      {new:true})
    .then((post) => {
      // in case that the slug is wrong or doesnt exists
      if(post){
        Posts.find({})
          .sort({ view: -1 })
          .limit(4)
          .then((topPosts) => {
            res.render('single', { post: post, postsTop: topPosts });
        });
      }else{
        res.redirect('/');
      }
    })
    .catch((err) => {
      console.log(err);
      res.redirect('/')
    });
})

// servidor
app.listen(port,()=> {
    console.log('server is running on port 5000');
})

