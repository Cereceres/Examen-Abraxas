const saveQueryRelationWithFile = require( "./save-query-relation-with-file" );


module.exports = ( transaction, file, indexFile, promises, folderContent ) => {
    file.toLocaleLowerCase().split( /use/ )
        .filter( ( row ) => row.length )
        .forEach( ( _query ) => {
            const queryParsed = _query.replace( "\n", " " ).split( /\s+/ ).filter( ( str ) => str.length );
            const selectInd = queryParsed.findIndex( ( str ) => str === "select" );
            const fromInd = queryParsed.findIndex( ( str ) => str === "from" );
            const joinInd = queryParsed.findIndex( ( str ) => str === "join" );
            const onInd = queryParsed.findIndex( ( str ) => str === "on" );
            const whereInd = queryParsed.findIndex( ( str ) => str === "where" );
            const use = queryParsed.slice( 0, selectInd );
            const select = queryParsed.slice( selectInd + 1, fromInd ).join( "" );
            const from = queryParsed.slice( fromInd + 1, joinInd - 1 )[ 0 ];
            const join = queryParsed.slice( joinInd + 1, onInd )[ 0 ];
            const on = queryParsed.slice( onInd + 1, whereInd ).join( "" );
            const where = queryParsed.slice( whereInd + 1 ).join( " " );
            const params = {
                on,
                where,
                from,
                join,
                select,
                "path": folderContent.files[ indexFile ],
                "name": use[ 0 ]
            };

            saveQueryRelationWithFile( promises, params, transaction );
        } );
};
