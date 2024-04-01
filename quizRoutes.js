const express = require('express');
const router = express.Router();

// Example data (you would retrieve this from your database)
const quizScores = {};

// Middleware to parse JSON request body
router.use(express.json());

// Middleware for authentication
function authenticate(req, res, next) {
  //Check if the user is authenticated based on the presence of a valid token in the request header
  const authToken = req.headers.authorization;

  if (!authToken || authToken !== 'YOUR_AUTH_TOKEN') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // If authenticated, proceed to the next middleware
  next();
}

// Submit answers for a specific quiz
router.post('/:quizId/submit', authenticate, (req, res) => {
  const quizId = parseInt(req.params.quizId);
  const submittedAnswers = req.body.answers; 
  const userId = req.body.userId; 

  // Calculate score 
  let score = 0;
  const correctAnswers = [/* Fetch correct answers for quizId from your database */];
  submittedAnswers.forEach((submittedAnswer, index) => {
    if (submittedAnswer === correctAnswers[index]) {
      score++;
    }
  });

  // Store or update the user's score
  // For simplicity, we're storing scores in memory, but you should use a database for persistence
  if (!quizScores[quizId]) {
    quizScores[quizId] = [];
  }
  quizScores[quizId].push({ userId, score });

  res.json({ score });
});

// Get scores for a specific quiz
router.get('/:quizId/scores', authenticate, (req, res) => {
  const quizId = parseInt(req.params.quizId);
  const scores = quizScores[quizId] || [];
  res.json(scores);
});

module.exports = router;
