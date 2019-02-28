
"use strict"

/* Globals START */

const fs = require( 'fs' )
const os = require( 'os' )
const http = require( 'http' )
const URL = require( 'url' )

const server = http.createServer( serverOnResponse )
    server.on( 'error', serverOnError )
    server.listen( 5555, serverOnListening )

const mimeType = {
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

/* Globals END */

if (! Array.prototype.last ) {
    Array.prototype.last = function( ) {
        return this [ this.length - 1 ]
	}
}

// is server error
function serverOnError( err ) {
	throw new Error( err )
}

// when got server show port and ip
function serverOnListening( ) {
	var addresses = [ ]
    var ifaces = os.networkInterfaces( )

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

function returnFile( path, res ) {

	console.log(path)
	if (! fs.existsSync( path ) || fs.lstatSync( path ).isDirectory( ) ) {
		res.writeHead( 404, { "Content-Type": "text/plain" } )
		res.end( "404: NOT FOUND" )
		return
	}
	res.writeHead( 200, { "Content-Type": mimeType[ path.split( "." ).last( ) ] } )

	let fileStream = fs.createReadStream( path )
	fileStream.on('end', function() {
		res.end( "200: OK" );
	})

	fileStream.pipe( res )

}



