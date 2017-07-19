const url = require( "url" );


const neo4j = require( "neo4j-driver" ).v1;

const readFolder = require( "./read-folder" );
const defaultConnection = "http://neo4j:neo4j@localhost:7474";
const urlNeo4j = url.parse( process.argv[ 3 ] || defaultConnection );
const auth = urlNeo4j.auth.split( ":" );

const session = neo4j.driver( `bolt://${ urlNeo4j.hostname}`, neo4j.auth.basic( auth[ 0 ], auth[ 1 ] ) ).session();

const pathToFolder = process.argv[ 2 ];


if ( !pathToFolder ) {
    console.log( "The path to folder is neccesary" );
    process.exit( 1 );
}

const extensionToRead = ".sql";
const folderContent = readFolder( pathToFolder, extensionToRead );
const promises = [];

session.readTransaction( ( transaction ) => {
    folderContent.content.forEach( ( file, indexFile ) => {
        let query = "MERGE (f:FILE {path: {path}}) RETURN f";

        promises.push( transaction.run( query, { "path": folderContent.files[ indexFile ] } ) );
        file.toLocaleLowerCase().split( /use/ )
        .filter( ( row ) => row.length )
        .forEach( ( _query ) => {
            console.log( "query =====", _query );
            const queryParsed = _query.replace( "\n", " " )
                .split( /\s+/ ).filter( ( str ) => str.length );

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
                "path": folderContent.files[ indexFile ],
                "name": use[ 0 ],
                from, join,
                select
            };
            
            query = "MERGE (q:QUERY {on: {on}, where: {where}}) RETURN q";
            promises.push( transaction.run( query, params ) );

            query = `MATCH (f:FILE {path: {path}}), (q:QUERY {on: {on}, where: {where}})
                     CREATE (f)-[:has_query]->(q)`;
            promises.push( transaction.run( query, params ) );
            

            query = "MERGE (db:DATABASE {db: {name}}) RETURN db";
            promises.push( transaction.run( query, params ) );

            query = `MATCH (q:QUERY {on: {on}, where: {where}}), (db:DATABASE {db: {name}})
                     CREATE (q)-[:uses_database]->(db)`;
            promises.push( transaction.run( query, params ) );

            query = "MERGE (tb:TABLE {table: {join}}) RETURN tb";
            promises.push( transaction.run( query, params ) );

            query = "MERGE (tb:TABLE {table: {from}}) RETURN tb";
            promises.push( transaction.run( query, params ) );

            query = `MATCH (q:QUERY {on: {on}, where: {where}}), (tb:TABLE {table: {join}})
                     CREATE (q)-[:uses_table]->(tb)`;
            promises.push( transaction.run( query, params ) );

            query = `MATCH (q:QUERY {on: {on}, where: {where}}), (tb:TABLE {table: {from}})
                     CREATE (q)-[:uses_table]->(tb)`;
            promises.push( transaction.run( query, params ) );

            select.split( "," ).forEach( ( field ) => {
                console.log( "field = ", field );
                params.field = field;
                query = "MERGE (field:FIELD {field: {field}}) RETURN field";
                promises.push( transaction.run( query, { field } ) );
                query = `MATCH (q:QUERY {on: {on}, where: {where}}), (field:FIELD {field: {field}}) 
                     CREATE (q)-[:uses_field]->(field)`;
                promises.push( transaction.run( query, params ) );

                query = `MATCH (tb:TABLE {table: {from}}), (field:FIELD {field: {field}}) 
                     CREATE (tb)-[:has_field]->(field)`;
                promises.push( transaction.run( query, params ) );
            } );
           

            query = `MATCH  (tb:TABLE {from: {from}, join: {join}}), (db:DATABASE {db: {name}})
                     CREATE (db)-[:has_table]->(tb)`;
            promises.push( transaction.run( query, params ) );


        } );
    } );
    Promise.all( promises )
    .then( console.log )
    .catch( console.error )
    .then( () => {
        session.close();
        process.exit();
    } );
} );
