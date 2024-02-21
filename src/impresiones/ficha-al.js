import React from 'react';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import Axios from 'axios';
import {_imagenLogo} from '../imagenesBase64/logo'
import {_membrete} from '../imagenesBase64/membrete'
import {_marcaagua} from '../imagenesBase64/membrete'

import Swal from 'sweetalert2';
import logo from '../membrete.jpeg'; // Tell webpack this JS file uses this image

export function imprimir(materiasAprobadas,instrumentosAlumno,alumno,descargar){
    try{
        imprimirFicha(materiasAprobadas,instrumentosAlumno,alumno,descargar)
    }catch(err){

        console.log(err.stack)
        const mensaje_html = `<p>Hubo un error al imprimir la ficha del alumno</p><p>${err}</p>`

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
          })
    }
}

function imprimirFicha(materiasAprobadas,instrumentosAlumno,alumno,descargar) {

    var materias = materiasAprobadas.map(item => [item.descripcion]); // transformo cada item en un array en consecuencia materias es un array de arrays
    var tabla_materias = [];

    if (materias.length > 0) {
        //var tabla_materias = [
        //    ['Materias aprobadas por test'],
        //    ...materias
        //];

        tabla_materias.unshift(...materias); // desestructuro el array para que inserte solo su contenido y no su contenedor, quiero los items solamente como elementos independientes y no un array que contiene esos elementos
    } else {
        tabla_materias.unshift(['Ninguna']);
    }

    tabla_materias.unshift(['Materias aprobadas por test']);


    if (materias.length == 0) {
        materias.push('Ninguna')
    }
    // transformo el array de instrumentos del alumno primero en un nuevo array de objetos con 3 propiedades.
    // Luego tranformo el array anterior en un nuevo array en el que en cada posición se crea un array cuyos elementos son los valores del objeto de cada item del array anterior.
    // Hago esto para que quede bien estructurado el contenido para mostrar en la tabla

    var hege = ["Cecilie", "Lone"];
    var cabecera = ["..", "Nivel Ens.", "Nivel Inst."];
    var children = hege.concat(cabecera);

    const newfecha = transformarFecha(alumno.fecha_nac);
    const edad = calcularEdad(alumno.fecha_nac);

    var instrumentos = instrumentosAlumno.map(item => ({ ins: item.instrumentos, ne: item.nivel_e, ni: item.nivel_i })).map(item => Object.values(item));

    instrumentos.unshift(cabecera)
    instrumentos.unshift(['Instrumentos y niveles', '', ''])

    var docDefinition = {
        background: function() {
            return {image: _membrete, width:600}
        },
        content: [

           /* {
                columns: [
                    {
                        image: _marcaagua,
                        width: 100,
                    },
                    {
                        text: `Ficha del alumno     ID ${alumno.id_alumno}`,margin:[100,0], style: 'anotherStyle'
                    },
                ]
            },*/
            { text: `Ficha del alumno     ID ${alumno.id_alumno}`, margin:[200,0,0,0], style:'nombre' },

            { text: `${alumno.apellido}, ${alumno.nombre}`, margin:[0,40,0,0], style: 'header' },
            {
                text: `${alumno.sexo == 'M' ? 'Hombre' : 'Mujer'} , ${edad}`, style: 'subtitulo'
            },

              {
                style: 'tableExample',
                table: {
                    headerRows: 1,
                    body: [
                        ['Datos Personales', ''],
                        ['DNI', `${alumno.documento == '' || alumno.documento == null ? '_____' : alumno.documento}`],
                        ['Fecha de nacimiento', `${newfecha == '' || newfecha == null ? '_____' : newfecha}`],
                        ['Nacionalidad', `${alumno.nacionalidad == '' || alumno.nacionalidad == null ? '_____' : alumno.nacionalidad}`],

                    ]
                },
                layout: 'lightHorizontalLines'
            },

            {
                style: 'tableExample',
                table: {
                    headerRows: 1,
                    body: [
                        ['Observaciones financieras'],
                        [`${alumno.obs_finanzas == '' || alumno.obs_finanzas == null ? 'Ninguna' : alumno.obs_finanzas}`],
                    ]
                },
                layout: 'lightHorizontalLines'
            },

            {
                style: 'tableExample',
                table: {
                    headerRows: 1,
                    body: [
                        ['Datos de contacto', ''],
                        ['Teléfono', `${alumno.telefono == '' || alumno.telefono == null ? '___________________' : alumno.telefono}`],
                        ['Celular', `${alumno.Celular == '' || alumno.Celular == null ? '___________________' : alumno.Celular}`],
                        ['Tel. alternativo', `${alumno.Telef_Alternativo == '' || alumno.Telef_Alternativo == null ? '___________________' : alumno.Telef_Alternativo}`],
                        ['Tel. laboral', `${alumno.Telef_Laboral == '' || alumno.Telef_Laboral == null ? '___________________' : alumno.Telef_Laboral}`],
                        ['E-mail', `${alumno.email == '' || alumno.email == null ? '___________________' : alumno.email}`],
                        ['E-mail secundario', `${alumno.Email_Secundario == '' || alumno.Email_Secundario == null ? '___________________' : alumno.Email_Secundario}`],

                    ]
                },
                layout: 'lightHorizontalLines'
            },
            {
                style: 'tableExample',
                table: {
                    headerRows: 1,
                    body: instrumentos
                },
                layout: 'lightHorizontalLines'
            },
            {
                style: 'tableExample',
                table: {
                    headerRows: 1,
                    body: tabla_materias
                },
                layout: 'lightHorizontalLines'
            },


            //{ text: 'Instrumentos y niveles', margin: [0, 25, 0, 25], style: 'subheader' },

            //{
            //    style: 'tableExample',
            //    table: {
            //        body: instrumentos
            //    }
            //},

            //{
            //    style: 'tableExample',
            //    table: {
            //        body: [
            //            ['Materias aprobadas por test', 'Instrumentos'],
            //            [
            //                {
            //                    stack: [
            //                        {
            //                            ul: materias
            //                        }
            //                    ]
            //                },
            //                [
            //                    {
            //                        table: {
            //                            body: instrumentos
            //                        },
            //                    }
            //                ],
            //            ]
            //        ]
            //    }
            //},

            //{ text: 'Materias aprobadas por test', margin: [0, 25, 0, 25], style: 'subheader' },

            //{
            //    ul: materias
            //},



        ], // content
        styles: {
            header: {
                fontSize: 22,
                bold: true,
                alignment: 'center'
            },
            subheader: {
                background: 'lightgray',
                bold: false
            },
            nombre: {
                italic: true,
                alignment: 'left'
            },
            subtitulo: {
                italic: true,
                alignment: 'center'
            },
            tableExample: {
                margin: [0, 15, 0, 15]
            },
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
        var nombre = `FICHA ${alumno.nombre} ${alumno.apellido} ID ${alumno.id_alumno}`

        if (descargar){
            pdfMake.createPdf(docDefinition).download(nombre);
        }else{
            pdfMake.createPdf(docDefinition).open();
        }
    })

   

}

function calcularEdad(fecha_nac){

    const anio = fecha_nac.slice(0,4);
    const mes = fecha_nac.slice(5,7);
    const dia = fecha_nac.slice(8,10);

    const today = new Date();
    const a = (Number(today.getFullYear()) * 100 + Number(today.getMonth()+1)) * 100 + Number(today.getDate());
    const b = (Number(anio) * 100 + Number(mes)) * 100 + Number(dia);
    return `${Math.trunc((a - b) / 10000)} años`;
}

function transformarFecha(fecha_nac){
    const anio = fecha_nac.slice(0,4);
    const mes = fecha_nac.slice(5,7);
    const dia = fecha_nac.slice(8,10);

    const nfecha_nac = `${dia}/${mes}/${anio}`  

    return nfecha_nac
}