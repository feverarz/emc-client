import React, {useState, useEffect, useRef} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose,faSave, faClock, faCircle as circle2 } from '@fortawesome/free-regular-svg-icons';
import { faInfoCircle, faCircle,faEnvelopeOpenText, faMobile, faPhone, faEdit } from '@fortawesome/free-solid-svg-icons';
import {scrollTop} from '../Helpers/utilidades-globales';
import {seleccionarTextoInput} from '../Helpers/utilidades-globales';
import Loading from '../componentes/Loading';
import {useNotas} from '../Context/notasContext';
import Swal from 'sweetalert2';
import Modal from '../componentes/Modal';
import useModal from '../hooks/useModal';
import AbmAlumno from '../abms/abm-alumno';
import AbmInstrumentosAlumno from '../abms/Abm-instrumentos-alumno';

const regex_solo_numeros = /^[0-9\b]+$/;
//const vector_colores = ['RGB(165,165,165)','RGB(160,160,160)','RGB(155,155,155)','RGB(150,150,150)','RGB(145,145,145)']
const vector_colores = ['blue','red','green','yellow','RGB(145,145,145)']

function Inputs_notas({fila,
                        columnas,
                        encabezado,
                        encabezadoCompleto,
                        vectorColumnasInstanciasFinales, 
                        usuario, 
                        nro_curso,
                        titulos,
                        ultimaFila,
                        visualizacion,
                        regimen,
                        curso}){
    const[notas,setNotas] = useState(
        {columna_1:columnas.columna_1,
            columna_2:columnas.columna_2,
            columna_3:columnas.columna_3,
            columna_4:columnas.columna_4,
            columna_5:columnas.columna_5,
            columna_6:columnas.columna_6,
            columna_7:columnas.columna_7,
            columna_8:columnas.columna_8,
            concepto:columnas.concepto,
            promedio:columnas.promedio,
            condicional:columnas.condicional,
            columna_1_rec:columnas.columna_1_rec,
            columna_2_rec:columnas.columna_2_rec,
            columna_3_rec:columnas.columna_3_rec,
            columna_4_rec:columnas.columna_4_rec,
            columna_5_rec:columnas.columna_5_rec,
            columna_6_rec:columnas.columna_6_rec,
            columna_7_rec:columnas.columna_7_rec,
            columna_8_rec:columnas.columna_8_rec
        }
    )
    const[grabando,setGrabando] = useState(false)
    const[buscando,setBuscando] = useState(false)
    const[infoUpdate,setInfoUpdate] = useState('')
    const[nuevasNotas,setNuevasNotas] = useState({...columnas})
    const[cambioGuardado,setCambioGuardado] = useState(true)
    const[cantidadCambios,setCantidadCambios] = useState(0)
    const[tengoFoco,setTengoFoco] = useState(false)
    const[cambioConcepto,setCambioConcepto] = useState(false)
    const[cambioPromedio,setCambioPromedio] = useState(false)
    const[noValidar,setNoValidar] = useState(false)
    const [concepto, setConcepto] = useState(0)
    const {idGrabar,notificarModificacionNotas} = useNotas();
    const [datosContacto,setDatosContacto]=useState(null)
    const [abrirFicha,setAbrirFicha]=useState(false)
    const [abrirNiveles,setAbrirNiveles]=useState(false)
    const [mostrarDatosContacto,setMostrarDatosContacto]=useState(false)
    const {toggle, isShowing } = useModal();
    const usuarioPuedeActualizarNiveles = useRef(false)
    const [columnaFoco,setColumnaFoco] = useState(null)

const cambiar = (e)=>{
     
   if ((validarInput(e.target.value,e.target.name) && !noValidar) || noValidar){

        if(e.target.name=='concepto'){
            setCambioConcepto(true) // es para que si estamos modificando el concepto y en consecuencia calculando el promedio que no recalcule el concepto por el cambio del promedio
        }else{
            setCambioConcepto(false)
        }
        if(e.target.name=='promedio'){  // es para que si estamos modificando el promedio y en consecuencia calculando el concepto que no recalcule el promedio por el cambio del concepto
            setCambioPromedio(true)
        }else{
            setCambioPromedio(false)
        }
        // cada imput tiene un name correspondiente al nombre del campo o propiedad del objeto
           // modifico el campo asociado a cada input y le asigno el valor del input que cambio
           // el resto lo copio como esta con el operador spread
           // normalmente si no usara esta tecnica haría lo siguiente por ejemplo con el campo columna_1
           //  setNotas({...notas,columna_1:e.target.value})
           // pero como traigo el nombre del campo como un string lo encierro entre corchetes
                setNotas({...notas,[e.target.name]:e.target.value})

    }
}

// Este efecto se agrega por pedido de Luciano para que las notas se graben en conjunto
// y no individualmente cuando se detecta que idGrabar cambia
// idGrabar viene de un contexto nuevo llamado NotasContext
// idGrabar lo modifica el componente hermano a inputs llamado GrabarNotas usando la función
// actualizarNota del contexto NotasContext
// Fue necesario usar un nuevo contexto diferente a useAlumno para lograr que el cambio de contexto
// que produce el cambio de idGrabar no provoque el re-renderizado del componente padre
// Usamos 2 contextos para desacoplarlos y evitar que no se rendericen los componentes hijos
useEffect(()=>{
    if (idGrabar>0){
        if (huboCambios(nuevasNotas,notas)){
            guardarCambiosManualmente()
        }
    }
},[idGrabar])

useEffect(()=>{ // procesa los cierres de modales por boton cerrar y no por otro motivo
    if (!isShowing){
        if (abrirFicha){
            setAbrirFicha(false)
        }
        if (abrirNiveles){
            setAbrirNiveles(false)
        }
    }
},[isShowing])

useEffect(()=>{
    if (huboCambios(nuevasNotas,notas) && !cambioPromedio){

        console.log('cambiando notas')
        setNotas({...notas,promedio:calcularPromedio(notas,regimen,vectorColumnasInstanciasFinales,curso,encabezadoCompleto)})

        // el concepto puede modificarse manualmente por el profesor o automáticamente al
        // modificar el promedio a mano
        // uso el flag cambioPromedio para distinguir cuando la modificación del concepto
        // se origina en un cambio manual o un cambio automático
        // solo ajusto el promedio cuando es un cambio automático por haber
        // ingresado notas
        // si no se haría un loop infinito de modificaciones
        // cambio el promedio porque cambió el concepto y a su vez cambio el concepto porque 
        // se modificó el promedio y lo evito con un flag
        // el flag cambioPromedio es true cuando la columna editada manualmente es promedio
        // y es false cuando es otra nota
    }    
},[notas.columna_1,
    notas.columna_2,
    notas.columna_3,
    notas.columna_4,
    notas.columna_5,
    notas.columna_6,
    notas.columna_7,
    notas.columna_8,
    notas.concepto,
    notas.columna_1_rec,
    notas.columna_2_rec,
    notas.columna_3_rec,
    notas.columna_4_rec,
    notas.columna_5_rec,
    notas.columna_6_rec,
    notas.columna_7_rec,
    notas.columna_8_rec])
    
useEffect(()=>{
    if (huboCambios(nuevasNotas,notas) && cambioPromedio){
        // el promedio puede modificarse manualmente por el profesor o automáticamente al
        // modificar las otras notas incluido el concepto
        // uso el flag cambioPromedio para distinguir cuando la modificación del promedio
        // se origina en un cambio manual o un cambio automático
        // solo ajusto el concepto cuando es un cambio manual hecho por el profesor
       // setConcepto(calcularConcepto(notas,regimen))
        setNotas({...notas,concepto:calcularConcepto(notas,regimen)})
    }
},[notas.promedio])


    useEffect(()=>{
        volverabuscarCalificaciones() // las calificaciones las traigo al crear el componente y luego de grabar para poder comparar si los campos y ver si hubo cambios para grabarlos, de otra forma grabaría siempre aunque no haya habido cambios
        // también traigo id_prof y id_encabezado para determinar si el usuario coincide con un profesor que está a cargo del curso
        // y si es una materia instrumental (encabezado=5) entonces podría acceder a la ficha del 
        // alumno y modificar el nivel de su instrumento

       /* if (fila==0){
            setTimeout(() => {
                hacerfocoEnPrimerInput('0columna_1')
            }, 100);
        }*/
    },[])

    useEffect(()=>{

        if (visualizacion){
            return
        }

        if (huboCambios(nuevasNotas,notas)){ // compara las notas del estado con las últimas notas traidas de la tabla para el alumno
            setCambioGuardado(false)
            notificarModificacionNotas(true)
            //antes se grababa automaticamente cuando había un cambio.
            // Luciano pidio que se guarde manualmente

            /*setTimeout(() => {
                grabarCalificaciones()
                .then(()=>{
                    setCambioGuardado(true)
                    setCantidadCambios(cantidadCambios + 1 )
                })
            }, 1000);*/

        }else{
            setCambioGuardado(true)
        }
    },[notas])

    const guardarCambiosManualmente = ()=>{
        grabarCalificaciones()
        .then(()=>{
            setCambioGuardado(true)
            setCantidadCambios(cantidadCambios + 1 )
            notificarModificacionNotas(false)
//            hacerFoco(`${fila}columna_1`) // ya no se graba individualmente sino en conjunto
            hacerFoco(`0columna_1`)
        })
    }

    const cancelarCambios = ()=>{
        
        copiarNotasOriginales(setNotas,nuevasNotas)
        setCambioGuardado(true)
        hacerFoco(`${fila}columna_1`)

    }

    const volverabuscarCalificaciones = async ()=>{
// Se buscan las calificaciones al inicio y luego de cada modificación para poder comparar
        setBuscando(true)
    
        try{
            const {data} = await Axios.get(`/api/cursos/curso/notasalumno/${nro_curso}/${columnas.id_alumno}`)
            setNuevasNotas(data);
            usuarioPuedeActualizarNiveles.current = data.id_prof == usuario.id_prof && data.es_instrumental==true && data.es_cuatrimestre_activo ==true
            // setDatosContacto(data.datosExtra[0]) // originalmente en el campo datosExtra nos llega un vector JSON que se generó en el stored spListarCalificaciones_new con el comando FOR JSON AUTO
            // pero en sql server 2005 no funciona la sentencia FOR JSON AUTO pero se puede crear un json manualmente en el stored y se envia parseado como objeto json, la diferencia es que me llega como objeto y antes me llegaab como vector de objetos
            setDatosContacto(data.datosExtra) // en el campo datosExtra nos llega un vector JSON que se generó en el stored spListarCalificaciones_new con el comando FOR JSON AUTO
            setBuscando(false)
        }catch(err){
            setNuevasNotas(false)
            console.log(err)
        }
    }    

    const comprobarTecla = (e)=>{
        
        if (e.keyCode==37){
           moverIzquierda(e.target.name,encabezado,fila)
        }
        if (e.keyCode==39){
            moverDerecha(e.target.name,encabezado,fila)
         }
        if (e.keyCode==38){
            moverArriba(e.target.name,encabezado,fila)
        }  
        if (e.keyCode==40){
            moverAbajo(e.target.name,encabezado,fila)
        }        
        if (e.keyCode==32 && esColumnaLeyenda(e.target.name) && !visualizacion){
            setNotas({...notas,[e.target.name]:proponerValor(notas[e.target.name],e.target.name)})
        }   
        if (e.keyCode==8){
            e.target.select()
        }    
    }

    const grabarCalificaciones = async ()=>{
        
        if (visualizacion){
            return 
        }

        setGrabando(true)
        const objetoAgrabar = {...notas}

        console.log('objetoAgrabar',objetoAgrabar)

        try{
            const resultado = await Axios.put(`/api/cursos/calificaciones/${nro_curso}/${columnas.id_alumno}/${usuario.id_prof}`, objetoAgrabar)

            setGrabando(false)

            setInfoUpdate(`Notas guardadas ${resultado.data.hora}`) 

           // finalizarCalificaciones()

            volverabuscarCalificaciones()

            gestionarConfirmacion()

        }catch(err){
            let mensaje_html_error;

            if(err.response){
                if(err.response.data.message){
                    mensaje_html_error = `Se produjo un error al grabar las calificaciones - ${err.response.data.message}`
                }else if (err.response.data) {
                    mensaje_html_error = `Se produjo un error al grabar las calificaciones - ${err.response.data}`
                }else{
                    mensaje_html_error = `Se produjo un error al grabar las calificaciones - ${err.response}`
                }
            }else{
                mensaje_html_error = `Se produjo un error al grabar las calificaciones - ${err}`
            }

            setGrabando(false)

            setInfoUpdate(`Las notas no se grabaron \n ${mensaje_html_error}`) 
        }
    
        
    }

    const handleFocus = (e,columna) => {
        e.target.select();
        setColumnaFoco(columna)
        setTengoFoco(true);
    }

    const verificarValor = (e)=>{

        setTengoFoco(false)
        setColumnaFoco(null)

        if (e.target.value.trim()==''){
            setNotas({...notas,[e.target.name]:'--'})
        }

        
        if(regex_solo_numeros.test(e.target.value.trim()) && e.target.value.trim()!='')
        {
            setNotas({...notas,[e.target.name]:Number(e.target.value.trim()).toString()})
        }
    
    }    
// El objeto columnas trae la información de todas las calificaciones de un alumno
// normalmente tomaría ese objeto y crearía por cada columna un input
// configurando cada uno con un nombre de columna fijo. Tendrìa 7 inputs (ver la version original en la funcion Inputs_old)
// En lugar de esto trato de identificar todas las columnas del objeto y configurar un solo input
// para que se creen dinamicamente todos con propiedades dinamicas 
// Para lograr esto transformo el objeto en un array con el metodo Object.entries
// me crea un array que tendra en cada posicion un array con el nombre de la propiedad y su valor
// El objeto columnas llega como parametro y viene en este formato
/*
{columna_1: "100"
columna_2: "75"
columna_3: "--"
columna_4: "--"
columna_5: null
columna_6: null
columna_7: null
columna_8: null
concepto: "475"
condicional: ""
dia: "Domingo"
fecha: null
hora: null
id_alumno: 1485
nombre: "Martos, Leandro Javier"
promedio: "90"
usuario: null
}
*/

// por medio de Object.entries(columnas) lo transformo en este vector
/*
["nombre", "Martos, Leandro Javier"],
["columna_1", "100"], ["columna_2", "75"],
["columna_3", "--"],
["columna_4", "--"],
["columna_5", null],
["columna_6", null],
["columna_7", null],
["columna_8", null],
["concepto", "475"],
["promedio", "90"],
["condicional", ""],
["id_alumno", 1485],
["fecha", null],
["hora", null],
["dia", "Domingo"],
["usuario", null]]
*/

// al transformar el objeto en en un array con Object.entries puedo recorrerlo con .map y renderizar N inputs pero 
// escrito 1 sola vez
// 
// Notar que también podría usar Object.keys u Object.values
//
// Object.keys(columnas)
/*
["nombre", "columna_1", "columna_2", "columna_3", "columna_4", "columna_5", "columna_6", "columna_7", "columna_8", "concepto", "promedio", "condicional", "id_alumno", "fecha", "hora", "dia", "usuario"]
// Object.values(columnas)
/*
["Martos, Leandro Javier", "100", "75", "--", "--", null, null, null, null, "475", "90", "", 1485, null, null, "Domingo", null]

*/

// la ventaja de transformar el objeto a array es que puedo usar todos los metodos de un array 
// para manipular sus elementos

//  {Object.entries(columnas).filter((item,index)=>item[1]!=null && index<12).map()
// Recorro el objeto con .map para crear cada input
// antes lo filtro los elementos descartanto aqueloos cuyo value = null o que su posicion sea mayor a 11 porque no los necesito
// como nombre, cada input tiene el nombre de la clave para que cuando se dispare el evento onChange
// la funcion cambiar pueda saber a que campo del objeto valor del estado, modificar

if (grabando){
    return <Main center><div><Loading/><span className="cargando">Grabando calificaciones...</span></div></Main>
};

    return <div className="flex f-col">
        { isShowing && abrirFicha && <Modal hide={toggle} titulo={null} isShowing={isShowing} estilo={{width:'1200px'}} estiloWrapper={{background:'#000000bf'}}>
                    <AbmAlumno id_alumno={columnas.id_alumno} 
                            finalizarAltaOcopia={null}
                            esModal={true}
                            usuarioPuedeActualizarNiveles = {usuarioPuedeActualizarNiveles.current}
                    />    
        </Modal>}
        { isShowing && abrirNiveles && <Modal hide={toggle} titulo={`Alumno: ${columnas.nombre}`} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
                    <AbmInstrumentosAlumno id_alumno={columnas.id_alumno} finalizarEdicion={()=>{toggle()}}
                    />    
        </Modal>}
        {(tengoFoco) && <div className="alignself-center">
            <p className="color-gray text-large bold mt-2 mb-4">{columnas.nombre}</p>
        </div>}
        <div className={`flex f-row items-center ${tengoFoco ? ' h-50' : ''}`}>
                    {/*!visualizacion && <FontAwesomeIcon className="cursor-pointer text-small mr-2" title={ mostrarDatosContacto ? "Ocultar los datos de contacto del alumno":"Ver los datos de contacto del alumno"} onClick={()=>{setMostrarDatosContacto(!mostrarDatosContacto)}} icon={faInfoCircle}/>*/}
                    {!visualizacion && <FontAwesomeIcon className="cursor-pointer text-small mr-2" title={"Abrir la ficha del alumno"} onClick={()=>{setAbrirFicha(true);toggle()}} icon={faInfoCircle}/>}
                    {!visualizacion && usuarioPuedeActualizarNiveles.current && <FontAwesomeIcon className="cursor-pointer text-small mr-2" title={"Actualizar los niveles del alumno"} onClick={()=>{setAbrirNiveles(true);toggle()}} icon={faEdit}/>}
                    {Object.entries(columnas).filter((item,index)=>item[1]!=null && index<20) // 20 porque pueden ser columnas de notas (8) + columnas de recuperatorios (8) + promedio + condicional + concepto + nombre => 16+4 = 20
                    .map((item,index)=>{
                    
                    if(visualizacion && item[0].includes('rec') && esRecuperatorioSinNota(item[1])){
                        return null
                    } else if (item[0]=='nombre'){
                        return <p  onClick={()=>{setAbrirFicha(true);toggle()}} title="Abrir la ficha del alumno" className="w-150 cursor-pointer">{columnas[item[0]]}</p>
                    }else{
                        return <div className="relative" title={definirTitle(item,encabezadoCompleto)}>
                            {(tengoFoco || fila == 0) && <span className="inotas-cal w-100pc">{titulos[index]}</span>}
                                <input  
                                    style={definirEstilo(item,encabezadoCompleto,tengoFoco,columnaFoco,visualizacion,columnas)}
                                    autoComplete={"off"} 
                                    name={item[0]} 
                                    maxLength={53}
                                    disable = {item[0]=='nombre' || visualizacion}
                                    onBlur = {(e)=>verificarValor(e)}
                                    className={claseSegunColumnaFila(item[0],notas[item[0]])}
                                    onFocus={(e)=>handleFocus(e,item[0])} 
                                    onKeyDown={(e)=>comprobarTecla(e)} 
                                    value={item[0]=='nombre' || visualizacion ? columnas[item[0]] : notas[item[0]]}   //ls diferencia es que si toma el value de columnas[nombre_campo] (el que viene como parametro) no va a cambiar su valor aunque trate de modificarlo el usuario. Cuando el value lo tomo de valor[nombre_campo] el valor lo toma del estado que ha cambiado por efecto del evengo onChange
                                    onChange={(e)=>{
                                            cambiar(e)
                                        }} id={fila+item[0]} type="text"
                                />
                        </div>}
                        })
                    }
                                    
                 
                    <div style={{width:"20px"}}>
                    {!cambioGuardado && <FontAwesomeIcon icon={faCircle} className="color-red" title="Las notas se modificaron"/>}
                    </div>
        </div>
            {/*No usamos esta tarjeta de datos sino directamente abrimos la ficha del alumno. Lo dejo comentado por si se querie volver a usar este criterio*/}
           
            {/*datosContacto &&  mostrarDatosContacto && <div className="flex p-2">
                <DatosPersonales datos = {datosContacto}/>
            </div>*/}
        
        {/*<div className="flex f-row alignself-fe">
            {!cambioGuardado && <button onBlur={()=>setTengoFoco(false)} onFocus={()=>setTengoFoco(true)}  title="Grabar los cambios" className="color-red" onClick={guardarCambiosManualmente}><span className="color-red blink fw-100">Grabe los cambios ...</span><FontAwesomeIcon icon={faSave} title="Grabar los cambios"/></button>}
            {!cambioGuardado && <button onBlur={()=>setTengoFoco(false)} onFocus={()=>setTengoFoco(true)}  title="Cancelar" className="color-red" onClick={cancelarCambios}><FontAwesomeIcon icon={faWindowClose} title="Cancelar"/></button>}
            {grabando && <span>Grabando notas ...</span>}
        </div>*/}
    </div>
}

    
function validarInput(input,columna){

    if (columna=='condicional'){ // la columna condicional solo admite el valor 'COND' o '--' y se escribe con la tecla space
        return false
    }

    if (columna=='promedio' || columna=='concepto'){
        if (input.length>4){
            return false
         }
    }else{
        if (input.length>3){
            return false
         }

         if (Number(input)>100){
            return false
        }
    }

    if (Number(input)<0){
        return false
    } 
  
    if(!regex_solo_numeros.test(input) && input!='') // si no agrego && input!='' no dejaría pasar el valor = vacio , porque vacío no es un número
    {
        return false
    }

    return true
}

function crearMailToIndividual(email){
    return email!=null && email!='' ? `mailto: ${email}` : ``
}

function proponerValor(valor,columna){

    if (columna=='condicional'){
        switch(valor.trim()){
            case 'COND':
                return '--'
            default : return 'COND'
        }
    }else{
        switch(valor.trim()){
            case 'AJ':
                return 'AI'
            case 'AI':
                return 'I'
            case 'I':
                return 'AUS'
            case 'AUS':
                return 'INC'
            case 'INC':
                return '--'
            case '--':
                return 'AJ'
            default : return 'AJ'
        }
    }
}

function transformarObjetoEnVector(objeto){
    const objetoComoVector = Object.entries(objeto)
    const vectorFiltrado = objetoComoVector.filter(item=>item[1]!=null).map(item=>item[0])

    return vectorFiltrado
}

function obtenerTitulos(objeto){
    const objetoComoVector = Object.entries(objeto)
    const vectorFiltrado = objetoComoVector.filter(item=>item[1]!=null).map(item=>item[1])

    return vectorFiltrado
}

function hacerFoco(id){
    let idInterval =setInterval(() => {
        const element = document.getElementById(id);
    
        if (element){
            element.focus();
            clearInterval(idInterval)
        }
    }, 10);
}

function moverIzquierda(columna,encabezado,fila){
    const ubicacion = encabezado.indexOf(columna)

    const definirFoco = encabezado[ubicacion-1]
    hacerFoco(`${fila}${definirFoco}`)
}

function moverDerecha(columna,encabezado,fila){
    const ubicacion = encabezado.indexOf(columna)

    const definirFoco = encabezado[ubicacion+1]
    hacerFoco(`${fila}${definirFoco}`)
}

function moverArriba(columna,encabezado,fila){
    if (fila<2){
        scrollTop()
    }
    hacerFoco(`${fila-1}${columna}`)
}

function moverAbajo(columna,encabezado,fila){
    hacerFoco(`${fila+1}${columna}`)
}

function claseSegunColumnaFila(columna,valor){

    switch(columna){
            case 'nombre': return 'caliname';
            case 'columna_1_rec' : 
            case 'columna_2_rec' : 
            case 'columna_3_rec' : 
            case 'columna_4_rec' : 
            case 'columna_5_rec' : 
            case 'columna_6_rec' : 
            case 'columna_7_rec' : 
            case 'columna_8_rec' : 
            return 'text-center color-green recupera'
            default : return  columna == 'promedio' && (Number(valor) < 60 || isNaN(valor)) ? 'cali text-center color-red':'cali text-center color-gray'
        }
    
}

function copiarNotasOriginales(setNotas,notasNuevas){

    setNotas({id_alumno:notasNuevas.id_alumno,columna_1 : notasNuevas.columna_1,
    columna_2 : notasNuevas.columna_2,
    columna_3 : notasNuevas.columna_3, 
    columna_4 : notasNuevas.columna_4,
    columna_5 : notasNuevas.columna_5,
    columna_6 : notasNuevas.columna_6,
    columna_7 : notasNuevas.columna_7,
    columna_8 : notasNuevas.columna_8,
    promedio : notasNuevas.promedio,
    condicional : notasNuevas.condicional,
    concepto : notasNuevas.concepto,
    columna_1_rec : notasNuevas.columna_1_rec,
    columna_2_rec : notasNuevas.columna_2_rec,
    columna_3_rec : notasNuevas.columna_3_rec,
    columna_4_rec : notasNuevas.columna_4_rec,
    columna_5_rec : notasNuevas.columna_5_rec,
    columna_6_rec : notasNuevas.columna_6_rec,
    columna_7_rec : notasNuevas.columna_7_rec,
    columna_8_rec : notasNuevas.columna_8_rec})
}

function huboCambios(notasOriginales,notasNuevas){
   
    return notasOriginales.columna_1 !=notasNuevas.columna_1 ||
    notasOriginales.columna_2 !=notasNuevas.columna_2 ||
    notasOriginales.columna_3 !=notasNuevas.columna_3 ||
    notasOriginales.columna_4 !=notasNuevas.columna_4 ||
    notasOriginales.columna_5 !=notasNuevas.columna_5 ||
    notasOriginales.columna_6 !=notasNuevas.columna_6 ||
    notasOriginales.columna_7 !=notasNuevas.columna_7 ||
    notasOriginales.columna_8 !=notasNuevas.columna_8 ||
    notasOriginales.promedio !=notasNuevas.promedio ||
    notasOriginales.condicional !=notasNuevas.condicional ||
    notasOriginales.concepto !=notasNuevas.concepto ||
    notasOriginales.columna_1_rec !=notasNuevas.columna_1_rec ||
    notasOriginales.columna_2_rec !=notasNuevas.columna_2_rec ||
    notasOriginales.columna_3_rec !=notasNuevas.columna_3_rec ||
    notasOriginales.columna_4_rec !=notasNuevas.columna_4_rec ||
    notasOriginales.columna_5_rec !=notasNuevas.columna_5_rec ||
    notasOriginales.columna_6_rec !=notasNuevas.columna_6_rec ||
    notasOriginales.columna_7_rec !=notasNuevas.columna_7_rec ||
    notasOriginales.columna_8_rec !=notasNuevas.columna_8_rec    

}

function Observaciones({observaciones,grabar,onchange,filasobs,observacionesCalOriginal}){
    return <div>
        <textarea id="obs-cal" placeholder="Observaciones" title="Observaciones" className="bg-wheat width-100x100" type="text" value={observaciones} rows={filasobs} maxLength="1000" cols="100" onChange={(e)=>onchange(e)}/> 
        <div className="flex f-reverse">
        </div>
    </div>
}

function esColumnaLeyenda(columna){
 if (columna=='concepto' || columna=='promedio'){
        return false
    }else{
        return true
    }
}

function calcularPromedio(notas,regimen,vectorColumnasInstanciasFinales,curso,encabezadoCompleto){
    let notaFinal = 0

    if (!regimen.prom_automatico){
        return notas.promedio
    }
    

    // reemplazo por una función
    const objetoNotasAvectorInicial = crearObjetoNotasInicial(notas)

    /*const objetoNotasAvectorInicial = {}

    for (let i=1;i<9;i++){
        if(notas[`columna_${i}`]){ // si la nota existe y no es null
            if(isNaN(notas[`columna_${i}`])){ // si la nota es un texto ('--',aus,inc..etc)
                if(notas[`columna_${i}_rec`] && !isNaN(notas[`columna_${i}_rec`])){// si tiene recuperatorio y es un número va la nota del recuperatorio
                    objetoNotasAvectorInicial[`columna_${i}`] = notas[`columna_${i}_rec`]
                }
            }else{
                if(notas[`columna_${i}_rec`]){ // si la nota es numérica y tiene recuperatorio válido y aprobado va esa nota
                    if(notas[`columna_${i}_rec`] && !isNaN(notas[`columna_${i}_rec`]) && Number(notas[`columna_${i}_rec`])>59){
                        objetoNotasAvectorInicial[`columna_${i}`] = notas[`columna_${i}_rec`] // si el recuperatorio es válido y está aprobado va esa nota
                    }else{ // si el recuperatorio no está aprobado o no es un número va la nota original
                        objetoNotasAvectorInicial[`columna_${i}`] = notas[`columna_${i}`]
                    }
                }else{ // si la nota es numérica y no tiene recuperatorio va esa nota 
                    objetoNotasAvectorInicial[`columna_${i}`] = notas[`columna_${i}`]
                }
            }
        }
    }*/

    if (notas.concepto && !isNaN(notas.concepto)){
        objetoNotasAvectorInicial[`concepto`] = notas[`concepto`]
    }

    // originalmente antes de incluir el concepto de recuperatorios tomaba el objeto notas y lo convertía a vector y filtraba
    // ahora creo un objeto de notas objetoNotasAvectorInicial en donde ya me quedo con la nota que corresponde y uso ahora ese objeto para seguir con el proceso natural
    const objetoNotasAvector = Object.entries(objetoNotasAvectorInicial)

//    const objetoNotasAvector = Object.entries(notas)
//    .filter(item=>!isNaN(item[1]) && item[1] != null && item[0] != 'promedio' && !item[0].includes('rec'))

    // El .reduce siguiente es el que calcula la nota según los porcentajes
    notaFinal = objetoNotasAvector.reduce((acum,item)=>{
            const nombreColumna = item[0];
            const valorColumna = Number(item[1])
            const porcentaje = regimen[nombreColumna]
            if (porcentaje != undefined && !isNaN(porcentaje)){
                const valorParcial = (valorColumna*porcentaje/100)
                console.log('nota =', porcentaje + ' % ', valorParcial)
                return acum + valorParcial
            }else{
                return acum
            }
    },0)


if (curso.nro_tratamiento){ // cuando el encabezado del curso tiene un número de tratamiento aplico una regla particular identificada con ese numero, son casos que salen de la regla standard de como se calcula la nota final
//    notaFinal = procesar_nro_tratamiento(curso.nro_tratamiento,notaFinal,objetoNotasAvector,notas,encabezadoCompleto)
    notaFinal = procesar_nro_tratamiento(curso.nro_tratamiento,notaFinal,objetoNotasAvector,objetoNotasAvectorInicial,encabezadoCompleto)
    
}else{
/*
REGLA STANDARD ( Cuando el encabezado no tiene un nro_tratamiento específico)
Para que una materia esté aprobada (Nota Final > 60), 
todas las instancias de finales deben estar aprobadas 
(Examen y/o Proyecto Final). 
En caso de no estar aprobada alguna, la Nota Final no debe superar el 59. 
*/
    const vectorInstanciasFinalesAprobadas = 
            objetoNotasAvector.filter(item=>vectorColumnasInstanciasFinales.some(item2=>item[0]==item2) && Number(item[1])>=60)
    
            console.log('vectorInstanciasFinalesAprobadas',vectorInstanciasFinalesAprobadas)
            console.log('vectorColumnasInstanciasFinales',vectorColumnasInstanciasFinales)

    if (vectorInstanciasFinalesAprobadas.length<vectorColumnasInstanciasFinales.length){
        if (notaFinal>59){
//            notaFinal = 59 
            notaFinal = 'INC' // Daniel Johansen solicitó que en lugar de 59 se grabe INC.
        }
    }
}
    if(isNaN(notaFinal)){
        return notaFinal
    }else{
        return Math.round(notaFinal).toString()
    }
}

function calcularConcepto(notas,regimen){
   
    if (!regimen.conc_manipulado){
        return notas.concepto
    }

    if (isNaN(notas.promedio) || !notas.promedio){ // 31-01-2023 Luciano solicita que el promedio pueda tomar letras además de números por eso hago esta validación aquí
        return notas.concepto
    }

    const objetoNotasAvectorInicial = crearObjetoNotasInicial(notas)

    const objetoNotasAvector = Object.entries(objetoNotasAvectorInicial)

//    const objetoNotasAvector = Object.entries(notas).filter(item=>!isNaN(item[1]) && item[1] != null && item[0] != 'concepto' && item[0] != 'promedio')

    const parteA = objetoNotasAvector.reduce((acum,item)=>{
            const nombreColumna = item[0];
            const valorColumna = Number(item[1])
            const porcentaje = regimen[nombreColumna]
            const valorParcial = (valorColumna*porcentaje/100)
            return acum + valorParcial
    },0)

    const promedio = Number(notas.promedio)
    const porcentajeConcepto = regimen['concepto']
    const nuevoConcepto = (promedio - parteA)/(porcentajeConcepto/100)

    return parseInt(nuevoConcepto).toString()
}

function encontrarInstanciasFinales(columnasTitulos){
    // en el filter buscamos los criterios para dejar solo las columnas asociadas a examenes o proyectos finales pero excluyendo al promedio que cuyo título ahora se llama "Nota Final"

    return Object.entries(columnasTitulos).filter((item,index)=>item[1]!=null && item[1].toUpperCase().includes('FINAL') && item[0]!='promedio').map(item=>item[0])
}

//export default React.memo(Inputs_notas)
export default Inputs_notas

function DatosPersonales({datos}){
    return <div className="px-6 py-4 mb-2 border-solid-gray border-radius-7 p-4">
      <span title="Teléfono" className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2 mr-2">
            <FontAwesomeIcon icon={faPhone}></FontAwesomeIcon>  {datos.telefono}     
      </span>
      <span title="Teléfono alternativo" className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2 mr-2">
              {datos.telefono2}       
       </span>                        
      <span title="Teléfono laboral" className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2 mr-2">
              {datos.telefono3}     
      </span>    
      <span title="Celular" className="whitespace-no-wrap inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2    ">
              <FontAwesomeIcon icon={faMobile}></FontAwesomeIcon>{datos.celular}     
      </span>    
                                  
      <div className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2    ">
              <FontAwesomeIcon icon={faEnvelopeOpenText}></FontAwesomeIcon>
              <a target="_blank" className="mr-2 ml-2" href={crearMailToIndividual(datos.email)} title="E-mail principal">{datos.email}</a> 
              <a target="_blank" className="mr-2 ml-2" href={crearMailToIndividual(datos.email2)} title="E-mail secundario">{datos.email2}</a>      
      </div>     
</div>
}

function gestionarConfirmacion(){

    //Se creó esta función originalmente para gestionar
    // el mensaje de confirmación pensando en el hecho de que
    // se pueden grabar N set de notas de varios alumnos y se puede llegar
    // a mostrar N veces este mensaje
    // La solución que elegí fue poner un ID al elemento <p>
    // y antes de disparar este mensaje comprobar si en el DOM ya existe este
    // id, si existe que no lo vuelva a disparar
    // pero al hacer pruebas veo que Swal.fire no se dispara N veces aunque
    // se graben N notas, probablemente se ejecute un Swal.close y cancele todo
    // automáticamente, por eso no se avanzó con la comprobación del ID pensada inicialmente
    // si llegase a ser necesario se puede retomar este mecanismo
    Swal.fire({
        html:'<p id="mens-conf-notas">Se grabaron las notas</p>',
        icon: 'warning',
        showConfirmButton: false,
        timer: 1500
    })   
}

const procesar_nro_tratamiento = (nro_tratamiento,notaFinal,objetoNotas,notas,encabezadoCompleto)=>{

    switch(nro_tratamiento){
        case 1 : return nota_final_tratamiento1(notaFinal,objetoNotas,notas,encabezadoCompleto)
        //case 2 : return nota_final_tratamiento2(notaFinal,objetoNotas,notas,encabezadoCompleto)
        //case 3 : return nota_final_tratamiento3(notaFinal,objetoNotas,notas,encabezadoCompleto)
        default : return nota_final_tratamiento1(notaFinal,objetoNotas,notas,encabezadoCompleto)
    }
 
}

const nota_final_tratamiento1 = (notaFinal,objetoNotas,notas,encabezadoCompleto)=>{


    console.log('notas especiales',notas)

    let texto = ''

        const mapearNotasPorEncabezado = Object.entries(notas)
                                        .filter(item=>item[1] != null && item[0] != 'promedio' )
                                        .map(item=>{
                                            return [...item,encabezadoCompleto[item[0]]]
                                        })
    
        // REGLA 1: Comprobar que la estructura sea correcta
        const nombres_requeridos = ['Escrito Midterm','Oral Midterm','Escrito Final','Oral Final','Tps']
        
        let flag_estructura = true
    
        console.log('mapearNotasPorEncabezado',mapearNotasPorEncabezado)
        /*nombres_requeridos.forEach(item=>{
            const nombre_buscado_upp = item.toUpperCase()
            const encontrado = mapearNotasPorEncabezado.some(item=>item[2].toUpperCase()==nombre_buscado_upp)
            if(!encontrado){
                flag_estructura = false
            }
        })*/
    
        if(!flag_estructura){
            escribirLog('CALIFICACIÓN = 1 PORQUE NO SE ENCONTRÓ LA ESTRUCTURA ADECUADA PARA EL nro_tratamiento=1 -  regla 1')
            console.log('Estructura esperada: ',nombres_requeridos)
            return desaprobadoPorFaltaDeEstructura()
        }
    
        const finales = mapearNotasPorEncabezado.filter(item=>item[2].toUpperCase().includes('FINAL'))
        const midterms = mapearNotasPorEncabezado.filter(item=>item[2].toUpperCase().includes('MIDTERM'))
        const finalOral = finales.filter(item=>item[2].toUpperCase().includes('ORAL')).map(item=>isNaN(item[1]) ? 0 : Number(item[1]))
        const finalEscrito = finales.filter(item=>item[2].toUpperCase().includes('ESCRITO')).map(item=>isNaN(item[1]) ? 0 : Number(item[1]))
        const midtermOral = midterms.filter(item=>item[2].toUpperCase().includes('ORAL')).map(item=>isNaN(item[1]) ? 0 : Number(item[1]))
        const midTermEscrito = midterms.filter(item=>item[2].toUpperCase().includes('ESCRITO')).map(item=>isNaN(item[1]) ? 0 : Number(item[1]))

        console.log(`FN ORAL ${finalOral[0]}`,` FN ESCRITO${finalEscrito[0]}`)
        console.log(`MT ORAL ${midtermOral[0]}`,`MT ESCRITO ${midTermEscrito[0]}`)

        if (finalesDesaprobados(finalOral,finalEscrito)){
            console.log('A')
            escribirLog(`A - Finales desaprobados <51`)
            return desaprobado(notaFinal)
        }

        if (examenesAprobados(finalOral,finalEscrito)){
            if(examenesAprobados(midtermOral,midTermEscrito)){
                console.log('B')
                escribirLog(`B Finales y midterms aprobados`)
                if(promedioFinalesOK(finalOral,finalEscrito)){
                    return Math.round(notaFinal).toString()
                }else{
                    console.log('O')
                    escribirLog(`O - El promedio de los finales no es suficiente`)
                    return desaprobado(notaFinal)
                }
            }
        }

        if(estaDesAprobado(midtermOral[0])){
            if(estaDesAprobado(finalOral[0])){
                console.log('C')
                escribirLog(`C Mid y final oral desaprobados`)
                return desaprobado(notaFinal)
            }
        }

        if(estaDesAprobado(midTermEscrito[0])){
            if(estaDesAprobado(finalEscrito[0])){
                console.log('D')
                escribirLog(`D Mid y final escrito desaprobados`)
                return desaprobado(notaFinal)
            }
        }

        if(estaAprobado(midtermOral[0])){
            if(estaDesAprobado(finalOral[0])){
                if(Number(finalOral[0]<=49)){
                    console.log('F')
                    escribirLog(`F Mid oral aprobado, Final oral <= 49`)
                    return desaprobado(notaFinal)
                }else if (desaprobadoCondicional(finalOral)){
                        console.log('G')
                        escribirLog(`G Mid oral aprobado, Final oral e/50 y 59`)
                        const resultado =  analizarSegundonivel(midTermEscrito,finalEscrito,notaFinal,'escrito')
                        return procesarResultado(resultado,finalOral,finalEscrito)
                    }else{
                    console.log('H')
                    escribirLog(`H Mid oral aprobado, Final oral aprobado`)
                    const resultado =  analizarSegundonivel(midTermEscrito,finalEscrito,notaFinal,'escrito')
                    return procesarResultado(resultado,finalOral,finalEscrito)

                }
            }else{
                console.log('I')
                const resultado =  analizarSegundonivel(midTermEscrito,finalEscrito,notaFinal,'escrito')

                if(Number(resultado)>59){
                    if(promedioFinalesOK(finalOral,finalEscrito)){
                        return resultado
                    }else{
                        console.log('O')
                        escribirLog(`O - El promedio de los finales no es suficiente`)
                        return desaprobado(notaFinal)
                    }
                }else{
                    return resultado
                }
            }
        }else{
            if(estaDesAprobado(finalOral[0])){
                    console.log('J')
                    escribirLog(`J mid oral desaprobado final desaprobado `)
                    return desaprobado(notaFinal)
            }else{
                console.log('I')
                escribirLog(`I mid oral desaprobado final aprobado`)
                const resultado =  analizarSegundonivel(midTermEscrito,finalEscrito,notaFinal,'escrito')
                
                if(Number(resultado)>59){
                    if(promedioFinalesOK(finalOral,finalEscrito)){
                        return resultado
                    }else{
                        console.log('O')
                        escribirLog(`O - El promedio de los finales no es suficiente`)
                        return desaprobado(notaFinal)
                    }
                }else{
                    return resultado
                }

            }
        }
    }

const desaprobado = (notaFinal)=>{
    //return 59
    //return Number(notaFinal) < 59 ?  Math.round(notaFinal).toString() : 59

    // Luciano solicitó que el desaprobado ya no sea 59 sino INC
    return 'INC'
}

const desaprobadoPorFaltaDeEstructura = ()=>{
    return 1
}

const examenesAprobados = (Oral,Escrito)=>{
   return Number(Oral[0])>59 && Number(Escrito[0])>59
}


const finalesDesaprobados = (finalOral,finalEscrito)=>{
//    return Number(finalOral[0])<41 || Number(finalEscrito[0])<41
    return Number(finalOral[0])<=49 || Number(finalEscrito[0])<=49
}

 const desaprobadoCondicional = (nota)=>{
    console.log('desaprobado condicional',nota[0])

//    return Number(nota[0])<59 && Number(nota[0])>40
    return Number(nota[0])<59 && Number(nota[0])>=50

 }

 const promedioFinalesOK = (finalOral, finalEscrito)=>{
        const promedio = (Number(finalOral)+Number(finalEscrito))/2
        return promedio > 59
 }

 const estaAprobado = (nota)=>{
    return Number(nota)>59
 }

 const estaDesAprobado = (nota)=>{
    return Number(nota)<60
 }

 const escribirLog = (texto) =>{
 /*   if(notaRef){
        notaRef.current.innerText = texto
    }
*/
    console.log(texto)
 }

 const  analizarSegundonivel = (midterm,final,notaFinal,nombre)=>{

    if(estaAprobado(midterm[0])){
        if(estaAprobado(final[0])){
            console.log('zzz')
            escribirLog(`mid ${nombre} aprobado final ${nombre} aprobado`)
            return Math.round(notaFinal).toString()
        }else{
            if(desaprobadoCondicional(final)){
                console.log('xxx')
                escribirLog(`mid ${nombre} aprobado final ${nombre} e/ 51 y 59`)
                return Math.round(notaFinal).toString()
            }else{
                console.log('yyy')
                escribirLog(`mid ${nombre} aprobado final ${nombre} <51`)
                return desaprobado(notaFinal)
            }
        }
    }else{
        if(estaAprobado(final[0])){
            console.log('ttt')
            escribirLog(`mid ${nombre} desaprobado final ${nombre} aprobado`)
            return Math.round(notaFinal).toString()
        }else{
            console.log('uuu')
            escribirLog(`mid ${nombre} desaprobado final ${nombre} desaprobado`)
            return desaprobado(notaFinal)
        }
    }
 }

 const procesarResultado = (resultado,finalOral,finalEscrito)=>{
    if(Number(resultado)>59){
        if(promedioFinalesOK(finalOral,finalEscrito)){
            return resultado
        }else{
            console.log('O')
            escribirLog(`O - El promedio de los finales no es suficiente`)
            return desaprobado(resultado)
        }
    }else{
        return resultado
    }
 }

 const obtenerValor = (item,notas)=>{

    if(isNaN(item[1])){ // si la nota no es un número puede ser -- , aus - inc ---etc
                        // si tiene un recuperatorio tomo la nota del mismo
                        // si la nota no es un número y no tiene recuperatorio tomo como CERO
        if(notas[`${item[0]}_rec`] && !isNaN(notas[`${item[0]}_rec`])){
            return notas[`${item[0]}_rec`]
        }else{
            return 0
        }
    }else{ // si la nota es un número entonces verifico si tiene recuperatorio aprobado
           // y si aprobó el recuperatorio tomo esa nota, si no tomo la nota original
        if(notas[`${item[0]}_rec`] && !isNaN(notas[`${item[0]}_rec`]) && Number(notas[`${item[0]}_rec`])>59){
            return notas[`${item[0]}_rec`]
        }else{
            return item[1]
        }
    }
}

const definirTitle = (item,encabezadoCompleto)=>{
    if(item[0].includes('_rec')){
        const col_recuperada = item[0].slice(0,9)
        return  `Recuperatorio de ${encabezadoCompleto[col_recuperada]}`
    }else{
        return encabezadoCompleto[item[0]]
    }
}

const definirEstilo = (item,encabezadoCompleto,tengoFoco,columnaFoco,visualizacion,notas)=>{

    const focoSi = item[0]==columnaFoco && tengoFoco ? true : false;
    console.log('perrin',JSON.stringify(notas))
    if (visualizacion) {
        if(item[0].includes('_rec')){
            if(esRecuperatorioSinNota(item[1])){
                return null
            }
            const col_recuperada = item[0].slice(0,9)
            const num_columna_recuperada = item[0].slice(8,9)
            return {borderRight: 'solid 1px black',backgroundx:vector_colores[Number(num_columna_recuperada)-1],borderBottom:focoSi ? 'solid 2px red' : `solid 1px ${vector_colores[Number(num_columna_recuperada)-1]}`,borderTop:focoSi ? 'solid 2px red' : ''}
        }else{
            if(notas[`${item[0]}_rec`] && !esRecuperatorioSinNota(notas[`${item[0]}_rec`])){
                const num_columna = item[0].slice(8,9)
                const focoSiRec = `${item[0]}_rec`==columnaFoco && tengoFoco ? true : false;
    
                return {borderLeft: 'solid 1px black',backgroundx:vector_colores[Number(num_columna)-1],borderBottom:focoSiRec ? 'solid 2px red' : `solid 1px ${vector_colores[Number(num_columna)-1]}`,borderTop:focoSiRec ? 'solid 2px red' : ''}
            }else{
                return null
            }
        }
    } 


    if(item[0].includes('_rec')){
        const col_recuperada = item[0].slice(0,9)
        const num_columna_recuperada = item[0].slice(8,9)
        return {borderRight: 'solid 1px black',backgroundx:vector_colores[Number(num_columna_recuperada)-1],borderBottom:focoSi ? 'solid 2px red' : `solid 1px ${vector_colores[Number(num_columna_recuperada)-1]}`,borderTop:focoSi ? 'solid 2px red' : ''}
    }else{
        if(encabezadoCompleto[`${item[0]}_rec`]){
            const num_columna = item[0].slice(8,9)
            const focoSiRec = `${item[0]}_rec`==columnaFoco && tengoFoco ? true : false;

            return {borderLeft: 'solid 1px black',backgroundx:vector_colores[Number(num_columna)-1],borderBottom:focoSiRec ? 'solid 2px red' : `solid 1px ${vector_colores[Number(num_columna)-1]}`,borderTop:focoSiRec ? 'solid 2px red' : ''}
        }else{
            return null
        }
    }
}

const esRecuperatorioSinNota = (item)=>{
    if(item!=undefined){
        return (Number(item)==0 || isNaN(item))
    }else{
        return true
    }
}

const crearObjetoNotasInicial = (notas) =>{
    const objetoNotasAvectorInicial = {}

    for (let i=1;i<9;i++){
        if(notas[`columna_${i}`]){ // si la nota existe y no es null
            if(isNaN(notas[`columna_${i}`])){ // si la nota es un texto ('--',aus,inc..etc)
                if(notas[`columna_${i}_rec`] && !isNaN(notas[`columna_${i}_rec`])){// si tiene recuperatorio y es un número va la nota del recuperatorio
                    objetoNotasAvectorInicial[`columna_${i}`] = notas[`columna_${i}_rec`]
                }else{
                    // este punto lo agregué para corregir un bug en encabezados con número de tratamiento, debería seguir funcionando para el resto de los encabezados sin problema
                    objetoNotasAvectorInicial[`columna_${i}`] = 0 // si la nota no es texto y no tiene recuperatorio va 0
                }
            }else{
                if(notas[`columna_${i}_rec`]){ // si la nota es numérica y tiene recuperatorio válido y aprobado va esa nota
                    if(notas[`columna_${i}_rec`] && !isNaN(notas[`columna_${i}_rec`]) && Number(notas[`columna_${i}_rec`])>59){
                        objetoNotasAvectorInicial[`columna_${i}`] = notas[`columna_${i}_rec`] // si el recuperatorio es válido y está aprobado va esa nota
                    }else{ // si el recuperatorio no está aprobado o no es un número va la nota original
                        objetoNotasAvectorInicial[`columna_${i}`] = notas[`columna_${i}`]
                    }
                }else{ // si la nota es numérica y no tiene recuperatorio va esa nota 
                    objetoNotasAvectorInicial[`columna_${i}`] = notas[`columna_${i}`]
                }
            }
        }
    }

    return objetoNotasAvectorInicial
}