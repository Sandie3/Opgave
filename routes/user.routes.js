const User = require( '../models/user.model' );

const express = require( 'express' );
const router = express.Router();

// Handle form data (POST, PUT)
const formData = require( 'express-form-data' );
router.use( formData.parse() )

// Create user
// -----------------------------
router.post( '/', async ( req, res ) => {

    console.log( 'Created user' )

    try {
        
        let user = new User( req.body ); 

        await user.save();

        return res.status( 200 ).json( { message: "Created", created: user } )

    } catch ( error ) {

        console.log( "ERROR:" + error )

        return res.status( 500 ).json( { message: 'Internal server error!' } )

    }

} )


module.exports = router;