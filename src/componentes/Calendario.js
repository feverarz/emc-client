import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { Calendar } from "react-multi-date-picker"
import DatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel"
import { setNestedObjectValues } from 'formik';

// documentacion : 
// https://shahabyazdi.github.io/react-multi-date-picker/props/

const diasSemana = [
    "DO", 
    "LU", 
    "MA", 
    "MI", 
    "JU", 
    "VI", 
    "SA"
  ]
  const mesesAño = [
    "Ene", 
    "Feb", 
    "Mar", 
    "Abr", 
    "May", 
    "Jun", 
    "Jul", 
    "Ago", 
    "Sep", 
    "Oct", 
    "Nov", 
    "Dic"
  ]
export default function Calendario ({multiple,panel,tituloPanel,value,array,setValue}){
    return (
        <div>
        <Calendar
        className="custom-calendario"
        multiple
        weekDays={diasSemana}
          value={['19/07/2021','05/07/2021']}
          months={mesesAño}  
        plugins={panel ? [
            <DatePanel header={tituloPanel}/>
        ]:null}
        format = "DD/MM/YYYY"
        onChange={ multiple ? array => { //Array of Dateobjecs
            //alert("selected dates :\n" + array.join(",\n"))
             console.log('array',array)
             setValue(array)
          } : value =>{setValue(value)}}
        value = {multiple? array : value}
        />
        </div>
    )
}