export function scrollTop(){
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0 // For Chrome, Firefox, IE and Opera
  }    

  export function scrollBottom(){
    document.body.scrollBottom = 0; // For Safari
    document.documentElement.scrollBottom = 0 // For Chrome, Firefox, IE and Opera
  }  

  export function hacerScroll(id){
    let element = document.getElementById(id);
    if(element){
        element.scrollIntoView();
    }
}

export function seleccionarTextoInput(id){
    document.getElementById(id).select()
}

export function hacerfocoEnPrimerInput(id){

    let idInterval =setInterval(() => {
        const element = document.getElementById(id);

        if (element){
            element.focus();
            clearInterval(idInterval)
        }
    }, 500);
}