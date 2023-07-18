import React from 'react'

export default function Loading({blanco}){
    return (
        <div className="Loading mt-2">
            <div className={blanco ? "Loading__dot-1 bg-white" : "Loading__dot-1 bg-517ea4"}></div>
            <div className={blanco ? "Loading__dot-2 bg-white" : "Loading__dot-2 bg-517ea4"}></div>
            <div className={blanco ? "Loading__dot-3 bg-white" : "Loading__dot-3 bg-517ea4"}></div>
        </div>
    )
}