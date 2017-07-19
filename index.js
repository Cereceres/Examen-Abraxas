const url = require( "url" );

const neo4j = require( "neo4j-driver" ).v1;

const readFolder = require( "./lib/read-folder" );
const saveContentFolder = require( "./lib/save-content-folder" );

const defaultConnection = "http://neo4j:neo4j@localhost:7474";
const urlNeo4j = url.parse( process.argv[ 3 ] || defaultConnection );
const pathToFolder = process.argv[ 2 ];
const extensionToRead = ".sql";
const auth = urlNeo4j.auth.split( ":" );
const session = neo4j.driver( `bolt://${ urlNeo4j.hostname}`, neo4j.auth.basic( auth[ 0 ], auth[ 1 ] ) ).session();
const folderContent = readFolder( pathToFolder, extensionToRead );


if ( !pathToFolder ) {
    console.log( "The path to folder is neccesary!!" );
    process.exit( 1 );
}


saveContentFolder( folderContent, session );
