import React from 'react'

const SimContainer = (props) => {

    /* Holds the simulation */

    return(

        <div>

            {
                props.src?
                <iframe src={props.src}></iframe>:
                null
            }
        
        </div>
    )

}

export default SimContainer