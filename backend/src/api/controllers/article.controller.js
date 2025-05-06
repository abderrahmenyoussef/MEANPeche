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

// Find a single article with an id
exports.findById = (req, res) => {
    const id = req.params.id;
    
    Article.findById(id)
        .then(data => {
            if (!data) {
                return res.status(404).send({
                    message: `Article avec l'id ${id} non trouvé.`
                });
            }
            res.status(200).send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: `Erreur lors de la récupération de l'article avec l'id ${id}`
            });
        });
};

// Update an article by id
exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Les données de mise à jour ne peuvent pas être vides!"
        });
    }
    
    const id = req.params.id;
    
    Article.findByIdAndUpdate(id, req.body, { useFindAndModify: false, new: true })
        .then(data => {
            if (!data) {
                return res.status(404).send({
                    message: `Impossible de mettre à jour l'article avec l'id ${id}. L'article n'a pas été trouvé.`
                });
            }
            res.status(200).send({
                message: "L'article a été mis à jour avec succès.",
                data: data
            });
        })
        .catch(err => {
            res.status(500).send({
                message: `Erreur lors de la mise à jour de l'article avec l'id ${id}`
            });
        });
};

// Delete an article with the specified id
exports.delete = (req, res) => {
    const id = req.params.id;
    
    Article.findByIdAndDelete(id)
        .then(data => {
            if (!data) {
                return res.status(404).send({
                    message: `Impossible de supprimer l'article avec l'id ${id}. L'article n'a pas été trouvé.`
                });
            }
            res.status(200).send({
                message: "L'article a été supprimé avec succès!"
            });
        })
        .catch(err => {
            res.status(500).send({
                message: `Erreur lors de la suppression de l'article avec l'id ${id}`
            });
        });
};