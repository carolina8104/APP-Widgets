const { useState, useEffect } = React

function Widget({ w, h, color, content }) {

    return (
        <div className="widget" style={{ width: w, height: h, backgroundColor: color }}>
            {content}
        </div>
    )
 
}