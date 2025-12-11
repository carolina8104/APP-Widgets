function Widget(props) { 
    
    const {color, content } = props 

    return (
        <div className="widget" style={{ backgroundColor: color }}>
            {content}
        </div>
    )
}

