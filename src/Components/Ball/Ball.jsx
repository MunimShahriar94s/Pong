import style from "./Ball.module.css" 

function Ball(props){
    return (
        <div ref={props.cref} style={{
            left: props.left,
            top: props.top
        }} 
        className={style.ball}></div>
    )
}

export default Ball;