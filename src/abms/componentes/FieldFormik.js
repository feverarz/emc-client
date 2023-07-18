import React from 'react';
import {seleccionarTextoInput} from '../../Helpers/utilidades-globales';

import {Formik, Form, Field, ErrorMessage} from 'formik';

export const FieldFormik = ({id,maxLength,name,values,titulo,type})=>{


    return <div className="flex f-col">
    <div className="flex f-row">
        <label className="Form__labels__abmcursos_corto" htmlFor="abm-abreviatura">{titulo}</label>
        <Field 
            id={id}
            type={type} 
            autoComplete="off" 
            maxLength={maxLength}
            name={name} 
            onFocus={()=>seleccionarTextoInput(id)} 
            onClick={()=>seleccionarTextoInput(id)}                         
            className={values[name]? '' : 'input-vacio'}
        />   
    </div>  
    <div className="error_formulario"><ErrorMessage name={name}/></div> 
    </div>   
}


 