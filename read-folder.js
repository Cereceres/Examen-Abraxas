const fs = require( "fs" );
const path = require( "path" );
const { isArray } = Array;

module.exports = ( folderPath = "./", extensions = [ ".js" ] ) => {
    if ( !isArray( extensions ) ) extensions = [ extensions ];

    const pathAbsoluteToFolder = path.resolve( folderPath );
    const files = fs.readdirSync( pathAbsoluteToFolder )
        .filter( filterFoldersAndHiddenFiles( pathAbsoluteToFolder, extensions ) );
    const content = files.map( ( file ) => fs.readFileSync( `${pathAbsoluteToFolder }/${ file}` ).toString() );

    return { files, content };
};

const filterFoldersAndHiddenFiles = ( pathAbsoluteToFolder, extensions ) => ( file ) => {
    const isFile = fs.lstatSync( `${pathAbsoluteToFolder }/${ file}` ).isFile();
    const isNoTHiden = !/^\./.test( file );
    const fileExt = path.extname( file );
    const isValidExtension = extensions.reduce( ( is_, extension ) => is_ || extension === fileExt, false );
    const isValidFile = isFile && isNoTHiden && isValidExtension;

    return isValidFile;
};
