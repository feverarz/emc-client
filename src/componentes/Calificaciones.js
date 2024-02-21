import React from 'react'
import {useState, useEffect} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose,faSave} from '@fortawesome/free-regular-svg-icons';
import { faCheckDouble,faUndo,faGripHorizontal,faGripVertical } from '@fortawesome/free-solid-svg-icons';
import {hacerScroll,hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';
const vector_colores = ['blue','red','green','yellow','RGB(145,145,145)']

export default function Calificaciones({encabezado, 
                                        notas,
                                        editar,
                                        nombreAlumnoSeleccionado,
                                        id_alumno,
                                        alumnoSeleccionado,
                                        cancelarAcciones,
                                        grabarNotas,regimen}){

    const [notaSeleccionada,setNotaSeleccionada]=useState(null);
    const [sePuedeEditar,setSePuedeEditar]=useState(false)    
    const [copiaNotas,setCopiaNotas]=useState(null)    
    const [huboCambios,setHuboCambios]=useState(false)    
    const [mostrarEnColumnas,setMostrarEnColumnas]=useState(false)    
    const [mostrarNotasOriginales,setMostrarNotasOriginales]=useState(false)

    useEffect(()=>{
        if(notas){
            setCopiaNotas({...notas[0]});
        }
    },[])

    useEffect(()=>{
    },[notaSeleccionada])

    useEffect(()=>{

        if (editar){
            if (id_alumno == alumnoSeleccionado){
                setSePuedeEditar(true) 
                setHuboCambios(false)
                //abrirPrimeraNotaAutomaticamente();
            }else{
                setSePuedeEditar(false) 
                setNotaSeleccionada(null)
            }
        }

    },[alumnoSeleccionado])

    const iniciarEdicion = (columna)=>{

        if(sePuedeEditar && editar){ // sePuedeEditar se refiere a si el alumno fue seleccionado para editar dentro de la grilla. La propiedad editar se refiere a si es una grilla de visualización o de carga de notas.
            if(notaSeleccionada==columna){
                setNotaSeleccionada(null)
            }else{
                setNotaSeleccionada(columna)
                hacerfocoEnPrimerInput('in-range')
            }
        }
    }

    const abrirPrimeraNotaAutomaticamente = ()=>{
        const encabezadoComoArray = Object.entries(encabezado) // Object.entries(encabezado) devuelve un array con cada par clave, valor del objeto como otro array, es un array de arrays

/*      0: (2) ["columna_1", "ProyMid"]
        1: (2) ["columna_2", "TestMid"]
        2: (2) ["columna_3", "ProyFinal"]
        3: (2) ["columna_4", "TestFinal"]
        4: (2) ["columna_5", null]
        5: (2) ["columna_6", null]
        6: (2) ["columna_7", null]
        7: (2) ["columna_8", null]
        8: (2) ["concepto", "Concepto"]    */

        const primeraNotaNoNula = encabezadoComoArray.find(item=>item[1] !=null)

        // devuelve por ejemplo ["columna_3", "ProyFinal"]

        setNotaSeleccionada(primeraNotaNoNula[0])
    }

    const cerrarLeyendasYnotas = ()=>{
        setTimeout(() => {
            setNotaSeleccionada(null)
        }, 1); // se hace con settimeout porque de otra forma no actualizaba, se ejecutaba la función pero no se actualizaba el estado
    }

    const verColumnas = ()=>{
        if (mostrarEnColumnas){
            setMostrarEnColumnas(false)
        }else{
            setMostrarEnColumnas(true)
        }
    }

    const procesarNota=(columna,valor)=>{
        const aux = {...copiaNotas};
        aux[columna] = valor;

        setCopiaNotas(aux);
        copiaNotas[columna]=valor;

        const verificacionDiferencias = lasNotasSonDiferentes(notas[0],copiaNotas);

        setHuboCambios(verificacionDiferencias)
    }

    const deshacerNotaIndividual=(columna)=>{
       
        iniciarDeshacerNotaIndividual(columna).then(notasModificadas=>{
            const verificacionDiferencias = lasNotasSonDiferentes(notas[0],notasModificadas);
            setHuboCambios(verificacionDiferencias)
        })

    }

    const iniciarDeshacerNotaIndividual= async (columna)=>{
        const aux = {...copiaNotas};
        const valorOriginal = notas[0][columna]

        aux[columna] = valorOriginal;

        setCopiaNotas(aux);

        return aux
    }

    const cancelarEdicion =()=>{
        setCopiaNotas({...notas[0]})
        cancelarAcciones();
    }

    const grabarCambios =()=>{
        grabarNotas(copiaNotas)
    }

    const deshacerCambios =()=>{
        setCopiaNotas({...notas[0]})
        setHuboCambios(false)
        cerrarLeyendasYnotas()
    }

    const verOriginales =()=>{
        if (mostrarNotasOriginales){
                setMostrarNotasOriginales(false)
        }else{
                setMostrarNotasOriginales(true)
        }
    }

    

    if (copiaNotas){

        if (notas.length==0) {
            return ''
        }

        return(<div className="relative">
            {sePuedeEditar && 
                <div>
                    <h4 className="text-center mt-0 mb-2">{nombreAlumnoSeleccionado}</h4>
                    <Acciones   huboCambios={huboCambios} 
                                cancelar={cancelarEdicion} 
                                grabar={grabarCambios} 
                                deshacer={deshacerCambios}
                                verOriginales={verOriginales}
                                verColumnas={verColumnas}
                                mostrarEnColumnas={mostrarEnColumnas}/>
                </div>
            }
            {sePuedeEditar && mostrarNotasOriginales && huboCambios && <Originales notasOriginales={notas[0]} mostrarEnColumnas={mostrarEnColumnas}/>}
            <div className={mostrarEnColumnas ? "flex f-row justify-content-center":""}>
            {sePuedeEditar && <Encabezado encabezado={encabezado} mostrarEnColumnas={mostrarEnColumnas}/>}
            <div className={sePuedeEditar ? mostrarEnColumnas ? 'mb-4 flex f-col':'mb-4' : ''}>
                {encabezado.columna_1 && 
                    <span title={definirTitle('columna_1',encabezado)} 
                          style={definirEstilo('columna_1',encabezado,false,null)}
                          onClick={()=>iniciarEdicion('columna_1')}  
                          className={sePuedeEditar ? "g-calificaciones cursor-pointer" : "g-calificaciones cursor-not-allowed"}>
                                {copiaNotas.columna_1}
                                {notaSeleccionada=='columna_1' && 
                                        <LeyendasYnotas columna='columna_1' 
                                                        nombre={encabezado.columna_1} 
                                                        procesarNota={procesarNota}
                                                        numero={copiaNotas.columna_1}
                                                        cerrar={cerrarLeyendasYnotas}
                                                        notaOriginal={notas[0].columna_1}
                                                        deshacerNotaIndividual={deshacerNotaIndividual}/>}
                    </span>
                }
                {encabezado.columna_1_rec && 
                    <span title={definirTitle('columna_1_rec',encabezado)}  
                          style={definirEstilo('columna_1_rec',encabezado,false,null)}
                          className={sePuedeEditar ? "g-calificaciones cursor-pointer recupera" : "g-calificaciones cursor-not-allowed recupera"}>
                                {copiaNotas.columna_1_rec}
                    </span>
                }
                {encabezado.columna_2 && 
                    /*<div>
                        <input  type="text" 
                                value={copiaNotas.columna_2} 
                                onClick={()=>iniciarEdicion('columna_2')}
                                className={sePuedeEditar ? "g-calificaciones cursor-pointer" : "g-calificaciones cursor-not-allowed"}
                        />
                        {notaSeleccionada=='columna_2' && 
                                    <LeyendasYnotas columna='columna_2' 
                                                    nombre={encabezado.columna_2} 
                                                    procesarNota={procesarNota}
                                                    numero={copiaNotas.columna_2}
                                                    cerrar={cerrarLeyendasYnotas}
                                                    notaOriginal={notas[0].columna_2}
                                                    deshacerNotaIndividual={deshacerNotaIndividual}/>} 
                    </div>*/
                    <span title={definirTitle('columna_2',encabezado)}  
                          onClick={()=>iniciarEdicion('columna_2')}  
                          style={definirEstilo('columna_2',encabezado,false,null)}
                          className={sePuedeEditar ? "g-calificaciones cursor-pointer" : "g-calificaciones cursor-not-allowed"}>
                                 {copiaNotas.columna_2}
                                {notaSeleccionada=='columna_2' && 
                                    <LeyendasYnotas columna='columna_2' 
                                                    nombre={encabezado.columna_2} 
                                                    procesarNota={procesarNota}
                                                    numero={copiaNotas.columna_2}
                                                    cerrar={cerrarLeyendasYnotas}
                                                    notaOriginal={notas[0].columna_2}
                                                    deshacerNotaIndividual={deshacerNotaIndividual}/>}                                                    
                    </span>
                }
                {encabezado.columna_2_rec && 
                    <span title={definirTitle('columna_2_rec',encabezado)}  
                          style={definirEstilo('columna_2_rec',encabezado,false,null)}
                          className={sePuedeEditar ? "g-calificaciones cursor-pointer" : "g-calificaciones cursor-not-allowed"}>
                                {copiaNotas.columna_2_rec}
                    </span>
                }                
                {encabezado.columna_3 && 
                    <span title={definirTitle('columna_3',encabezado)} 
                          onClick={()=>iniciarEdicion('columna_3')}  
                          style={definirEstilo('columna_3',encabezado,false,null)}
                          className={sePuedeEditar ? "g-calificaciones cursor-pointer" : "g-calificaciones cursor-not-allowed"}>
                                 {copiaNotas.columna_3}
                                {notaSeleccionada=='columna_3' && 
                                <LeyendasYnotas columna='columna_3' 
                                                nombre={encabezado.columna_3} 
                                                procesarNota={procesarNota}
                                                numero={copiaNotas.columna_3}
                                                cerrar={cerrarLeyendasYnotas}
                                                notaOriginal={notas[0].columna_3}
                                                deshacerNotaIndividual={deshacerNotaIndividual}/>}                                                
                    </span>
                }
                {encabezado.columna_3_rec && 
                    <span title={definirTitle('columna_3_rec',encabezado)} 
                          style={definirEstilo('columna_3_rec',encabezado,false,null)}
                          className={sePuedeEditar ? "g-calificaciones cursor-pointer" : "g-calificaciones cursor-not-allowed"}>
                                {copiaNotas.columna_3_rec}
                    </span>
                }
                {encabezado.columna_4 && 
                    <span title={definirTitle('columna_4',encabezado)} 
                          onClick={()=>iniciarEdicion('columna_4')}  
                          style={definirEstilo('columna_4',encabezado,false,null)}
                          className={sePuedeEditar ? "g-calificaciones cursor-pointer" : "g-calificaciones cursor-not-allowed"}>
                                 {copiaNotas.columna_4}
                                {notaSeleccionada=='columna_4' && 
                                <LeyendasYnotas columna='columna_4' 
                                                nombre={encabezado.columna_4} 
                                                procesarNota={procesarNota}
                                                numero={copiaNotas.columna_4}
                                                cerrar={cerrarLeyendasYnotas}
                                                notaOriginal={notas[0].columna_4}
                                                deshacerNotaIndividual={deshacerNotaIndividual}/>}                                                
                    </span>
                }       
                {encabezado.columna_4_rec && 
                    <span title={definirTitle('columna_4_rec',encabezado)} 
                          style={definirEstilo('columna_4_rec',encabezado,false,null)}
                          className={sePuedeEditar ? "g-calificaciones cursor-pointer" : "g-calificaciones cursor-not-allowed"}>
                                {copiaNotas.columna_4_rec}
                    </span>
                }         
                {encabezado.columna_5 && 
                    <span title={definirTitle('columna_5',encabezado)}  
                          onClick={()=>iniciarEdicion('columna_5')}  
                          style={definirEstilo('columna_5',encabezado,false,null)}
                          className={sePuedeEditar ? "g-calificaciones cursor-pointer" : "g-calificaciones cursor-not-allowed"}>
                                {copiaNotas.columna_5}
                                {notaSeleccionada=='columna_5' && 
                                <LeyendasYnotas columna='columna_5' 
                                          nombre={encabezado.columna_5} 
                                          procesarNota={procesarNota}
                                          numero={copiaNotas.columna_5}
                                          cerrar={cerrarLeyendasYnotas}
                                          notaOriginal={notas[0].columna_5}
                                          deshacerNotaIndividual={deshacerNotaIndividual}/>}                                          
                    </span>
                }
                {encabezado.columna_5_rec && 
                    <span title={definirTitle('columna_5_rec',encabezado)} 
                          style={definirEstilo('columna_5_rec',encabezado,false,null)}
                          className={sePuedeEditar ? "g-calificaciones cursor-pointer" : "g-calificaciones cursor-not-allowed"}>
                                {copiaNotas.columna_5_rec}
                    </span>
                }
                {encabezado.columna_6 && 
                    <span title={definirTitle('columna_6',encabezado)}  
                          onClick={()=>iniciarEdicion('columna_6')}  
                          style={definirEstilo('columna_6',encabezado,false,null)}
                          className={sePuedeEditar ? "g-calificaciones cursor-pointer" : "g-calificaciones cursor-not-allowed"}>
                                {copiaNotas.columna_6}
                                {notaSeleccionada=='columna_6' && 
                                <LeyendasYnotas columna='columna_6' 
                                          nombre={encabezado.columna_6} 
                                          procesarNota={procesarNota}
                                          numero={copiaNotas.columna_6}
                                          cerrar={cerrarLeyendasYnotas}
                                          notaOriginal={notas[0].columna_6}
                                          deshacerNotaIndividual={deshacerNotaIndividual}/>}                                          
                    </span>
                }         
                {encabezado.columna_6_rec && 
                    <span title={definirTitle('columna_6_rec',encabezado)}  
                          style={definirEstilo('columna_6_rec',encabezado,false,null)}
                          className={sePuedeEditar ? "g-calificaciones cursor-pointer" : "g-calificaciones cursor-not-allowed"}>
                                {copiaNotas.columna_6_rec}
                    </span>
                }
                {encabezado.columna_7 && 
                    <span title={definirTitle('columna_7',encabezado)} 
                          onClick={()=>iniciarEdicion('columna_7')}  
                          style={definirEstilo('columna_7',encabezado,false,null)}
                          className={sePuedeEditar ? "g-calificaciones cursor-pointer" : "g-calificaciones cursor-not-allowed"}>
                              {copiaNotas.columna_7}
                                {notaSeleccionada=='columna_7' && 
                                <LeyendasYnotas columna='columna_7' 
                                          nombre={encabezado.columna_7} 
                                          procesarNota={procesarNota}
                                          numero={copiaNotas.columna_7}
                                          cerrar={cerrarLeyendasYnotas}
                                          notaOriginal={notas[0].columna_7}
                                          deshacerNotaIndividual={deshacerNotaIndividual}/>}                                          
                    </span>
                }            
                {encabezado.columna_7_rec && 
                    <span title={definirTitle('columna_7_rec',encabezado)} 
                          style={definirEstilo('columna_7_rec',encabezado,false,null)}
                          className={sePuedeEditar ? "g-calificaciones cursor-pointer" : "g-calificaciones cursor-not-allowed"}>
                                {copiaNotas.columna_7_rec}
                    </span>
                } 
                {encabezado.columna_8 && 
                    <span title={definirTitle('columna_8',encabezado)}  
                          onClick={()=>iniciarEdicion('columna_8')}  
                          style={definirEstilo('columna_8',encabezado,false,null)}
                          className={sePuedeEditar ? "g-calificaciones cursor-pointer" : "g-calificaciones cursor-not-allowed"}>
                              {copiaNotas.columna_8}
                          {notaSeleccionada=='columna_8' && 
                          <LeyendasYnotas columna='columna_8' 
                                          nombre={encabezado.columna_8} 
                                          procesarNota={procesarNota}
                                          numero={copiaNotas.columna_8}
                                          cerrar={cerrarLeyendasYnotas}
                                          notaOriginal={notas[0].columna_8}
                                          deshacerNotaIndividual={deshacerNotaIndividual}/>}                                          
                    </span>
                }       
                {encabezado.columna_8_rec && 
                    <span title={definirTitle('columna_8_rec',encabezado)} 
                          style={definirEstilo('columna_8_rec',encabezado,false,null)}
                          className={sePuedeEditar ? "g-calificaciones cursor-pointer" : "g-calificaciones cursor-not-allowed"}>
                                {copiaNotas.columna_8_rec}
                    </span>
                }                   
                {encabezado.concepto && 
                    <span title={encabezado.concepto} 
                          onClick={()=>iniciarEdicion('concepto')}  
                          className={sePuedeEditar ? "g-calificaciones cursor-pointer" : "g-calificaciones cursor-not-allowed"}>
                              {copiaNotas.concepto}
                          {notaSeleccionada=='concepto' && 
                          <LeyendasYnotas columna='concepto' 
                                          nombre={encabezado.concepto} 
                                          procesarNota={procesarNota}
                                          numero={copiaNotas.concepto}
                                          cerrar={cerrarLeyendasYnotas}
                                          notaOriginal={notas[0].concepto}
                                          deshacerNotaIndividual={deshacerNotaIndividual}/>}                                          
                    </span>
                }
                    <span title='Nota final' 
                          onClick={()=>iniciarEdicion('promedio')}  
                          className={sePuedeEditar ? `g-calificaciones cursor-pointer ${(copiaNotas.promedio < 60 || isNaN(copiaNotas.promedio)) ? 'color-red' : ''}` : `g-calificaciones cursor-not-allowed ${(copiaNotas.promedio < 60 || isNaN(copiaNotas.promedio)) ? 'color-red' : ''}`}>
                              {copiaNotas.promedio}
                          {notaSeleccionada=='promedio' && 
                          <LeyendasYnotas columna='promedio' 
                                          nombre={'Nota final'} 
                                          procesarNota={procesarNota}
                                          numero={copiaNotas.promedio}
                                          cerrar={cerrarLeyendasYnotas}
                                          notaOriginal={notas[0].promedio}
                                          deshacerNotaIndividual={deshacerNotaIndividual}/>}                                             
                    </span>
                    <span title='Condicional' 
                          onClick={()=>iniciarEdicion('condicional')}  
                          className={sePuedeEditar ? "g-calificaciones cursor-pointer" : "g-calificaciones cursor-not-allowed"}>
                              {copiaNotas.condicional=='COND' ? 'COND' : '--'}
                          {notaSeleccionada=='condicional' && 
                          <LeyendasYnotas columna='condicional' 
                                          esCondicional={true}
                                          nombre={'Condicional'} 
                                          procesarNota={procesarNota}
                                          numero={copiaNotas.condicional}
                                          cerrar={cerrarLeyendasYnotas}
                                          notaOriginal={notas[0].condicional}
                                          deshacerNotaIndividual={deshacerNotaIndividual}/>}                                             
                    </span>
            </div>
            </div>
            <span title={`Actualizado el ${copiaNotas.dia} ${copiaNotas.fecha} a las ${copiaNotas.hora} hs. por ${copiaNotas.usuario} `} className="text-xxsmall">{copiaNotas.fecha ?  `Última actualización el ${copiaNotas.dia} ${copiaNotas.fecha} a las ${copiaNotas.hora.substring(0,5)} hs.` : ``}</span>

        </div>) 

    }else{

        if (!encabezado) {
            return ''
        }

        if (encabezado.length==0) {
            return ''
        }

        return (
                <div> 
                {!editar &&  <div>
                    {encabezado.columna_1 && <span title={encabezado.columna_1} className="e-calificaciones w-50">{encabezado.columna_1}</span>}
                    {encabezado.columna_1_rec && <span title={encabezado.columna_1_rec} className="e-calificaciones w-50">{encabezado.columna_1_rec}</span>}
                    {encabezado.columna_2 && <span title={encabezado.columna_2} className="e-calificaciones w-50">{encabezado.columna_2}</span>}
                    {encabezado.columna_2_rec && <span title={encabezado.columna_2_rec} className="e-calificaciones w-50">{encabezado.columna_2_rec}</span>}
                    {encabezado.columna_3 && <span title={encabezado.columna_3} className="e-calificaciones w-50">{encabezado.columna_3}</span>}
                    {encabezado.columna_3_rec && <span title={encabezado.columna_3_rec} className="e-calificaciones w-50">{encabezado.columna_3_rec}</span>}
                    {encabezado.columna_4 && <span title={encabezado.columna_4} className="e-calificaciones w-50">{encabezado.columna_4}</span>}
                    {encabezado.columna_4_rec && <span title={encabezado.columna_4_rec} className="e-calificaciones w-50">{encabezado.columna_4_rec}</span>}
                    {encabezado.columna_5 && <span title={encabezado.columna_5} className="e-calificaciones w-50">{encabezado.columna_5}</span>}
                    {encabezado.columna_5_rec && <span title={encabezado.columna_5_rec} className="e-calificaciones w-50">{encabezado.columna_5_rec}</span>}
                    {encabezado.columna_6 && <span title={encabezado.columna_6} className="e-calificaciones w-50">{encabezado.columna_6}</span>}
                    {encabezado.columna_6_rec && <span title={encabezado.columna_6_rec} className="e-calificaciones w-50">{encabezado.columna_6_rec}</span>}
                    {encabezado.columna_7 && <span title={encabezado.columna_7} className="e-calificaciones w-50">{encabezado.columna_7}</span>}
                    {encabezado.columna_7_rec && <span title={encabezado.columna_7_rec} className="e-calificaciones w-50">{encabezado.columna_7_rec}</span>}
                    {encabezado.columna_8 && <span title={encabezado.columna_8} className="e-calificaciones w-50">{encabezado.columna_8}</span>}
                    {encabezado.columna_8_rec && <span title={encabezado.columna_8_rec} className="e-calificaciones w-50">{encabezado.columna_8_rec}</span>}
                    {encabezado.concepto && <span title={encabezado.concepto} className="e-calificaciones w-50">{encabezado.concepto}</span>}
                    <span title="Promedio" className="e-calificaciones w-50">Nota final</span>
                    <span title="Condicional" className="e-calificaciones w-50">Condicional</span>
                </div>}
            </div>
        )
        
       
    }
   
} 

function Originales({notasOriginales,mostrarEnColumnas}){
    return <div className={mostrarEnColumnas ? "contenedor-notas-originales-c" : "contenedor-notas-originales-f"}>
                    {notasOriginales.columna_1 && <span title={notasOriginales.columna_1} className={mostrarEnColumnas ? "g-originales-c" : "g-originales-f"}>{notasOriginales.columna_1}</span>}
                    {notasOriginales.columna_1_rec && <span title={notasOriginales.columna_1_rec} className={mostrarEnColumnas ? "g-originales-c" : "g-originales-f"}>{notasOriginales.columna_1_rec}</span>}
                    {notasOriginales.columna_2 && <span title={notasOriginales.columna_2} className={mostrarEnColumnas ? "g-originales-c" : "g-originales-f"}>{notasOriginales.columna_2}</span>}
                    {notasOriginales.columna_2_rec && <span title={notasOriginales.columna_2_rec} className={mostrarEnColumnas ? "g-originales-c" : "g-originales-f"}>{notasOriginales.columna_2_rec}</span>}
                    {notasOriginales.columna_3 && <span title={notasOriginales.columna_3} className={mostrarEnColumnas ? "g-originales-c" : "g-originales-f"}>{notasOriginales.columna_3}</span>}
                    {notasOriginales.columna_3_rec && <span title={notasOriginales.columna_3_rec} className={mostrarEnColumnas ? "g-originales-c" : "g-originales-f"}>{notasOriginales.columna_3_rec}</span>}
                    {notasOriginales.columna_4 && <span title={notasOriginales.columna_4} className={mostrarEnColumnas ? "g-originales-c" : "g-originales-f"}>{notasOriginales.columna_4}</span>}
                    {notasOriginales.columna_4_rec && <span title={notasOriginales.columna_4_rec} className={mostrarEnColumnas ? "g-originales-c" : "g-originales-f"}>{notasOriginales.columna_4_rec}</span>}
                    {notasOriginales.columna_5 && <span title={notasOriginales.columna_5} className={mostrarEnColumnas ? "g-originales-c" : "g-originales-f"}>{notasOriginales.columna_5}</span>}
                    {notasOriginales.columna_5_rec && <span title={notasOriginales.columna_5_rec} className={mostrarEnColumnas ? "g-originales-c" : "g-originales-f"}>{notasOriginales.columna_5_rec}</span>}
                    {notasOriginales.columna_6 && <span title={notasOriginales.columna_6} className={mostrarEnColumnas ? "g-originales-c" : "g-originales-f"}>{notasOriginales.columna_6}</span>}
                    {notasOriginales.columna_6_rec && <span title={notasOriginales.columna_6_rec} className={mostrarEnColumnas ? "g-originales-c" : "g-originales-f"}>{notasOriginales.columna_6_rec}</span>}
                    {notasOriginales.columna_7 && <span title={notasOriginales.columna_7} className={mostrarEnColumnas ? "g-originales-c" : "g-originales-f"}>{notasOriginales.columna_7}</span>}
                    {notasOriginales.columna_7_rec && <span title={notasOriginales.columna_7_rec} className={mostrarEnColumnas ? "g-originales-c" : "g-originales-f"}>{notasOriginales.columna_7_rec}</span>}
                    {notasOriginales.columna_8 && <span title={notasOriginales.columna_8} className={mostrarEnColumnas ? "g-originales-c" : "g-originales-f"}>{notasOriginales.columna_8}</span>}
                    {notasOriginales.columna_8_rec && <span title={notasOriginales.columna_8_rec} className={mostrarEnColumnas ? "g-originales-c" : "g-originales-f"}>{notasOriginales.columna_8_rec}</span>}
                    {notasOriginales.concepto && <span title={notasOriginales.concepto} className={mostrarEnColumnas ? "g-originales-c" : "g-originales-f"}>{notasOriginales.concepto}</span>}
                    <span title={notasOriginales.promedio} className={mostrarEnColumnas ? "g-originales-c" : "g-originales-f"}>{notasOriginales.promedio}</span>
                    <span title={notasOriginales.condicional} className={mostrarEnColumnas ? "g-originales-c" : "g-originales-f"}>{notasOriginales.condicional=='COND' ? 'COND' : '--'}</span>
</div>

}
function Encabezado({encabezado,mostrarEnColumnas}){
return <div className={mostrarEnColumnas ? "flex f-col en-col" : ""}>
            {encabezado.columna_1 && <span title={encabezado.columna_1} className="e-calificaciones w-50">{encabezado.columna_1}</span>}
            {encabezado.columna_1_rec && <span title={encabezado.columna_1_rec} className="e-calificaciones w-50">{encabezado.columna_1_rec}</span>}
            {encabezado.columna_2 && <span title={encabezado.columna_2} className="e-calificaciones w-50">{encabezado.columna_2}</span>}
            {encabezado.columna_2_rec && <span title={encabezado.columna_2_rec} className="e-calificaciones w-50">{encabezado.columna_2_rec}</span>}
            {encabezado.columna_3 && <span title={encabezado.columna_3} className="e-calificaciones w-50">{encabezado.columna_3}</span>}
            {encabezado.columna_3_rec && <span title={encabezado.columna_3_rec} className="e-calificaciones w-50">{encabezado.columna_3_rec}</span>}
            {encabezado.columna_4 && <span title={encabezado.columna_4} className="e-calificaciones w-50">{encabezado.columna_4}</span>}
            {encabezado.columna_4_rec && <span title={encabezado.columna_4_rec} className="e-calificaciones w-50">{encabezado.columna_4_rec}</span>}
            {encabezado.columna_5 && <span title={encabezado.columna_5} className="e-calificaciones w-50">{encabezado.columna_5}</span>}
            {encabezado.columna_5_rec && <span title={encabezado.columna_5_rec} className="e-calificaciones w-50">{encabezado.columna_5_rec}</span>}
            {encabezado.columna_6 && <span title={encabezado.columna_6} className="e-calificaciones w-50">{encabezado.columna_6}</span>}
            {encabezado.columna_6_rec && <span title={encabezado.columna_6_rec} className="e-calificaciones w-50">{encabezado.columna_6_rec}</span>}
            {encabezado.columna_7 && <span title={encabezado.columna_7} className="e-calificaciones w-50">{encabezado.columna_7}</span>}
            {encabezado.columna_7_rec && <span title={encabezado.columna_7_rec} className="e-calificaciones w-50">{encabezado.columna_7_rec}</span>}
            {encabezado.columna_8 && <span title={encabezado.columna_8} className="e-calificaciones w-50">{encabezado.columna_8}</span>}
            {encabezado.columna_8_rec && <span title={encabezado.columna_8_rec} className="e-calificaciones w-50">{encabezado.columna_8_rec}</span>}
            {encabezado.concepto && <span title={encabezado.concepto} className="e-calificaciones w-50">{encabezado.concepto}</span>}
            <span title="Promedio" className="e-calificaciones">Promedio</span>
            <span title="Condicional" className="e-calificaciones">Condicional</span>
</div>
}

function LeyendasYnotas_old(){

    const[valor,setValor]=useState(50)
    const[mostrarRange,setMostrarRange]=useState(false)

    const cambiar=(e)=>{
        setValor(e.target.value)
    }

    return <div className="flex f-row absolute contenedor-leyendas-notas">
            <div className="flex f-row">
                <button title="Ausente justificado 251" className="boton-leyenda-notas">AJ</button>
            </div>
            <button title="Ausente injustificado 252" className="boton-leyenda-notas">AI</button>
            <button title="I 253" className="boton-leyenda-notas">I</button>
            <button title="AUS 254" className="boton-leyenda-notas">AUS</button>
            <button title="Incompleto 255" className="boton-leyenda-notas">INC</button>
            <button title="Sin calificación 0" className="boton-leyenda-notas">--</button>
            <button onClick={()=>setMostrarRange(true)} title="Sin calificación 0" className="boton-leyenda-notas">{valor}</button>
            {mostrarRange && <div className="bg-tomato"><input value={valor} step="10" id="in-range" onChange={(e)=>cambiar(e)} type="range" id="vol" name="vol" min="0" max="100"></input></div>}
            
    </div>
}


function LeyendasYnotas({columna,nombre,procesarNota,numero,cerrar,notaOriginal,deshacerNotaIndividual,esCondicional}){


    const[valor,setValor]=useState(Number.isInteger(Number(numero)) ? Number(numero) : 0)
    const[mostrarRange,setMostrarRange]=useState(false)

    const notaDiferenteAoriginal = notaOriginal!=numero;

    const cambiar=(e)=>{
        setValor(e.target.value)
        procesarNota(columna,e.target.value)
    }

    return <div className="flex f-col absolute contenedor-leyendas-notas">
            <div className="flex f-row justify-content-space-around">
                <span className="text-small bold">{nombre}</span>
                <span className="cursor-pointer texto-acciones-menu botonNc inline-block-1" 
                      title='Cerrar' onClick={()=>cerrar()}>
                    <FontAwesomeIcon icon={faWindowClose}/>
                </span>
            </div>
            
            {!esCondicional && <div className="bg-tomato h-18"><input value={valor} onChange={(e)=>cambiar(e)} type="range" id="in-range" min="0" max="100"></input>
                <button onClick={()=>procesarNota(columna,'AJ')} title="Ausente justificado 251" className="boton-leyenda-notas text-small">AJ</button>
                <button onClick={()=>procesarNota(columna,'INC')} title="Incompleto 255" className="boton-leyenda-notas text-small">INC</button>
                <button onClick={()=>procesarNota(columna,'--')} title="Sin calificación 0" className="boton-leyenda-notas text-small">--</button>
                <button onClick={()=>procesarNota(columna,'AI')} title="Ausente injustificado 252" className="boton-leyenda-notas text-small">AI</button>
                <button onClick={()=>procesarNota(columna,'I')} title="I 253" className="boton-leyenda-notas text-small">I</button>
                <button onClick={()=>procesarNota(columna,'AUS')} title="AUS 254" className="boton-leyenda-notas text-small">AUS</button>
                {notaDiferenteAoriginal && <button onClick={()=>deshacerNotaIndividual(columna)} title={`Volver a la nota original...${notaOriginal}`} className="boton-leyenda-notas text-small">
                        <FontAwesomeIcon className="" icon={faUndo}/>
                </button>}
            </div>}

            {esCondicional && <div className="h-18">
                <button onClick={()=>procesarNota(columna,'')} title="Sin calificación 0" className="boton-leyenda-notas text-small">--</button>
                <button onClick={()=>procesarNota(columna,'COND')} title="Condicional" className="boton-leyenda-notas text-xxsmall">COND</button>
                {notaDiferenteAoriginal && <button onClick={()=>deshacerNotaIndividual(columna)} title={`Volver a la nota original...${notaOriginal}`} className="boton-leyenda-notas">
                        <FontAwesomeIcon className="" icon={faUndo}/>
                </button>}
            </div>}            
            
    </div>
}

function Acciones({huboCambios,cancelar,deshacer,grabar,verOriginales,verColumnas, mostrarEnColumnas}){

       return <div className="flex f-row justify-content-center mb-2 mt-2">
            <span onClick={cancelar} className="cursor-pointer texto-acciones-menu botonNc inline-block-1 mr-2" title='Cancelar'>
                <FontAwesomeIcon className="color-tomato" icon={faWindowClose}/>
            </span>
            <span onClick={verColumnas} className="cursor-pointer texto-acciones-menu botonNc inline-block-1 mr-2" title={ mostrarEnColumnas ? 'Mostrar en filas':'Mostrar en columnas'}>
                <FontAwesomeIcon className="color-tomato" icon={mostrarEnColumnas ? faGripHorizontal : faGripVertical  }/>
            </span>            
            {huboCambios && 
            <div className="flex f-row">
                <span onClick={deshacer} className="cursor-pointer texto-acciones-menu botonNc inline-block-1 mr-2" title='Deshacer todo'>
                    <FontAwesomeIcon className="color-tomato" icon={faUndo}/>
                </span>
                <span onClick={verOriginales} className="cursor-pointer texto-acciones-menu botonNc inline-block-1 mr-2" title='Ver notas originales'>
                    <FontAwesomeIcon className="color-tomato" icon={faCheckDouble}/>
                </span>                
            </div>}
            <div>
                {!huboCambios && <span className="cursor-pointer mr-2 ml-6 text-xxsmall" >
                    No hubo cambios 
                </span>}
                {huboCambios && <span onClick={grabar} className="color-63 cursor-pointer mr-2 ml-6 text-small blink" >
                    <FontAwesomeIcon className="color-tomato" icon={faSave}/> Grabar cambios 
                </span> }
            </div>
        </div>

}

function lasNotasSonDiferentes(notasOriginales,copiaNotas){
    let seEncontraronDiferentes = false;

    const notasOriginalesVector = Object.values(notasOriginales);
    const copiaNotasVector = Object.values(copiaNotas);
    
    notasOriginalesVector.forEach((item,index)=>{
            if (item!=copiaNotasVector[index]){
                seEncontraronDiferentes=true
            }
    })

    return seEncontraronDiferentes
}

const definirTitle = (item,encabezadoCompleto)=>{
    if(item.includes('_rec')){
        const col_recuperada = item.slice(0,9)
        return  `Recuperatorio de ${encabezadoCompleto[col_recuperada]}`
    }else{
        return encabezadoCompleto[item]
    }
}

const definirEstilo = (item,encabezadoCompleto,tengoFoco,columnaFoco)=>{

    console.log(item,encabezadoCompleto)
    const focoSi = item==columnaFoco && tengoFoco ? true : false;

    if(item.includes('_rec')){
        const col_recuperada = item.slice(0,9)
        const num_columna_recuperada = item.slice(8,9)
        return {borderRight: 'solid 1px black',background:'rgb(189, 184, 184)',borderBottom:focoSi ? 'solid 2px red' : `solid 2px ${vector_colores[Number(num_columna_recuperada)-1]}`,borderTop:focoSi ? 'solid 2px red' : ''}
    }else{
        if(encabezadoCompleto[`${item}_rec`]){
            const num_columna = item.slice(8,9)
            const focoSiRec = `${item}_rec`==columnaFoco && tengoFoco ? true : false;

            return {borderLeft: 'solid 1px black',backgroundx:vector_colores[Number(num_columna)-1],borderBottom:focoSiRec ? 'solid 2px red' : `solid 2px ${vector_colores[Number(num_columna)-1]}`,borderTop:focoSiRec ? 'solid 2px red' : ''}
        }else{
            return null
        }
    }
}