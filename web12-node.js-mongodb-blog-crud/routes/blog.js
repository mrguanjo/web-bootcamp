const express = require('express');

const mongodb = require('mongodb');

const db = require('../data/database');

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get('/', function(req, res) {
  res.redirect('/posts');
});

router.get('/posts', async function(req, res) {
  const posts = await db
  .getDb()
  .collection('posts')
  .find({})
  .project({title: 1, summary: 1, 'author.name': 1})
  .toArray();

  // console.log(posts);
  res.render('posts-list', {posts: posts});
});

router.get('/new-post', async function(req, res) {
  const authors =  await db.getDb().collection('authors').find().toArray();
  // console.log(authors);
  res.render('create-post', {authors: authors});
});

router.post('/posts', async function(req, res) {
  const authorId = new ObjectId(req.body.author);
  const author = await db.getDb().collection('authors').findOne({_id: authorId});

  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    author: {
      id: authorId,
      name: author.name,
      email: author.email
    }
  };

  const result = await db.getDb().collection('posts').insertOne(newPost);
  res.redirect('/posts');
});

router.get('/posts/:id', async function(req, res) {
  let postId = req.params.id;

  try {
    postId = new ObjectId(postId);
  } catch(error) {
    return res.status(404).render('404');
  };

  const post = await db.getDb().collection('posts').findOne({_id: postId}, {summary: 0});
  console.log(post);

  if(!post) {
    return res.status(404).render('404');
  }

  const options = {
		timeZone: 'Asia/Seoul',
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		hour12: false // 24시간 형식으로 표시
	  };

  post.humanReadableDate = post.date.toLocaleDateString('ko-KR', options);
  post.date = post.date.toISOString();

  res.render('post-detail', {post: post});
})

router.get('/posts/:id/edit', async function(req, res) {
  const postId = req.params.id;

  const post = await db
    .getDb()
    .collection('posts')
    .findOne({_id: new ObjectId(postId)}, {title: 1, summary: 1, body: 1});
  // console.log(post);

  if(!post) {
    return res.status(404).render('404');
  }

  res.render('update-post', {post: post});
});

router.post('/posts/:id/edit', async function(req, res) {
  const postId = req.params.id;

  await db.getDb()
  .collection('posts')
  .updateOne(
    {_id: new ObjectId(postId)},
    {
      $set: {
        title: req.body.title, 
        summary: req.body.summary, 
        body: req.body.content,
        // date: new Date() // For Update date when the post was updated.
      } 
    });

  res.redirect('/posts');
});

router.post('/posts/:id/delete', async function(req, res) {
  const postId = new ObjectId(req.params.id);

  await db.getDb().collection('posts').deleteOne({_id: postId});

  res.redirect('/posts');
});

module.exports = router;