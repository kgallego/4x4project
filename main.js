
"use strict"

/* Globals START */

const FS = require( 'fs' )
const OS = require( 'os' )
const HTTP = require( 'http' )
const URL = require( 'url' )
const CRYPTO = require( 'crypto' )

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

const DB_NAME = '4x4'

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

// COOKIES START
// cookie parsing
function parseCookies( req ) {

	let list = { }
	let rc = req.headers.cookie

	rc && rc.split( ';' ).forEach( function( cookie ) {
		let parts = cookie.split( '=' )
		list[parts.shift().trim()] = decodeURI(parts.join('='))
	} )

	return list

}
// COOKIES END

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

	if ( url.pathname == "/checkEmail" ) {
		req.on( 'data', function ( data, err ) {
			checkEmail( JSON.parse( data ).email, res )
		})
	} else if ( url.pathname == "/signIn" ) {
		req.on( 'data', function ( data, err ) {
			signIn( JSON.parse( data ), res )
		})
	} else if ( url.pathname == "/signUp" ) {
		req.on( 'data', function ( data, err ) {
			console.log("data to sign up: %s", data)
			signUp( JSON.parse( data ), res )
		})
	} else if ( url.pathname == "/getAll" ) {
		getAllUsers( function( users ) {
			res.writeHead( 200, { "Constent-Type": "text/plain" } )
			res.write( JSON.stringify( users ) )
			res.end( )
		})
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

// if email exists
function checkEmail( email, res ) {

	const collection = DB.collection( 'users' )
	findUser( { email : email }, collection, function( user ) {
		console.log( user )
		res.writeHead( 200, {"Content-Type": "text/plain"} )
		res.end( )
	})

}

// on signIn request
function signIn( userdata, res ) {
	const collection = DB.collection( 'users' )

	findUser( { email : userdata.email }, collection, function( user ) {
		if ( user == null ) {
			res.writeHead( 404, { "Content-Type": "text/plain" } )
			res.end( )
		} else {
			// compare passwd sent and passwd stored
			console.log( CRYPTO.createHash( 'sha256' ).update( userdata.password ).digest( 'hex' ), userdata.password, user.password )
			let passwordHashFromUser = CRYPTO.createHash( 'sha256' )
				.update( userdata.password )
				.digest( 'hex' )

			if ( passwordHashFromUser != user.password ) {
				res.writeHead( 403, { "Content-Type": "text/plain" } )
				res.end( )
				return
			}

			// user's data to show on front end
			let data = {
				email: user.email,
				username: user.username,
				galaxies: user.galaxies,
				currentTasks: user.currentTasks,
			}

			res.writeHead( 200, {
				"Set-Cookie": "alauth=" + user._id.toString( ),
				"Content-Type": "text/plain"
			} )
			res.write( JSON.stringify( data ) )
			res.end( )
		}
	})

}

// on signUp request
function signUp( newUserdata, res ) {

	const collection = DB.collection( 'users' )

	// finds user in user collection.
	// if user exists reqpond 410,
	// else add user to the collection; respond 200
	findUser( { email : newUserdata.email }, collection, function( user ) {
		if ( user ) {
			res.writeHead( 410, { "Content-Type": "text/plain" } )
			res.end( )
		} else {
			// user object
			let newUser = {
				email : newUserdata.email,
				password : CRYPTO.createHash( 'sha256' )
					.update( newUserdata.password )
					.digest( 'hex' ),
				username : newUserdata.username,
				galaxies : [],
				currentTasks: [],
			}

			// incerts user
			insertUser( newUser, collection, function( result ) {
				// result is null if there's an error
				if (! result ) {
					res.writeHead( 400, { "Content-Type": "plain/text" } )
					res.end( )
				} else {
					console.log( result, result._id )
					let data = {
						email: result.email,
						username: result.email,
						galaxies: result.galaxies,
						currentTasks: result.currentTasks,
					}

					res.writeHead( 200, {
						"Set-Cookie": "alauth=" + result._id.toString( ),
						"Content-Type": "plain/text",
					})
					res.write( JSON.stringify( data ) )
					res.end( )
				}
			})
		}
	})
}

// finds user by query provided
function findUser( query, collection, callback ) {
	// finds user returns it to callback
	collection.findOne( query, function( err, data ) {
		if ( err ) {
			callback( null )
		} else {
			callback( data )
		}
	})
}

// insert users to collection
function insertUser( newUser, collection, callback ) {
	// incerts a new user
	collection.insert( newUser, function( err, res ) {
		if ( err ) {
			callback( null )
		} else {
			callback( res )
		}
	})
}




/* DEBUGGING ONLY */

function getAllUsers( callback ) {

	const collection = DB.collection( 'users' )

	collection.find( ).toArray( function( err, data ) {
		if ( err ) {
			callback( { error : err } )
		} else {
			callback( { records : data } )
		}

	})

}

/* DEBUGGING ONLY */

