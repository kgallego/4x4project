
"use strict"

function checkEmail( email ) {

	let pack = {
		email: email
	}

	let xhr = new XMLHttpRequest( )

	let url = window.origin + "/checkEmail"
	xhr.open( 'POST', url )
	
	xhr.onreadystatechange = function () {
		if(xhr.readyState === 4 && xhr.status === 200) {
			
			let data = JSON.parse( xhr.responseText )
			console.log( data )

		}
	}

	xhr.send( JSON.stringify( pack ) )
}

