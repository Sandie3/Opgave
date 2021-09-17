const express = require( 'express' );
require( 'dotenv' ).config();
const cors = require( 'cors' );

const app = express();
const PORT = process.env.PORT || 4011;


// ---- Mongo & Mongoose
// ------------------------------------------
const mg = require( 'mongoose' );

// Local DB
mg.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })


const db = mg.connection; // Connect to DB
db.on( 'error', ( error ) => console.log( "ERROR: " + error ) )
db.once( 'open', () => console.log( "/// ----> MongoDB ready! " ) )

// ---- APP
// ------------------------------------------
app.use( express.json() );                              // Handle JSON data
app.use( express.urlencoded( { extended: true } ) )     // Handle URLEncoded data
app.use( cors( { credentials: true, origin: true } ) )  // CORS
app.use( express.static( 'public' ) )                   // Define public folder to get static files

// ---- SESSION
// ------------------------------------------

const session = require( 'express-session' )
const MongoStore = require( 'connect-mongo' )

const expire = 1000 * 60 // 1 minute

app.use( session( {
    name: process.env.SESSION_NAME,
    // if resave + rolling = true, session will resave on every page refresh
    resave: false,
    rolling: true,
    saveUninitialized: false, //
    store: MongoStore.create( { mongoUrl: process.env.DB_URL } ),
    secret: process.env.SESSION_SECRET,
    cookie: {
        maxAge: expire,
        sameSite: 'strict',
        secure: false, // True if SSL is enabled
        httpOnly: true, // Important - Session can't be manipulated by external JS

    }
} ) )

// ---- AUTH CHECK
// ------------------------------------------
app.use( '*/admin*', async ( req, res, next ) => {

    // If user is logged in
    if (req.session && req.session.userId) {
        return next()
    } else {
        console.log('Login unauthorized')
        return res.status( 401 ).json( { message: 'Unauthorized' } )
    }

} )

// ---- ROUTES
// ------------------------------------------

// "Landing page"
app.get( '/', async ( req, res ) => {
    console.log( 'Server endpoint' )
    return res.status( 200 ).json( { message: 'SERVER OK' } )
} )
app.use( '/farmstore', require( './routes/farmstore.routes' ) )
app.use( '/login', require( './routes/login.routes' ) )
app.use( '/user', require( './routes/user.routes' ) )

// ---- LISTEN
// ------------------------------------------
app.listen( PORT, () => {
    console.log( "/// ----> Listening on port: " + PORT )
} )