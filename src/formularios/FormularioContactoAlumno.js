import React from 'react';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as Yup from 'yup';

export default function FormularioContactoAlumno({handleSubmit,telefono, celular, telef_alternativo,telef_laboral,email,email_secundario}){

    const initialValuesc = { telefono: telefono ? telefono : '', 
                             celular: celular ? celular : '', 
                             telef_alternativo : telef_alternativo ? telef_alternativo : '',
                             telef_laboral: telef_laboral ? telef_laboral : '',
                             email: email ? email : '',
                             email_secundario: email_secundario ? email_secundario : ''}

    const validationSchema = Yup.object({
        telefono:Yup.string().required('Required'),
        celular: Yup.string().required('Required')
    })

    const onSubmit = values =>{
        console.log("submit")
    }

    // formik contiene el estado del formulario en formik.values
    // el helper formik.handleChange actualiza el estado del formulario en la propiedad que corresopnda
    return(

        <div className="Signup">
        <div className="actualizarFichaAlumno flex f-col">
             <Formik enableReinitialize 
                initialValues={initialValuesc} 
                validationSchema={validationSchema} 
                onSubmit={onSubmit}>
            { ({ errors, touched }) =>{ return (<Form>
                    <label htmlFor="telefono">Teléfono</label>
                    <Field  
                        type="text" 
                        id="telefono"
                        name='telefono' 
                        placeholder="Teléfono x"/>
                    <ErrorMessage name="telefono"/>
                    <label htmlFor="telef_alternativo">Tel. 2</label>
                    <Field 
                        id="telef_alternativo"
                        type="text" 
                        name="telef_alternativo" 
                        placeholder="Teléfono 2"/>
                    <ErrorMessage name="telef_alternativo"/>

                    <Field 
                        type="text" 
                        name="telef_laboral" 
                        placeholder="Tel. laboral"/>
                    <ErrorMessage name="telef_laboral"/>

                    <Field 
                        type="text" 
                        name="celular" 
                        placeholder="Celular"/>
                    <ErrorMessage name="celular"/>

                    <Field 
                        type="text" 
                        name="email" 
                        placeholder="email"/>
                    <ErrorMessage name="email"/>

                    <Field 
                        type="text" 
                        name="email_secundario" 
                        placeholder="email 2"/>
                     <ErrorMessage name="email_secundario"/>
                   
                    <button className="Form__submit" type="submit">Actualizar</button>

            </Form>) } }
       </Formik>
        </div>
    </div>

    )
}

function FormularioContactoAlumnoORIGINAL({handleSubmit,telefono, celular, telef_alternativo,telef_laboral,email,email_secundario}){
    return(

        <div className="Signup">
        <div className="actualizarFichaAlumno flex flex-wrap">
            <form onSubmit={handleSubmit }>
                <input value={telefono}
                    type="text" 
                    name="telefono" 
                    placeholder="Teléfono" />
                <input value={telef_alternativo}
                    type="text" 
                    name="telef_alternativo" 
                    placeholder="Teléfono 2" 
                    className="" required/>    
                <input value={telef_laboral}
                    type="text" 
                    name="telef_laboral" 
                    placeholder="Tel. laboral" 
                    className="" required/>   
                <input value={celular}
                    type="text" 
                    name="celular" 
                    placeholder="Celular" 
                    className="" required/>
                <input value={email}
                    type="text" 
                    name="email" 
                    placeholder="email" 
                    className="" required/>   
                <input value={email_secundario}
                    type="text" 
                    name="email_secundario" 
                    placeholder="email 2" 
                    className="" required/>                                                           
                <button className="Form__submit" type="submit">Actualizar</button>
            </form>
        </div>
    </div>

    )
}