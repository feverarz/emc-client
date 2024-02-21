export const convertirCarrera = (carrera)=>{
    
    if (carrera === null || typeof carrera === 'undefined') { 
        return 'NN';
    }

    if(carrera.toString() === '1') return 'MUS-P'
    
    if(carrera.toString() === '2') return 'PROD-M'
    
    if(carrera.includes(',')){
        const carrerasarray = carrera.split(',').map(item=>{
                    if(item.toString() === '1')  return 'MUS-P'
                    if (item.toString() === '2') return 'PROD-M'
                    else return 'NN'
                }).reduce((ac,item)=>{
                    return `${ac} ${item}`
                },'')
                return carrerasarray
    } 
        
    return 'NN'
}


export const parsearArchivoInfo = (cadenaArchivo) => {
    const partes = cadenaArchivo.split('-');

    const nombreCompleto = partes[0].replace(/_/g, ' ');
    const apellido = partes[1].replace(/_/g, ' ');
    const documento = partes[2];
    const timestamp = partes[3];

    const fecha = new Date(parseInt(timestamp));
    const fechaFormateada = fecha.toLocaleDateString('es-AR');

    return {
        nombre: nombreCompleto + ' ' + apellido,
        documento: documento,
        fecha: fechaFormateada,
        identificador: cadenaArchivo
    };
};