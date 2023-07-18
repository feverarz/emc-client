import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose,faSave, faClock, faCircle as circle2 } from '@fortawesome/free-regular-svg-icons';
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import {scrollTop} from '../Helpers/utilidades-globales';
import {seleccionarTextoInput} from '../Helpers/utilidades-globales';
import {useNotas} from '../Context/notasContext';

const regex_solo_numeros = /^[0-9\b]+$/;

function Inputs_notas({fila,columnas,encabezado,vectorColumnasInstanciasFinales, usuario, nro_curso,titulos,ultimaFila,visualizacion,regimen}){
    const[notas,setNotas] = useState(
        {id_alumno:columnas.id_alumno,
            columna_1:columnas.columna_1,
            columna_2:columnas.columna_2,
            columna_3:columnas.columna_3,
            columna_4:columnas.columna_4,
            columna_5:columnas.columna_5,
            columna_6:columnas.columna_6,
            columna_7:columnas.columna_7,
            columna_8:columnas.columna_8,
            concepto:columnas.concepto,
            promedio:columnas.promedio,
            condicional:columnas.condicional}
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
    const {actualizarNota,idGrabar} = useNotas();

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

     useEffect(()=>{
        if (huboCambios(nuevasNotas,notas) && !cambioPromedio){
            setNotas({...notas,promedio:calcularPromedio(notas,regimen,vectorColumnasInstanciasFinales)})
    
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
        notas.concepto])
       
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
        if (idGrabar>0){
            if (huboCambios(nuevasNotas,notas)){
                guardarCambiosManualmente()
            }
        }
    },[idGrabar])
    
        useEffect(()=>{
            volverabuscarCalificaciones() // las calificaciones las traigo al crear el componente y luego de grabar para poder comparar si los campos y ver si hubo cambios para grabarlos, de otra forma grabaría siempre aunque no haya habido cambios
    
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
                hacerFoco(`${fila}columna_1`)
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
            try{
                const resultado = await Axios.put(`/api/cursos/calificaciones/${nro_curso}/${columnas.id_alumno}/${usuario.id_prof}`, objetoAgrabar)
    
                setGrabando(false)
    
                setInfoUpdate(`Notas guardadas ${resultado.data.hora}`) 
    
               // finalizarCalificaciones()
    
                volverabuscarCalificaciones()
    
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
    
        const handleFocus = (e) => {e.target.select();setTengoFoco(true)}
    
        const verificarValor = (e)=>{
    
            setTengoFoco(false)
    
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

    return <div className="flex f-col items-center"> 
    {tengoFoco && <div className="flex f-row">
                        <span className="color-gray text-large bold mr-2">{columnas.nombre}</span>
                 </div>}
    <div className="flex f-row items-center">
                {Object.entries(columnas).filter((item,index)=>item[1]!=null && index<12).map((item,index)=>
                <div>
                    {(tengoFoco || fila == 0) && <span className="e-calificaciones w-100pc">{titulos[index]}</span>}
                        <input  
                            autoComplete={"off"} 
                            name={item[0]} 
                            maxLength={53}
                            disable = {visualizacion}
                            onBlur = {(e)=>verificarValor(e)}
                            className={claseSegunColumnaFila(item[0],notas[item[0]])}
                            onFocus={(e)=>handleFocus(e)} 
                            onKeyDown={(e)=>comprobarTecla(e)} 
                            value={item[0]=='nombre' || visualizacion ? columnas[item[0]] : notas[item[0]]}   //ls diferencia es que si toma el value de columnas[nombre_campo] (el que viene como parametro) no va a cambiar su valor aunque trate de modificarlo el usuario. Cuando el value lo tomo de valor[nombre_campo] el valor lo toma del estado que ha cambiado por efecto del evengo onChange
                            onChange={(e)=>{
                                    cambiar(e)
                                }} id={fila+item[0]} type="text"
                        />
                </div>)}
                {/*!cambioGuardado && <button onBlur={()=>setTengoFoco(false)} onFocus={()=>setTengoFoco(true)}  title="Grabar los cambios" className="color-red" onClick={guardarCambiosManualmente}><FontAwesomeIcon icon={faSave} title="Grabar los cambios"/></button>*/}
    </div>

    <div className="flex f-row alignself-fe">
        {/*!cambioGuardado && <span className="color-red blink">Grabe los cambios ...</span>*/}
        {/*!cambioGuardado && <button onBlur={()=>setTengoFoco(false)} onFocus={()=>setTengoFoco(true)}  title="Grabar los cambios" className="color-red" onClick={guardarCambiosManualmente}><span className="color-red blink fw-100">Grabe los cambios ...</span><FontAwesomeIcon icon={faSave} title="Grabar los cambios"/></button>*/}
        {/*!cambioGuardado && <button onBlur={()=>setTengoFoco(false)} onFocus={()=>setTengoFoco(true)}  title="Cancelar" className="color-red" onClick={cancelarCambios}><FontAwesomeIcon icon={faWindowClose} title="Cancelar"/></button>*/}
        {/*grabando && <span>Grabando notas ...</span>*/}
        
    </div>
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
            case 'nombre': return 'caliname'
            default : return  columna == 'promedio' && Number(valor) < 60 ? 'cali text-center color-red':'cali text-center color-gray'
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
    concepto : notasNuevas.concepto})
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
    notasOriginales.concepto !=notasNuevas.concepto

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

function calcularPromedio(notas,regimen,vectorColumnasInstanciasFinales){

    if (!regimen.prom_automatico){
        return notas.promedio
    }

    const objetoNotasAvector = Object.entries(notas).filter(item=>!isNaN(item[1]) && item[1] != null && item[0] != 'promedio' )

    let notaFinal = objetoNotasAvector.reduce((acum,item)=>{
            const nombreColumna = item[0];
            const valorColumna = Number(item[1])
            const porcentaje = regimen[nombreColumna]
            const valorParcial = (valorColumna*porcentaje/100)
            return acum + valorParcial
    },0)


/*
Para que una materia esté aprobada (Nota Final > 60), 
todas las instancias de finales deben estar aprobadas 
(Examen y/o Proyecto Final). 
En caso de no estar aprobada alguna, la Nota Final no debe superar el 59. 
*/
    const vectorInstanciasFinalesAprobadas = objetoNotasAvector.filter(item=>vectorColumnasInstanciasFinales.some(item2=>item[0]==item2) && Number(item[1])>=60)
    
    if (vectorInstanciasFinalesAprobadas.length<vectorColumnasInstanciasFinales.length){
        if (notaFinal>59){
            notaFinal = 59
        }
    }

    return Math.round(notaFinal).toString()
}

function calcularConcepto(notas,regimen){
   
    if (!regimen.conc_manipulado){
        return notas.concepto
    }

    const objetoNotasAvector = Object.entries(notas).filter(item=>!isNaN(item[1]) && item[1] != null && item[0] != 'concepto' && item[0] != 'promedio')

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

export default React.memo(Inputs_notas)