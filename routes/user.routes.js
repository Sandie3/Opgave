const User = require( '../models/user.model' );

const express = require( 'express' );
const router = express.Router();

// Handle form data (POST, PUT)
const formData = require( 'express-form-data' );
router.use( formData.parse() )

router.get( '/', async ( req, res ) => {

    console.log( 'GET users' )

    try {

        let user = await User.find();

        return res.status( 200 ).json( user )

    } catch ( err ) {

        console.log( "ERROR:" + err )

        return res.status( 500 ).json( { message: 'Internal server error!' } )

    }

} )

// Create user
// -----------------------------
router.post( '/', async ( req, res ) => {

    console.log( 'POST user' )

    try {
        
        let user = new User( req.body ); 

        await user.save();

        return res.status( 200 ).json( { message: "New user is created", created: user } )

    } catch ( error ) {

        console.log( "ERROR:" + error )

        return res.status( 500 ).json( { message: 'Internal server error!' } )

    }

} )

router.put( '/admin/:id', async ( req, res ) => {

    console.log( 'PUT user from id' )

    try {

        let user = await User.findByIdAndUpdate( { _id: req.params.id }, req.body, { new: true } )

        res.status( 200 ).json( { message: 'Edited user', created: user } )

    } catch ( err ) {

        res.status( 400 ).json( { message: 'Error while posting' } )

    }

} )

router.delete( '/admin/:id', async ( req, res ) => {

    console.log( 'DELETE user from ID' )

    try {

        await User.findByIdAndDelete( req.params.id );

        return res.status( 200 ).json( { message: 'Deleted user' } )

    } catch ( err ) {

        console.log( "ERROR:" + err )

        return res.status( 500 ).json( { message: 'Internal server error!' } )

    }

} )


module.exports = router;