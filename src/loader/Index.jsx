import ReactLoading from 'react-loading';
import { ThreeDots } from 'react-loader-spinner';

export const OldSpinnerLoader = () => {
    return (
        <div className='loding-container'>
            <div className="loading">
                <div style={{ height: '100%', width: '100%' }}></div>
                <ReactLoading type={'bubbles'} color={'#5cb226'} height={'100%'} width={'100%'} className='loader-customize' />
                <span style={{ left: "44%", top: "54%", position: 'fixed', color: '#ffff', fontSize: 25 }}>Please wait...</span>
            </div>
        </div>
    );
}

export const DataLoading = () => {
    return (
        <div className='loding-container'>
            <div className='loading' style={{ justifyContent: 'center' }}>
                <ThreeDots
                    visible={true}
                    height="100"
                    width="100"
                    color="#5CB226"
                    radius="9"
                    ariaLabel="three-dots-loading"
                    wrapperStyle={{justifyContent: "center"}}
                    wrapperClass=""
                />
                {/* <span style={{left:"44%", top:"50%",position:'fixed',color:'#ffff',fontSize:25}}>Please wait...</span> */}
                {/* <span 
            style={{ 
                // left: "49%", top: "53%", 
                position: 'fixed' }}
            >Please wait...</span> */}
            </div>
        </div>
    )
}