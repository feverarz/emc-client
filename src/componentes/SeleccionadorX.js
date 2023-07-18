import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/free-regular-svg-icons';
import { v4 as uuidv4 } from 'uuid';

export default function SeleccionadorX({vector,onchange,valor,nombre,noDefault,name,classancho,limpiar,claves,id}){
    let clasesSelect = "block appearance-none w-100 select-titulo rounded shadow leading-tight";
    let clasesActivo = "block appearance-none w-full select-titulo rounded shadow leading-tight";

    if (classancho){
        clasesSelect=`block appearance-none ${classancho} select-titulo rounded shadow leading-tight`
    }

    //recordar que un objeto puedo leerlo de 2 formas como vector o como objeto
    // es lo mismo usuario['nombre'] que usuario.nombre
    // aprovecho esta característica para hacer un seleccionador genérico y le paso
    // el nombre de la clave y el texto como un string para referenciarlo en notación vector
    return (            
        <div className="input-field col s12 flex f-row">
            <select value={valor} name={name? name : ''} onChange = {onchange} className={valor=="-1" ? clasesSelect : clasesActivo} id={id? id : null}>
                { noDefault ? null : <option value="-1" key="-1">{nombre}</option>}
                {/*vector.map(item=><option value={item[claves.id]} key={item[claves.id]}>{item[claves.nombre]}</option> )*/}
                {claves && vector.map(item=><option value={item[claves.id]} key={uuidv4()}>{item[claves.nombre]}</option> )}
                {!claves && vector.map(item=><option value={item} key={item}>{item}</option> )}
            </select>
            { valor!="-1" && limpiar && 
                        <button>
                            <FontAwesomeIcon className="ic-abm"
                                            icon={faWindowClose} 
                                            onClick={limpiar}/>
                        </button>}  
        </div>
        )
        
}   
