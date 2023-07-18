import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faAngleDoubleRight, faAngleDoubleLeft, faEdit, faMobile, faEnvelopeSquare, faEnvelopeOpenText, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { faWindowClose, faUser, faPlusSquare, faMinusSquare, faWindowMaximize, faFilePdf  } from '@fortawesome/free-regular-svg-icons';
import Loading from '../componentes/Loading';
import Modal from '../componentes/Modal';
import useModal from '../hooks/useModal';
import { v4 as uuidv4 } from 'uuid';
import ConstanciaAL from './ConstanciaAL';
import Analitico from './Analitico';
import {imprimir as imprimirComprobanteInsc} from '../impresiones/comprobante-insc';
import {imprimir as imprimirFicha} from '../impresiones/ficha-al';
import Swal from 'sweetalert2';
import {useAlumno} from '../Context/alumnoContext'; 
import TipoImpresion from '../componentes/TipoImpresion';
import {hacerfocoEnPrimerInput} from '../Helpers/utilidades-globales';

export default function ImpresionesAlumno({alumno,datosDelAlumno,mostrarLateralmente,esModal}){

const {toggle, isShowing} = useModal();
const [abrirConstancia,setAbrirConstancia]=useState(false);
const [abrirAnalitico,setAbrirAnalitico]=useState(false);
const [preguntasPDF,setPreguntasPDF] = useState(null)
const [nombrePDF,setNombrePDF] = useState("")
const [descargar,setDescargar] = useState(true)

const {cuatrimestreActivo} = useAlumno();

useEffect(()=>{
    if (!isShowing){
        if (abrirConstancia){ // si se cierra porque muestra otros datos 
            setAbrirConstancia(false)
        }   
        if (abrirAnalitico){ // si se cierra porque muestra otros datos 
            setAbrirAnalitico(false)
        }            
    }
},[isShowing]) // proceso algo cada vez que el modal se cierra

const handleSubmit=(e)=>{
    e.preventDefault()
}

const iniciarImprimirPDF = (documento)=>{
    if (preguntasPDF && preguntasPDF==documento){
        setPreguntasPDF(null)
    }else{
        setPreguntasPDF(documento)
        setNombrePDF(null)
        //hacerfocoEnPrimerInput("nombre-pdf")
    }

}

const cerrarPreguntasPDF = ()=>{
    setPreguntasPDF(null)
}

const handleChangeNombrePDF = (e)=>{
    setNombrePDF(e.target.value) 
}

const ejecutarImprimirComprobanteInsc = ()=>{
const objetoAlumno = {alumno:`${datosDelAlumno.nombre} ${datosDelAlumno.apellido}`, 
                  id_alumno:datosDelAlumno.id_alumno, 
                  documento:datosDelAlumno.documento}
    imprimirComprobanteInsc(cuatrimestreActivo.nombre,objetoAlumno,alumno.historial,descargar)
}

const ejecutarImprimirFicha = ()=>{
   
        imprimirFicha(alumno.materiasAprobadasTest,alumno.instrumentos,datosDelAlumno,descargar)
}

    return (
        <div className="p-4 rounded">
            { !mostrarLateralmente && <Impresiones 
                    modoColumna = {false}
                    toggle={toggle} 
                    setAbrirConstancia={setAbrirConstancia} 
                    setAbrirAnalitico={setAbrirAnalitico} 
                    ejecutarImprimirComprobanteInsc={ejecutarImprimirComprobanteInsc} 
                    ejecutarImprimirFicha={ejecutarImprimirFicha}
                    iniciarImprimirPDF = {iniciarImprimirPDF}
                    cerrarPreguntasPDF = {cerrarPreguntasPDF}
                    handleChangeNombrePDF = {handleChangeNombrePDF}
                    preguntasPDF = {preguntasPDF} 
                    setPreguntasPDF = {setPreguntasPDF}
                    setNombrePDF = {setNombrePDF}
                    nombrePDF = {nombrePDF}  
                    descargar = {descargar}
                    setDescargar = {setDescargar}  
                    descargar = {descargar}                           
                    />
            }
            <div className= {mostrarLateralmente ? "flex f-col da-lateral" : "flex f-row"} > 
            { mostrarLateralmente && <Impresiones 
                    modoColumna = {true}
                    toggle={toggle} 
                    setAbrirConstancia={setAbrirConstancia} 
                    setAbrirAnalitico={setAbrirAnalitico} 
                    ejecutarImprimirComprobanteInsc={ejecutarImprimirComprobanteInsc} 
                    ejecutarImprimirFicha={ejecutarImprimirFicha}
                    iniciarImprimirPDF = {iniciarImprimirPDF}
                    cerrarPreguntasPDF = {cerrarPreguntasPDF}
                    handleChangeNombrePDF = {handleChangeNombrePDF}
                    preguntasPDF = {preguntasPDF} 
                    setPreguntasPDF = {setPreguntasPDF}
                    setNombrePDF = {setNombrePDF}
                    nombrePDF = {nombrePDF}         
                    setDescargar = {setDescargar}       
                    descargar = {descargar}                           
                    />
            }
            {abrirConstancia && <ConstanciaModal hide={toggle} isShowing={isShowing} alumno={datosDelAlumno} esModal={esModal} /> }
            {abrirAnalitico && <AnaliticoModal hide={toggle} isShowing={isShowing} alumno={datosDelAlumno} esModal={esModal}/> }
                   
            </div>
        </div>
        

    )
}


function ConstanciaModal({hide,isShowing,alumno,esModal}){
    const estiloWrapper = {background:'#000000bf'}

    return  <Modal hide={hide} isShowing={isShowing} titulo="Constancia de alumno regular" estiloWrapper={estiloWrapper}>
                <ConstanciaAL alumno={alumno}/>
            </Modal>
}

function AnaliticoModal({hide,isShowing,alumno,esModal}){
    const estilo = {width:'800px'}
    const estiloWrapper = {background:'#000000bf'}

    return  <Modal hide={hide} isShowing={isShowing} titulo="Analítico" estilo={estilo} estiloWrapper={estiloWrapper}>
                <Analitico alumno={alumno}/>
            </Modal>
}



function Impresiones({modoColumna,
                        toggle,
                        setAbrirConstancia,
                        setAbrirAnalitico,
                        ejecutarImprimirComprobanteInsc,
                        ejecutarImprimirFicha,
                        preguntasPDF,
                        nombrePDF,
                        handleChangeNombrePDF,
                        cerrarPreguntasPDF,
                        iniciarImprimirPDF,
                        setDescargar,
                        descargar
                    }){
    return <div className="flex f-col">
        <div className={modoColumna ? "" : "flex flex-wrap"}>
            <div>
                <button title="Imprimir la constancia de alumno regular" onClick={()=>{setAbrirConstancia(true); toggle()}}>
                    <FontAwesomeIcon className="ic-abm" icon={faFilePdf} /> <span className="texto-acciones-menu">Constancia AR</span>
                </button>
             </div>
            <div className="relative">
                <button title="Imprimir el analítico" onClick={()=>{setAbrirAnalitico(true); toggle()}}>
                    <FontAwesomeIcon className="ic-abm"  icon={faFilePdf} /> <span className="texto-acciones-menu">Analítico</span> 
                </button>
            </div>
            <div className="relative">
                <button title="Imprimir el comprobante de inscripción de las cursadas actuales" onClick={()=>{iniciarImprimirPDF('comprobante-insc')}}>
                    <FontAwesomeIcon className="ic-abm" icon={faFilePdf} /> <span className="texto-acciones-menu">Comprobante Insc.</span> 
                </button>
                {preguntasPDF=='comprobante-insc' && <TipoImpresion cerrarPreguntasPDF={cerrarPreguntasPDF} 
                                                            nombrePDF={nombrePDF}
                                                            handleChangeNombrePDF = {handleChangeNombrePDF}
                                                            ejecutarImprimirPDF = {ejecutarImprimirComprobanteInsc}
                                                            modificarDescargar = {setDescargar}
                                                            descargar = {descargar}
                                                            />}                 
            </div>
            <div className="relative">
                <button title="Imprimir la ficha del alumno" onClick={()=>{iniciarImprimirPDF('ficha')}}>
                    <FontAwesomeIcon className="ic-abm" icon={faFilePdf} /> <span className="texto-acciones-menu">Ficha personal</span> 
                </button>    
                {preguntasPDF=='ficha' && <TipoImpresion cerrarPreguntasPDF={cerrarPreguntasPDF} 
                                                            nombrePDF={nombrePDF}
                                                            handleChangeNombrePDF = {handleChangeNombrePDF}
                                                            ejecutarImprimirPDF = {ejecutarImprimirFicha}
                                                            modificarDescargar = {setDescargar}
                                                            descargar = {descargar}
                                                            />} 
            </div>
  
     </div>      
  
</div>
}