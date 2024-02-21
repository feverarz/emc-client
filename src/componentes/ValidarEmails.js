import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose, faUser, faPlusSquare, faEdit } from '@fortawesome/free-regular-svg-icons';
import {faAngleRight,faAngleLeft} from '@fortawesome/free-solid-svg-icons';
import Loading from '../componentes/Loading';
import {hacerScroll,hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';
import { text } from '@fortawesome/fontawesome-svg-core';
import AbmAlumno from '../abms/abm-alumno';
import Modal from '../componentes/Modal';
import useModal from '../hooks/useModal';

export default function ValidarEmails({alumnos}){

    const anchoPaginacion = 50;

    const [alumnosValidados,setAlumnosValidados]=useState([]);
    const [validandoEmails,setValidandoEmails]=useState(true)
    const [huboError,setHuboError]=useState(false)
    const {toggle, isShowing } = useModal();
    const [id_seleccionado,setid_seleccionado]=useState(null)

useEffect(()=>{
    const listado = ValidarDatos(alumnos,setValidandoEmails)
    setAlumnosValidados(listado)
},[])

useEffect(()=>{ // procesa los cierres de modales por boton cerrar y no por otro motivo
    if (!isShowing){
        setid_seleccionado(null)
    }
},[isShowing])

    const seleccionarAlumno = (id)=>{
        setid_seleccionado(id)
        toggle()
    }



    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (validandoEmails){
        return <Main center><div><Loading/><span className="cargando">Validando emails...</span></div></Main>
    };

    return(
        <div className="validar-emails"> 
        { isShowing && id_seleccionado && <Modal hide={toggle} titulo={null} isShowing={isShowing} estilo={{width:'1200px'}} estiloWrapper={{background:'#1d2c38'}}>
            <AbmAlumno id_alumno={id_seleccionado} 
                        grabarSoloDatos
                        finalizarAltaOcopia={()=>{setid_seleccionado(null);toggle()}}
                       esModal={true}
            />    
        </Modal>} 
            <Tabla seleccionarAlumno={seleccionarAlumno} alumnosValidados={alumnosValidados} titulo="Alumnos activos con e-mail inválido" callback={item=>((item.email1.trim()!='' && item.cursos > 0) && (item.valemail1==false))} />
            <Tabla seleccionarAlumno={seleccionarAlumno} alumnosValidados={alumnosValidados} titulo="Alumnos activos sin e-mail" callback={item=>item.email1.trim()=='' && item.cursos > 0} />
            <Tabla seleccionarAlumno={seleccionarAlumno} alumnosValidados={alumnosValidados} titulo="Alumnos inactivos con e-mail inválido" callback={item=>((item.email1.trim()!='' && item.cursos == 0) && (item.valemail1==false))} />
            <Tabla seleccionarAlumno={seleccionarAlumno} alumnosValidados={alumnosValidados} titulo="Alumnos inactivos sin e-mail" callback={item=>item.email1.trim()=='' && item.cursos == 0} />
        </div>
    )
}


function ValidarDatos (alumnos, setValidandoEmails){
    const listadoValidado = alumnos.map(item=>{ 
    return {id_alumno: item.id_alumno, 
        alumno:item.alumno, 
        email1: item.email1, 
        valemail1: validarEmail(item.email1), 
        email2:item.email2, 
        valemail2: validarEmail(item.email2),
        cursos:item.cursos}
    })

    setValidandoEmails(false)

    return listadoValidado
}

function validarEmail(email){
    // const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
    //http://www.regular-expressions.info/email.html
     const re = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
    // const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
     
     return re.test(String(email).toLowerCase().trim());
}

function Tabla ({alumnosValidados,titulo,callback,seleccionarAlumno}){

    const cantidad = alumnosValidados.filter(callback).length

    return <div className="mt-6">
        <p className="text-center text-large mb-2">{titulo}({cantidad})</p>
        <table>
            <thead>
                <tr className="fw-700">
                    <th className="">ID</th>
                    <th className="text-left">Alumno</th>
                    <th className="text-left ml-2">E-mail / E-mail alternativo</th>
                </tr>
            </thead>
            <tbody>
            {alumnosValidados
            .filter(callback)
            .map(item=>{
                 return <tr title="Abrir la ficha del alumno" className="cursor-pointer" onClick={()=>seleccionarAlumno(item.id_alumno)}>
                     <td>{item.id_alumno}</td>
                     <td>{item.alumno} </td>
                     <td className="ml-2">
                         <div className="flex f-col ml-2">
                            <span title="e-mail" className={item.valemail1==false ? 'color-red' : ''}>{item.email1}</span> 
                            <span title="e-mail alternativo" className={item.valemail2==false ? 'color-red' : ''}>{item.email2}</span>
                         </div>
                     </td>
                     </tr>
            })}
            </tbody>
        </table>
</div>
}