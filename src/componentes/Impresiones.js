import React from 'react';
import {imprimir} from '../impresiones/registro';

export default function Impresiones(){
    return (
       <div>
           <h1>IMPRIMIR</h1>
           <button onClick={()=>imprimir(false)}>imprimir</button>
       </div>
    )
}