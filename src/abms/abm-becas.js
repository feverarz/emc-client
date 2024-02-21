import React from 'react';
import {useState, useEffect} from 'react';
import Main from '../componentes/Main';
import Axios from 'axios';
import Loading from '../componentes/Loading';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose,faPlusSquare, faCheckSquare,faDotCircle } from '@fortawesome/free-regular-svg-icons';
import {seleccionarTextoInput} from '../Helpers/utilidades-globales';
import {useAbm} from './hooks/useAbm';
import {FieldFormik} from './componentes/FieldFormik';
import {SelectFormik} from './componentes/SelectFormik';
import {useApis} from './hooks/useApis';

export default function AbmBecas({id_alumno,finalizar}){

  
    const {becas,cuatrimestres,cargandoDatos,buscarBecas, buscarCuatrimestres,grabarBeca} = useApis();
    const {huboError,grabandoDatos,onsubmit} = useAbm();

    // el abm tiene un objeto de inicialización
       const [objetoInicializacion,setObjetoInicializacion]=useState({
        nombre:'',
        apellido:'',
        prueba:'uno',
        check:true,
        id_alumno : id_alumno,
        id_cuatrimestre  : -1,
        id_tipo_beca:-1
    })

    React.useEffect(()=>{
        buscarBecas()
        buscarCuatrimestres()
    },[])

    // el abm tiene un validation squema
const validationSchema = Yup.object({
id_cuatrimestre:Yup.number().min(1,'Falta seleccionar el cuatrimestre de la beca').integer().required('Falta seleccionar el cuatrimestre de la beca'),
id_tipo_beca:Yup.number().min(1,'Falta seleccionar la beca').integer().required('Falta seleccionar la beca'),
})                 


    if (huboError){
        return <Main center>
                <span>Se produjo un error al cargar los datos para esta vista</span>
            </Main>
    }

    if (cargandoDatos){
        return <Main center>
                <div><Loading/><span className="cargando">Cargando datos ...</span></div>
            </Main>
    };

    return (
        <Main> 
        { grabandoDatos && <Main>
            <div><Loading/><span className="cargando">Grabando datos...</span></div>
        </Main>}


    <Formik validateOnMount 
            enableReinitialize 
            initialValues={objetoInicializacion}
            validationSchema={validationSchema} 
            onSubmit={(values)=>onsubmit(values,grabarBeca,finalizar)}>

                {({ values, 
                    errors, 
                    touched, 
                    handleChange,
                    setFieldValue, 
                    resetForm, 
                    initialValues,
                    dirty }) => 
                    { return <Form id="ref-ficha">
                                    <div className="FormAbmContainer-x1">
                                                <FieldFormik
                                                   id='beca-nombre'
                                                   maxLength='20'
                                                   type='text'
                                                   name='nombre' titulo='Nombre'
                                                   values={values}
                                                />
                                                <SelectFormik
                                                    id='id_tipo_beca'
                                                    vector={becas}
                                                    name='id_tipo_beca'
                                                    values={values}
                                                    valorDefault={-1}
                                                    titulo='Beca'
                                                    handleChange={handleChange}
                                                />
                                                <SelectFormik
                                                    id='id_cuatrimestre'
                                                    vector={cuatrimestres}
                                                    name='id_cuatrimestre'
                                                    values={values}
                                                    valorDefault={-1}
                                                    titulo='Cuatrimestre'
                                                    handleChange={handleChange}
                                                />
                                                 <FieldFormik
                                                    id='beca-check'
                                                    type='checkbox'
                                                    name='check' titulo='Check'
                                                    values={values}
                                                />
                                                <FieldFormik
                                                    id='beca-apellido'
                                                    maxLength='20'
                                                    type='text'
                                                    name='apellido' titulo='Apellido'
                                                    values={values}
                                                />
                                        { dirty && <button className="Form__submit" type="submit">Grabar</button>}
                                    </div>
                        </Form> } }

    </Formik>


    </Main>
    )
}
















