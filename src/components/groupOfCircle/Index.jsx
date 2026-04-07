//#region Imports
import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import dragIcon from "../../assets/img/drag_gw.svg"
import rotateIcon from '../../assets/img/rotate_lightset_icon.png'
import resizeIcon from '../../assets/img/resize_lightset_icon2.png'
import editicon from '../../assets/img/edit_icon.png'
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import "./Index.css";
import { deletePages } from '../../IndexedDB';
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import db, { deleteLights } from "../../IndexedDB.js";
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
// import HeightIcon from '@mui/icons-material/Height';
import Icon from '@mdi/react';
import { mdiArrowLeftRight } from '@mdi/js';
import { mdiArrowUpDown } from '@mdi/js';
import { mdiArrowAll } from '@mdi/js';
import { mdiArrowLeftRightBold, mdiArrowTopLeftBottomRight } from '@mdi/js';
import { mdiHand } from '@mdi/js';
import LightPlacementComponent from '../lightPlacementView/Index.jsx'
//#endregion

//#region Circle component
const Circle = ({ isGridEnabled, handleActionClick, color, posObj }) => {

    //State and variables
    const [size, setSize] = useState({ width: '8px', height: '8px' })

    //UseEffect
    // Grid square is 10px, so:
    // Downlight (small): 3/4 of square = 7.5px (round to 8px)
    // Ceiling light (large): 1.1-1.2x of square = 11-12px
    useEffect(() => {
        if (posObj.lightSize == 'large') {
            setSize({ height: "11px", width: "11px" }) // Ceiling light: slightly bigger than square
        } else if (posObj.lightSize == 'medium') {
            setSize({ height: "12px", width: "12px" });
        } else {
            // Small (downlight): 3/4 of 10px grid square = 7.5px, round to 8px
            setSize({ height: "8px", width: "8px" });
        }
    }, [])

    //JSX
    return (
        <div className='circle-dot-block-area'>
            <div className='circle-dot-block-content'
                onClick={() => {
                    console.log("Action clicked");
                    (isGridEnabled == true) && handleActionClick(posObj)
                }}>
                <div className='circle-dot-block'
                    style={{
                        position: 'relative',
                        // left: x - 5,
                        // top: y - 5,
                        width: size.width,
                        height: size.height,
                        borderRadius: '50%',
                        backgroundColor: color,
                        // transform: 'translate(-50%, -50%)',
                        marginTop: '5px',
                        marginBottom: '5px'
                    }}
                />
            </div>
        </div>
    );
}
//#endregion

//#region Action component
export const Actions = ({ circleName, rotation, lightCount, posObjArr, setPositions, handleRotate, handleEditClick, posObj, setCircleCount, onHideAllActions }) => {

    console.log('posObj',posObj)
    //Function to handle delete placed light
    const handleDelete = async (nodeId) => {
        console.log('nodeId, before array', nodeId, posObjArr);
        const params = new URLSearchParams(window.location.search);
        const fileName = params.get("file");

        if (posObjArr) {
            const indexToDelete = posObjArr.findIndex(item => item.nodeId === nodeId);
            console.log("indexToDelete", indexToDelete);
            if (indexToDelete !== -1) {
                // const deletedItem = posObjArr[indexToDelete];
                posObjArr.splice(indexToDelete, 1);
                localStorage.setItem('currentNodePositions', JSON.stringify(posObjArr));
                setPositions([...posObjArr]);
                setCircleCount(circleCount => circleCount + 1)
                await deleteLights(fileName, nodeId)
            } else {
                console.log(`Element with nodeId ${nodeId} not found.`);
            }
        } else {
            console.log('Local storage data not found.');
        }
    }

    //JSX
    // Calculate positioning based on rotation
    // Position actions within 10px of the lights
    const getActionStyle = () => {
        // Position at top-right corner, very close to the lights (max 10px gap)
        // Using transform to fine-tune positioning
        return {
            position: 'absolute',
            right: '0px',
            top: '0px',
            transform: 'translate(5px, -5px)',
            zIndex: 999999
        };
    };

    return (
        <div 
            className={`${circleName == 'eight' && rotation == 270 ? 'rotate-actions' : 'actions'}`}
            style={getActionStyle()}
        >
            <div className='edit-icon-green' onClick={() => handleEditClick(posObj)}>
                <EditOutlinedIcon />
            </div>
            <div className='drag-icon-green'>
                <Icon path={mdiHand} size={1} />
            </div>
            {
                lightCount != 1 &&
                <div className='rotate-icon-green' >
                    <img className="rotate-handle" style={{ width: 21, height: 20 }} onClick={(e) => {
                        e.stopPropagation();
                        handleRotate(posObj);
                    }}
                        src={rotateIcon}
                        alt="Rotate icon"
                    />
                </div>
            }
            <DeletePopup handleDelete={handleDelete} posObj={posObj} />
            {onHideAllActions && (
                <div className='hide-actions-icon' onClick={onHideAllActions} title="Hide All Actions">
                    <VisibilityOffIcon />
                </div>
            )}

        </div>
    );
}
//#endregion

//#region OneCircle component
export const OneCircles = ({ color, posObj, storePositionsArr, setPositions, isGridEnabled, showLightPlacementComp,
    setShowLightPlacementComp, zoomCount, setAnotherArray, anotherArray, GetDifference, }) => {

    //#region State and variables
    const [selfZIndex, setSelfZIndex] = useState(99999);
    const [position, setPosition] = useState({ x: posObj?.x, y: posObj?.y, id: posObj?.nodeId });
    const [size, setSize] = useState({ width: 50, height: 100 });
    const [posObjArr, setPosObjArr] = useState([]);
    const [circleCount, setCircleCount] = useState(0)
    const navigate = useNavigate();
    var difference;
    //#endregion

    //#region useEffect
    useEffect(() => {
        if (storePositionsArr) {
            setPosObjArr(storePositionsArr);
        }
        if ((posObj.isZoomed == true) && (IsZoomedCount() == true)) {
            if (showLightPlacementComp == true) {
                setPosition({ x: posObj.zoomDrawerX, y: posObj.zoomY, id: posObj.nodeId })
            }
            else {
                setPosition({ x: posObj.zoomX, y: posObj.zoomY, id: posObj.nodeId })
            }
        } else if ((IsZoomedCount() == true) && (posObj.isZoomed == false)) {
            if (showLightPlacementComp == true) {
                setPosition({ x: posObj.zoomDrawerX, y: posObj.zoomY, id: posObj.nodeId })
            }
            else {
                console.log('log2 2')
                setPosition({ x: posObj.zoomX, y: posObj.zoomY, id: posObj.nodeId })
            }
        }
        else if ((IsZoomedCount() == false) && (posObj.isZoomed == true) && (zoomCount == 0)) {
            if (showLightPlacementComp == true) {
                setPosition({ x: posObj.drawerX, y: posObj.y, id: posObj.nodeId })
            }
            else {
                setPosition({ x: posObj.x, y: posObj.y, id: posObj.nodeId })
            }
        }
        else {
            if (showLightPlacementComp == true) {
                setPosition({ x: posObj.drawerX, y: posObj.y, id: posObj.nodeId })
            }
            else {
                setPosition({ x: posObj.x, y: posObj.y, id: posObj.nodeId })
            }
            console.log('log4')
        }
    }, [showLightPlacementComp, zoomCount]);
    //#endregion

    //#region Functions
    const IsZoomedCount = () => {
        if (zoomCount % 2 == 0) {
            return false;
        }
        else {
            return true;
        }
    }

    var styleZIndex = {
        zIndex: selfZIndex
    }

    const setNodePositions = (dragElement, nodeId) => {

        var screenWidth = window.innerWidth;
        var drawerDifference;
        if (screenWidth <= 992) {
            drawerDifference = Math.round(((32 / 100) * screenWidth) / 2);
        }
        else if (screenWidth <= 1300) {
            drawerDifference = Math.round(((33 / 100) * screenWidth) / 2);
        }
        else if (screenWidth <= 1600) {
            drawerDifference = Math.round(((29 / 100) * screenWidth) / 2);

        }
        else if (screenWidth <= 2000) {
            drawerDifference = Math.round(((36 / 100) * screenWidth) / 2);

        }

        if (IsZoomedCount(zoomCount) == true) {
            console.log("Zoommmmmm");

            if (showLightPlacementComp == true) {
                var zoomX = dragElement.x - drawerDifference;
                var zoomY = dragElement.y;
                // GetXDifference(zoomX, true);
                // GetDifference(zoomX, true)

                // difference = difference + 25;
                var x = GetDifference(zoomX, true)
                var y = zoomY - ((40.8 / 100) * zoomY);
                var zoomDrawerX = dragElement.x;
                var drawerX = difference + drawerDifference;
            }
            else {
                var zoomX = dragElement.x;
                var zoomY = dragElement.y;
                // GetXDifference(zoomX, true);
                // GetDifference(zoomX, true)

                console.log('');
                // difference = difference + 25;
                var x = GetDifference(zoomX, true)
                var y = zoomY - ((40.8 / 100) * zoomY);
                var zoomDrawerX = dragElement.x + drawerDifference;
                var drawerX = x + drawerDifference;
            }
        }
        else if (IsZoomedCount(zoomCount) == false) {
            console.log("Zoom false!");

            if (showLightPlacementComp == true) {
                var x = dragElement.x - drawerDifference;
                var y = dragElement.y;
                // GetXDifference(x, false);
                // GetDifference(x, false)

                // difference = difference - 25;
                var zoomX = GetDifference(x, false);
                var zoomY = ((80.8 / 100) * y) + y;
                var zoomDrawerX = difference + drawerDifference;
                var drawerX = dragElement.x;
            }
            else {
                var x = dragElement.x;
                var y = dragElement.y;
                // GetXDifference(x, false);
                // GetDifference(x, false)

                // difference = difference - 25;
                var zoomX = GetDifference(x, false)
                var zoomY = ((80.8 / 100) * y) + y;
                var zoomDrawerX = difference + drawerDifference;
                var drawerX = dragElement.x + drawerDifference;
            }
        }

        let localData = JSON.parse(localStorage.getItem("currentNodePositions"));
        if (localData && localData.length > 0) {
            const updateLocalArr = localData.map(item => {
                if (item.nodeId === nodeId) {
                    return { ...item, x: x, y: y, zoomX: zoomX, zoomY: zoomY, drawerX: drawerX, zoomDrawerX: zoomDrawerX }
                }
                return item;
            });
            console.log('localData', localData);
            localStorage.setItem("currentNodePositions", JSON.stringify(updateLocalArr));
        }

        const updatedPosObjArr = storePositionsArr.map(item => {
            if (item.nodeId === nodeId) {
                console.log('iteeemmmmm', item.zoomX,item.zoomY);
                console.log('x, y ', x, y);
                return { ...item, x: x, y: y, zoomX: zoomX, zoomY: zoomY-15, drawerX: drawerX, zoomDrawerX: zoomDrawerX }
            }
            else {
                return item;
            }
        });

        return updatedPosObjArr;
    }

    const handleEditClick = (posObj) => {
        console.log('handleEditClick')
        setShowLightPlacementComp(true);
        console.log('posObj.placeLight', { selectedLight: posObj?.placeLight, nodeId: posObj?.nodeId, categoryId: posObj.categoryId });
        var localData = [];
        localData = JSON.parse(localStorage.getItem("currentNodePositions"));
        console.log("localData", localData, typeof (localData), posObj);
        if (localData == null && typeof (localData) == 'object') {
            localData = [];
        }

        const nodeIdExists = localData.some(obj => obj.nodeId === posObj.nodeId);
        if (!nodeIdExists) {
            localData.push(posObj);
        }

        localStorage.setItem("currentNodePositions", JSON.stringify(localData));
        console.log("New updated content");

        localStorage.setItem('editCurrentNodeId', JSON.stringify(posObj?.nodeId))







        var stateObj = { selectedLight: posObj?.placeLight, nodeId: posObj?.nodeId, categoryId: posObj.categoryId }
        const params = new URLSearchParams(window.location.search);
        const fileName = params.get("file");
        const placeLight = params.get("placeLight");



        // const externalComponents = placeLight ? `&circles=${decodeURIComponent(placeLight)}` : "";
        // navigate(`/lightplacementview?file=${decodeURIComponent(fileName)}`, { state: stateObj });
        // navigate("/lightplacementview?file=${decodeURIComponent(fileName)}", { state: stateObj });
    };

    const handleDrag = (e, ui, nodeId) => {
        const { deltaX, deltaY, x, y } = ui;
        // console.log('ui', ui);
        // console.log('deltaX, Y', deltaX + ', ' + deltaY);
        setPosition(prevPosition => ({
            ...prevPosition,
            x: prevPosition.x + deltaX,
            y: prevPosition.y + deltaY
        }));
        e.stopPropagation();
        e.preventDefault();
    };

    const handleDragStop = (e, data, nodeId) => {
        console.log('handleDragStop')
        const updatedPosObjArr = setNodePositions(data, nodeId);
        setPositions(updatedPosObjArr);
        e.stopPropagation();
        e.preventDefault();
    };

    const handleRotate = () => { };

    const handleActionClick = (posObj) => {
        // console.log("action clicked");
        const localData = storePositionsArr?.map((item) => {
            if (posObj.nodeId == item.nodeId) {
                item.isActiveAction = true
                return { ...item }
            } else {
                item.isActiveAction = false
                return { ...item }
            }


        })
        setPositions(localData);
        // localStorage.setItem('currentNodePositions', JSON.stringify(localData));

        const another = anotherArray?.map((item) => {
            if (posObj.nodeId == item.nodeId) {
                item.isActiveAction = true
                return { ...item }
            } else {
                item.isActiveAction = false
                return { ...item }
            }
        })
        setAnotherArray(another);
    }
    //#endregion

    //#region JSX
    return (
        <>
            <Draggable
                key={posObj.nodeId}
                handle=".drag-icon-green" // .handle
                position={position}

                onDrag={(e, data) => handleDrag(e, data, posObj.nodeId)}
                onStop={(e, data) => handleDragStop(e, data, posObj.nodeId)}
            >
                <div className='one-circle-containers' style={{...styleZIndex, position: 'relative'}}

                >
                    {/* Four circle node */}
                    <div className='node-container'
                        style={{
                            position: 'relative',
                            transform: `rotate(0deg)`

                        }}
                    >
                        {/* Display circle */}
                        <div className='circle-icon-block' >
                            <div className='dot-flex-row'>
                                <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={size.width / 4} y={size.height / 4} color={color} posObj={posObj} />
                            </div>

                        </div>
                    </div>
                    {/* Actions positioned relative to container - always near lights */}
                    {(isGridEnabled == true && posObj.isActiveAction == true) &&
                        <Actions 
                            lightCount={1} 
                            posObjArr={storePositionsArr} 
                            setPositions={setPositions} 
                            handleRotate={handleRotate} 
                            handleEditClick={handleEditClick}
                            posObj={posObj} 
                            circleCount={circleCount} 
                            setCircleCount={setCircleCount} 
                        />
                    }
                </div>
            </Draggable >
        </>
    );
    //#endregion
};

export const TwoCircles = ({ GetDifference, dimensions, color, posObj, storePositionsArr, setPositions, isGridEnabled, showLightPlacementComp,
    setShowLightPlacementComp, zoomCount, anotherArray, setAnotherArray
}) => {
    const [position, setPosition] = useState({ x: posObj?.x, y: posObj?.y, id: posObj?.nodeId });
    let width = posObj.width ? posObj.width : 50
    let height = posObj.height ? posObj.height : 25
    const [size, setSize] = useState({ width: width, height: height });
    const [posObjArr, setPosObjArr] = useState([]);
    const [circleCount, setCircleCount] = useState(0)
    const navigate = useNavigate();
    const [isRotate, setIsRotate,] = useState(false)
    const [rotation, setRotation] = useState(posObj?.rotateDegree);
    const [selfZIndex, setSelfZIndex] = useState(9999);
    var difference;
    //#endregion
    console.log("TwoCircles",posObj)


    //#region useEffect
    useEffect(() => {
        if (storePositionsArr) {
            setPosObjArr(storePositionsArr);
        }
        if ((posObj.isZoomed == true) && (IsZoomedCount() == true)) {
            // console.log("pos and zoom true");
            if (showLightPlacementComp == true) {
                setPosition({ x: posObj.zoomDrawerX, y: posObj.zoomY, id: posObj.nodeId })
            }
            else {
                setPosition({ x: posObj.zoomX, y: posObj.zoomY, id: posObj.nodeId })
            }
            console.log("log 1",posObj.zoomedWidth,posObj.zoomedHeight,posObj.width,posObj.height)
            setSize({ width: posObj.zoomedWidth, height: posObj.zoomedHeight });

        } else if ((IsZoomedCount() == true) && (posObj.isZoomed == false)) {
            // console.log("pos false and zoom true");
            if (showLightPlacementComp == true) {
                console.log(" in drawer", posObj.zoomDrawerX, posObj.zoomY);

                setPosition({ x: posObj.zoomDrawerX, y: posObj.zoomY, id: posObj.nodeId })
            }
            else {
                console.log("not in drawer");
                setPosition({ x: posObj.zoomX, y: posObj.zoomY, id: posObj.nodeId })
            }
            console.log("log 2",posObj.zoomedWidth,posObj.zoomedHeight,posObj.width,posObj.height)
            setSize({ width: posObj.zoomedWidth, height: posObj.zoomedHeight });


        }
        else if ((IsZoomedCount() == false) && (posObj.isZoomed == true) && (zoomCount == 0)) {
            // console.log("pos true and zoom false and zoomCount 0");

            if (showLightPlacementComp == true) {
                setPosition({ x: posObj.drawerX, y: posObj.y, id: posObj.nodeId })
            }
            else {
                setPosition({ x: posObj.x, y: posObj.y, id: posObj.nodeId })
            }
            console.log("log 3",posObj.zoomedWidth,posObj.zoomedHeight,posObj.width,posObj.height)
            setSize({ width: posObj.width, height: posObj.height });


        }
        else {
            // console.log("else ", posObj.isZoomed, IsZoomedCount(), zoomCount);

            if (showLightPlacementComp == true) {
                setPosition({ x: posObj.drawerX, y: posObj.y, id: posObj.nodeId })
            }
            else {
                setPosition({ x: posObj.x, y: posObj.y, id: posObj.nodeId })
            }
            console.log("log 4",posObj.zoomedWidth,posObj.zoomedHeight,posObj.width,posObj.height)
            setSize({ width: posObj.width, height: posObj.height });
        }
    }, [showLightPlacementComp, zoomCount]);
    //#endregion

    //#region Styles
    var styleZIndex = {
        zIndex: selfZIndex
    }
    //#endregion

    //#region Functions
    const IsZoomedCount = () => {
        if (zoomCount % 2 == 0) {
            return false;
        }
        else {
            return true;
        }
    }

    const setNodePositions = (dragElement, nodeId) => {
        console.log("dragElement", dragElement);
        var screenWidth = window.innerWidth;
        var drawerDifference;
        if (screenWidth <= 992) {
            drawerDifference = Math.round(((32 / 100) * screenWidth) / 2);
        }
        else if (screenWidth <= 1300) {
            drawerDifference = Math.round(((33 / 100) * screenWidth) / 2);
        }
        else if (screenWidth <= 1600) {
            drawerDifference = Math.round(((29 / 100) * screenWidth) / 2);

        }
        else if (screenWidth <= 2000) {
            drawerDifference = Math.round(((36 / 100) * screenWidth) / 2);

        }

        if (IsZoomedCount(zoomCount) == true) {
            console.log("Zoom true!");

            if (showLightPlacementComp == true) {
                var zoomX = dragElement.x - drawerDifference;
                var zoomY = dragElement.y;
                // GetXDifference(zoomX, true);
                // difference = difference + 25;
                var x = GetDifference(zoomX, true);
                var y = zoomY - ((40.8 / 100) * zoomY) - 7;
                var zoomDrawerX = dragElement.x;
                var drawerX = difference + drawerDifference;
            }
            else {
                var zoomX = dragElement.x;
                var zoomY = dragElement.y;
                // GetXDifference(zoomX, true);
                // difference = difference + 25;
                var x = GetDifference(zoomX, true);;
                var y = zoomY - ((40.8 / 100) * zoomY) - 7;
                var zoomDrawerX = dragElement.x + drawerDifference;
                var drawerX = x + drawerDifference;
            }
        }
        else if (IsZoomedCount(zoomCount) == false) {
            console.log("Zoom false!");

            if (showLightPlacementComp == true) {
                var x = dragElement.x - drawerDifference;
                var y = dragElement.y;
                ;
                // difference = difference - 25;
                var zoomX = GetDifference(x, false)
                var zoomY = (((80.8 / 100) * y) + y) - 10;
                var zoomDrawerX = GetDifference(x, false) + drawerDifference;
                var drawerX = dragElement.x;
            }
            else {
                var x = dragElement.x;
                var y = dragElement.y;
                // GetXDifference(x, false);
                // difference = difference - 25;
                var zoomX = GetDifference(x, false)
                var zoomY = (((80.8 / 100) * y) + y) - 10;
                var zoomDrawerX = GetDifference(x, false) + drawerDifference;
                var drawerX = dragElement.x + drawerDifference;
            }
        }

        let localData = JSON.parse(localStorage.getItem("currentNodePositions"));
        if (localData && localData.length > 0) {
            const updateLocalArr = localData.map(item => {
                if (item.nodeId === nodeId) {
                    return { ...item, x: x, y: y, zoomX: zoomX, zoomY: zoomY, drawerX: drawerX, zoomDrawerX: zoomDrawerX }
                }
                return item;
            });
            console.log('localData', localData);
            console.log('updateLocalArr', updateLocalArr);
            localStorage.setItem("currentNodePositions", JSON.stringify(updateLocalArr));
        }

        const updatedPosObjArr = storePositionsArr.map(item => {
            if (item.nodeId === nodeId) {
                console.log('before', item);
                console.log('x, y ', x, y);
                return { ...item, x: x, y: y, zoomX: zoomX, zoomY: zoomY, drawerX: drawerX, zoomDrawerX: zoomDrawerX }
            }
            else {
                return item;
            }
        });
        console.log("LATEST UPDATED POSITIONS", updatedPosObjArr);
        return updatedPosObjArr;
    }


    const handleRotate = (currObj) => {
        setIsRotate(true)
        const newRotation = rotation == 0 ? 270 : 0;
        setRotation(newRotation);

        let localData = JSON.parse(localStorage.getItem("currentNodePositions"));
        if (localData && localData.length > 0) {
            const updateLocalArr = localData.map(item => {
                if (item.nodeId === currObj.nodeId) {
                    item.rotateDegree = newRotation;
                    console.log('item.rotateDegree', item.rotateDegree);
                    return { ...item };
                }
                return item;
            });
            // console.log('updateLocalArr', updateLocalArr);
            localStorage.setItem("currentNodePositions", JSON.stringify(updateLocalArr));
        }

        const updatedPosObjArr = storePositionsArr.map(item => {
            if (item.nodeId === currObj.nodeId) {
                item.rotateDegree = newRotation;
                console.log('item.rotateDegree', item.rotateDegree);
                // Ensure position is maintained after rotation
                if (item.x !== undefined && item.y !== undefined) {
                    setPosition({ x: item.x, y: item.y, id: item.nodeId });
                }
                return { ...item };
            }
            return item;
        });
        // console.log('updatedPosObjArr', updatedPosObjArr);
        setPositions(updatedPosObjArr);
    };

    const handleDrag = (e, ui, nodeId) => {
        const { deltaX, deltaY, x, y } = ui;
        // console.log('ui', ui);
        // console.log('deltaX, Y', deltaX + ', ' + deltaY);
        setPosition(prevPosition => ({
            ...prevPosition,
            x: prevPosition.x + deltaX,
            y: prevPosition.y + deltaY
        }));
        e.stopPropagation();
        e.preventDefault();
    };

    const handleEditClick = (posObj) => {
        setShowLightPlacementComp(true);
        console.log('posObj.placeLight', { selectedLight: posObj?.placeLight, nodeId: posObj?.nodeId, categoryId: posObj.categoryId });

        var localData = [];
        localData = JSON.parse(localStorage.getItem("currentNodePositions"));
        console.log("localData", localData, typeof (localData), posObj);
        if (localData == null && typeof (localData) == 'object') {
            localData = [];
        }

        const nodeIdExists = localData.some(obj => obj.nodeId === posObj.nodeId);
        if (!nodeIdExists) {
            localData.push(posObj);
        }

        localStorage.setItem("currentNodePositions", JSON.stringify(localData));
        console.log("New updated content");
        localStorage.setItem('editCurrentNodeId', JSON.stringify(posObj?.nodeId))


        var stateObj = { selectedLight: posObj?.placeLight, nodeId: posObj?.nodeId, categoryId: posObj.categoryId }
        const params = new URLSearchParams(window.location.search);
        const fileName = params.get("file");
        const placeLight = params.get("placeLight");

        const externalComponents = placeLight ? `&circles=${decodeURIComponent(placeLight)}` : "";
        // navigate(`/lightplacementview?file=${decodeURIComponent(fileName)}`, { state: stateObj });
        // navigate("/lightplacementview?file=${decodeURIComponent(fileName)}", { state: stateObj });
    };

    const handleDragStop = (e, data, nodeId) => {


        const { x, y } = data;
        console.log("handleDragStop",handleDragStop)

        const updatedPosObjArr = setNodePositions(data, nodeId);
        setPositions(updatedPosObjArr);
        e.stopPropagation();
        e.preventDefault();
    };




    const onResize = (event, { node, size, handle }, nodeId) => {
        const { width, height } = size;
        setSize({ width: width, height: height });
    };

    const onResizeStop = (event, { node, size, handle }, nodeId, posObj) => {
        const { width, height } = size;
        console.log('onResizeStop')

        const updatedPosObjArr = storePositionsArr.map(item => {
            if (IsZoomedCount(zoomCount) == true) {
                if (item.nodeId === nodeId) {
                    console.log('if IsZoomedCountttt',item)
                    return { ...item,y: item.y+7, zoomedWidth: width, zoomedHeight: height, height: (height / 2) + ((height * 10) / 100), width: (width / 2) + ((width * 5) / 100) };
                }
                return item;
            }
            else {
                if (item.nodeId === nodeId) {
                    console.log('else IsZoomedCountttt',height * 33)
                    return {...item, zoomedHeight:  height + (height/4*3) -10, height: height, width: width }

                }
                return item;
            }

        });
        setPositions(updatedPosObjArr);
        localStorage.setItem('currentNodePositions', JSON.stringify(updatedPosObjArr));

    }


    const handleActionClick = (posObj) => {

        console.log("action clicked");
        const localData = storePositionsArr.map((item) => {
            if (posObj.nodeId == item.nodeId) {
                item.isActiveAction = true
                return { ...item }
            } else {
                item.isActiveAction = false
                return { ...item }
            }
        })
        setPositions(localData);
        // localStorage.setItem('currentNodePositions', JSON.stringify(localData));

        const another = anotherArray?.map((item) => {
            if (posObj.nodeId == item.nodeId) {
                item.isActiveAction = true
                return { ...item }
            } else {
                item.isActiveAction = false
                return { ...item }
            }
        })
        setAnotherArray(another);
    }

    //#endregion

    //#region JSX
    return (
        <>
            <Draggable
                handle=".drag-icon-green"
                position={position}
                onDrag={(e, data) => handleDrag(e, data, posObj.nodeId)}
                onStop={(e, data) => handleDragStop(e, data, posObj.nodeId)}
            // style={{ maxHeight: `${localStorage.getItem("imageHeight") - position.y}px` }}
            >
                <Resizable

                    handle={(isGridEnabled == true && posObj.isActiveAction == true) &&
                        <div className='vertical-horizontal-resize'>
                            <Icon path={mdiArrowTopLeftBottomRight} size={1} />
                        </div>
                    }
                    width={size.width}
                    height={size.height}
                    maxHeight={`${localStorage.getItem("imageHeight") - position.y}px`}
                    onResize={(e, data) => onResize(e, data, posObj.nodeId)}
                    onResizeStop={(e, data) => onResizeStop(e, data, posObj.nodeId, posObj)}
                // axis='both'
                //  resizeHandles={['se']}
                >
                    <div className='two-circle-container' style={{...styleZIndex, position: 'relative'}}
                    // onClick={() => { (isGridEnabled == true) && handleActionClick(posObj) }}
                    >
                        {/* Four circle node */}
                        {rotation == 270 ?
                            <div
                                style={{
                                    transform: `rotate(${0}deg)`,
                                    position: 'relative',
                                    width: size.height + 'px',
                                    // height: size.width + 'px',
                                    maxHeight: `${localStorage.getItem("imageHeight") - position.y}px`,
                                }}
                            // Adjust rotation angle  
                            >
                                < div className='new-circle-icon-block'
                                    style={{
                                        width: size.height + 'px',
                                        // height: size.width + 'px',
                                        maxHeight: `${localStorage.getItem("imageHeight") - position.y}px`
                                    }}
                                >
                                    <div className='new-dot-block flex-hr' style={{ maxHeight: `${(localStorage.getItem("imageHeight") - position.y) / 2}px`, width: '100%' }}>
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} color={color} posObj={posObj} />
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={(2 * size.height) / 4} y={size.width / 4} color={color} posObj={posObj} />
                                    </div>
                                </div>
                            </div>
                            :
                            <div
                                style={{
                                    transform: `rotate(${0}deg)`,
                                    position: 'relative',
                                    // width: size.width,
                                    height: size.height,
                                    maxHeight: `${localStorage.getItem("imageHeight") - position.y}px`
                                }} // Adjust rotation angle
                            >
                                {/* Display circle */}
                                <div className='circle-icon-block'
                                    style={{
                                        maxHeight: `${localStorage.getItem("imageHeight") - position.y}px`,
                                        height: size.height + 'px',
                                    }}
                                >
                                    <div className='dot-flex-row'>
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={size.width / 4} y={size.height / 4} color={color} posObj={posObj} />
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={(size.width) / 4} y={2 * size.height / 4} color={color} posObj={posObj} />
                                    </div>
                                </div>
                            </div>
                        }
                        {/* Actions positioned relative to container - always near lights */}
                        {(isGridEnabled == true && posObj.isActiveAction == true) &&
                            <Actions 
                                circleName="two" 
                                rotation={rotation} 
                                posObjArr={storePositionsArr} 
                                setPositions={setPositions} 
                                handleRotate={handleRotate} 
                                handleEditClick={handleEditClick}
                                posObj={posObj} 
                                lightCount={2}
                                circleCount={circleCount} 
                                setCircleCount={setCircleCount} 
                            />
                        }
                    </div>
                </Resizable>
            </Draggable >
        </>
    );
    //#endregion

};

//  This is main component which is display 4 circles
const FourCircles = ({ GetDifference, dimensions, color, posObj, storePositionsArr, setPositions, isGridEnabled, showLightPlacementComp, setShowLightPlacementComp, zoomCount, anotherArray, setAnotherArray }) => {
    const [position, setPosition] = useState({ x: posObj?.x, y: posObj?.y, id: posObj?.nodeId });
    let width = posObj.width ? posObj.width : 50
    let height = posObj.height ? posObj.height : 25

    // const [size, setSize] = useState({ width: width, height: height });
    const [size, setSize] = useState({ width: 50, height: 25 });

    const [posObjArr, setPosObjArr] = useState([]);

    const [selfZIndex, setSelfZIndex] = useState(999);

    var styleZIndex = {
        zIndex: selfZIndex
    }

    useEffect(() => {
        // Retrieve and parse the array from localStorage when the component mounts
        // console.log("storedPositions", storePositionsArr);
        // Retrieve and parse the array from localStorage when the component mounts
        // const storedPositions = localStorage.getItem('currentNodePositions');
        if (storePositionsArr) {
            setPosObjArr(storePositionsArr);
        }

        if ((posObj.isZoomed == true) && (IsZoomedCount() == true)) {
            // console.log("pos and zoom true");
            if (showLightPlacementComp == true) {
                setPosition({ x: posObj.zoomDrawerX, y: posObj.zoomY, id: posObj.nodeId })
            }
            else {
                setPosition({ x: posObj.zoomX, y: posObj.zoomY, id: posObj.nodeId })
            }
            setSize({ width: posObj.zoomedWidth, height: posObj.zoomedHeight });

        } else if ((IsZoomedCount() == true) && (posObj.isZoomed == false)) {
            console.log("posObj.zoomX posObj.zoomY",posObj.zoomX,posObj.zoomY);
            if (showLightPlacementComp == true) {
                setPosition({ x: posObj.zoomDrawerX, y: posObj.zoomY, id: posObj.nodeId })
            }
            else {
                setPosition({ x: posObj.zoomX, y: posObj.zoomY, id: posObj.nodeId })
            }
            setSize({ width: posObj.zoomedWidth, height: posObj.zoomedHeight });


        }
        else if ((IsZoomedCount() == false) && (posObj.isZoomed == true) && (zoomCount == 0)) {
            // console.log("pos true and zoom false and zoomCount 0");

            if (showLightPlacementComp == true) {
                setPosition({ x: posObj.drawerX, y: posObj.y, id: posObj.nodeId })
            }
            else {
                setPosition({ x: posObj.x, y: posObj.y, id: posObj.nodeId })
            }
            setSize({ width: posObj.width, height: posObj.height });


        }
        else {
            // console.log("else node", posObj.isZoomed, IsZoomedCount(), zoomCount);

            if (showLightPlacementComp == true) {
                setPosition({ x: posObj.drawerX, y: posObj.y, id: posObj.nodeId })
            }
            else {
                setPosition({ x: posObj.x, y: posObj.y, id: posObj.nodeId })
            }
            setSize({ width: posObj.width, height: posObj.height });


        }
    }, [showLightPlacementComp, zoomCount]);

    // Rotate
    const [isRotate, setIsRotate,] = useState(false)
    const [rotation, setRotation] = useState(posObj?.rotateDegree);
    const [circleCount, setCircleCount] = useState(0)
    const navigate = useNavigate();
    var difference;

    const IsZoomedCount = () => {
        if (zoomCount % 2 == 0) {
            return false;
        }
        else {
            return true;
        }
    }

    const setNodePositions = (dragElement, nodeId) => {
        console.log("dragElement", dragElement);
        var screenWidth = window.innerWidth;
        var drawerDifference;
        if (screenWidth <= 992) {
            drawerDifference = Math.round(((32 / 100) * screenWidth) / 2);
        }
        else if (screenWidth <= 1300) {
            drawerDifference = Math.round(((33 / 100) * screenWidth) / 2);
        }
        else if (screenWidth <= 1600) {
            drawerDifference = Math.round(((29 / 100) * screenWidth) / 2);

        }
        else if (screenWidth <= 2000) {
            drawerDifference = Math.round(((36 / 100) * screenWidth) / 2);

        }

        if (IsZoomedCount(zoomCount) == true) {
            console.log("Zoom true!");

            if (showLightPlacementComp == true) {
                var zoomX = dragElement.x - drawerDifference;
                var zoomY = dragElement.y;
                // GetXDifference(zoomX, true);
                // difference = difference + 25;
                var x = GetDifference(zoomX, true);
                var y = zoomY - ((40.8 / 100) * zoomY) - 7;
                var zoomDrawerX = dragElement.x;
                var drawerX = difference + drawerDifference;
            }
            else {
                var zoomX = dragElement.x;
                var zoomY = dragElement.y;
                // GetXDifference(zoomX, true);
                // difference = difference + 25;
                var x = GetDifference(zoomX, true);;
                var y = zoomY - ((40.8 / 100) * zoomY) - 7;
                var zoomDrawerX = dragElement.x + drawerDifference;
                var drawerX = x + drawerDifference;
            }
        }
        else if (IsZoomedCount(zoomCount) == false) {
            console.log("Zoom false!");

            if (showLightPlacementComp == true) {
                var x = dragElement.x - drawerDifference;
                var y = dragElement.y;
                ;
                // difference = difference - 25;
                var zoomX = GetDifference(x, false)
                var zoomY = (((80.8 / 100) * y) + y) - 10;
                var zoomDrawerX = GetDifference(x, false) + drawerDifference;
                var drawerX = dragElement.x;
            }
            else {
                var x = dragElement.x;
                var y = dragElement.y;
                // GetXDifference(x, false);
                // difference = difference - 25;
                var zoomX = GetDifference(x, false)
                var zoomY = (((80.8 / 100) * y) + y) - 10;
                var zoomDrawerX = GetDifference(x, false) + drawerDifference;
                var drawerX = dragElement.x + drawerDifference;
            }
        }

        let localData = JSON.parse(localStorage.getItem("currentNodePositions"));
        if (localData && localData.length > 0) {
            const updateLocalArr = localData.map(item => {
                if (item.nodeId === nodeId) {
                    return { ...item, x: x, y: y, zoomX: zoomX, zoomY: zoomY, drawerX: drawerX, zoomDrawerX: zoomDrawerX }
                }
                return item;
            });
            console.log('localData', localData);
            console.log('updateLocalArr', updateLocalArr);
            localStorage.setItem("currentNodePositions", JSON.stringify(updateLocalArr));
        }

        const updatedPosObjArr = storePositionsArr.map(item => {
            if (item.nodeId === nodeId) {
                console.log('before', item);
                console.log('x, y ', x, y);
                return { ...item, x: x, y: y, zoomX: zoomX, zoomY: zoomY, drawerX: drawerX, zoomDrawerX: zoomDrawerX }
            }
            else {
                return item;
            }
        });
        console.log("LATEST UPDATED POSITIONS", updatedPosObjArr);
        return updatedPosObjArr;
    }


    const handleEditClick = (posObj) => {
        setShowLightPlacementComp(true);
        console.log('posObj.placeLight', { selectedLight: posObj?.placeLight, nodeId: posObj?.nodeId, categoryId: posObj.categoryId });
        var localData = [];
        localData = JSON.parse(localStorage.getItem("currentNodePositions"));
        console.log("localData", localData, typeof (localData), posObj);
        if (localData == null && typeof (localData) == 'object') {
            localData = [];
        }

        const nodeIdExists = localData.some(obj => obj.nodeId === posObj.nodeId);
        if (!nodeIdExists) {
            localData.push(posObj);
        }

        localStorage.setItem("currentNodePositions", JSON.stringify(localData));
        console.log("New updated content");
        localStorage.setItem('editCurrentNodeId', JSON.stringify(posObj?.nodeId))


        var stateObj = { selectedLight: posObj?.placeLight, nodeId: posObj?.nodeId, categoryId: posObj.categoryId }
        const params = new URLSearchParams(window.location.search);
        const fileName = params.get("file");
        const placeLight = params.get("placeLight");

        // const externalComponents = placeLight ? `&circles=${decodeURIComponent(placeLight)}` : "";
        // navigate(`/lightplacementview?file=${decodeURIComponent(fileName)}`, { state: stateObj });
        // navigate("/lightplacementview?file=${decodeURIComponent(fileName)}", { state: stateObj });
    };

    const handleRotate = (currObj) => {
        setIsRotate(true)
        if (rotation == 0) {
            setRotation(270)
        } else {
            setRotation(0)
        }

        let localData = JSON.parse(localStorage.getItem("currentNodePositions"));
        if (localData && localData.length > 0) {
            const updateLocalArr = localData.map(item => {
                if (item.nodeId === currObj.nodeId) {
                    item.rotateDegree = (rotation == 0 ? 270 : 0);
                    console.log('item.rotateDegree', item.rotateDegree);
                    return { ...item };
                }
                return item;
            });
            // console.log('updateLocalArr', updateLocalArr);
            localStorage.setItem("currentNodePositions", JSON.stringify(updateLocalArr));
        }

        const updatedPosObjArr = storePositionsArr.map(item => {
            if (item.nodeId === currObj.nodeId) {
                item.rotateDegree = (rotation == 0 ? 270 : 0);
                console.log('item.rotateDegree', item.rotateDegree);
                return { ...item };
            }
            return item;
        });
        // console.log('updatedPosObjArr', updatedPosObjArr);
        setPositions(updatedPosObjArr);
    };

    const handleDrag = (e, ui, nodeId) => {
        const { deltaX, deltaY, x, y } = ui;
        // console.log('ui', ui);
        // console.log('deltaX, Y', deltaX + ', ' + deltaY);
        setPosition(prevPosition => ({
            ...prevPosition,
            x: prevPosition.x + deltaX,
            y: prevPosition.y + deltaY
        }));
        e.stopPropagation();
        e.preventDefault();
    };

    const handleDragStop = (e, data, nodeId) => {


        const { x, y } = data;

        const updatedPosObjArr = setNodePositions(data, nodeId);
        setPositions(updatedPosObjArr);

        e.stopPropagation();
        e.preventDefault();
    };


    const onResize = (event, { node, size, handle }, nodeId) => {
        const { width, height } = size;
        setSize({ width: width, height: height });
    };

    const onResizeStop = (event, { node, size, handle }, nodeId, posObj) => {
        const { width, height } = size;
        console.log('onResizeStop', size);
        console.log('posObj', posObj);
        console.log('posObjArr', posObjArr);




        const updatedPosObjArr = storePositionsArr.map(item => {
            console.log('iitteemm',item)
            if (IsZoomedCount(zoomCount) == true) {
                if (item.nodeId === nodeId) {       
                    // return { ...item, zoomedWidth: width, zoomedHeight: height, height: (height / 2) + ((height * 10) / 100), width: (width / 2) + ((width * 5) / 100) };
                    return { ...item, zoomedWidth: width, zoomedHeight: height, height: (height / 2) + ((height * 10) / 100), width: (width / 2) + ((width * 5) / 100) };

                }
                return item;
            }
            else {
                if (item.nodeId === nodeId) {
                    console.log('iteemm',item)
                    // return { ...item,zoomedWidth: width + (width - ((width * 8) / 100)), zoomedHeight: (height + height) - ((height * 15) / 100), height: height, width: width };
                    // return { ...item,zoomX: item.zoomX,zoomedWidth: width + (width - ((width * 8) / 100)) - 30, zoomedHeight: (height + height) - ((height * 15) / 100)-15, height: height, width: width };
                    // return { ...item, zoomedWidth: width + (width - (width/3))+5, zoomedHeight: height + (height - (height/3)) + 5, height: height, width: width };
                    return {...item, zoomedWidth:  width + (width/4*3) -5, zoomedHeight:  height + (height/4*3), height: height, width: width, }
                    // return {...item, zoomedWidth:width + (width/3) + ((width/3)/2),zoomedHeight:height + (height/3) + ((height/3)/2)}

                }
                return item;
            }

        });
        setPositions(updatedPosObjArr);
        localStorage.setItem('currentNodePositions', JSON.stringify(updatedPosObjArr));
    }



    const handleActionClick = (posObj) => {


        console.log("action clicked");
        const localData = storePositionsArr?.map((item) => {
            if (posObj.nodeId == item.nodeId) {
                item.isActiveAction = true
                return { ...item }
            } else {
                item.isActiveAction = false
                return { ...item }
            }
        })
        setPositions(localData);
        // localStorage.setItem('currentNodePositions', JSON.stringify(localData));

        const another = anotherArray?.map((item) => {
            if (posObj.nodeId == item.nodeId) {
                item.isActiveAction = true
                return { ...item }
            } else {
                item.isActiveAction = false
                return { ...item }
            }
        })
        setAnotherArray(another);
    }

    return (
        <>
            <Draggable
                handle=".drag-icon-green"
                position={position}
                // style={{ maxHeight: `${localStorage.getItem("imageHeight") - position.y}px` }}

                onDrag={(e, data) => handleDrag(e, data, posObj.nodeId)}
                onStop={(e, data) => handleDragStop(e, data, posObj.nodeId)}
            >
                <Resizable
                    handle={(isGridEnabled == true && posObj.isActiveAction == true) &&
                        <div className='vertical-horizontal-resize'>
                            <Icon path={mdiArrowTopLeftBottomRight} size={1} />
                        </div>
                    }
                    width={size.width}
                    height={size.height}
                    maxHeight={`${localStorage.getItem("imageHeight") - position.y}px `}
                    onResize={(e, data) => onResize(e, data, posObj.nodeId)}
                    onResizeStop={(e, data) => onResizeStop(e, data, posObj.nodeId, posObj)}

                // axis='both'
                // resizeHandles={['se']}
                >
                    <div className='four-circle-container' style={{...styleZIndex, position: 'relative'}}
                    >
                        {/* Four circle node */}
                        {rotation == 270 ?
                            <div
                                style={{
                                    transform: `rotate(${0}deg)`,
                                    position: 'relative',
                                    width: size.height + 'px',
                                    height: size.width + 'px',

                                    maxHeight: `${localStorage.getItem("imageHeight") - position.y}px`,
                                }}
                            // Adjust rotation angle  
                            >
                                < div className='new-circle-icon-block'
                                    style={{
                                        width: size.height + 'px',
                                        height: size.width + 'px',

                                        maxHeight: `${localStorage.getItem("imageHeight") - position.y}px`
                                    }}
                                >
                                    <div className='new-dot-block'
                                        style={{
                                            // maxHeight: `${(localStorage.getItem("imageHeight") - position.y) }px`,
                                            width: '98%'
                                        }}>
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} color={color} posObj={posObj} />
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={(2 * size.height) / 4} y={size.width / 4} color={color} posObj={posObj} />
                                    </div>
                                    <div className='new-dot-block-nth' style={{
                                        // maxHeight: `${(localStorage.getItem("imageHeight") - position.y) }px` 
                                    }}>
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={(2 * size.height) / 4} y={(2 * size.width) / 4} color={color} posObj={posObj} />
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={size.height / 4} y={(2 * size.width) / 4} color={color} posObj={posObj} />
                                    </div>

                                </div>
                            </div>
                            :
                            <div
                                style={{
                                    transform: `rotate(${0}deg)`,
                                    position: 'relative',
                                    width: size.width,
                                    height: size.height,
                                    maxHeight: `${localStorage.getItem("imageHeight") - position.y}px`
                                }} // Adjust rotation angle  
                            >

                                {/* Display circle */}
                                <div className='circle-icon-block'
                                    style={{
                                        width: size.width + 'px',
                                        height: size.height + 'px',
                                        maxHeight: `${localStorage.getItem("imageHeight") - position.y}px`
                                    }}
                                >
                                    <div className='dot-flex-row'>
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={size.width / 4} y={size.height / 4} color={color} posObj={posObj} />
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={(2 * size.width) / 4} y={size.height / 4} color={color} posObj={posObj} />
                                    </div>
                                    <div className='dot-flex-row-for-nth'>
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={(2 * size.width) / 4} y={(2 * size.height) / 4} color={color} posObj={posObj} />
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={size.width / 4} y={(2 * size.height) / 4} color={color} posObj={posObj} />
                                    </div>
                                </div>
                            </div>
                        }
                        {/* Actions positioned relative to container - always near lights */}
                        {(isGridEnabled == true && posObj.isActiveAction == true) &&
                            <Actions 
                                circleName="four" 
                                rotation={rotation} 
                                posObjArr={storePositionsArr} 
                                setPositions={setPositions} 
                                handleRotate={handleRotate} 
                                handleEditClick={handleEditClick}
                                posObj={posObj} 
                                lightCount={4}
                                circleCount={circleCount} 
                                setCircleCount={setCircleCount} 
                            />
                        }
                    </div >
                </Resizable>
            </Draggable >
        </>
    );
};
//#endregion

//  This component display 6 circles
export const SixCircles = ({ GetDifference, dimensions, color, posObj, storePositionsArr, setPositions, isGridEnabled, showLightPlacementComp, zoomCount, setShowLightPlacementComp, anotherArray, setAnotherArray }) => {
    const [position, setPosition] = useState({ x: posObj?.x, y: posObj?.y, id: posObj?.nodeId });
    let width = posObj.width ? posObj.width : 50
    let height = posObj.height ? posObj.height : 25
    const [size, setSize] = useState({ width: width, height: height });
    const [posObjArr, setPosObjArr] = useState([]);
    const [circleCount, setCircleCount] = useState(0);

    const [selfZIndex, setSelfZIndex] = useState(99);

    var styleZIndex = {
        zIndex: selfZIndex
    }

    useEffect(() => {
        // Retrieve and parse the array from localStorage when the component mounts
        // console.log("storedPositions", storePositionsArr);
        // Retrieve and parse the array from localStorage when the component mounts
        // const storedPositions = localStorage.getItem('currentNodePositions');
        if (storePositionsArr) {
            setPosObjArr(storePositionsArr);
        }

        if ((posObj.isZoomed == true) && (IsZoomedCount() == true)) {
            // console.log("pos and zoom true");
            if (showLightPlacementComp == true) {
                setPosition({ x: posObj.zoomDrawerX, y: posObj.zoomY, id: posObj.nodeId })
            }
            else {
                setPosition({ x: posObj.zoomX, y: posObj.zoomY, id: posObj.nodeId })
            }
            setSize({ width: posObj.zoomedWidth, height: posObj.zoomedHeight });


        } else if ((IsZoomedCount() == true) && (posObj.isZoomed == false)) {
            // console.log("pos false and zoom true");
            if (showLightPlacementComp == true) {
                setPosition({ x: posObj.zoomDrawerX, y: posObj.zoomY, id: posObj.nodeId })
            }
            else {
                setPosition({ x: posObj.zoomX, y: posObj.zoomY, id: posObj.nodeId })
            }
            setSize({ width: posObj.zoomedWidth, height: posObj.zoomedHeight });

        }
        else if ((IsZoomedCount() == false) && (posObj.isZoomed == true) && (zoomCount == 0)) {
            // console.log("pos true and zoom false and zoomCount 0");

            if (showLightPlacementComp == true) {
                setPosition({ x: posObj.drawerX, y: posObj.y, id: posObj.nodeId })
            }
            else {
                setPosition({ x: posObj.x, y: posObj.y, id: posObj.nodeId })
            }
            setSize({ width: posObj.width, height: posObj.height });


        }
        else {
            // console.log("else ", posObj.isZoomed, IsZoomedCount(), zoomCount);

            if (showLightPlacementComp == true) {
                setPosition({ x: posObj.drawerX, y: posObj.y, id: posObj.nodeId })
            }
            else {
                setPosition({ x: posObj.x, y: posObj.y, id: posObj.nodeId })
            }
            setSize({ width: posObj.width, height: posObj.height });
        }
    }, [showLightPlacementComp, zoomCount]);

    // Rotate
    const [isRotate, setIsRotate,] = useState(false)
    const [rotation, setRotation] = useState(posObj?.rotateDegree);
    const navigate = useNavigate();
    var difference;

    const IsZoomedCount = () => {
        if (zoomCount % 2 == 0) {
            return false;
        }
        else {
            return true;
        }
    }

    const setNodePositions = (dragElement, nodeId) => {
        console.log("dragElement", dragElement);
        var screenWidth = window.innerWidth;
        var drawerDifference;
        if (screenWidth <= 992) {
            drawerDifference = Math.round(((32 / 100) * screenWidth) / 2);
        }
        else if (screenWidth <= 1300) {
            drawerDifference = Math.round(((33 / 100) * screenWidth) / 2);
        }
        else if (screenWidth <= 1600) {
            drawerDifference = Math.round(((29 / 100) * screenWidth) / 2);

        }
        else if (screenWidth <= 2000) {
            drawerDifference = Math.round(((36 / 100) * screenWidth) / 2);

        }

        if (IsZoomedCount(zoomCount) == true) {
            console.log("Zoom true!");

            if (showLightPlacementComp == true) {
                var zoomX = dragElement.x - drawerDifference;
                var zoomY = dragElement.y;
                // GetXDifference(zoomX, true);
                // difference = difference + 25;
                var x = GetDifference(zoomX, true);
                var y = zoomY - ((40.8 / 100) * zoomY) - 7;
                var zoomDrawerX = dragElement.x;
                var drawerX = difference + drawerDifference;
            }
            else {
                var zoomX = dragElement.x;
                var zoomY = dragElement.y;
                // GetXDifference(zoomX, true);
                // difference = difference + 25;
                var x = GetDifference(zoomX, true);;
                var y = zoomY - ((40.8 / 100) * zoomY) - 7;
                var zoomDrawerX = dragElement.x + drawerDifference;
                var drawerX = x + drawerDifference;
            }
        }
        else if (IsZoomedCount(zoomCount) == false) {
            console.log("Zoom false!");

            if (showLightPlacementComp == true) {
                var x = dragElement.x - drawerDifference;
                var y = dragElement.y;
                ;
                // difference = difference - 25;
                var zoomX = GetDifference(x, false)
                var zoomY = (((80.8 / 100) * y) + y) - 10;
                var zoomDrawerX = GetDifference(x, false) + drawerDifference;
                var drawerX = dragElement.x;
            }
            else {
                var x = dragElement.x;
                var y = dragElement.y;
                // GetXDifference(x, false);
                // difference = difference - 25;
                var zoomX = GetDifference(x, false)
                var zoomY = (((80.8 / 100) * y) + y) - 10;
                var zoomDrawerX = GetDifference(x, false) + drawerDifference;
                var drawerX = dragElement.x + drawerDifference;
            }
        }

        let localData = JSON.parse(localStorage.getItem("currentNodePositions"));
        if (localData && localData.length > 0) {
            const updateLocalArr = localData.map(item => {
                if (item.nodeId === nodeId) {
                    return { ...item, x: x, y: y, zoomX: zoomX, zoomY: zoomY, drawerX: drawerX, zoomDrawerX: zoomDrawerX }
                }
                return item;
            });
            console.log('localData', localData);
            console.log('updateLocalArr', updateLocalArr);
            localStorage.setItem("currentNodePositions", JSON.stringify(updateLocalArr));
        }

        const updatedPosObjArr = storePositionsArr.map(item => {
            if (item.nodeId === nodeId) {
                console.log('before', item);
                console.log('x, y ', x, y);
                return { ...item, x: x, y: y, zoomX: zoomX, zoomY: zoomY, drawerX: drawerX, zoomDrawerX: zoomDrawerX }
            }
            else {
                return item;
            }
        });
        console.log("LATEST UPDATED POSITIONS", updatedPosObjArr);
        return updatedPosObjArr;
    }

    const handleRotate = (currObj) => {
        setIsRotate(true)
        const newRotation = rotation == 0 ? 270 : 0;
        setRotation(newRotation);

        let localData = JSON.parse(localStorage.getItem("currentNodePositions"));
        if (localData && localData.length > 0) {
            const updateLocalArr = localData.map(item => {
                if (item.nodeId === currObj.nodeId) {
                    item.rotateDegree = newRotation;
                    console.log('item.rotateDegree', item.rotateDegree);
                    return { ...item };
                }
                return item;
            });
            // console.log('updateLocalArr', updateLocalArr);
            localStorage.setItem("currentNodePositions", JSON.stringify(updateLocalArr));
        }

        const updatedPosObjArr = storePositionsArr.map(item => {
            if (item.nodeId === currObj.nodeId) {
                item.rotateDegree = newRotation;
                console.log('item.rotateDegree', item.rotateDegree);
                // Ensure position is maintained after rotation
                if (item.x !== undefined && item.y !== undefined) {
                    setPosition({ x: item.x, y: item.y, id: item.nodeId });
                }
                return { ...item };
            }
            return item;
        });
        // console.log('updatedPosObjArr', updatedPosObjArr);
        setPositions(updatedPosObjArr);
    };

    const handleDrag = (e, ui, nodeId) => {
        const { deltaX, deltaY, x, y } = ui;
        // console.log('ui', ui);
        // console.log('deltaX, Y', deltaX + ', ' + deltaY);
        setPosition(prevPosition => ({
            ...prevPosition,
            x: prevPosition.x + deltaX,
            y: prevPosition.y + deltaY
        }));
        e.stopPropagation();
        e.preventDefault();
    };

    const handleEditClick = (posObj) => {
        setShowLightPlacementComp(true);
        console.log('posObj.placeLight', { selectedLight: posObj?.placeLight, nodeId: posObj?.nodeId, categoryId: posObj.categoryId });
        var localData = [];
        localData = JSON.parse(localStorage.getItem("currentNodePositions"));
        console.log("localData", localData, typeof (localData), posObj);
        if (localData == null && typeof (localData) == 'object') {
            localData = [];
        }

        const nodeIdExists = localData.some(obj => obj.nodeId === posObj.nodeId);
        if (!nodeIdExists) {
            localData.push(posObj);
        }

        localStorage.setItem("currentNodePositions", JSON.stringify(localData));
        console.log("New updated content");
        localStorage.setItem('editCurrentNodeId', JSON.stringify(posObj?.nodeId))


        var stateObj = { selectedLight: posObj?.placeLight, nodeId: posObj?.nodeId, categoryId: posObj.categoryId }
        const params = new URLSearchParams(window.location.search);
        const fileName = params.get("file");
        const placeLight = params.get("placeLight");

        // const externalComponents = placeLight ? `&circles=${decodeURIComponent(placeLight)}` : "";
        // navigate(`/lightplacementview?file=${decodeURIComponent(fileName)}`, { state: stateObj });
        // navigate("/lightplacementview?file=${decodeURIComponent(fileName)}", { state: stateObj });
    };

    const handleDragStop = (e, data, nodeId) => {


        const { x, y } = data;

        const updatedPosObjArr = setNodePositions(data, nodeId);
        // console.log('updatedPosObjArr', updatedPosObjArr);
        setPositions(updatedPosObjArr);

        e.stopPropagation();
        e.preventDefault();
    };

    const onResize = (event, { node, size, handle }, nodeId) => {
        const { width, height } = size;
        setSize({ width: width, height: height });
    };

    const onResizeStop = (event, { node, size, handle }, nodeId, posObj) => {
        const { width, height } = size;
        console.log('size', size);
        console.log('posObj', posObj);
        console.log('posObjArr', posObjArr)

        const updatedPosObjArr = storePositionsArr.map((item,index) => {
            if (IsZoomedCount(zoomCount) == true) {
                if (item.nodeId === nodeId) {
                    return { ...item, zoomedWidth: width, zoomedHeight: height, height: (height / 2) + ((height * 10) / 100), width: (width / 2) - 5 + ((width * 5) / 100) + 10,};
                }
                return item;
            }
            else {
                if (item.nodeId === nodeId) {
                    console.log('index',index)
                    // return { ...item, zoomedWidth: width + (width - ((width * 8) / 100)), zoomedHeight: (height + height) - ((height * 15) / 100), height: height, width: width };
                    // return { ...item,zoomX: item.zoomX,zoomedWidth: width + (width - ((width * 8) / 100)) - 30, zoomedHeight: (height + height) - ((height * 15) / 100)-15, height: height, width: width };
                    // return { ...item, zoomedWidth: width + (width - (width/3)), zoomedHeight:  height + (height - (height/3)), height: height, width: width };
                    return {...item, zoomedWidth:  width + (width/4*3) - 10, zoomedHeight:  height + (height/4*3), height: height, width: width}
                    // return {...item , zoomedWidth: width+width , zoomedHeight: height + (height/4*3)}
                    
                }
                return item;
            }

        });
        setPositions(updatedPosObjArr);
        localStorage.setItem('currentNodePositions', JSON.stringify(updatedPosObjArr));




    }



    const handleActionClick = (posObj) => {

        console.log("action clicked");
        const localData = storePositionsArr?.map((item) => {
            if (posObj.nodeId == item.nodeId) {
                item.isActiveAction = true
                return { ...item }
            } else {
                item.isActiveAction = false
                return { ...item }
            }
        })
        setPositions(localData);
        // localStorage.setItem('currentNodePositions', JSON.stringify(localData));

        const another = anotherArray?.map((item) => {
            if (posObj.nodeId == item.nodeId) {
                item.isActiveAction = true
                return { ...item }
            } else {
                item.isActiveAction = false
                return { ...item }
            }
        })
        setAnotherArray(another);
    }

    return (
        <>
            <Draggable
                handle=".drag-icon-green"
                position={position}
                onDrag={(e, data) => handleDrag(e, data, posObj.nodeId)}
                onStop={(e, data) => handleDragStop(e, data, posObj.nodeId)}
                maxHeight={`${localStorage.getItem("imageHeight") - position.y}px`}
            // defaultPosition={{ x: 700, y: 190 }}
            >
                <Resizable
                    handle={(isGridEnabled == true && posObj.isActiveAction == true) &&

                        <div className='vertical-horizontal-resize'>
                            <Icon path={mdiArrowTopLeftBottomRight} size={1} />
                        </div>
                    }

                    width={size.width}
                    height={size.height}
                    maxHeight={`${localStorage.getItem("imageHeight") - position.y}px`}
                    onResize={(e, data) => onResize(e, data, posObj.nodeId)}
                    onResizeStop={(e, data) => onResizeStop(e, data, posObj.nodeId, posObj)}
                // axis='both'
                //  resizeHandles={['se']}
                >
                    <div className='six-circle-container' style={{...styleZIndex, position: 'relative'}}
                    // onClick={() => { (isGridEnabled == true) && handleActionClick(posObj) }}
                    >

                        {(rotation == 270) ?
                            <div
                                style={{
                                    transform: `rotate(${0}deg)`,
                                    position: 'relative',
                                    width: size.height * 2 + 'px',
                                    height: size.width + 'px',
                                    maxHeight: `${localStorage.getItem("imageHeight") - position.y}px`,
                                }}
                            // Adjust rotation angle  
                            >
                                < div className='new-circle-icon-block'
                                    style={{
                                        width: size.height * 2 + 'px',
                                        height: size.width + 'px',
                                        maxHeight: `${localStorage.getItem("imageHeight") - position.y}px`
                                    }}
                                >
                                    <div className='new-dot-block' style={{
                                        // maxHeight: `${(localStorage.getItem("imageHeight") - position.y) / 2}px`, 
                                        width: '49%'
                                    }}>
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} color={color} posObj={posObj} />
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={(2 * size.height) / 4} y={size.width / 4} color={color} posObj={posObj} />
                                    </div>
                                    <div className='new-dot-block' style={{
                                        // maxHeight: `${(localStorage.getItem("imageHeight") - position.y) / 2}px`,
                                        width: '49% '
                                    }}>
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={(2 * size.height) / 4} y={(2 * size.width) / 4} color={color} posObj={posObj} />
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={size.height / 4} y={(2 * size.width) / 4} color={color} posObj={posObj} />
                                    </div>
                                    <div className='new-dot-block-nth'>
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={(2 * size.height) / 4} y={(3 * size.width) / 4} color={color} posObj={posObj} />
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={size.height / 4} y={(3 * size.width) / 4} color={color} posObj={posObj} />
                                    </div>
                                </div>
                            </div>
                            :

                            < div
                                style={{
                                    transform: `rotate(${0}deg)`,
                                    position: 'relative',
                                    width: size.width + 'px',
                                    height: size.height + 'px',
                                    maxHeight: `${localStorage.getItem("imageHeight") - position.y}px`
                                }} // Adjust rotation angle  
                            >
                                {/* Display circle */}
                                < div className='circle-icon-block'
                                    style={{
                                        width: size.width + 'px',
                                        height: size.height + 'px',
                                        maxHeight: `${localStorage.getItem("imageHeight") - position.y}px`
                                    }}
                                >
                                    <div className='dot-flex-row' style={{ maxHeight: `${(localStorage.getItem("imageHeight") - position.y) / 2}px` }}>
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={size.width / 4} y={size.height / 4} color={color} posObj={posObj} />
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={(2 * size.width) / 4} y={size.height / 4} color={color} posObj={posObj} />
                                    </div>
                                    <div className='dot-flex-row' style={{ maxHeight: `${(localStorage.getItem("imageHeight") - position.y) / 2}px` }}>
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={(2 * size.width) / 4} y={(2 * size.height) / 4} color={color} posObj={posObj} />
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={size.width / 4} y={(2 * size.height) / 4} color={color} posObj={posObj} />
                                    </div>
                                    <div className='dot-flex-row-for-nth'>
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={(2 * size.width) / 4} y={(3 * size.height) / 4} color={color} posObj={posObj} />
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={size.width / 4} y={(3 * size.height) / 4} color={color} posObj={posObj} />
                                    </div>
                                </div>

                            </div>
                        }






                        {/* Actions positioned relative to container - always near lights */}
                        {(isGridEnabled == true && posObj.isActiveAction == true) &&
                            <Actions 
                                circleName="six" 
                                rotation={rotation} 
                                posObjArr={storePositionsArr} 
                                setPositions={setPositions} 
                                handleRotate={handleRotate} 
                                handleEditClick={handleEditClick}
                                posObj={posObj} 
                                lightCount={6}
                                circleCount={circleCount} 
                                setCircleCount={setCircleCount} 
                            />
                        }
                        {/* </div> */}
                    </div>

                </Resizable>
            </Draggable >
        </>
    );
};
//#endregion

//  This component display 3 circles
export const EightCircles = ({ GetDifference, dimensions, color, posObj, storePositionsArr, setPositions, isGridEnabled, showLightPlacementComp, setShowLightPlacementComp, zoomCount, anotherArray, setAnotherArray }) => {
    const [position, setPosition] = useState({ x: posObj?.x, y: posObj?.y, id: posObj?.nodeId });
    let width = posObj.width ? posObj.width : 50
    let height = posObj.height ? posObj.height : 25
    console.log('posObjjjjjjj',posObj.zoomedHeight)

    const [size, setSize] = useState({ width: width, height: height });
    const [posObjArr, setPosObjArr] = useState([]);
    const [circleCount, setCircleCount] = useState(0)

    // Rotate
    const [isRotate, setIsRotate,] = useState(false)
    const [rotation, setRotation] = useState(posObj?.rotateDegree);
    const [direction, setDirection] = useState(posObj?.rotateDegree == '270' ? 'Rotable' : 'Normal');
    const prevPosRef = useRef({ x: 0, y: 0 }); // To store previous mouse positions
    const prevRotValue = useRef(posObj?.rotateDegree == '270' ? 'Rotable' : 'Normal')
    const navigate = useNavigate();
    const [rotateSize, setRotateSize] = useState({ height: '', width: '' })
    var difference;

    const [selfZIndex, setSelfZIndex] = useState(9);
    var styleZIndex = {
        zIndex: selfZIndex
    }
    useEffect(() => {
        // Retrieve and parse the array from localStorage when the component mounts
        // console.log("storedPositions", storePositionsArr);
        // Retrieve and parse the array from localStorage when the component mounts
        // const storedPositions = localStorage.getItem('currentNodePositions');
        if (storePositionsArr) {
            setPosObjArr(storePositionsArr);
        }


        if ((posObj.isZoomed == true) && (IsZoomedCount() == true)) {
            // console.log("pos and zoom true");
            if (showLightPlacementComp == true) {
                setPosition({ x: posObj.zoomDrawerX, y: posObj.zoomY, id: posObj.nodeId })
            }
            else {
                setPosition({ x: posObj.zoomX, y: posObj.zoomY, id: posObj.nodeId })
            }

            setSize({ width: posObj.zoomedWidth, height: posObj.zoomedHeight });



        } else if ((IsZoomedCount() == true) && (posObj.isZoomed == false)) {
            // console.log("pos false and zoom true");
            if (showLightPlacementComp == true) {
                setPosition({ x: posObj.zoomDrawerX, y: posObj.zoomY, id: posObj.nodeId })
            }
            else {
                setPosition({ x: posObj.zoomX, y: posObj.zoomY, id: posObj.nodeId })
            }

            setSize({ width: posObj.zoomedWidth, height: posObj.zoomedHeight });


        }
        else if ((IsZoomedCount() == false) && (posObj.isZoomed == true) && (zoomCount == 0)) {
            // console.log("pos true and zoom false and zoomCount 0");

            if (showLightPlacementComp == true) {
                setPosition({ x: posObj.drawerX, y: posObj.y, id: posObj.nodeId })
            }
            else {
                setPosition({ x: posObj.x, y: posObj.y, id: posObj.nodeId })
            }
            setSize({ width: posObj.width, height: posObj.height });

        }
        else {
            // console.log("else ", posObj.isZoomed, IsZoomedCount(), zoomCount);

            if (showLightPlacementComp == true) {
                setPosition({ x: posObj.drawerX, y: posObj.y, id: posObj.nodeId })
            }
            else {
                setPosition({ x: posObj.x, y: posObj.y, id: posObj.nodeId })
            }
            setSize({ width: posObj.width, height: posObj.height });

        }
    }, [showLightPlacementComp, zoomCount]);

    const IsZoomedCount = () => {
        if (zoomCount % 2 == 0) {
            return false;
        }
        else {
            return true;
        }
    }


    const setNodePositions = (dragElement, nodeId) => {
        console.log("dragElement", dragElement);
        var screenWidth = window.innerWidth;
        var drawerDifference;
        if (screenWidth <= 992) {
            drawerDifference = Math.round(((32 / 100) * screenWidth) / 2);
        }
        else if (screenWidth <= 1300) {
            drawerDifference = Math.round(((33 / 100) * screenWidth) / 2);
        }
        else if (screenWidth <= 1600) {
            drawerDifference = Math.round(((29 / 100) * screenWidth) / 2);

        }
        else if (screenWidth <= 2000) {
            drawerDifference = Math.round(((36 / 100) * screenWidth) / 2);

        }

        if (IsZoomedCount(zoomCount) == true) {
            console.log("Zoom true!");

            if (showLightPlacementComp == true) {
                var zoomX = dragElement.x - drawerDifference;
                var zoomY = dragElement.y;
                // GetXDifference(zoomX, true);
                // difference = difference + 25;
                var x = GetDifference(zoomX, true);
                var y = zoomY - ((40.8 / 100) * zoomY) - 7;
                var zoomDrawerX = dragElement.x;
                var drawerX = difference + drawerDifference;
            }
            else {
                var zoomX = dragElement.x;
                var zoomY = dragElement.y;
                // GetXDifference(zoomX, true);
                // difference = difference + 25;
                var x = GetDifference(zoomX, true);;
                var y = zoomY - ((40.8 / 100) * zoomY) - 7;
                var zoomDrawerX = dragElement.x + drawerDifference;
                var drawerX = x + drawerDifference;
            }
        }
        else if (IsZoomedCount(zoomCount) == false) {
            console.log("Zoom false!");

            if (showLightPlacementComp == true) {
                var x = dragElement.x - drawerDifference;
                var y = dragElement.y;
                ;
                // difference = difference - 25;
                var zoomX = GetDifference(x, false)
                var zoomY = (((80.8 / 100) * y) + y) - 10;
                var zoomDrawerX = GetDifference(x, false) + drawerDifference;
                var drawerX = dragElement.x;
            }
            else {
                var x = dragElement.x;
                var y = dragElement.y;
                // GetXDifference(x, false);
                // difference = difference - 25;
                var zoomX = GetDifference(x, false)
                var zoomY = (((80.8 / 100) * y) + y) - 10;
                var zoomDrawerX = GetDifference(x, false) + drawerDifference;
                var drawerX = dragElement.x + drawerDifference;
            }
        }

        let localData = JSON.parse(localStorage.getItem("currentNodePositions"));
        if (localData && localData.length > 0) {
            const updateLocalArr = localData.map(item => {
                if (item.nodeId === nodeId) {
                    return { ...item, x: x, y: y, zoomX: zoomX, zoomY: zoomY, drawerX: drawerX, zoomDrawerX: zoomDrawerX }
                }
                return item;
            });
            console.log('localData', localData);
            console.log('updateLocalArr', updateLocalArr);
            localStorage.setItem("currentNodePositions", JSON.stringify(updateLocalArr));
        }

        const updatedPosObjArr = storePositionsArr.map(item => {
            if (item.nodeId === nodeId) {
                console.log('before', item);
                console.log('x, y ', x, y);
                return { ...item, x: x, y: y, zoomX: zoomX, zoomY: zoomY, drawerX: drawerX, zoomDrawerX: zoomDrawerX }
            }
            else {
                return item;
            }
        });
        console.log("LATEST UPDATED POSITIONS", updatedPosObjArr);
        return updatedPosObjArr;
    }

    const handleEditClick = (posObj) => {
        setShowLightPlacementComp(true);

        console.log('posObj.placeLight', { selectedLight: posObj?.placeLight, nodeId: posObj?.nodeId, categoryId: posObj.categoryId });
        var localData = [];
        localData = JSON.parse(localStorage.getItem("currentNodePositions"));
        console.log("localData", localData, typeof (localData), posObj);
        if (localData == null && typeof (localData) == 'object') {
            localData = [];
        }

        const nodeIdExists = localData.some(obj => obj.nodeId === posObj.nodeId);
        if (!nodeIdExists) {
            localData.push(posObj);
        }

        localStorage.setItem("currentNodePositions", JSON.stringify(localData));
        console.log("New updated content");
        localStorage.setItem('editCurrentNodeId', JSON.stringify(posObj?.nodeId))


        var stateObj = { selectedLight: posObj?.placeLight, nodeId: posObj?.nodeId, categoryId: posObj.categoryId }
        const params = new URLSearchParams(window.location.search);
        const fileName = params.get("file");
        const placeLight = params.get("placeLight");

        // const externalComponents = placeLight ? `&circles=${decodeURIComponent(placeLight)}` : "";
        // navigate(`/lightplacementview?file=${decodeURIComponent(fileName)}`, { state: stateObj });
        // navigate("/lightplacementview?file=${decodeURIComponent(fileName)}", { state: stateObj });
    };

    const handleDrag = (e, ui, nodeId) => {
        const { deltaX, deltaY, x, y } = ui;
        setPosition(prevPosition => ({
            ...prevPosition,
            x: prevPosition.x + deltaX,
            y: prevPosition.y + deltaY
        }));
        e.stopPropagation();
        e.preventDefault();
    };

    const handleDragStop = (e, data, nodeId) => {

        const { x, y } = data;
        const updatedPosObjArr = setNodePositions(data, nodeId);
        setPositions(updatedPosObjArr);
        e.stopPropagation();
        e.preventDefault();
    };

    const handleResize = (event, size) => {
        const currentPos = { x: event.clientX, y: event.clientY };

        // Get previous position
        const prevPos = prevPosRef.current;

        // Calculate the difference between current and previous positions
        const deltaX = Math.abs(currentPos.x - prevPos.x);
        const deltaY = Math.abs(currentPos.y - prevPos.y);

        // Determine if movement is more horizontal or vertical
        if (deltaX > deltaY) {
            setDirection("Horizontal");
            // if (rotation == 0) {
            //     setSize({ width: width, height: height });
            // }
            if (rotation == 270) {
                setSize({ ...size, height: width });
            }
            console.log("Horizontal");
        } else {
            setDirection("Vertical");
            console.log("Vertical");
            // if (rotation == 0) {
            //     setSize({ width: width, height: height });
            // }
            if (rotation == 270) {
                setSize({ width: height });
            }

        }

        // Update previous position for the next resize event
        prevPosRef.current = currentPos;
    };

    const handleRotate = (currObj) => {
        setIsRotate(true)
        const newRotation = rotation == 0 ? 270 : 0;
        setRotation(newRotation);
        setDirection(newRotation == 270 ? "Rotable" : "Normal");

        let localData = JSON.parse(localStorage.getItem("currentNodePositions"));
        if (localData && localData.length > 0) {
            const updateLocalArr = localData.map(item => {
                if (item.nodeId === currObj.nodeId) {
                    item.rotateDegree = newRotation;
                    console.log('item.rotateDegree', item.rotateDegree);
                    return { ...item };
                }
                return item;
            });

            localStorage.setItem("currentNodePositions", JSON.stringify(updateLocalArr));
        }

        const updatedPosObjArr = storePositionsArr.map(item => {
            if (item.nodeId === currObj.nodeId) {
                item.rotateDegree = newRotation;
                console.log('item.rotateDegree', item.rotateDegree);
                // Ensure position is maintained after rotation
                if (item.x !== undefined && item.y !== undefined) {
                    setPosition({ x: item.x, y: item.y, id: item.nodeId });
                }
                return { ...item };
            }
            return item;
        });

        setPositions(updatedPosObjArr);
    };

    const onResize = (event, { node, size, handle }, nodeId) => {
        console.log("event", event, "node", node, "size", size, "handle", handle, "nodeId", nodeId);
        const { width, height } = size;
        setSize({ width: width, height: height });
    };

    const onResizeStop = (event, { node, size, handle }, nodeId, posObj) => {
        console.log('One third',100 - (100/3))

        const { width, height } = size;
        console.log('size', size);
        console.log('posObj', posObj);
        console.log('posObjArr', posObjArr);

        const updatedPosObjArr = storePositionsArr.map(item => {
            if (IsZoomedCount(zoomCount) == true) {
                if (item.nodeId === nodeId) {
                    console.log('if comes')
                    // return { ...item, zoomedWidth: width, zoomedHeight: height, height: (height / 2) + ((height * 10) / 100), width: (width / 2) + ((width * 5) / 100),y:item.y+5,x:item.x+2 };
                    return { ...item, zoomedWidth: width, zoomedHeight: height, height: (height / 2) + ((height * 10) / 100), width: (width / 2) - 5 + ((width * 5) / 100) + 10,};

                }
                return item;
            }
            else {
                if (item.nodeId === nodeId) {
                    // return { ...item, zoomedWidth: width + (width - ((width * 8) / 100)), zoomedHeight: (height + height) - ((height * 15) / 100), height: height, width: width };
                    // return { ...item,zoomX: item.zoomX,zoomedWidth: width + (width - ((width * 8) / 100)) - 30, zoomedHeight: (height + height) - ((height * 15) / 100)-15, height: height, width: width };
                    // return { ...item,zoomX:item.zoomX, zoomedWidth: width + (width - (width/3)), zoomedHeight:  height + (height - (height/3)), height: height, width: width };
                    // return {...item, zoomedWidth:  width + (width/4*3), zoomedHeight:  height + (height/4*3), height: height, width: width }
                    return {...item, zoomedWidth:  width + (width/4*3) - 10, zoomedHeight:  height + (height/4*3), height: height, width: width,}

                }
                return item;
            }

        });
        setPositions(updatedPosObjArr);
        localStorage.setItem('currentNodePositions', JSON.stringify(updatedPosObjArr));
    }

    const handleActionClick = (posObj) => {


        console.log("action clicked");
        const localData = storePositionsArr?.map((item) => {
            if (posObj.nodeId == item.nodeId) {
                item.isActiveAction = true
                return { ...item }
            } else {
                item.isActiveAction = false
                return { ...item }
            }
        })
        setPositions(localData);
        // localStorage.setItem('currentNodePositions', JSON.stringify(localData));

        const another = anotherArray?.map((item) => {
            if (posObj.nodeId == item.nodeId) {
                item.isActiveAction = true
                return { ...item }
            } else {
                item.isActiveAction = false
                return { ...item }
            }
        })
        setAnotherArray(another);
    }

    return (
        <>
            <Draggable
                handle=".drag-icon-green"
                position={position}
                onDrag={(e, data) => handleDrag(e, data, posObj.nodeId)}
                onStop={(e, data) => handleDragStop(e, data, posObj.nodeId)}
                maxHeight={`${localStorage.getItem("imageHeight") - position.y}px`}
            >
                <Resizable
                    handle={(isGridEnabled == true && posObj.isActiveAction == true) &&
                        // '.vertical-horizontal-resize'
                        <div className='vertical-horizontal-resize'>
                            <Icon path={mdiArrowTopLeftBottomRight} size={1} />
                        </div>
                    }
                    width={size.width}
                    height={size.height}
                    maxHeight={`${localStorage.getItem("imageHeight") - position.y}px `}
                    onResize={(e, data) => onResize(e, data, posObj.nodeId)}
                    onResizeStop={(e, data) => onResizeStop(e, data, posObj.nodeId, posObj)}
                // axis='both'
                //  resizeHandles={['se']}
                >
                    <div className='eight-circle-container' style={{...styleZIndex, position: 'relative'}}
                    // onClick={() => { (isGridEnabled == true) && handleActionClick(posObj) }}
                    >
                        {/* Eight circle node */}
                        {rotation == 270 ?

                            <div
                                style={{
                                    transform: `rotate(${0}deg)`,
                                    position: 'relative',
                                    width: `${size.height * 3}px`,
                                    height: `${size.width}px`,
                                    maxHeight: `${localStorage.getItem("imageHeight") - position.y}px`
                                }} // Adjust rotation angle  
                            >
                                {/* Display circle */}
                                <div className='new-circle-icon-block'
                                    style={{
                                        width: `${size.height * 3}px`,
                                        height: `${size.width}px`,
                                        maxHeight: `${localStorage.getItem("imageHeight") - position.y}px`
                                    }}
                                >
                                    <div className='new-dot-block' style={{
                                        // maxHeight: `${(localStorage.getItem("imageHeight") - position.y) / 2}px`, 
                                        width: '32%'
                                    }}>
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} color={color} posObj={posObj} />
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={(2 * size.height) / 4} y={size.width / 4} color={color} posObj={posObj} />
                                    </div>
                                    <div className='new-dot-block' style={{
                                        // maxHeight: `${(localStorage.getItem("imageHeight") - position.y) / 2}px`,
                                        width: '32% '
                                    }}>
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={(2 * size.height) / 4} y={(2 * size.width) / 4} color={color} posObj={posObj} />
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={size.height / 4} y={(2 * size.width) / 4} color={color} posObj={posObj} />
                                    </div>
                                    <div className='new-dot-block' style={{
                                        // maxHeight: `${(localStorage.getItem("imageHeight") - position.y) / 2}px`,
                                        width: '32% '
                                    }}>
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={(2 * size.height) / 4} y={(2 * size.width) / 4} color={color} posObj={posObj} />
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={size.height / 4} y={(2 * size.width) / 4} color={color} posObj={posObj} />
                                    </div>
                                    <div className='new-dot-block-nth'>
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={(2 * size.height) / 4} y={(3 * size.width) / 4} color={color} posObj={posObj} />
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={size.height / 4} y={(3 * size.width) / 4} color={color} posObj={posObj} />
                                    </div>
                                </div>
                            </div>
                            :
                            <div
                                style={{
                                    transform: `rotate(${0}deg)`,
                                    position: 'relative',
                                    width: size.width + 'px',
                                    height: size.height + 'px',
                                    maxHeight: `${localStorage.getItem("imageHeight") - position.y}px`
                                }}
                            // Adjust rotation angle  
                            >
                                {/* Display circle */}
                                <div className='circle-icon-block'
                                    style={{
                                        width: size.width + 'px',
                                        height: size.height + 'px',
                                        maxHeight: `${localStorage.getItem("imageHeight") - position.y}px`
                                    }}
                                >
                                    <div className='dot-flex-row' style={{ maxHeight: `${(localStorage.getItem("imageHeight") - position.y) / 3}px` }}>
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={size.width / 4} y={size.height / 4} color={color} posObj={posObj} />
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={(2 * size.width) / 4} y={size.height / 4} color={color} posObj={posObj} />
                                    </div>
                                    <div className='dot-flex-row' style={{ maxHeight: `${(localStorage.getItem("imageHeight") - position.y) / 3}px` }}>
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={(2 * size.width) / 4} y={(2 * size.height) / 4} color={color} posObj={posObj} />
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={(2 * size.width) / 4} y={(4 * size.height) / 4} color={color} posObj={posObj} />
                                    </div>
                                    <div className='dot-flex-row' style={{ maxHeight: `${(localStorage.getItem("imageHeight") - position.y) / 3}px` }}>
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={size.width / 4} y={(2 * size.height) / 4} color={color} posObj={posObj} />
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={(2 * size.width) / 4} y={(3 * size.height) / 4} color={color} posObj={posObj} />
                                    </div>
                                    <div className='dot-flex-row'>
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={size.width / 4} y={(3 * size.height) / 4} color={color} posObj={posObj} />
                                        <Circle isGridEnabled={isGridEnabled} handleActionClick={handleActionClick} x={size.width / 4} y={(4 * size.height) / 4} color={color} posObj={posObj} />
                                    </div>
                                </div>
                            </div>
                        }


                        {/* Actions positioned relative to container - always near lights */}
                        {(isGridEnabled == true && posObj.isActiveAction == true) &&
                            <Actions 
                                circleName="eight" 
                                rotation={rotation} 
                                posObjArr={storePositionsArr} 
                                setPositions={setPositions} 
                                handleRotate={handleRotate} 
                                handleEditClick={handleEditClick}
                                posObj={posObj} 
                                lightCount={8}
                                circleCount={circleCount} 
                                setCircleCount={setCircleCount} 
                            />
                        }
                    </div>
                </Resizable>
            </Draggable >
        </>
    );
};
//#endregion

//#region Delete Popup
export const DeletePopup = (props) => {
    return (
        <div className="delete-action-icon">
            {/* {fileObj && ( */}
            <Popup
                trigger={<DeleteIcon />}
                className="delete-popup"
            >
                {(close) => (
                    <div className="delete-popup-button-block">
                        <div className="alert-icon-info">
                            <div className="alert-icon">
                                {/* <img src={alertIcon}></img> */}
                            </div>
                            <h5>Delete Selected Light!</h5>
                        </div>
                        <p>Are you sure you want to delete this lights?</p>
                        <div className="delete-btn-block">
                            <button onClick={close}>Cancel</button>
                            <button
                                className="delete-block"
                                onClick={() => {
                                    props.handleDelete(props.posObj.nodeId)
                                    close();
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </Popup>
            {/* )} */}
        </div>
    )
}
//#endregion

export default FourCircles;



















