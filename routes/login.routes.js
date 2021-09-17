const User = require( '../models/user.model' );

const express = require( 'express' );
const router = express.Router();

// Handle form data (POST, PUT)
const formData = require( 'express-form-data' );
router.use( formData.parse() )

// Login user
// -----------------------------
router.post( '/', async ( req, res ) => {

    console.log( 'Login' )

    try {

        const { email, password } = req.body;

        const user = await User.findOne( { email: email } );

        if ( !user ) {
            return res.status( 401 ).json( { message: "Email wrong!" } )
        }

        user.comparePassword( password, function ( err, isMatch ) {

            if ( err ) throw err;

            if ( isMatch ) {

                req.session.userId = user._id;

                res.status( 200 ).json( { name: user.name, user_id: user._id } )

            } else {
                
                return res.status( 401 ).json( { message: "Password does not match!" } )
            }

        } )

    } catch ( error ) {

        console.log( "ERROR:" + error )

        return res.status( 500 ).json( { message: 'Internal server error!' } )

    }

} )

// Log out
// -----------------------------
router.get( '/logout', async ( req, res ) => {

    console.log( 'Logout' )

    req.session.destroy( err => { 
        if (err) return res.status( 500 ).json( { message: 'Logout unsuccessful' } )

        res.clearCookie( process.env.SESSION_NAME ).json( { message: 'Cookie deleted' } )
     } )

} )

// Logged in
// -----------------------------
router.get( '/loggedin', async ( req, res ) => {

    console.log( 'Login still active' )

    if (req.session.userId) {
        return res.status( 200 ).json( { message: 'Login still active', login: true } )
    } else {
        return res.status( 401 ).json( { message: 'Login expired', login: false } )
    }

} )

module.exports = router;