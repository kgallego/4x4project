
"use strict"

/* Globals START */

const FS = require( 'fs' )
const OS = require( 'os' )
const HTTP = require( 'http' )
const URL = require( 'url' )

const SERVER = HTTP.createServer( serverOnResponse )
    SERVER.on( 'error', serverOnError )
    SERVER.listen( 5555, serverOnListening )

const MIME_TYPE = {
    'ico': 'image/x-icon',
    'html': 'text/html',
    'js': 'text/javascript',
    'json': 'application/json',
    'css': 'text/css',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'wav': 'audio/wav',
    'mp3': 'audio/mpeg',
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'eot': 'appliaction/vnd.ms-fontobject',
    'ttf': 'aplication/font-sfnt',
	'': 'text/plain',
}

const MONGO_CLIENT = require( 'mongodb' ).MongoClient

const DB_URL = 'mongodb://localhost:27017'

const DB_NAME = 'test'

const DB_CLIENT = new MONGO_CLIENT( DB_URL )

let DB

/* Globals END */

// db connection
DB_CLIENT.connect( function( err ) {

	if ( err ) throw err
    console.log( "Connected successfully to server" )

    DB = DB_CLIENT.db( DB_NAME )

})




// to find last element in array
if (! Array.prototype.last ) {
    Array.prototype.last = function( ) {
        return this [ this.length - 1 ]
    }
}

/* EXIT START */
/* exit program handling to close db connection */

process.stdin.resume( )//so the program will not close instantly

function exitHandler( options, exitCode ) {
	DB_CLIENT.close( )
	console.log(`About to exit with code: ${exitCode}`)
    if ( options.cleanup ) console.log( 'clean' )
    if ( exitCode || exitCode === 0) console.log( exitCode )
    if ( options.exit ) process.exit( )
}

//do something when app is closing
process.on( 'exit', exitHandler.bind( null,{ cleanup: true } ) )

//catches ctrl+c event
process.on( 'SIGINT', exitHandler.bind( null, { exit: true } ) )

// catches "kill pid" (for example: nodemon restart)
process.on( 'SIGUSR1', exitHandler.bind( null, { exit: true } ) )
process.on( 'SIGUSR2', exitHandler.bind( null, { exit: true } ) )

//catches uncaught exceptions
process.on( 'uncaughtException', exitHandler.bind( null, { exit: true } ) )

// EXIT END


// if server error
function serverOnError( err ) {
	throw new Error( err )
}


// when got server show port and ip
function serverOnListening( ) {
	var addresses = [ ]
    var ifaces = OS.networkInterfaces( )

    // Getting all IPv4 addresses
   	for ( var iface in ifaces ) {
    	for ( var addr in ifaces[ iface ] ) {
        	if ( ifaces[ iface ][ addr ][ 'family' ] == "IPv4" ) {
            	addresses.push( ifaces[ iface ][ addr ][ 'address' ] )
            }
        }
	}
    // Displaying IPv4
    console.log( "Got server listening on\n" + addresses.join( ", " ) + " : " + this.address( ).port )
}

// on connection
function serverOnResponse( req, res ) {

	let url = URL.parse( req.url, true )

	if ( url.pathname == "/getData" ) {
		res.writeHead( 403, { "Content-Type": "text/plain" } )
		res.end( "403: FORBIDDEN" )
	} else {
		returnFile( __dirname + url.pathname, res )
	}


}

// send file if one exists to http res
function returnFile( path, res ) {

	console.log(path)
	if (! FS.existsSync( path ) || FS.lstatSync( path ).isDirectory( ) ) {
		res.writeHead( 404, { "Content-Type": "text/plain" } )
		res.end( "404: NOT FOUND" )
		return
	}
	res.writeHead( 200, { "Content-Type": MIME_TYPE[ path.split( "." ).last( ) ] } )

	let fileStream = FS.createReadStream( path )
	fileStream.on('end', function() {
		res.end( )
	})

	fileStream.pipe( res )

}



