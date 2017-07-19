const parseFolder = require( "./parse-folder" );

module.exports = ( folderContent, session ) => session
    .readTransaction( ( transaction ) => {
        const promises = parseFolder( transaction, folderContent );

        Promise.all( promises )
        .then( () => {
            session.close();
            process.exit();
        } )
        .catch( console.error );
    } );
