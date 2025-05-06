const db = require('../../database/db.config');
const Article = db.article;

// Create a new article
exports.create = (req, res) => {
    // Récupération des données
    const { iid, nom, description, prix, stock, categorie, images } = req.body;
    
    if (!iid || !nom || !description || !prix || !stock || !categorie || !images) {
        return res.status(400).send({
            message: 'Le contenu ne peut pas être vide'
        });
    }
    
    const newArticle = new Article({
        iid: iid,
        nom: nom,
        description: description,
        prix: prix,
        stock: stock,
        categorie: categorie,
        images: images,
        date_ajout: new Date()
    });
    
    newArticle.save(newArticle)
        .then((data) => {
            res.status(200).send({
                message: 'Article créé avec succès'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({
                message: "Une erreur s'est produite lors de la création de l'article"
            });
        });
}

// Retrieve all articles from the database
exports.findAll = (req, res) => {
    Article.find()
        .then(articles => {
            res.status(200).send(articles);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Une erreur s'est produite lors de la récupération des articles."
            });
        });
}