const parseFile = require( "./parse-file" );


module.exports = ( transaction, folderContent ) => folderContent.content
        .reduce( ( promises, file, indexFile ) => {
            let query = "MERGE (f:FILE {path: {path}}) RETURN f";

            promises.push( transaction.run( query, { "path": folderContent.files[ indexFile ] } ) );
        
            parseFile( transaction, file, indexFile, promises, folderContent );
            return promises;
        }, [] );
