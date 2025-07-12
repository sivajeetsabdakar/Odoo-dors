'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Mock data
const initialQuestions = [
  {
    id: '1',
    title: 'How to center a div in CSS?',
    description: '<p>I\'ve been struggling with centering a div element. What are the best practices in 2024?</p>',
    author: { id: '2', username: 'john_doe' },
    tags: ['css', 'html', 'frontend'],
    createdAt: new Date('2024-01-15'),
    answers: [],
    upvotes: 5
  },
  {
    id: '2',
    title: 'React state management best practices',
    description: '<p>What are the current best practices for state management in React applications? Should I use Context API or Redux?</p>',
    author: { id: '2', username: 'john_doe' },
    tags: ['react', 'javascript', 'state-management'],
    createdAt: new Date('2024-01-14'),
    answers: [],
    upvotes: 12
  },
  {
    id: '3',
    title: 'Next.js vs React - When to use which?',
    description: '<p>I\'m confused about when to use Next.js vs plain React. Can someone explain the differences and use cases?</p>',
    author: { id: '1', username: 'admin' },
    tags: ['nextjs', 'react', 'framework'],
    createdAt: new Date('2024-01-13'),
    answers: [],
    upvotes: 8
  }
];

const initialAnswers = [
  {
    id: '1',
    questionId: '1',
    content: '<p>You can use Flexbox for this! Just use <code>display: flex; justify-content: center; align-items: center;</code> on the parent container.</p>',
    author: { id: '1', username: 'admin' },
    createdAt: new Date('2024-01-15'),
    upvotes: 3,
    isAccepted: true
  }
];

export const DataProvider = ({ children }) => {
  const [questions, setQuestions] = useState(initialQuestions);
  const [answers, setAnswers] = useState(initialAnswers);
  const [notifications, setNotifications] = useState([]);

  const addQuestion = (questionData) => {
    const newQuestion = {
      id: Date.now().toString(),
      ...questionData,
      createdAt: new Date(),
      answers: [],
      upvotes: 0
    };
    setQuestions(prev => [newQuestion, ...prev]);
    return newQuestion;
  };

  const addAnswer = (questionId, answerData) => {
    const newAnswer = {
      id: Date.now().toString(),
      questionId,
      ...answerData,
      createdAt: new Date(),
      upvotes: 0,
      isAccepted: false
    };
    setAnswers(prev => [...prev, newAnswer]);
    
    // Add notification to question author
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const notification = {
        id: Date.now().toString(),
        userId: question.author.id,
        type: 'answer',
        message: `${answerData.author.username} answered your question "${question.title}"`,
        read: false,
        createdAt: new Date()
      };
      setNotifications(prev => [...prev, notification]);
    }
    
    return newAnswer;
  };

  const upvoteAnswer = (answerId, userId) => {
    setAnswers(prev => prev.map(answer => 
      answer.id === answerId 
        ? { ...answer, upvotes: answer.upvotes + 1 }
        : answer
    ));
  };

  const acceptAnswer = (answerId) => {
    setAnswers(prev => prev.map(answer => 
      answer.id === answerId 
        ? { ...answer, isAccepted: true }
        : { ...answer, isAccepted: false }
    ));
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId 
        ? { ...notif, read: true }
        : notif
    ));
  };

  const getQuestionById = (id) => {
    return questions.find(q => q.id === id);
  };

  const getAnswersByQuestionId = (questionId) => {
    return answers.filter(a => a.questionId === questionId);
  };

  const getUserNotifications = (userId) => {
    return notifications.filter(n => n.userId === userId);
  };

  const value = {
    questions,
    answers,
    notifications,
    addQuestion,
    addAnswer,
    upvoteAnswer,
    acceptAnswer,
    markNotificationAsRead,
    getQuestionById,
    getAnswersByQuestionId,
    getUserNotifications
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};