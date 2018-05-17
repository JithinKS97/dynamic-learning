import React from 'react'

const SimContainer = (props) => {


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