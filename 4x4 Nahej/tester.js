var pageablesA
window.customElements.define('page-able', class extends HTMLElement{
	constructor(){
		super()
		console.log('pageable')
	}


})
window.onload=()=>{
	pageablesA = Array.from(document.getElementsByTagName('page-able'))

	window.onhashchange=()=>{
		console.log(pageablesA.find( pageable => pageable.id === location.hash.replace('#', '')))
	}


}

