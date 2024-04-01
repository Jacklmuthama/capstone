const express = require("express");
const mysql = require('mysql2');
const cors = require('cors');
const quizRoutes = require('./quizRoutes');
const { createConnection } = require("net");


const app = express();
app.use(cors);
app.use(express.json());
app.use('/api/quizzes', quizRoutes);

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "capstone"
})
//signup
app.post('/signup', (req, res) => {
    const sql = "INSERT INTO login(`name`, `email`, `password`) VALUES(?)";
    const values = [
        req.body.name,
        req.body.email,
        req.body.password
    ]
    db.query(sql, [values], (err, data)=>{
        if(err){
            return res.json("Error");
        }
        return res.json(data);
    })
})
//login
app.post('/login', (req, res) => {
    const sql = "SELECT * FROM login WHERE `email` = ? AND `password` = ?";
    db.query(sql, [req.body.email,req.body.password], (err, data)=>{
        if(err){
            return res.json("Error");
        }
        if(data.length > 0){
            return res.json("sucess")
        }else {
            return res.json('failed')
        }
    })
})

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
