const Product = require( '../models/farmstore.model' )

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

// GET all products
router.get( '/', async ( req, res ) => {

    console.log( 'GET all products' )

    try {

        let products = await Product.find(); // Find all

        return res.status( 200 ).json( products )

    } catch ( err ) {

        console.log( "ERROR:" + err )

        return res.status( 500 ).json( { message: 'Internal server error!' } )

    }

} )

// GET product from ID
router.get( '/:id', async ( req, res ) => {

    console.log( 'GET product', req.params.id )

    try {

        let product = await Product.findById( req.params.id ); // Find by ID

        if ( !product ) {
            return res.status( 401 ).json( { message: "No product!" } )
        }

        return res.status( 200 ).json( product )

    } catch ( err ) {

        console.log( "ERROR:" + err )

        return res.status( 500 ).json( { message: 'Internal server error!' } )

    }

} )

// Search for product from keywords
router.get( '/search/:key', async ( req, res ) => {

    console.log( 'GET product from search', req.params.key )

    try {

        let products = await Product.find( {
            $or: [
                // Search for keyword no matter the capitalization
                { 'name': { "$regex": req.params.key, "$options": "i" } },
                { 'info': { "$regex": req.params.key, "$options": "i" } },
            ]
        } );

        return res.status( 200 ).json( products )

    } catch ( err ) {

        console.log( "ERROR:" + err )

        return res.status( 500 ).json( { message: 'Internal server error!' } )

    }

} )

// ADMIN
// -----------------------------------------------------------------------------------------------

// POST new product
router.post( '/admin', upload.single( 'image' ), async ( req, res ) => {

    console.log( 'POST product' )

    try {

        let product = new Product( req.body )
        product.image = req.file.filename
        // product.image = req.file ? req.file.filename : 'noimage.jpg'
        product = await product.save()

        res.status( 200 ).json( { message: 'New product is created', created: product } )

    } catch ( err ) {

        res.status( 400 ).json( { message: 'Error while posting' } )

    }

} )

// PUT - Edit product from id
router.put( '/admin/:id', upload.single( 'image' ), async ( req, res ) => {

    console.log( 'PUT product' )

    try {

        if ( req.file ) {
            // replace old image name with new image name
            req.body.image = req.file.filename

            // If you want to delete image/file
            const oldProduct = await Product.find( req.params.id )
            fs.unlink( './public/images/' + oldProduct.image, ( err ) => {
                if ( err ) throw err;
                console.log( 'Image deleted' )
            } )

        }

        let product = await Product.findByIdAndUpdate( { _id: req.params.id }, req.body, { new: true } )

        res.status( 200 ).json( { message: 'New product is created', created: product } )

    } catch ( err ) {

        res.status( 400 ).json( { message: 'Error while posting' } )

    }

} )

// DELETE a product
router.delete( '/admin/:id', async ( req, res ) => {

    console.log( 'DELETE product from ID' )

    try {

        const oldProduct = await Product.findById( req.params.id )
        fs.unlink( './public/images/' + oldProduct.image, ( err ) => {
            if ( err ) throw err;
            console.log( 'Image deleted' )
        } )

        await Product.findByIdAndDelete( req.params.id ); // Find by ID

        return res.status( 200 ).json( { message: 'Deleted product' } )

    } catch ( err ) {

        console.log( "ERROR:" + err )

        return res.status( 500 ).json( { message: 'Internal server error!' } )

    }

} )


module.exports = router;