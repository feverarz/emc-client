import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCameraRetro, faUserAlt } from '@fortawesome/free-solid-svg-icons';
import { faWindowClose, faUser, faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import Main from './Main'
export default function FichaCurso(){

    function hacerScroll1(){
        let element = document.getElementById(`6sasa`);
        element.scrollIntoView(false);
    }
    function hacerScroll2(){
        let element = document.getElementById(`1pipo`);
        element.scrollIntoView(false);
    }
    const usuarios = [  {_id:1,username:"pipo"},
                        {_id:2,username:"toto"},
                        {_id:3,username:"sasa"},
                        {_id:4,username:"sasa"},
                        {_id:5,username:"sasa"},
                        {_id:6,username:"sasa"},
                        {_id:7,username:"sasa"},
                        {_id:8,username:"sasa"}
                    ]
    return(
        <Main>
    <div className="Explore__section">
        <button onClick={hacerScroll2}>prueba</button>
        <button onClick={hacerScroll1}>prueba</button>
    <h2 className="Explore__title">Descubrir usuarios</h2>
    <div className="Explore__usuarios-container">
      {usuarios.map(usuario => {
        return (
          <div id={usuario._id+usuario.username} className="Explore__usuario" key={usuario._id}>
            <FontAwesomeIcon icon={faCameraRetro} />
            <p>{usuario._id+usuario.username}</p>
          </div>
        );
      })}
    </div>
  </div>
  </Main>

    )
}