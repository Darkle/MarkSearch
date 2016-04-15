'use strict'

/****
 * Examples of the SQL statements created in search.js: http://bit.ly/1TxvdZa
 */

function printSearchSQL(knexSQL) {
  console.log(`=========================================================================================================
  knexSQL.toSQL():
        
      `)
  console.log(knexSQL.toSQL())
  console.log(`=========================================================================================================`)
  console.log(`=========================================================================================================
  knexSQL.toString():
      `)
  console.log(knexSQL.toString())
  console.log(`=========================================================================================================`)
}

module.exports = printSearchSQL