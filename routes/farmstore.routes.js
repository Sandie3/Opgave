const Farmstore = require( '../models/farmstore.model' )

const express = require( 'express' );
const router = express.Router();

const fs = require( 'fs' )

// Handle files ( Images or whatever )
const multer = require( 'multer' )

function getRandomInt ( min = 0, max = 100 ) {
    return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

const randomName = () => {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let name = '';
    for ( let i = 0; i < 8; i++ ) {
        name += possible.charAt( getRandomInt( 0, possible.length ) );
    }
    return name;
}

const upload = multer( {

    storage: multer.diskStorage( {
        destination: function ( req, file, cb ) {
            cb( null, './public/images/' )
        },
        filename: function ( req, file, cb ) {
            let temp = file.originalname.split( '.' );
            const filename = temp[ 0 ] + '-' + randomName() + '.' + temp[ 1 ]
            cb( null, filename )
        }
    } )

} )

// GET all store
router.get( '/', async ( req, res ) => {

    console.log( 'GET all farmstores' )

    try {

        let store = await Farmstore.find(); // Find all

        return res.status( 200 ).json( store )

    } catch ( err ) {

        console.log( "ERROR:" + err )

        return res.status( 500 ).json( { message: 'Internal server error!' } )

    }

} )

// GET store from ID
router.get( '/:id', async ( req, res ) => {

    console.log( 'GET store', req.params.id )

    try {

        let store = await Farmstore.findById( req.params.id ); // Find by ID

        if ( !store ) {
            return res.status( 401 ).json( { message: "No store!" } )
        }

        return res.status( 200 ).json( store )

    } catch ( err ) {

        console.log( "ERROR:" + err )

        return res.status( 500 ).json( { message: 'Internal server error!' } )

    }

} )

// Search for store from keywords
router.get( '/search/:key', async ( req, res ) => {

    console.log( 'GET store from search', req.params.key )

    try {

        let store = await Farmstore.find( {
            $or: [
                // Search for keyword no matter the capitalization
                { 'name': { "$regex": req.params.key, "$options": "i" } },
                { 'info': { "$regex": req.params.key, "$options": "i" } },
            ]
        } );

        return res.status( 200 ).json( store )

    } catch ( err ) {

        console.log( "ERROR:" + err )

        return res.status( 500 ).json( { message: 'Internal server error!' } )

    }

} )

// ADMIN
// -----------------------------------------------------------------------------------------------

// POST new store
router.post( '/admin', upload.single( 'image' ), async ( req, res ) => {

    console.log( 'POST store' )

    try {

        let store = new Farmstore( req.body )
        store.image = req.file.filename
        // store.image = req.file ? req.file.filename : 'noimage.jpg'
        store = await store.save()

        res.status( 200 ).json( { message: 'New store is created', created: store } )

    } catch ( err ) {

        res.status( 400 ).json( { message: 'Error while posting' } )

    }

} )

// PUT - Edit store from id
router.put( '/admin/:id', upload.single( 'image' ), async ( req, res ) => {

    console.log( 'PUT store' )

    try {

        if ( req.file ) {

            req.body.image = req.file.filename

            const oldImage = await Farmstore.find( req.params.id )
            fs.unlink( './public/images/' + oldImage.image, ( err ) => {
                if ( err ) throw err;
                console.log( 'Image deleted' )
            } )

        }

        let store = await Farmstore.findByIdAndUpdate( { _id: req.params.id }, req.body, { new: true } )

        res.status( 200 ).json( { message: 'New store is created', created: store } )

    } catch ( err ) {

        res.status( 400 ).json( { message: 'Error while posting' } )

    }

} )

// DELETE a store
router.delete( '/admin/:id', async ( req, res ) => {

    console.log( 'DELETE store from ID' )

    try {

        const oldImage = await Farmstore.findById( req.params.id )
        fs.unlink( './public/images/' + oldImage.image, ( err ) => {
            if ( err ) throw err;
            console.log( 'Image deleted' )
        } )

        await Farmstore.findByIdAndDelete( req.params.id );

        return res.status( 200 ).json( { message: 'Deleted store' } )

    } catch ( err ) {

        console.log( "ERROR:" + err )

        return res.status( 500 ).json( { message: 'Internal server error!' } )

    }

} )


module.exports = router;