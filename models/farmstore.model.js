const mg = require( 'mongoose' );

const storeScheme = new mg.Schema( {
    name: {
        type: String,
        required: [ true, 'No name!' ]
    },
    address: {
        type: String,
        requires: [ true, 'No address!' ]
    },
    info: {
        type: String,
        default: [ true, 'No info!' ]
    },
    opening: {
        type: String,
        default: [ true, 'No opening!' ]
    },
    image: {
        type: String,
        requires: [ true, 'No image!' ]
    }
} )

module.exports = mg.model( 'Stores', storeScheme, 'stores' );