const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
let players = [];
let currentCategory = '';
let questions = [];
let currentQuestionIndex = 0;
let scores = { player1: 0, player2: 0 };
const fetchQuestions = async (category) => {
  try {
    const response = await axios.get(`https://the-trivia-api.com/api/questions`, {
      params: {
        limit: 6,
        categories: category,
        difficulties: 'easy,medium,hard',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
};

app.post('/start', (req, res) => {
  const { player1, player2 } = req.body;
  players = [player1, player2];
  res.json({ message: 'Players registered successfully!', players });
});

app.post('/select-category', async (req, res) => {
  const { categories } = req.body;
  currentCategory = categories;
  questions = await fetchQuestions(categories);
  currentQuestionIndex = 0;
  res.json({ message: `Category ${categories} selected!`, questions });
});
app.post('/answer', (req, res) => {
  const { player, answer } = req.body;
  const correctAnswer = questions[currentQuestionIndex].correctAnswer;
  let points = 0;
  const difficulty = questions[currentQuestionIndex].difficulty;
  if (answer === correctAnswer) {
    switch (difficulty) {
      case 'easy':
        points = 10;
        break;
      case 'medium':
        points = 15;
        break;
      case 'hard':
        points = 20;
        break;
    }
    scores[player] += points;
  }
  currentQuestionIndex += 1;
  const nextPlayer = currentQuestionIndex % 2 === 0 ? 'player1' : 'player2';
  if (currentQuestionIndex >= questions.length) {
    res.json({
      message: `Round over. ${nextPlayer}, select a new category or end the game.`,
      scores,
    });
  } else {
    res.json({
      message: `${nextPlayer}'s turn.`,
      nextQuestion: questions[currentQuestionIndex],
      scores,
    });
  }
});
app.post('/end', (req, res) => {
  const winner =
    scores.player1 > scores.player2
      ? players[0]
      : scores.player1 < scores.player2
      ? players[1]
      : 'It\'s a tie!';
  res.json({ message: 'Game Over!', scores, winner });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
