export const courses = [
  {
    id: 1,
    title: "Introduction to Algorithms",
    subject: "Computer Science",
    progress: 78,
    totalQuestions: 42,
    flashcards: 65,
    lastStudied: "2 hours ago",
    color: "#7C5CFF",
    emoji: "🧮",
  },
  {
    id: 2,
    title: "Organic Chemistry",
    subject: "Chemistry",
    progress: 45,
    totalQuestions: 89,
    flashcards: 120,
    lastStudied: "Yesterday",
    color: "#00D9FF",
    emoji: "⚗️",
  },
  {
    id: 3,
    title: "Macroeconomics",
    subject: "Economics",
    progress: 92,
    totalQuestions: 35,
    flashcards: 48,
    lastStudied: "3 days ago",
    color: "#F59E0B",
    emoji: "📊",
  },
  {
    id: 4,
    title: "Modern History 1900–2000",
    subject: "History",
    progress: 23,
    totalQuestions: 67,
    flashcards: 85,
    lastStudied: "1 week ago",
    color: "#22C55E",
    emoji: "🌍",
  },
]

export const quizQuestions = [
  {
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correct: 1,
    explanation:
      "Binary search halves the search space with each comparison, giving O(log n) worst-case — far more efficient than linear search for sorted data.",
  },
  {
    question: "Which data structure follows LIFO (Last-In, First-Out) ordering?",
    options: ["Queue", "Linked List", "Stack", "Heap"],
    correct: 2,
    explanation:
      "A Stack follows LIFO ordering — the last element pushed is the first one popped. Think of a stack of plates: you always take from the top.",
  },
  {
    question: "What does Big O notation primarily express?",
    options: [
      "Memory usage in bytes",
      "Algorithm accuracy",
      "Worst-case growth of runtime",
      "Code readability score",
    ],
    correct: 2,
    explanation:
      "Big O notation describes the upper bound (worst-case) of an algorithm's runtime as a function of input size n, ignoring constants and lower-order terms.",
  },
  {
    question: "In a full binary tree, what is the maximum number of nodes at depth d?",
    options: ["d", "2d", "2^d", "d²"],
    correct: 2,
    explanation:
      "At depth d, a binary tree can have at most 2^d nodes, since each node branches into at most 2 children — giving an exponential relationship.",
  },
  {
    question: "Which sorting algorithm has the best average-case time complexity?",
    options: [
      "Bubble Sort — O(n²)",
      "Merge Sort — O(n log n)",
      "Insertion Sort — O(n²)",
      "Selection Sort — O(n²)",
    ],
    correct: 1,
    explanation:
      "Merge Sort consistently achieves O(n log n) across best, average, and worst cases using a divide-and-conquer strategy — optimal for comparison-based sorting.",
  },
]

export const flashcards = [
  {
    front: "What is Big O notation?",
    back: "Big O notation describes the upper bound of an algorithm's time or space complexity — expressing worst-case performance growth as input size n approaches infinity.",
  },
  {
    front: "Define a Hash Table",
    back: "A data structure that maps keys to values using a hash function to compute an array index. Provides average O(1) lookup, insertion, and deletion — O(n) worst-case due to collisions.",
  },
  {
    front: "What is Dynamic Programming?",
    back: "An optimization technique that solves complex problems by breaking them into overlapping subproblems, storing intermediate results (memoization or tabulation) to avoid redundant computation.",
  },
  {
    front: "Explain Recursion",
    back: "A function that calls itself as part of its own definition. Every recursive solution requires a base case to terminate the call stack. Used to elegantly express self-similar or divide-and-conquer problems.",
  },
  {
    front: "What is a Directed Acyclic Graph (DAG)?",
    back: "A graph with directed edges and no directed cycles. Used in dependency resolution, topological sorting, build systems, and representing computation pipelines where order matters.",
  },
]

export const scoreHistory = [
  { date: "Jan 8", score: 62 },
  { date: "Jan 15", score: 71 },
  { date: "Jan 22", score: 68 },
  { date: "Feb 1", score: 79 },
  { date: "Feb 8", score: 82 },
  { date: "Feb 15", score: 77 },
  { date: "Feb 22", score: 88 },
  { date: "Mar 1", score: 84 },
  { date: "Mar 8", score: 91 },
  { date: "Mar 15", score: 87 },
  { date: "Mar 22", score: 94 },
]

export const courseStats = [
  { name: "Algorithms", score: 84 },
  { name: "Chemistry", score: 71 },
  { name: "Economics", score: 92 },
  { name: "History", score: 58 },
]
