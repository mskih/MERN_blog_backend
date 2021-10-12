const express = require("express");
const bodyparser = require("body-parser");
const app = express();
const {MongoClient} = require ("mongodb");

const withDB = async(operations, res) =>{
    try{
        const client = await MongoClient.connect('mongodb://localhost:27017/',{
        useNewURLParser: true,
        useUnifiedTopology: true
    });
        const db=client.db("mernblog");
        console.log("Mongo connected")
        await operations(db);

        client.close();
    }catch(err){
        res.status(500).json({message:'Error connecting to db', err});
    }
}

app.get('/mernblog/articles/:name', async (req, res)=>{
        withDB(async (db)=>{
            const articleName=req.params.name;
        const articleInfo= await db.collection('articles').findOne({name: articleName});
        res.status(200).json(articleInfo);    
        }, res)       
});

app.use(bodyparser.json());

app.post('/mernblog/articles/:name/add-comments', (req, res)=>{

    const {username, text}=req.body;
    const articleName=req.params.name;

    withDB(async (db)=>{
        const articleInfo =await db.collection('articles').findOne({name: 'articleName'});
        await db.collection('articles').updateOned({name: articleName}, 
            {
            '$set':{
                comments: articleInfo.comments.concat({username, text}),
            },
        });
        const updatedArticleInfo = await db.collection('articles').findOne({name: 'articleName'});
        res.status(200).json(updatedArticleInfo);
    }, res);
});

app.listen(8000, ()=>console.log("Listening on port 8000"));
