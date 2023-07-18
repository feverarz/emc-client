import React from 'react';
import Swal from 'sweetalert2';
import Axios from 'axios';
import UseApis from './useApis';

export const useAbm = ()=>{

    const [grabandoDatos,setGrabandoDatos] = React.useState(false);
    const [huboError,setHuboError]=React.useState(false)

    const grabarDatos = async (values,callback,finalizar)=>{
        try{
            if(callback){
                setGrabandoDatos(true)
                const resultado = await callback(values)

                if (resultado[0]){
                    alert(resultado[1])
                    finalizar()
                }else{
                    alert(resultado[1])
                }
                setGrabandoDatos(false)
            }

        }catch(err){
            setGrabandoDatos(false)
            console.log('Error al grabar los datos', err)
            alert('Se produjo un error al grabar los datos')
        }
    }
    
    const iniciarGrabar = (values,callback,finalizar)=>{
        let texto;
        let textoConfirmacion;
    
        texto = `¿Confirma la asignación de la beca?`
        textoConfirmacion = 'Si, asignar la beca'
    
        Swal.fire({
            text:texto,
            showCancelButton:true,
            confirButtonText:textoConfirmacion,
            cancelButtonText:'Cancelar'
        }).then(
            resultado=>{
                if (resultado.value){
                    grabarDatos(values,callback,finalizar);
    
                }else{
                    console.log("Se canceló la creación de la beca")
                }
            }
        )
    }

//    const onsubmit = (values,callback,dos) =>{
    const onsubmit = (values,callback,finalizar) =>{
        iniciarGrabar(values,callback,finalizar)
    }

    return {
        grabandoDatos,
        huboError,
        iniciarGrabar,
        onsubmit
    }
}
