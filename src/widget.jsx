const { useState, useEffect } = React

function Widget({ w, h, color, content }) {

    return (
        <div style={{ width: w, height: h, backgroundColor: color }}>
            {content}
        </div>
    )
 
}