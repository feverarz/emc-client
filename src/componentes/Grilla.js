import React, {useState, useEffect} from 'react';
import {seleccionarTextoInput} from '../Helpers/utilidades-globales';

export default function Grilla(){
const [columns,setColumns] = useState([
    { key: 'id', name: 'ID' },
    { key: 'title', name: 'Title' },
    { key: 'count', name: 'Count' } ])

const [rows,setRows] = useState([{id: 0, title: 'row1', count: 20}, 
{id: 1, title: 'row1', count: 40}, 
{id: 2, title: 'row1', count: 60}])

  
    return (
       <table id="cali">
           <body>
                <tr>
                    <td>
                        <Inputs id={'uno'}/>
                    </td>
                    <td>
                        <Inputs id={'dos'}/>
                    </td>                    
                </tr>   
                <tr>
                    <td>
                        <Inputs id={'tres'}/>
                    </td>
                    <td>
                        <Inputs id={'cuatro'}/>
                    </td>                       
                </tr>                             
           </body>
       </table>
        )
}
 

function Inputs({id}){
    return <input value="prueba" id={id} type="text" onKeyDown={(e)=>console.log(e.keyCode)} onSelect={(e)=>seleccionarTextoInput(e.target.id)}/>
}