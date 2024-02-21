import React from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

 export default  function LinksReferencias(){
    const cursos = [{"id":6691,"materia":"EMO","profesor":"Teodoro Cromberg","fecha":"13/06/20            14:00"},{"id":6690,"materia":"ART1","profesor":"Tomás Babjackzuk","fecha":"12/06/20            20:17"},{"id":6689,"materia":"ENJ (D)","profesor":"Juan Cruz Urquiza","fecha":"12/06/20            20:10"},{"id":6688,"materia":"AHT","profesor":"Julio Aguirre","fecha":"12/06/20            20:03"},{"id":6687,"materia":"ART3","profesor":"Sebastián Bazán","fecha":"12/06/20            20:02"},{"id":6686,"materia":"ART3","profesor":"Sebastián Bazán","fecha":"12/06/20            19:53"},{"id":6685,"materia":"EAP4","profesor":"Sebastián Bazán","fecha":"12/06/20            19:48"},{"id":6683,"materia":"ARR2","profesor":"Daniel Johansen","fecha":"28/03/20            20:11"},{"id":6682,"materia":"CPC","profesor":"Nora Olga Malatesta","fecha":"28/03/20            20:06"},{"id":6681,"materia":"ENJ","profesor":"Ricardo Nole","fecha":"27/03/20            14:33"}]


    return(<div className=""> Ultimos cursos creados
        {
            cursos.map(item=>{
                return (
                <Link disabled key={`ult-cur${item.id}`} className="" 
                                to={{
                                    pathname: `/pepe/${item.id}`,
                                    state: {nro_curso:item.id}
                                }}> 
                <span className="" title={`${item.materia}\n${item.profesor}\nCreado el ${item.fecha}`}>{item.id}</span>
                            </Link> 
            )
                })
        }
    </div>
    )

  /*  return(<div className=""> Ultimos cursos creados
    {
        cursos.map(item=>{
            return (
 
            <span key={uuidv4()} className="ultimos-cursos" title={`${item.materia}\n${item.profesor}\nCreado el ${item.fecha}`}>{item.id}</span>
        )
            })
    }
</div>
)*/
}
