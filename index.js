const express = require('express')
const { PrismaClient } = require('@prisma/client')
const bodyParser = require("body-parser")
const requireJsonContent = require("./middlewear/requireJsonContent.js")
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
const app = express()
const prisma = new PrismaClient()
const port = process.env.PORT || 3000

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET_AUTH,
  baseURL: 'http://localhost:3000',
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: 'https://dev-cqqe5nrs30z0euec.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

app.get("/", (req,res) => {
    res.send("Hello World!")
})

// req.isAuthenticated is provided from the auth router
app.get('/callback', (req, res) => {
    console.log(req.body)
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

app.post("/create/user", requireJsonContent, async (req,res)=>{
    try {
        const { email, name } = req.body
        const newUser = await prisma.user.create({
            data:{
                name,
                email
            }
        })
        res.status(200).json(newUser)
    } catch (error) {
        throw new Error(error)
    }
})

app.get("/login/success", (req,res)=>{

})

app.listen(port, () => {
    console.log(`Port running at: ${port}`)
})