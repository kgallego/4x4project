
"use strict"

function checkEmail( email ) {

	let pack = {
		email: email
	}

	let xhr = new XMLHttpRequest( )

	let url = window.origin + '/checkEmail'
	xhr.open( 'POST', url )

	xhr.onreadystatechange = function () {
		if(xhr.readyState === 4 && xhr.status === 200) {

			let data = JSON.parse( xhr.responseText )
			console.log( data )

		}
	}

	xhr.send( JSON.stringify( pack ) )
}

function signIn( email, password ) {

	let pack = {
		email : email,
		password : password,
	}

	let xhr = new XMLHttpRequest( )

	let url = window.origin + '/signIn'

	xhr.open( 'POST', url )

	xhr.onreadystatechange = function () {
		if(xhr.readyState === 4 && xhr.status === 200) {
			let data = JSON.parse( xhr.responseText )
            console.log( data )
		}
	}

	xhr.send( JSON.stringify( pack ) )



}

function signUp( email, name, passwd, passwdConfirmed ) {

	// TODO: passwd matching
	// if ( passwd != passwdConfirmed ) {}

	let pack = {
		email : email,
		username : name,
		password : passwd,
	}

	let xhr = new XMLHttpRequest( )

	let url = window.origin + '/signUp'

	xhr.open( 'POST', url )

	xhr.onreadystatechange = function () {
		if(xhr.readyState === 4 && xhr.status === 200) {
			let data = JSON.parse( xhr.responseText )
            console.log( data )
		}
	}

	xhr.send( JSON.stringify( pack ) )


}


