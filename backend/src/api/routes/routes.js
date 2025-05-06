module.exports = app => {
    const router = require('express').Router();
    const articleController = require('../controllers/article.controller');
    
    // Create a new article
    router.post('/articles', articleController.create);
    
    // Retrieve all articles
    router.get('/articles', articleController.findAll);
    
    app.use('/api', router);
}