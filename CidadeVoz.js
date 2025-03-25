const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const ws = require("ws");
const http = require("http")
const bcrypt = require('bcrypt')
const fs = require("fs")
const mime = require("mime-types")
const path = require("path")




const app = express();
app.use(express.json())
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/images/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const mimeType = mime.lookup(file.originalname);
    if (mimeType && mimeType.startsWith('image/')) { 
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024, files: 1 },
    fileFilter: fileFilter

})

const db = new sqlite3.Database('./db/CidadeVoz_Banco.db', (err) => {
     if (err) {
        console.error("Erro ao Conectarr com o banco de Dados: ", err.message);
     }else{
        console.log("Banco de Dados Criado Com Sucesso!")
     }
})


const createYearTable = async () => {

    let Ano = 2000;
    const Ano_atual = new Date().getFullYear();
    while ( Ano < Ano_atual ){
        Ano = Ano + 4; 
    }
    const Correct_Year = ( Ano - 4 );

     db.get("SELECT * FROM periodos WHERE ano = ?", [ Correct_Year ], ( err, row ) => {
        if(err){
            return false;
        }else{
            if ( !row ) {
                db.run("INSERT INTO periodos VALUES (?,?) ",  [ Correct_Year, JSON.stringify([])  ] )
            }
        }
     })

}

const CreateDataBases = async () => { 
    await db.run("CREATE TABLE IF NOT EXISTS registros ( CPF INTERGER PRIMARY KEY UNIQUE, Senha TEXT NOT NULL , Configs TEXT ) ");
    const table_year = await db.run("CREATE TABLE IF NOT EXISTS periodos ( ano INTERGER PRIMARY KEY UNIQUE, vereadores TEXT ) ")
    if ( table_year ) { 
        await createYearTable();
    }
}

CreateDataBases();



// Usuário -------------------------------------------------------

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
    db.all( "SELECT * FROM registros WHERE CPF = ? AND Senha = ?", [ body.CPF, body.Senha ], (err, row) => {
        if (err) {
            res.status(400).json('CPF e/ou Senha Inválido')
        }else {
            res.status(200).json(row)
        }
    } )
})

// Usuário -------------------------------------------------------


//Vereadores ----------------------------------------------------


app.post('/getvereadores', async (req, res) => {
    db.all("SELECT * FROM registros", [] , (err, row) => {
        let vereadores = []
        for ( let i = 0; i < row.length; i++ ){
            let config_json = JSON.parse( row[i].Configs )  
            if ( config_json.Tipo === "Sou Vereador" ){
                vereadores.push( row[i] );
            }
        }
        if ( vereadores.length > 0  ) {
            res.status(200).json(vereadores)  
        }else {
            res.status(400).json( { message: "Nenhum Vereador encontrado na database!" } )
        }
    })
})


app.post('/getvereadorbycpf', async (req, res) => {
    const body = req.body;
    if (!body){
        return;
    }
    res.json( { message: "Um vereador ai ggzada" } )
})

app.get('/periodos', async (req, res) => {
    db.all("SELECT * FROM periodos", [], (err, row) => {
        if (err){
            res.status(400).json({message: "Erro ao recolher os periodos"})
        }else{
            res.status(200).json(row);
        }
    })
})

//Vereadores ----------------------------------------------------

// Imagens -----------------------------------------------------

const upload_Person = (CPF, Configs) => {
    db.run("UPDATE registros SET Configs = ? WHERE CPF = ?", [ Configs, CPF ], (err, row) => {
        if (err) {
            return false;
        }
    } )
    return true;
}

app.post('/upload_person_file', upload.single('image'), (req, res) => {
    if (req.file) {
        const body = req.body;
        if (body.CPF) {
            db.get("SELECT Configs FROM registros WHERE CPF = ?", [body.CPF], (err, row) => {
                if (err) {
                    console.error('Erro ao consultar o banco de dados:', err);
                    return res.status(500).send('Erro interno no servidor.');
                }

                if (row) {

                    let updated_image = JSON.parse( row.Configs )
                    updated_image.Image = req.file.originalname || "N/A"

                    const has_updated = upload_Person( body.CPF, JSON.stringify(updated_image) )

                    if ( has_updated ){
                        return res.status(200).send("Imagem Alterada Com Sucesso!");
                    }
                } else {
                    return res.status(404).send('CPF não encontrado.');
                }
            });
        }
    } else {
        res.status(400).send('Erro ao Carregar a Imagem.');
    }
});



app.get('/get_person_image/:imageName', (req, res) => {
    const imageName = req.params.imageName;

    const imagePath = path.join(__dirname, 'uploads/images', imageName);

    fs.exists(imagePath, (exists) => {
        if (exists) {
            res.sendFile(imagePath);
        } else {
            res.status(404).send('Imagem não encontrada');
        }
    });
});






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