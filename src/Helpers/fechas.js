import moment from 'moment';

export function fechaActual(formato){
    const fecha = new moment();
    if(formato){
        return fecha.format(formato); 
    }else{
        return fecha
    }
}

export function compararFechas(fecha){
    const fechaActual = new moment();
    const fechaRegistro = new moment(fecha)

    const diferencia = fechaActual.diff(fechaRegistro,'seconds')
    
    return diferencia
}

export function sumarMinutos(horaI,minutoI,minutosMas){
    const startTime = `${horaI}:${minutoI}`;
    const durationInMinutes = minutosMas;

    const endTime = moment(startTime, 'HH:mm').add(durationInMinutes, 'minutes').format('HH:mm');
    return endTime
}

export function sumarSemanas(fechaInicio,semanasMas){
   
    const fechaInicioMomentJs = new moment(fechaInicio)

    //const endTime = moment('11/08/2020','DD/MM/YYYY').add(4, 'M').format('DD/MM/YYYY');
    const endTime = moment(fechaInicio,'DD/MM/YYYY').add(semanasMas, 'w');

    return {dia:endTime.date(),mes:endTime.month()+1,anio:endTime.year()}
}

export function transformarIso8601(fechaiso){
    let fecha = moment(fechaiso)
    return fecha.format('DD/MM/YYYY'); 
}

export function fechaEnFuncionhoy(fecha,tipo,formato){
    let fecha_aux = moment(fecha,formato)
    let hoy = moment()

    if(tipo=='menor'){
        return fecha_aux.isBefore(hoy); 
    }else{
        return fecha_aux.isAfter(hoy); 
    }
}

