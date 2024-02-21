import React from 'react';
import {useState, useEffect} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/free-regular-svg-icons';
import {hacerfocoEnPrimerInput} from '../Helpers/utilidades-globales';

export default function TipoImpresion({ejecutarImprimirPDF,cerrarPreguntasPDF,nombrePDF,handleChangeNombrePDF, descargar, modificarDescargar}){

   // const [descargar,setDescargar] = useState(true)

    useEffect(()=>{
        modificarDescargar(false)
    },[])

    function imprimir(){

       /* if (descargar){
            ejecutarImprimirPDF()
            cerrarPreguntasPDF()
        }else{
            if (nombrePDF && nombrePDF.trim()!="" )
            {
                ejecutarImprimirPDF()
                cerrarPreguntasPDF()
            }else{
                alert("Ingrese el nombre del archivo pdf")
            }
        }*/

        ejecutarImprimirPDF()
        cerrarPreguntasPDF()
   }    

    function handleCheckBox (e){
       if (e.target.checked){
            modificarDescargar(true)
       }else{
            modificarDescargar(false)
       }
    }

return  <div className="bg-white border-dotted-gray border-radius-7 zi-100 absolute p-2">
{/* !descargar && <input onChange={handleChangeNombrePDF} type="text" value={nombrePDF} autoComplete="off" placeholder="Nombre del archivo" name="nombre" id="nombre-pdf" className="border-dotted-gray m-2"/>*/}
<label title="Marcar el casillero para descargar el documento" className="text-xsmall mr-2" htmlFor="spar">Descargar</label>
<input title="Marcar el casillero para descargar el documento" type="checkbox" id="spar" checked={descargar} onChange={(e)=>handleCheckBox(e)}/>

<div className="flex f-row">
    <button onClick={imprimir}>Crear PDF</button>
    <button><FontAwesomeIcon 
        className="ic-abm"
        icon={faWindowClose} 
        title="Cerrar impresión de archivo PDF"
        onClick={cerrarPreguntasPDF}
        />
    </button>
</div>


</div>    
}