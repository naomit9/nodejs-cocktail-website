const express = require("express");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
const exp = require("constants");
const dotenv = require("dotenv");

dotenv.config();

// DB Values
const dbUrl =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.DB_HOST}`;
const client = new MongoClient(dbUrl);

const app = express();
const port = process.env.PORT || "8888";

// Set up Template Engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Path for Static Files
app.use(express.static(path.join(__dirname, "public")));

// Form Data Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Page Routes
app.get("/", async (req, res) => {
    let cocktailDrinks = await getCocktails();
    //console.log(cocktailDrinks)
    res.render("index", {title: "Home", drinks: cocktailDrinks})
});

app.get("/list", async (req, res) => {
    let cocktailDrinks = await getCocktails();
    res.render("list", {title : "List of Cocktails", drinks: cocktailDrinks})
});

// Admin Pages
app.get("/admin/cocktail/add", async (req, res) => {
    let cocktailDrinks = await getCocktails();
    res.render("cocktail-add", {title: "Add new cocktail", drinks: cocktailDrinks});
})

app.get("/admin/cocktail", async (req, res) => {
    let cocktailDrinks = await getCocktails();
    res.render("cocktail-admin", {title: "Admin Page", drinks: cocktailDrinks});
})

app.get("/admin/cocktail/delete", async (req, res) => {
    let id = req.query.cocktailId;
    await deleteCocktail(id);
    res.redirect("/admin/cocktail")
})

app.get("/admin/cocktail/edit", async (req, res) => {
    if (req.query.cocktailId) {
        let cocktailToEdit = await getSingleCocktail(req.query.cocktailId);
        let cocktailDrinks = await getCocktails();
        res.render("cocktail-edit", { title: "Edit cocktail", drinks: cocktailDrinks,
    editCocktail:cocktailToEdit});
    } else {
        res.redirect("/admin/cocktail");
    }
});

// Admin Form Processing
app.post("/admin/cocktail/add/submit", async (req, res) => {
    let name = req.body.name;
    let type = req.body.type;
    let origin = req.body.origin;
    let alcoholContent= req.body.alcoholContent;
    let ingredients = req.body.ingredients;
    let preparation = req.body.preparation;
    let creationDate = req.body.creationDate;
    let newCocktail = {
        "name":name,
        "type":type,
        "origin":origin,
        "alcoholContent":alcoholContent,
        "ingredients":ingredients,
        "preparation":preparation,
        "creationDate":creationDate
    }
    await addCocktail(newCocktail);
    res.redirect("/admin/cocktail");
})

app.post("/admin/cocktail/edit/submit", async (req, res) => {
    let idFilter = {_id: new ObjectId(req.body.cocktailId)};
    let name = req.body.name;
    let type = req.body.type;
    let origin = req.body.origin;
    let alcoholContent= req.body.alcoholContent;
    let ingredients = req.body.ingredients;
    let preparation = req.body.preparation;
    let creationDate = req.body.creationDate;
    let updatedCocktail = {
        "name":name,
        "type":type,
        "origin":origin,
        "alcoholContent":alcoholContent,
        "ingredients":ingredients,
        "preparation":preparation,
        "creationDate":creationDate
    }
    await editCocktail(idFilter, updatedCocktail);
    res.redirect("/admin/cocktail")
})


app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
});

// MongoDB Functions
async function connection() {
    db = client.db("cocktaildb");
    return db;
}

// Function to select all documents in the cocktails collection
async function getCocktails() {
    db = await connection();
    let results = db.collection("cocktails").find({})
    let res = await results.toArray();
    return res;
}

// Function to add a cocktail to the cocktails collection
async function addCocktail(cocktailData) {
    db = await connection();
    let status = await db.collection("cocktails").insertOne(cocktailData);
    console.log("cocktail added")
}

// Function to delete a cocktail document from the collection
async function deleteCocktail(id) {
    db = await connection();
    const deleteId = {_id: new ObjectId(id)};
    const result = await db.collection("cocktails").deleteOne(deleteId);
    if (result.deleteCount == 1)
        console.log("delete successful")
}

// Function to edit a single cocktail document 
async function getSingleCocktail(id) {
    db = await connection();
    const editId = {_id: new ObjectId(id)};
    const result = await db.collection("cocktails").findOne(editId);
    return result;
}

async function editCocktail(filter, updatedCocktail) {
    db = await connection();
    const updateCocktail = {
        $set: updatedCocktail
    }
    let status = await db.collection("cocktails").updateOne(filter, updateCocktail);
}