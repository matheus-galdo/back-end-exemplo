import express from "express";
import { MongoClient } from "mongodb";
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import Joi from "joi";
import { loginSchema } from "./schemas/userSchema.js";
import dayjs from "dayjs";

const mongoClient = new MongoClient("mongodb://localhost:27017");
let db;

mongoClient.connect().then(() => {
    db = mongoClient.db("my_wallet");
});


const app = express();
app.use(express.json());



async function cadastro(req, res) {
    const { email, password, confirm_password } = req.body;

    try {
        const user = await db.collection("users").findOne({ email: email });

        if (user) {
            return res.status(409).send("já existe um usuário com este email");
        }

        const senha_criptografada = bcrypt.hashSync(password, 10);

        await db.collection("users").insertOne({ email, senha_criptografada });
        res.sendStatus(201);
    } catch (error) {
        res.sendStatus(400);
    }
}

app.post('/sign-up', cadastro)
app.post('/sign-in', login)
app.get('/listar-usuarios', listUsers)







app.post('/sign-up', (req, res) => {
    const { email, password, confirm_password } = req.body;

    db.collection("users").findOne({ email: email }).then(user => {
        if (user) {
            return res.status(409).send("já existe um usuário com este email")
        }

        const senha_criptografada = bcrypt.hashSync(password, 10);

        db.collection("users").insertOne({ email, senha_criptografada }).then(result => {
            res.sendStatus(201);
        }).catch(error => {
            res.sendStatus(400);
        });
    }).catch(error => {
        res.sendStatus(400);
    });
});




app.post('/sign-in', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('as informações de login estão erradas');
    }

    const { error } = loginSchema.validate({ email, password });
    console.log(error)

    if (error) {
        return res.status(400).send('as informações de login estão erradas');
    }

    return res.send('deu certo');


    try {
        const user = await db.collection("users").findOne({ email: email });
    } catch (error) {
        console.log('deu um erro', error)
    }

    const hash = user.password;
    const senha_correta = bcrypt.compareSync(password, hash);


    if (senha_correta) {
        const token = uuid();

        db.collection("sessions").insertOne({ token: token, })

        return res.send({
            token: `Bearer ${token}`
        })
    }
    res.sendStatus(201);
});

app.get('/list-users', async (req, res) => {
    const users = await db.collection("users").find({}).toArray();
    res.send(users);
})


app.get('transacoes', (req, res) => {
    const { authorization } = req.headers;
})


app.get("/agora", (req, res) => {
    const agora = dayjs('2004/08/20 23:45:20');


    res.send(agora.add(4, 'day').format("DD/MM/YY HH:mm:ss"));
})

app.listen(5000);

