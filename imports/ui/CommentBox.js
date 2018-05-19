import React from 'react'

const CommentBox = (props) => {

    return (
        <div>
            {props.comment}
            <button onClick = {() =>{
                    props.deleteComment(props.index)
                }
            }>X</button>
        </div>
    )
}

export default CommentBox