const express = require('express');
const mongoose = require('mongoose')
var bodyParser = require('body-parser');
const port = process.env.PORT || 5000;
const path = require('path');
const fileupload = require('express-fileupload')
const fs = require('fs')
const session = require('express-session')
const app = express();
const Posts = require('./Posts.js')
require('dotenv').config();
app.use(fileupload());

// conecção com o banco de dados
mongoose.connect(process.env.CHAVE,{useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>console.log('conectado com sucesso'))
.catch((err)=>console.log(err))

// innicializar session
app.use(session({ secret: 'sebsetbafveb', cookie: {maxAge: 60000}}))
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

var usuarios = [
  {
    login: 'kaio',
    senha: 'SENHA'
  }
]

app.post('/admin/login', (req,res) => {
  usuarios.map((item)=>{
    if(item.login == req.body.login && item.senha == req.body.senha){
      req.session.login = req.body.login
    }
  })
  res.redirect('/admin/login');
})

app.post('/admin/cadastro', (req,res)=>{
  //inserir notica no banco de dados

  // checking my file
  // console.log(req.files)

  //file validation
  let formato = req.files.arquivo.name.split('.');
  var imagem = "";
  //validar tamanho da imagem
  if(formato[formato.length - 1] == "jpg"){
    imagem = new Date().getTime() + '.jpg'
    req.files.arquivo.mv(__dirname + "/public/images/" + imagem)
  }else{
    fs.unlinkSync(req.files.arquivo.tempFilePath);
  }

  Posts.create({
    titulo: req.body.titulo,
    imagem: 'http://localhost:5000/public/images/' + imagem,
    categoria: req.body.categoria,
    conteudo: req.body.text,
    slug: req.body.slug,
    chamada: req.body.slug,
    view: 0
  });

  res.redirect('/admin/login')
})

app.get('/admin/deletar/:id',(req,res) => {
  Posts.deleteOne({_id:req.params.id})
  .then(()=>{
    res.redirect('/admin/login')
  })
 
})

// validação da session
app.get('/admin/login',(req,res)=>{
  if(req.session.login == null){
    res.render('admin-login')
  }else{
    Posts.find({})
    .sort({ _id: -1 })
    .then((posts) => {
      res.render('admin-panel', { posts: posts });
    });
  }
})

app.get('/api/request',(req,res)=>{
  Posts.find({})
    .then((noticias)=>{
        res.json(noticias)
    })
})


// servidor
app.listen(port,()=> {
    console.log('server is running on port 5000');
})

