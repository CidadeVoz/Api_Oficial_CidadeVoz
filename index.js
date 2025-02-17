const express = require("express");
const sqlite3 = require("sqlite3");
const multer = require("multer");
const ws = require("ws");

const app = express();
























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