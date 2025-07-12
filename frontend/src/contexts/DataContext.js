'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { questionsApi, answersApi, commentsApi, tagsApi } from '@/lib/api';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [comments, setComments] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Questions methods
  const fetchQuestions = async (page = 0, size = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await questionsApi.getAllQuestions(page, size);
      setQuestions(response.content || response);
      return response;
    } catch (error) {
      setError(error.message);
      console.error('Error fetching questions:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionById = async (id) => {
    try {
      setError(null);
      const question = await questionsApi.getQuestionById(id);
      return question;
    } catch (error) {
      setError(error.message);
      console.error('Error fetching question:', error);
      throw error;
    }
  };

  const createQuestion = async (questionData, userId) => {
    try {
      setError(null);
      const newQuestion = await questionsApi.createQuestion(questionData, userId);
      setQuestions(prev => [newQuestion, ...prev]);
      return newQuestion;
    } catch (error) {
      setError(error.message);
      console.error('Error creating question:', error);
      throw error;
    }
  };

  const updateQuestion = async (id, questionData, userId) => {
    try {
      setError(null);
      await questionsApi.updateQuestion(id, questionData, userId);
      // Refresh questions list or update specific question
      await fetchQuestions();
      return true;
    } catch (error) {
      setError(error.message);
      console.error('Error updating question:', error);
      throw error;
    }
  };

  const deleteQuestion = async (id, userId) => {
    try {
      setError(null);
      await questionsApi.deleteQuestion(id, userId);
      setQuestions(prev => prev.filter(q => q.id !== id));
      return true;
    } catch (error) {
      setError(error.message);
      console.error('Error deleting question:', error);
      throw error;
    }
  };

  const voteOnQuestion = async (id, vote, userId) => {
    try {
      setError(null);
      const response = await questionsApi.voteOnQuestion(id, vote, userId);
      // Update local state with new vote count
      setQuestions(prev => prev.map(q => 
        q.id === id ? { ...q, voteCount: response.voteCount } : q
      ));
      return response;
    } catch (error) {
      setError(error.message);
      console.error('Error voting on question:', error);
      throw error;
    }
  };

  const searchQuestions = async (query, page = 0, size = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await questionsApi.searchQuestions(query, page, size);
      return response;
    } catch (error) {
      setError(error.message);
      console.error('Error searching questions:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getQuestionsByTag = async (tagName) => {
    try {
      setError(null);
      const questions = await questionsApi.getQuestionsByTag(tagName);
      return questions;
    } catch (error) {
      setError(error.message);
      console.error('Error fetching questions by tag:', error);
      throw error;
    }
  };

  const getQuestionsByUser = async (userId) => {
    try {
      setError(null);
      const questions = await questionsApi.getQuestionsByUser(userId);
      return questions;
    } catch (error) {
      setError(error.message);
      console.error('Error fetching user questions:', error);
      throw error;
    }
  };

  // Answers methods
  const fetchAnswersByQuestion = async (questionId) => {
    try {
      setError(null);
      const answers = await answersApi.getAnswersByQuestion(questionId);
      setAnswers(prev => {
        const filtered = prev.filter(a => a.questionId !== questionId);
        return [...filtered, ...answers.map(a => ({ ...a, questionId }))];
      });
      return answers;
    } catch (error) {
      setError(error.message);
      console.error('Error fetching answers:', error);
      throw error;
    }
  };

  const createAnswer = async (questionId, answerData, userId) => {
    try {
      setError(null);
      const newAnswer = await answersApi.createAnswer(questionId, answerData, userId);
      setAnswers(prev => [...prev, { ...newAnswer, questionId }]);
      return newAnswer;
    } catch (error) {
      setError(error.message);
      console.error('Error creating answer:', error);
      throw error;
    }
  };

  const updateAnswer = async (id, answerData, userId) => {
    try {
      setError(null);
      await answersApi.updateAnswer(id, answerData, userId);
      return true;
    } catch (error) {
      setError(error.message);
      console.error('Error updating answer:', error);
      throw error;
    }
  };

  const deleteAnswer = async (id, userId) => {
    try {
      setError(null);
      await answersApi.deleteAnswer(id, userId);
      setAnswers(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (error) {
      setError(error.message);
      console.error('Error deleting answer:', error);
      throw error;
    }
  };

  const voteOnAnswer = async (id, vote, userId) => {
    try {
      setError(null);
      const response = await answersApi.voteOnAnswer(id, vote, userId);
      setAnswers(prev => prev.map(a => 
        a.id === id ? { ...a, voteCount: response.voteCount } : a
      ));
      return response;
    } catch (error) {
      setError(error.message);
      console.error('Error voting on answer:', error);
      throw error;
    }
  };

  // Comments methods
  const fetchCommentsByAnswer = async (answerId) => {
    try {
      setError(null);
      const comments = await commentsApi.getCommentsByAnswer(answerId);
      setComments(prev => {
        const filtered = prev.filter(c => c.answerId !== answerId);
        return [...filtered, ...comments.map(c => ({ ...c, answerId }))];
      });
      return comments;
    } catch (error) {
      setError(error.message);
      console.error('Error fetching comments:', error);
      throw error;
    }
  };

  const createComment = async (answerId, commentData, userId) => {
    try {
      setError(null);
      const newComment = await commentsApi.createComment(answerId, commentData, userId);
      setComments(prev => [...prev, { ...newComment, answerId }]);
      return newComment;
    } catch (error) {
      setError(error.message);
      console.error('Error creating comment:', error);
      throw error;
    }
  };

  const updateComment = async (id, commentData, userId) => {
    try {
      setError(null);
      await commentsApi.updateComment(id, commentData, userId);
      return true;
    } catch (error) {
      setError(error.message);
      console.error('Error updating comment:', error);
      throw error;
    }
  };

  const deleteComment = async (id, userId) => {
    try {
      setError(null);
      await commentsApi.deleteComment(id, userId);
      setComments(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (error) {
      setError(error.message);
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  // Tags methods
  const fetchAllTags = async () => {
    try {
      setError(null);
      const tags = await tagsApi.getAllTags();
      setTags(tags);
      return tags;
    } catch (error) {
      setError(error.message);
      console.error('Error fetching tags:', error);
      throw error;
    }
  };

  const searchTags = async (query) => {
    try {
      setError(null);
      const tags = await tagsApi.searchTags(query);
      return tags;
    } catch (error) {
      setError(error.message);
      console.error('Error searching tags:', error);
      throw error;
    }
  };

  const getPopularTags = async () => {
    try {
      setError(null);
      const tags = await tagsApi.getPopularTags();
      return tags;
    } catch (error) {
      setError(error.message);
      console.error('Error fetching popular tags:', error);
      throw error;
    }
  };

  // Helper methods for backward compatibility
  const getQuestionById = (id) => {
    return questions.find(q => q.id === id);
  };

  const getAnswersByQuestionId = (questionId) => {
    return answers.filter(a => a.questionId === questionId);
  };

  const getCommentsByAnswerId = (answerId) => {
    return comments.filter(c => c.answerId === answerId);
  };

  const value = {
    // State
    questions,
    answers,
    comments,
    tags,
    loading,
    error,
    
    // Questions methods
    fetchQuestions,
    fetchQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    voteOnQuestion,
    searchQuestions,
    getQuestionsByTag,
    getQuestionsByUser,
    
    // Answers methods
    fetchAnswersByQuestion,
    createAnswer,
    updateAnswer,
    deleteAnswer,
    voteOnAnswer,
    
    // Comments methods
    fetchCommentsByAnswer,
    createComment,
    updateComment,
    deleteComment,
    
    // Tags methods
    fetchAllTags,
    searchTags,
    getPopularTags,
    
    // Helper methods
    getQuestionById,
    getAnswersByQuestionId,
    getCommentsByAnswerId,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};