import { useState } from 'react'
import { words } from './data/words'
import './App.css'

function getTodayDate() {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getDailyWords(allWords) {
  const today = new Date()

  const startDate = new Date(2026, 9, 4)

  const todayUTC = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )

  const startUTC = Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  )

  const differenceInDays = Math.floor(
    (todayUTC - startUTC) / (1000 * 60 * 60 * 24)
  )

  const dayIndex = ((differenceInDays % 30) + 30) % 30

  const startIndex = dayIndex * 30

  return allWords.slice(startIndex, startIndex + 30)
}


function getCurrentDay() {
  const today = new Date()
  const startDate = new Date(2026, 9, 4)

  const todayUTC = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )

  const startUTC = Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  )

  const differenceInDays = Math.floor(
    (todayUTC - startUTC) / (1000 * 60 * 60 * 24)
  )

  return ((differenceInDays % 30) + 30) % 30 + 1
}

function App() {
  const [gameStarted, setGameStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [finalScore, setFinalScore] = useState(0)
  const [gameFinished, setGameFinished] = useState(false)
  const [attempts, setAttempts] = useState(() => {
  const savedDate = localStorage.getItem('statsDate')
  const today = getTodayDate()

  if (savedDate !== today) {
    localStorage.setItem('statsDate', today)
    localStorage.setItem('attempts', '0')
    localStorage.setItem('bestScore', '0')

    return 0
  }

  const savedAttempts = localStorage.getItem('attempts')

  return savedAttempts ? Number(savedAttempts) : 0
})

const [bestScore, setBestScore] = useState(() => {
  const savedDate = localStorage.getItem('statsDate')
  const today = getTodayDate()

  if (savedDate !== today) {
    return 0
  }

  const savedBestScore = localStorage.getItem('bestScore')

  return savedBestScore ? Number(savedBestScore) : 0
})

  // Перемешивает массив
  function shuffleArray(array) {
    return [...array].sort(() => Math.random() - 0.5)
  }

  // Перемешиваем 30 вопросов перед началом игры
  const [gameWords, setGameWords] = useState([])

  // Создаём 4 варианта ответа
  const [answers, setAnswers] = useState([])
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answerChecked, setAnswerChecked] = useState(false)
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(null)
  const [mistakes, setMistakes] = useState([])
  const [history, setHistory] = useState(() => {
  const savedHistory = localStorage.getItem('history')

  return savedHistory
    ? JSON.parse(savedHistory)
    : []
})
const [showHistory, setShowHistory] = useState(false)

  const [isMistakeMode, setIsMistakeMode] = useState(false)

  function createAnswers(currentWord, allWords) {
    // Берём неправильные переводы
    const wrongAnswers = allWords
      .filter((word) => word.id !== currentWord.id)
      .map((word) => word.translation)

    // Перемешиваем и берём 3
    const randomWrongAnswers = shuffleArray(wrongAnswers).slice(0, 3)

    // Добавляем правильный ответ
    const allAnswers = [
      currentWord.translation,
      ...randomWrongAnswers,
    ]

    // Перемешиваем все 4 варианта
    return shuffleArray(allAnswers)
  }

  function startGame() {
    setGameFinished(false)


    const dailyWords = getDailyWords(words)
    const shuffledWords = shuffleArray(dailyWords)

    setGameWords(shuffledWords)
    setCurrentQuestion(0)
    setScore(0)
    setMistakes([])

    setAnswers(
      createAnswers(shuffledWords[0], shuffledWords)
    )

    setGameStarted(true)
  }

  function startMistakesGame() {
  const mistakeWords = mistakes.map((mistake, index) => ({
  id: `mistake-${index}`,
  word: mistake.word,
  translation: mistake.correctAnswer,
}))

  const shuffledWords = shuffleArray(mistakeWords)

  setGameWords(shuffledWords)
  setCurrentQuestion(0)
  setScore(0)
  setFinalScore(0)

  setSelectedAnswer(null)
  setAnswerChecked(false)
  setIsCorrectAnswer(null)

  setIsMistakeMode(true)

  setAnswers(
    createAnswers(shuffledWords[0], words)
  )

  setGameFinished(false)
}

  function checkAnswer(selectedAnswer) {
  if (answerChecked) return

  const currentWord = gameWords[currentQuestion]
  const isCorrect = selectedAnswer === currentWord.translation

  setSelectedAnswer(selectedAnswer)
  setAnswerChecked(true)
  setIsCorrectAnswer(isCorrect)

  const updatedScore = isCorrect ? score + 1 : score

  if (isCorrect) {
    setScore(updatedScore)
  }

  if (!isCorrect) {
    setMistakes((previousMistakes) => [
      ...previousMistakes,
      {
        word: currentWord.word,
        correctAnswer: currentWord.translation,
        selectedAnswer: selectedAnswer,
      },
    ])
  }

  const nextQuestion = currentQuestion + 1

  setTimeout(() => {
    if (nextQuestion < gameWords.length) {
      setCurrentQuestion(nextQuestion)

      setAnswers(
        createAnswers(gameWords[nextQuestion], gameWords)
      )

      setSelectedAnswer(null)
      setAnswerChecked(false)
      setIsCorrectAnswer(null)
    } else {
      const newAttempts = attempts + 1

      setFinalScore(updatedScore)
      setAttempts(newAttempts)

      localStorage.setItem('attempts', newAttempts)
      const currentDay = getCurrentDay()

const newResult = {
  day: currentDay,
  score: updatedScore,
  total: gameWords.length,
  percentage: Math.round(
    (updatedScore / gameWords.length) * 100
  ),
  date: getTodayDate(),
}

setHistory((previousHistory) => {
  const updatedHistory = [
    ...previousHistory,
    newResult,
  ]

  localStorage.setItem(
    'history',
    JSON.stringify(updatedHistory)
  )

  return updatedHistory
})

      if (updatedScore > bestScore) {
        setBestScore(updatedScore)
        localStorage.setItem('bestScore', updatedScore)
      }

      setSelectedAnswer(null)
      setAnswerChecked(false)
      setIsCorrectAnswer(null)

      setGameFinished(true)
    }
  }, 700)
}

    if (showHistory) {
  return (
    <main>
      <h1>🇬🇧 English Quest</h1>

      <h2>📊 History</h2>

      {history.length === 0 ? (
        <p>No results yet.</p>
      ) : (
        <div className="history-list">
          {history.map((result, index) => (
            <div className="history-item" key={index}>
              <strong>Day {result.day}</strong>

              <span>
                {result.score} / {result.total}
              </span>

              <span>
                {result.percentage}%
              </span>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => setShowHistory(false)}>
        ← Back
      </button>
    </main>
  )
}


  if (!gameStarted) {
  const currentDay = getCurrentDay()

  return (
    <main>
      <h1>🇬🇧 English Quest</h1>

      <div className="start-card">
        <span className="day-badge">
          Day {currentDay} / 30
        </span>

        <h2>Today's Challenge</h2>

        <p>
          Learn and test yourself on 30 English words.
        </p>

        <p className="today-progress">
  {attempts === 0
    ? '⚪ Today: Not started'
    : `✅ Today: Completed • ${attempts} attempt${attempts > 1 ? 's' : ''}`}
</p>

        <div className="start-stats">
          <div>
            <strong>30</strong>
            <span>Words</span>
          </div>

          <div>
            <strong>{bestScore}</strong>
            <span>Best Score</span>
          </div>

          <div>
            <strong>{attempts}</strong>
            <span>Attempts</span>
          </div>
        </div>

        <button onClick={startGame}>
          Start Test 🚀
        </button>


        <button
  className="history-button"
  onClick={() => setShowHistory(true)}
>
  📊 History
</button>



      </div>
    </main>
  )
}


  if (gameFinished) {
  const percentage = Math.round(
    (finalScore / gameWords.length) * 100
  )

  return (
    <main>
      <h1>🇬🇧 English Quest</h1>

      <h2>🏆 Test Completed!</h2>

      <p>
        Score: {finalScore} / {gameWords.length}
      </p>

      <p>
        Accuracy: {percentage}%
      </p>

      <p>
        Mistakes: {mistakes.length}
      </p>
      {mistakes.length > 0 && (
  <div className="mistakes-list">
    <h3>Your Mistakes</h3>

    {mistakes.map((mistake, index) => (
      <div className="mistake-item" key={index}>
        <strong>{mistake.word}</strong>
        <p>Correct: {mistake.correctAnswer}</p>
        <p>Your answer: {mistake.selectedAnswer}</p>
      </div>
    ))}
  </div>
)}

      <p>
        🏆 Best Score: {Math.max(bestScore, finalScore)} / {gameWords.length}
      </p>

      <p>
        Attempts today: {attempts}
      </p>

      <button onClick={startGame}>
        🔄 Play Again
      </button>
    </main>
  )
}



  const currentWord = gameWords[currentQuestion]

  return (
    <main>
      <h1>🇬🇧 English Quest</h1>

      <h2>
        Question {currentQuestion + 1} / {gameWords.length}
      </h2>

      <p>Score: {score}</p>

      <div className="progress">
  <div
    className="progress-bar"
    style={{
      width: `${((currentQuestion + 1) / gameWords.length) * 100}%`,
    }}
  ></div>
</div>

      <h3>{currentWord.word}</h3>

      <p>Как переводится это слово?</p>

      {answerChecked && (
  <p className={isCorrectAnswer ? 'feedback correct-text' : 'feedback wrong-text'}>
    {isCorrectAnswer ? 'Correct! ✅' : 'Wrong! ❌'}
  </p>
      )}

      <div className="answers">


        {answers.map((answer) => {
  let className = ''

  if (answerChecked) {
    if (answer === currentWord.translation) {
      className = 'correct'
    } else if (answer === selectedAnswer) {
      className = 'wrong'
    }
  }

  return (
    <button
      key={answer}
      className={className}
      onClick={() => checkAnswer(answer)}
    >
      {answer}
    </button>
  )
})}
      </div>
    </main>
  )
}

export default App