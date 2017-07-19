const saveRelationFieldsWithOthers = require( "./save-relation-fields-with-others" );


module.exports = ( promises, params, transaction ) => {
    let query = "MERGE (q:QUERY {on: {on}, where: {where}}) RETURN q";

    promises.push( transaction.run( query, params ) );

    query = `MATCH (f:FILE {path: {path}}), (q:QUERY {on: {on}, where: {where}})
                     CREATE UNIQUE (f)-[:has_query]->(q)`;
    promises.push( transaction.run( query, params ) );
            

    query = "MERGE (db:DATABASE {db: {name}}) RETURN db";
    promises.push( transaction.run( query, params ) );

    query = `MATCH (q:QUERY {on: {on}, where: {where}}), (db:DATABASE {db: {name}})
                     CREATE UNIQUE (q)-[:uses_database]->(db)`;
    promises.push( transaction.run( query, params ) );

    query = "MERGE (tb:TABLE {table: {join}}) RETURN tb";
    promises.push( transaction.run( query, params ) );

    query = "MERGE (tb:TABLE {table: {from}}) RETURN tb";
    promises.push( transaction.run( query, params ) );

    query = `MATCH (q:QUERY {on: {on}, where: {where}}), (tb:TABLE {table: {join}})
                     CREATE UNIQUE (q)-[:uses_table]->(tb)`;
    promises.push( transaction.run( query, params ) );

    query = `MATCH (q:QUERY {on: {on}, where: {where}}), (tb:TABLE {table: {from}})
                     CREATE UNIQUE (q)-[:uses_table]->(tb)`;
    promises.push( transaction.run( query, params ) );
           
    saveRelationFieldsWithOthers( promises, params, transaction );
    query = `MATCH  (tb:TABLE {table: {from}}), (db:DATABASE {db: {name}})
                     CREATE UNIQUE (db)-[:has_table]->(tb)`;
    promises.push( transaction.run( query, params ) );

    query = `MATCH  (tb:TABLE {table: {join}}), (db:DATABASE {db: {name}})
                     CREATE UNIQUE (db)-[:has_table]->(tb)`;
    promises.push( transaction.run( query, params ) );
};
