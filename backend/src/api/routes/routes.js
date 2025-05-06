module.exports = app => {
    const router = require('express').Router();
    const articleController = require('../controllers/article.controller');
    
    // Create a new article
    router.post('/articles', articleController.create);
    
    // Retrieve all articles
    router.get('/articles', articleController.findAll);
    
    // Retrieve a single article with id
    router.get('/articles/:id', articleController.findById);
    
    // Update an article with id
    router.put('/articles/:id', articleController.update);
    
    // Delete an article with id
    router.delete('/articles/:id', articleController.delete);
    
    app.use('/api', router);
}