import style from "./Line.module.css"
import Dot from "./Dot/Dot"

function Line(){

    function createDots(props){
        return <Dot />
    }

    return(
        <div className={style.line}>
            {Array(24).fill().map(createDots)}
            
        </div>
    )
}

export default Line