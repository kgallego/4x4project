
"use strict"

const fs = require( 'fs' )
const os = require( 'os' )
const http = require( 'http' )

const server = http.createServer( serverOnResponse )
    server.on( 'error', serverOnError )
    server.listen( 0, serverOnListening )

function serverOnError( err ) {
	throw new Error( err )
}
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

function serverOnResponse( req, res ) {
	console.log( `${req.method} ${req.url}` )

	res.writeHead(200, {
          "Content-Type": "text/html",
        });
  	let fileStream = fs.createReadStream( "index.html" )

/*	fileStream.on('data', function (data) {
    	res.write(data);
	});
*/
	fileStream.on('end', function() {
    	res.end();
	});

	fileStream.pipe( res )

}




