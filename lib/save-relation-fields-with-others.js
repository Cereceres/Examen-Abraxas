module.exports = ( promises, params, transaction ) => params.select.split( "," ).forEach( ( _field ) => {
    const fieldSplited = _field.split( "." );
    let table = fieldSplited[ 0 ];
    let field = fieldSplited[ 1 ];
    const theFieldIsTheSameOfFrom = !field;

    if ( theFieldIsTheSameOfFrom ){
        field = table;
        table = params.from;
    }

    const _params = Object.assign( { field, table }, params );

    let query = "MERGE (field:FIELD {field: {field}}) RETURN field";

    promises.push( transaction.run( query, { field } ) );
    query = `MATCH (q:QUERY {on: {on}, where: {where}}), (field:FIELD {field: {field}}) 
                     CREATE UNIQUE (q)-[:uses_field]->(field)`;
    promises.push( transaction.run( query, _params ) );
    if ( table !== params.from && table !== params.join ) return;

    query = `MATCH (tb:TABLE {table: {table}}), (field:FIELD {field: {field}}) 
                     CREATE UNIQUE (tb)-[:has_field]->(field)`;
    promises.push( transaction.run( query, _params ) );
} );
