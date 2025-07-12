// API configuration and base functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Default headers including ngrok skip warning
const getDefaultHeaders = () => ({
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
});

// Helper function to handle API responses
const handleApiResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An error occurred' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

// Helper function to build query parameters
const buildQueryParams = (params) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            queryParams.append(key, value);
        }
    });
    return queryParams.toString();
};

// Authentication API
export const authApi = {
    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: getDefaultHeaders(),
            body: JSON.stringify(userData),
        });
        return handleApiResponse(response);
    },

    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: getDefaultHeaders(),
            body: JSON.stringify({ email, password }),
        });
        return handleApiResponse(response);
    },

    getCurrentUser: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/auth/me?userId=${userId}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return handleApiResponse(response);
    },
};

// Questions API
export const questionsApi = {
    getAllQuestions: async (page = 0, size = 10) => {
        const queryParams = buildQueryParams({ page, size });
        const response = await fetch(`${API_BASE_URL}/questions?${queryParams}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return handleApiResponse(response);
    },

    getQuestionById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return handleApiResponse(response);
    },

    createQuestion: async (questionData, userId) => {
        const response = await fetch(`${API_BASE_URL}/questions?userId=${userId}`, {
            method: 'POST',
            headers: getDefaultHeaders(),
            body: JSON.stringify(questionData),
        });
        return handleApiResponse(response);
    },

    updateQuestion: async (id, questionData, userId) => {
        const response = await fetch(`${API_BASE_URL}/questions/${id}?userId=${userId}`, {
            method: 'PUT',
            headers: getDefaultHeaders(),
            body: JSON.stringify(questionData),
        });
        return handleApiResponse(response);
    },

    deleteQuestion: async (id, userId) => {
        const response = await fetch(`${API_BASE_URL}/questions/${id}?userId=${userId}`, {
            method: 'DELETE',
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return handleApiResponse(response);
    },

    voteOnQuestion: async (id, vote, userId) => {
        const response = await fetch(`${API_BASE_URL}/questions/${id}/vote?userId=${userId}`, {
            method: 'POST',
            headers: getDefaultHeaders(),
            body: JSON.stringify({ vote }),
        });
        return handleApiResponse(response);
    },

    getQuestionsByTag: async (tagName) => {
        const response = await fetch(`${API_BASE_URL}/questions/tag/${tagName}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return handleApiResponse(response);
    },

    searchQuestions: async (query, page = 0, size = 10) => {
        const queryParams = buildQueryParams({ q: query, page, size });
        const response = await fetch(`${API_BASE_URL}/questions/search?${queryParams}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return handleApiResponse(response);
    },

    getQuestionsByUser: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/questions/user/${userId}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return handleApiResponse(response);
    },
};

// Answers API
export const answersApi = {
    getAnswersByQuestion: async (questionId) => {
        const response = await fetch(`${API_BASE_URL}/questions/${questionId}/answers`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return handleApiResponse(response);
    },

    createAnswer: async (questionId, answerData, userId) => {
        const response = await fetch(`${API_BASE_URL}/questions/${questionId}/answers?userId=${userId}`, {
            method: 'POST',
            headers: getDefaultHeaders(),
            body: JSON.stringify(answerData),
        });
        return handleApiResponse(response);
    },

    updateAnswer: async (id, answerData, userId) => {
        const response = await fetch(`${API_BASE_URL}/answers/${id}?userId=${userId}`, {
            method: 'PUT',
            headers: getDefaultHeaders(),
            body: JSON.stringify(answerData),
        });
        return handleApiResponse(response);
    },

    deleteAnswer: async (id, userId) => {
        const response = await fetch(`${API_BASE_URL}/answers/${id}?userId=${userId}`, {
            method: 'DELETE',
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return handleApiResponse(response);
    },

    voteOnAnswer: async (id, vote, userId) => {
        const response = await fetch(`${API_BASE_URL}/answers/${id}/vote?userId=${userId}`, {
            method: 'POST',
            headers: getDefaultHeaders(),
            body: JSON.stringify({ vote }),
        });
        return handleApiResponse(response);
    },
};

// Comments API
export const commentsApi = {
    getCommentsByAnswer: async (answerId) => {
        const response = await fetch(`${API_BASE_URL}/answers/${answerId}/comments`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return handleApiResponse(response);
    },

    createComment: async (answerId, commentData, userId) => {
        const response = await fetch(`${API_BASE_URL}/answers/${answerId}/comments?userId=${userId}`, {
            method: 'POST',
            headers: getDefaultHeaders(),
            body: JSON.stringify(commentData),
        });
        return handleApiResponse(response);
    },

    updateComment: async (id, commentData, userId) => {
        const response = await fetch(`${API_BASE_URL}/comments/${id}?userId=${userId}`, {
            method: 'PUT',
            headers: getDefaultHeaders(),
            body: JSON.stringify(commentData),
        });
        return handleApiResponse(response);
    },

    deleteComment: async (id, userId) => {
        const response = await fetch(`${API_BASE_URL}/comments/${id}?userId=${userId}`, {
            method: 'DELETE',
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return handleApiResponse(response);
    },
};

// Users API
export const usersApi = {
    updateProfile: async (id, profileData) => {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'PUT',
            headers: getDefaultHeaders(),
            body: JSON.stringify(profileData),
        });
        return handleApiResponse(response);
    },
};

// Tags API
export const tagsApi = {
    getAllTags: async () => {
        const response = await fetch(`${API_BASE_URL}/tags`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return handleApiResponse(response);
    },

    searchTags: async (query) => {
        const queryParams = buildQueryParams({ q: query });
        const response = await fetch(`${API_BASE_URL}/tags/search?${queryParams}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return handleApiResponse(response);
    },

    getPopularTags: async () => {
        const response = await fetch(`${API_BASE_URL}/tags/popular`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return handleApiResponse(response);
    },
};

// File Upload API
export const fileUploadApi = {
    // Keep existing methods for backward compatibility, but mark them as deprecated
    uploadAvatar: async (file, userId) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);

        const response = await fetch(`${API_BASE_URL}/files/upload/avatar`, {
            method: 'POST',
            headers: {
                'ngrok-skip-browser-warning': 'true'
            },
            body: formData,
        });
        return handleApiResponse(response);
    },

    uploadQuestionImage: async (file, questionId) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('questionId', questionId);

        const response = await fetch(`${API_BASE_URL}/files/upload/question`, {
            method: 'POST',
            headers: {
                'ngrok-skip-browser-warning': 'true'
            },
            body: formData,
        });
        return handleApiResponse(response);
    },

    uploadAnswerImage: async (file, answerId) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('answerId', answerId);

        const response = await fetch(`${API_BASE_URL}/files/upload/answer`, {
            method: 'POST',
            headers: {
                'ngrok-skip-browser-warning': 'true'
            },
            body: formData,
        });
        return handleApiResponse(response);
    },

    uploadCommentImage: async (file, commentId) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('commentId', commentId);

        const response = await fetch(`${API_BASE_URL}/files/upload/comment`, {
            method: 'POST',
            headers: {
                'ngrok-skip-browser-warning': 'true'
            },
            body: formData,
        });
        return handleApiResponse(response);
    },

    deleteFile: async (filePath) => {
        const response = await fetch(`${API_BASE_URL}/files/${filePath}`, {
            method: 'DELETE',
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return handleApiResponse(response);
    },

    getFileUrl: (filePath) => {
        return `${API_BASE_URL}${filePath}`;
    },

    // New methods for Cloudinary-based uploads
    updateQuestionWithImages: async (questionId, imageUrls) => {
        const response = await fetch(`${API_BASE_URL}/questions/${questionId}/images`, {
            method: 'PUT',
            headers: getDefaultHeaders(),
            body: JSON.stringify({ imageUrls }),
        });
        return handleApiResponse(response);
    },

    updateAnswerWithImages: async (answerId, imageUrls) => {
        const response = await fetch(`${API_BASE_URL}/answers/${answerId}/images`, {
            method: 'PUT',
            headers: getDefaultHeaders(),
            body: JSON.stringify({ imageUrls }),
        });
        return handleApiResponse(response);
    },

    updateUserAvatar: async (userId, avatarUrl) => {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/avatar`, {
            method: 'PUT',
            headers: getDefaultHeaders(),
            body: JSON.stringify({ avatarUrl }),
        });
        return handleApiResponse(response);
    },
};

// Admin API for getting all content
export const adminApi = {
    getAllAnswers: async (page = 0, size = 100) => {
        const queryParams = buildQueryParams({ page, size });
        const response = await fetch(`${API_BASE_URL}/admin/answers?${queryParams}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return handleApiResponse(response);
    },

    getAllQuestions: async (page = 0, size = 100) => {
        const queryParams = buildQueryParams({ page, size });
        const response = await fetch(`${API_BASE_URL}/admin/questions?${queryParams}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return handleApiResponse(response);
    },

    // Content moderation endpoints
    approveContent: async (contentId, contentType) => {
        const response = await fetch(`${API_BASE_URL}/admin/content/${contentType}/${contentId}/approve`, {
            method: 'POST',
            headers: getDefaultHeaders(),
        });
        return handleApiResponse(response);
    },

    flagContent: async (contentId, contentType, reason = '') => {
        const response = await fetch(`${API_BASE_URL}/admin/content/${contentType}/${contentId}/flag`, {
            method: 'POST',
            headers: getDefaultHeaders(),
            body: JSON.stringify({ reason }),
        });
        return handleApiResponse(response);
    },

    blockContent: async (contentId, contentType, reason = '') => {
        const response = await fetch(`${API_BASE_URL}/admin/content/${contentType}/${contentId}/block`, {
            method: 'POST',
            headers: getDefaultHeaders(),
            body: JSON.stringify({ reason }),
        });
        return handleApiResponse(response);
    },
};

export default {
    authApi,
    questionsApi,
    answersApi,
    commentsApi,
    usersApi,
    tagsApi,
    fileUploadApi,
    adminApi,
};
