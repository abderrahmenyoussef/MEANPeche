module.exports = mongoose => {
    const Schema = mongoose.Schema;
    let ArticleSchema = new Schema({
        iid: {
            type: String,
            required: true,
            unique: true
        },
        nom: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        prix: {
            type: Number, // Using float (Number in JavaScript)
            required: true
        },
        stock: {
            type: Number, // Integer in JavaScript
            required: true
        },
        categorie: {
            type: String,
            required: true
        },
        images: {
            type: String, // URL to the image
            required: true
        },
        date_ajout: {
            type: Date,
            default: Date.now
        }
    }, {
        timestamps: true // Adds createdAt and updatedAt fields automatically
    });

    ArticleSchema.method('toJSON', function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Article = mongoose.model('Article', ArticleSchema);
    return Article;
}