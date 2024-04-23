const express = require("express");
require('dotenv').config();
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken')
const auth = require('./authenticate');
const quizRoutes = require('./quizRoutes');
const { createConnection } = require("net");


const app = express();
app.use(cors);
app.use(express.json());
app.use('/api/quizzes', quizRoutes);
// DB connection
const db = mysql.createConnection({
    host: process.env.MSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE_NAME,
    port: process.env.MYSQL_PORT
})
console.log(process.env.MSQL_HOST)
//signup create new user
app.post('/signup', async(req, res) => {
    const sql = "INSERT INTO login(`name`, `email`, `password`) VALUES(?)";
      if (users.some(user => user.email === req.body.email)) {
          const err = new Error('Email Taken!')
          err.status = 400;
          throw err;
      }
    const values = [
        req.body.name,
        req.body.email,
        await bcrypt.hash(req.body.password)
    ]
    db.query(sql, [values], (err, data)=>{
        if(err){
            return res.json("Error");
        }
        return res.json(data);
    })
})
//login authenticate a current user
app.post('/login', (req, res) => {
  const sql = "SELECT * FROM login WHERE `email` = ?";
  db.query(sql, [req.body.email], async (err, data) => {
      if (err) {
          res.status(500).json({
              status: 'error',
              message: 'Internal server error',
          });
      } else if (data.length === 0) {
          res.status(400).json({
              status: 'fail',
              message: 'User Not Found!',
          });
      } else {
          const user = data[0];
          try {
              if (await bcrypt.compare(req.body.password, user.password)) {
                  const tokenPayload = {
                      email: user.email,
                  };
                  const accessToken = jwt.sign(tokenPayload, 'SECRET');
                  res.status(201).json({
                      status: 'success',
                      message: 'User Logged In!',
                      data: {
                          accessToken,
                      },
                  });
              } else {
                  res.status(400).json({
                      status: 'fail',
                      message: 'Wrong Password!',
                  });
              }
          } catch (error) {
              res.status(500).json({
                  status: 'error',
                  message: 'Internal server error',
              });
          }
      }
  });
});

// Get a list of available quizzes
app.get('/api/quizzes', (req, res) => {
  res.json(quizzes);
});

// Get details of a specific quiz by ID
app.get('/api/quizzes/:quizId', (req, res) => {
  const quizId = parseInt(req.params.quizId);
  const quiz = quizzes.find(quiz => quiz.id === quizId);
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }
  res.json(quiz);
});

// Get all questions for a specific quiz
app.get('/api/quizzes/:quizId/questions', (req, res) => {
  const quizId = parseInt(req.params.quizId);
  const quiz = quizzes.find(quiz => quiz.id === quizId);
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  const quizQuestions = quiz.questions.map(questionId => questions[questionId]);
  res.json(quizQuestions);
});

// Get details of a specific question within a quiz
app.get('/api/quizzes/:quizId/questions/:questionId', (req, res) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  const quiz = quizzes.find(quiz => quiz.id === quizId);
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  const question = questions[questionId];
  if (!question || !quiz.questions.includes(questionId)) {
    return res.status(404).json({ message: 'Question not found in this quiz' });
  }
  res.json(question);
});

app.listen(8081, ()=>{
    console.log("listening");
})
