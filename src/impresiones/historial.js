import React from 'react';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import Axios from 'axios';
import {_imagenLogo} from '../imagenesBase64/logo'
import {_membrete} from '../imagenesBase64/membrete'
import Swal from 'sweetalert2';

export function imprimir(profesor,historial,descargar){
    try{
        generarDocumento(profesor,historial,descargar)
    }catch(err){

            const mensaje_html = `<p>Hubo un error al generar el documento</p><p>${err}</p>`

            Swal.fire({
                html:mensaje_html,
                icon: 'warning',
                confirmButtonColor: '#3085d6',
            })
        }
}

function generarDocumento(profesor,historial,descargar) {

    const fecha = fechaDelDia();

    // recibo un vector cualquiera y elijo los campos

   // const historial_ordenado =  historial.sort((a,b)=>a.anio-b.anio)

    // ordeno por nro curso descendiente 
    const historial_ordenado = historial.sort((a,b)=> a.nro_curso > b.nro_curso ? -1 : a.nro_curso < b.nro_curso ? 1 : 0)

    let historial_corte_control_por_anio = [];

    historial_ordenado.forEach((item,index,vector)=>{
            if (index>0){
                if(item.anio!=vector[index-1].anio){
                    historial_corte_control_por_anio.push({corte: true, Cuatrimestre:{ text: `Año ${item.anio}`, style: 'tableHeader' }, Materia:{ text: `Cursos dictados: ${historial.filter(a=>a.anio==item.anio).length}`, style: 'tableHeader', colSpan:4, italics: true, fontSize: 9 },nro_curso:{},CantidadInscriptos:{},PromedioEstimativo:{}})
                }
                historial_corte_control_por_anio.push(item)
            }else{
                historial_corte_control_por_anio.push({corte: true, Cuatrimestre:{ text: `Año ${item.anio}`, style: 'tableHeader' }, Materia:{ text: `Curso dictados: ${historial.filter(a=>a.anio==item.anio).length}`, style: 'tableHeader', colSpan:4, italics: true, fontSize: 9 },nro_curso:{},CantidadInscriptos:{},PromedioEstimativo:{}})
                historial_corte_control_por_anio.push(item)
            }
    }) 

    // atención con la lógica del colspan

    // si tengo 5 columnas en total y deseo que la primer columna ocupe 1 y la segunda columna ocupe 4
    // el vector tiene que tener 5 objetos siempre, igual al número de columnas
    // [{algo},{algo, colspan=4},{},{},{}] los últimos 3 objetos están vacíos porque son ocupados por la segunda columna, pero igual deben estar en el vector

    var cursadas_mapeadas = historial_corte_control_por_anio.map(item => { 
    
        return item.corte ? {periodo:item.Cuatrimestre, materia:item.Materia,curso:{},alumnos:{},promedio:{}} : {periodo: item.Cuatrimestre, materia: item.cod_materia + ' - ' + item.Materia, curso:item.nro_curso, alumnos:item.CantidadInscriptos, promedio: item.PromedioEstimativo.toFixed(2)}
    
    }) // uso .map para transformar un array de objetos a un nuevo array de objetos pero elijiendo los campos.
                                                                                    // El array cursadas que viene como propiedad del abm de alumnos trae las cursadas con muchos campos pero solo queremos 4 campos para armar la grilla
      
    //transformo el vector de objetos en un vector de arrays                                                                                    
    // uso .map para transformar un array de objetos en un nuevo array pero ahora no de objetos sino de arrays porque apliquè la funciòn Object.values. Hago esto porque para armar el pdf necesito un array de arrays y no array de objetos
    
    var cursadas_mapeadas_vector = cursadas_mapeadas.map(item=>{return Object.values(item)}) 
    
    cursadas_mapeadas_vector.unshift([{ text: 'Período', style: 'tableHeader' }, { text: 'Materia', style: 'tableHeader' }, { text: '#ID', style: 'tableHeader' }, { text: 'Alumnos', style: 'tableHeader' }, { text: 'Prom.', style: 'tableHeader' }])
    
    
    
    //cursadas_mapeadas_vector.unshift([{ text: 'Anio', style: 'tableHeader', colSpan:5 }, {}, {}, {},{}])

    var docDefinition = {

        content: [

            {
                columns: [
                    {
                        image: _imagenLogo,
                        width: 200,
                    },
                    {
                        text: `Historial de cursos`, margin: [20, 25], style: 'anotherStyle'
                    },
                ]
            },

            { text: `${profesor.apellido}, ${profesor.nombre}`, style: 'header' },
            /*{
                text: `${alumno.sexo == 'M' ? 'Hombre' : 'Mujer'} , ${edad}`, style: 'subtitulo'
            },*/
            /*{
                columns: [

                    {
                        type: 'none',
                        ol: [
                            {
                                margin: [0, 5],

                                columns: [
                                    { text: `titulo 1:`, decoration: 'underline', width: 60, bold: true }, { text: `(algo)algo`, style: '' },
                                ]
                            },
                            {
                                margin: [0, 5],

                                columns: [
                                    { text: `titulo 2:`, decoration: 'underline', width: 60, bold: true }, { text: `algo`, style: '' },
                                ]
                            },]
                    },

                    {
                        type: 'none',
                        ol: [
                            {
                                margin: [0, 5],
                                columns: [
                                    { text: `titulo 3:`, decoration: 'underline', width: 60, bold: true }, { text: `algo`, style: '' },
                                ]
                            },
                        ]
                    },

                ]


            },*/

            {
                style: 'tableExample',
                bold:false,
                fontSize:9,
                margin:[0,30],
                widths: [200, 'auto', 'auto',50,'auto'],
                table: {
                    headerRows: 1,
                    body:
                    cursadas_mapeadas_vector
                },
                layout: {
                    hLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? 2 : 1;
                    },
                    vLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.widths.length) ? 2 : 1;
                    },
                    hLineColor: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
                    },
                    vLineColor: function (i, node) {
                        return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
                    },
                    // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                    // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                    // paddingLeft: function(i, node) { return 4; },
                    // paddingRight: function(i, node) { return 4; },
                    // paddingTop: function(i, node) { return 2; },
                    // paddingBottom: function(i, node) { return 2; },
                    // fillColor: function (rowIndex, node, columnIndex) { return null; }
                }
            }

        ],
        styles: {
            header: {
                fontSize: 22,
                bold: true,
                alignment: 'center'
            },
            center: {
                alignment: 'center',
                decoration: 'underline'

            },
            anotherStyle: {
                italic: true,
                alignment: 'left'
            },
            body: {
                lineHeight: 1.5
            },
            tableHeader: {
                bold:true,
                fontSize:12
            }
        },
        images: {
            building: 'data:/Content/img/logo1.jpg'
        }
    };
   // pdfMake.createPdf(docDefinition).open();

   Swal.fire({
    html: 'Buscando...',
    timer: 600,
    onBeforeOpen: () => {
        Swal.showLoading()
    },
    }).then(data=>{
        var nombre = `HISTORIAL ${profesor.nombre} ${profesor.apellido}`
      //  pdfMake.createPdf(docDefinition).download(nombre);

        if (descargar){
            pdfMake.createPdf(docDefinition).download(nombre);
        }else{
            pdfMake.createPdf(docDefinition).open();
        }

    })

}

function fechaDelDia(){
    let fecha;

    const fecha_aux  = new Date()
    const dia = fecha_aux.getDate() < 10 ? `0${fecha_aux.getDate()}` : fecha_aux.getDate();
    let mes = fecha_aux.getMonth() + 1 ;
    mes = mes < 10 ? `0${mes}` : mes;
    fecha = `${dia}/${mes}/${fecha_aux.getUTCFullYear()}`

    return fecha;
}