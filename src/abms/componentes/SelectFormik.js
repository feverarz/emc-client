

import React from 'react';
import {seleccionarTextoInput} from '../../Helpers/utilidades-globales';

import {Formik, Form, Field, ErrorMessage} from 'formik';

export const SelectFormik = ({id,vector,name,values,titulo,handleChange,valorDefault})=>{

    return <div className="flex f-col">
    <div className="flex f-row" id={id}>
            <label className="Form__labels__abmcursos_corto" htmlFor="abm-capacidad">{titulo}</label>
            <select onChange={handleChange} 
                    value={values[name]}
                    name={name} 
                    className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                    {valorDefault && <option disabled={true} value={valorDefault}>Seleccione un valor</option>}    
                    {vector.map(item=><option value={item.id ? item.id : item} 
                                        key={item.id ? item.id : item}>
                                            {item.nombre ? item.nombre : item}
                                    </option> )}
            </select>                       
           
        </div>
            <div className="error_formulario"><ErrorMessage name={name}/></div> 
    </div>
}



  