import React from 'react';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import Axios from 'axios';
import {_imagenLogo} from '../imagenesBase64/logo'
import {_membrete} from '../imagenesBase64/membrete'
import Swal from 'sweetalert2';

export function imprimir(cursadas,descargar){
    try{
        generarComprobante(cursadas,descargar)
    }catch(err){

            const mensaje_html = `<p>Hubo un error al generar el comprobante</p><p>${err}</p>`

            Swal.fire({
                html:mensaje_html,
                icon: 'warning',
                confirmButtonColor: '#3085d6',
            })
        }
}

function generarComprobante(cursadas,descargar) {

    const fecha = fechaDelDia();

    var cursadas_mapeadas = cursadas.map(item => { return { descripcion: item.descripcion, profesor: item.profesor, diahora: item.DiaHora, aula: item.Aula, modalidad: item.virtual ? 'Virtual' : 'Presencial'}}) // uso .map para transformar un array de objetos a un nuevo array de objetos pero elijiendo los campos.
                                                                                    // El array cursadas que viene como propiedad del abm de alumnos trae las cursadas con muchos campos pero solo queremos 4 campos para armar la grilla

    var cursadas_mapeadas_vector = cursadas_mapeadas.map(item=>{return Object.values(item)}) // uso .map para transformar un array de objetos en un nuevo array pero ahora no de objetos sino de arrays porque apliquè la funciòn Object.values. Hago esto porque para armar el pdf necesito un array de arrays y no array de objetos
    
    cursadas_mapeadas_vector.unshift([{ text: 'Materia', style: 'tableHeader' }, { text: 'Profesor', style: 'tableHeader' }, { text: 'Día y hora', style: 'tableHeader' }, { text: 'Aula', style: 'tableHeader' }, { text: 'Modalidad', style: 'tableHeader' }])

    var docDefinition = {

        background: function() {
            return {image: _membrete, width:600}
        },
        content: [

           /* {
                columns: [
                    {
                        image: _imagenLogo,
                        width: 200,
                    },
                ]
            },*/

            {
                text: fecha, margin: [2, 20], style: 'center'
            },

            {
                text: `Mis cursadas en el cuatrimestre abierto`, margin: [2, 20], style: 'center'
            },

            {
                style: 'tableExample',
                bold:false,
                fontSize:9,
                margin:[0,10],
                widths: [200, 'auto', 'auto',50,'auto'],
                table: {
                    headerRows: 1,
                    body:
                        cursadas_mapeadas_vector

                },
            }

        ],
        styles: {
            header: {
                alignment: 'right'
            },
            center: {
                alignment: 'center',
                decoration: 'underline',
                bold:true
            },
            anotherStyle: {
                fontSize: 15,
                bold: true,
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

        var nombre = `cursadas actuales ${fecha}`
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