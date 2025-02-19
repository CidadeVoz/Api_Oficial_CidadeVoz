const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const ws = require("ws");
const bcrypt = require('bcrypt')


const app = express();
app.use(express.json())

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/images/')
    },
    filename: function (req, file, cb) {
        file
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024, files: 1 }
})

const db = new sqlite3.Database('./db/CidadeVoz_Banco.db', (err) => {
     if (err) {
        console.error("Erro ao Conectarr com o banco de Dados: ", err.message);
     }else{
        console.log("Banco de Dados Criado Com Sucesso!")
     }
})



const CreateDataBases = async () => { 
    await db.run("CREATE TABLE IF NOT EXISTS registros ( CPF INTERGET PRIMARY KEY UNIQUE, Senha TEXT NOT NULL , Configs TEXT ) ");
}

CreateDataBases();




app.post('/register', async (req, res)=> {
    const body = req.body;
    if (!body) {
        res.status(400).send("Erro nas Informações Enviadas!")
    }

      
    db.run( "INSERT INTO registros VALUES(?,?,?)", [ body.CPF, body.Senha, JSON.stringify( body.Configs ) ], (err, row) => {
        if (err) {
            res.status(400).send("Erro ao se Cadastrar!")
        }else {
            res.status(200).send('Usuário Cadastrado com Sucesso!')
        }
    } )
})

app.post('/login', async (req, res) => {
    const body = req.body
    if ( !body ){
        res.status(400).send("Erro nas Informações Enviadas!");
    }
    console.log(body)
    db.get( "SELECT * FROM registros WHERE CPF = ? AND Senha = ?", [ body.CPF, body.Senha ], (err, row) => {
        if (err) {
            res.status(400).send('CPF e/ou Senha Inválido')
        }else {
            res.status(200).send(row)
        }
    } )
})


// app.post('/upload', upload.single('image'), (req, res) => {
//     if (req.file) {
//         res.send('Imagem Carregada Com Sucesso!')
//     }else{
//         res.status(400).send('Erro ao Carregar a Imagem.')
//     }
// } )






app.get('/', async (req, res) => {
    res.send(`
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #008000; /* Verde */
                        margin: 0;
                        height: 100vh;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .container {
                        text-align: center;
                        color: #FFD700; /* Amarelo */
                        font-size: 2rem;
                        animation: float 3s ease-in-out infinite;
                    }
                    h1 {
                        font-size: 3rem;
                        margin-bottom: 20px;
                    }
                    .highlight {
                        font-weight: bold;
                        font-size: 3.5rem;
                        color: #FFD700;
                    }
                    .emoji {
                        font-size: 3rem;
                    }
                    @keyframes float {
                        0%, 100% {
                            transform: translateY(0);
                        }
                        50% {
                            transform: translateY(-15px);
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>
                        <span class="emoji">🌟</span> 
                        <span class="highlight">API do CidadeVoz</span> 
                        <span class="emoji">🌟</span>
                    </h1>
                    <p>Bem-vindo(a)! Estamos aqui para facilitar a comunicação entre cidadãos e vereadores. <span class="emoji">📢</span></p>
                </div>
            </body>
        </html>
    `);
});


app.listen( 3001 , () => {
    console.log("Servidor Rodando na Porta 3001 🚀")
} )