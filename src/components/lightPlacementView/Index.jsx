import "./Index.css";
import React, { useState, useEffect } from "react";
import {
  GetAllCategoriesApi,
  GetProductApi,
  GetAllProductApi,
} from "../../actions/lightPlacementActions.jsx";
import { DataLoading, OldSpinnerLoader } from "../../loader/Index.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../header/Index.jsx";
import backArraow from "../../assets/img/back_arrow.svg";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { GetAllLightPlacement } from "../../IndexedDB.jsx";
import DefaultImg from "../../assets/img/defaultImg.png";
// import EditView from "../editView/Index.js";
import Joyride, {
  ACTIONS,
  EVENTS,
  ORIGIN,
  STATUS,
  // CallBackProps,
} from "react-joyride";
import toast from "react-hot-toast";

const LightPlacement = (props) => {
  const [categoriesData, setCategoriesData] = useState([]);
  const [childrenCategories, setChildrenCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [productData, setProductData] = useState([]);
  const [allProductData, setAllProductData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRoomType, setShowRoomType] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [lightPlacementPositions, setLightPlacementPositions] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState(null);

  const [airFlow, setAirFlow] = useState(false);
  const [outDoor, setOutDoor] = useState(false);
  const [specialized, setSpecialized] = useState(false);

  const [airFlows, setAirFlows] = useState([]);
  const [outflow, setOutflow] = useState([]);
  const [specializedLighting, setSpecializedLighting] = useState([]);


  // const [selectedPrice, setSelectedPrice] = useState(null);
  // const [isLoadingRoomType, setIsLoadingRoomType] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [run, setRun] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // useEffect(() => {
  //   GetAllCategories();
  //   //Getdatabase Data
  //   getAllPositions();
  // }, []);

  //manage flow for other independent filters
  const categoryMap = {
    75: setAirFlows,
    76: setOutflow,
    77: setSpecializedLighting,
  };

  const fetchByCategories = async () => {
    setIsLoading(true);
    try {
      const categoryIds = [75, 76, 77];
      await Promise.all(
        categoryIds.map(async (categoryId) => {
          const productResponse = await GetProductApi(categoryId);
          const productItems = productResponse?.items || [];

          const filterItems = FindItemsByPosition(productItems, categoryId);

          const setState = categoryMap[categoryId];
          if (setState) {
            setState(filterItems);
          }
        })
      );
      setIsLoading(false);

    } catch (error) {
      setIsLoading(false);
      console.log("Independent Error in Category", error);
    }
  };


  useEffect(() => {
    // Check if the user has visited before
    const lightPlacementViewVisited = localStorage.getItem("lightPlacementViewVisited");

    if (lightPlacementViewVisited) {
      setRun(false);
    }

    // Handle categoryId prop - if provided, show products for that category
    if (props.categoryId != null) {
      GetProductData(props.categoryId.id);
      setShowProducts(true);
      setSelectedCategory(props.categoryId);
      setShowRoomType(false);
      setShowAllProducts(false);
      setAirFlow(false);
      setOutDoor(false);
      setSpecialized(false);
    } else if (props.isEditMode) {
      // Reset state when in edit mode but no category provided
      setSelectedCategory(null);
      setShowRoomType(false);
      setShowProducts(false);
      setShowAllProducts(false);
      setAirFlow(false);
      setOutDoor(false);
      setSpecialized(false);
      setProductData([]);
    }

    //GetDatabase data
    GetAllCategories();
    fetchByCategories();
    getAllPositions();
  }, [props.isEditMode, props.categoryId]);

  //   const GetAllCategories = async () => {

  //     setIsLoading(true);

  //     try {
  //       const categoriesResponse = await GetAllCategoriesApi(59);
  //       setCategoriesData(categoriesResponse);
  // console.log("Categories response:", categoriesResponse);

  //       if (categoriesResponse.children) {
  //         setIsLoading(true);
  //         const childrenIds = categoriesResponse.children.split(',');
  //         const childrenDetails = await Promise.all(childrenIds.map(id => GetAllCategoriesApi(id)));
  //         setIsLoading(false);
  //         setChildrenCategories(childrenDetails);
  // console.log("Children:", categoriesResponse.children);
  //         setIsLoading(false);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching categories:", error);
  //     }
  //   };

  const GetAllCategories = async () => {
    setIsLoading(true);

    try {
      const categoriesResponse = await GetAllCategoriesApi(59);
      console.log("Categories response:", categoriesResponse);

      // Check if response is valid
      if (!categoriesResponse || typeof categoriesResponse !== "object") {
        console.error(
          "Invalid API response. Expected JSON but got:",
          categoriesResponse
        );
        setIsLoading(false);
        return;
      }

      setCategoriesData(categoriesResponse);

      // Check if 'children' exists and is not empty
      if (categoriesResponse.children) {
        const childrenIds = categoriesResponse.children
          .split(",")
          .filter((id) => id); // remove empty strings
        if (childrenIds.length > 0) {
          const childrenDetails = await Promise.all(
            childrenIds.map(async (id) => {
              try {
                const child = await GetAllCategoriesApi(id);
                // Only return valid child objects
                if (child && typeof child === "object") return child;
                console.warn(
                  `Child category ${id} returned invalid response:`,
                  child
                );
                return null;
              } catch (err) {
                console.error(`Error fetching child category ${id}:`, err);
                return null;
              }
            })
          );

          // Remove nulls from childrenDetails
          const validChildren = childrenDetails.filter(
            (child) => child !== null
          );
          setChildrenCategories(validChildren);
          // console.log("Children categories loaded:", validChildren);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    props.onSendMessage(inputValue);
  };

  const FindItemsByPosition = (items, id) => {
    return items?.map((item) => {
      const match = item?.extension_attributes?.category_links?.find(itm => itm?.category_id?.includes(String(id)))
      // console.log("matxhingggg", match);
      return {
        ...item,
        _categoryPosition: match.position
      };
    })
      .sort((a, b) => a._categoryPosition - b._categoryPosition);
  };

  const GetProductData = async (categoryId, categoryData) => {
    try {
      setIsLoading(true);
      const productResponse = await GetProductApi(categoryId);
      const productItems = productResponse?.items;
      const filterItems = FindItemsByPosition(productItems, categoryId);
      // console.log("Sorted resposne ====>", filterItems);
      // setProductData(productResponse.items);
      setProductData(filterItems);
      setIsLoading(false);

      //default first light auto click
      // const defaultItem = filterItems[0];
      // if (defaultItem) {
      //   handleProductClick(defaultItem, defaultItem.custom_attributes.find((attr) => attr.attribute_code === "hashcolor")?.value, categoryData, false);
      // }

    } catch (error) {
      console.error("Error fetching product data for category with ID", categoryId, ":", error);
    }
  };


  const GetAllProductData = async () => {
    try {
      if (!showAllProducts) {
        setIsLoading(true);
        const allproductResponse = await GetAllProductApi();
        setIsLoading(false);
        setAllProductData(allproductResponse.items);
      }

      if (showAllProducts) {
        // setShowRoomType(true);
        // setShowProducts(true);
        setShowAllProducts(false);
      }

      if (!showAllProducts) {
        setShowAllProducts(true);
      }
    } catch (error) {
      console.error("Error fetching all product data:", error);
    }
  };

  const handleCategoryClick = (category) => {
    console.log("category clicked =====>", category);
    //setIsLoading(true); // Start loader when fetching children categories
    try {
      // console.log("Called!");
      setSelectedCategory(category);
      setShowRoomType(false); // Hide the room type selection
      // Fetch product data for the selected category
      setShowProducts(true);
      // setIsLoading(true);
      GetProductData(category.id, category);
      // setIsLoading(false);
    } catch (error) {
      console.error("Error fetching children categories:", error);
    }
  };

  const handleBackButtonClick = () => {
    setSelectedCategory(null);
    setShowRoomType(false);
    setShowProducts(false);
    setShowAllProducts(false);
    navigate(-1);
  };

  const getAllPositions = async () => {
    const params = new URLSearchParams(window.location.search);
    const fileName = params.get("file");
    var records = await GetAllLightPlacement(fileName);

    if (records?.length > 0) {
      // console.log("inside", records);
      setLightPlacementPositions(records);
    }
  };

  const lightPlacementMap = {
    "Single Light Placement (1 Light)": "single_light",
    "Small Room: 2x2m or smaller (1 light)": "small_room_light",
    "Medium Size Room: 2x3m - 3x4m (1/2 lights)": "medium_room_light",
    "Large Size Room - 3x4m - 4x5m (1/4 lights)": "large_room_light",
    "X-Large Size Room: 4x5m - 5x8m (1/2/6 lights)": "xl_room_light",
    "XX-Large Size Room: 5x8m - 6x10m (2/8 lights)": "xxl_room_light",
    "XXX-Large Size Room: 6x8m - 7x12m (3/9 lights)": "xxxl_room_light"
  };

  const words = {
    1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six", 7: "Seven", 8: "Eight", 9: "Nine", 10: "Ten"
  };


  const handleProductClick = (product, productColor, categoryData, isExtend, flagType, isSingle) => {
    // console.log("PRODUCT ====>", product, productColor, categoryData, selectedCategory);
    let productSku = product.sku;
    // if product color is undefined
    productColor = productColor || "#212529";
    // localStorage.setItem('hashColor', productColor);select-collapse-collapse
    const params = new URLSearchParams(window.location.search);
    const fileName = params.get("file");
    // const circleComponents = params.get("circles");
    var circleComponents = new URLSearchParams(window.location.href);
    // console.log("circle ---", circleComponents,window.location);
    circleComponents = circleComponents.get("circles");
    // console.log("fileName", fileName, "productColor", productColor, "circleComponents", circleComponents)
    // console.log("circle ===", circleComponents);

    var quantity;
    var circleComponent = circleComponents ? decodeURIComponent(circleComponents) : "";
    var hashColor = "";
    var lightSize = "small";

    const productCategory = isExtend === true ? categoryData : (selectedCategory || categoryData);

    const labelName = productCategory.name === "X-Large Size Room: 5x8m - 6x10m (2/8 lights)" ?
      "XX-Large Size Room: 5x8m - 6x10m (2/8 lights)" :
      productCategory.name === "X-Large Size Room: 6x8m - 7x12m (3/9 lights)" ?
        "XXX-Large Size Room: 6x8m - 7x12m (3/9 lights)" :
        productCategory.name;

    let height = null;
    let width = null;

    const dotkey = lightPlacementMap[labelName];
    const dotNumber = product?.custom_attributes?.find(obj => obj.attribute_code === dotkey) ? Number(product?.custom_attributes?.find(obj => obj.attribute_code === dotkey)?.value) : null;
    const productUrl = product?.custom_attributes?.find(item => item.attribute_code === "app_image")?.value || null;
    const lightPixels = product?.custom_attributes?.find(item => item.attribute_code === "set_of_lights")?.value || null;
    // console.log("product url ====>", lightPixels?.split("*").map(Number), productUrl);

    console.log("***************", props.aiData, lightPixels);

    if (lightPixels !== null && lightPixels !== undefined) {
      let [w, h] = lightPixels?.split("*").map(Number);
      // height = h;
      // width = w;

      const widthPx = Math.ceil(w * props.aiData.pixels_per_cm_from_grid);
      const heightPx = Math.ceil(h * props.aiData.pixels_per_cm_from_grid);

      console.log("calculated height and width in px ===>", widthPx, heightPx);

      width = widthPx;
      height = heightPx;

    }

    switch (productCategory.name) {
      case "Single Light Placement (1 Light)":
        circleComponent
          ? (circleComponent += dotNumber ? `,${words[dotNumber]}Circles_${productColor}` : `,OneCircles_${productColor}`)
          : (circleComponent = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `OneCircles_${productColor}`);
        quantity = dotNumber ?? 1;
        hashColor = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `OneCircles_${productColor}`;
        break;
      case "Small Room: 2x2m or smaller (1 light)":
        circleComponent
          ? (circleComponent += dotNumber ? `,${words[dotNumber]}Circles_${productColor}` : `,OneCircles_${productColor}`)
          : (circleComponent = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `OneCircles_${productColor}`);
        quantity = dotNumber ?? 1;
        hashColor = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `OneCircles_${productColor}`;
        break;
      case "Medium Size Room: 2x3m - 3x4m (1/2 lights)":
        circleComponent
          ? (circleComponent += dotNumber ? `,${words[dotNumber]}Circles_${productColor}` : `,TwoCircles_${productColor}`)
          : (circleComponent = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `TwoCircles_${productColor}`);
        if (productSku.startsWith("P18S")) {
          quantity = dotNumber ?? 1;
          hashColor = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `OneCircles_${productColor}`;
          lightSize = "medium";
        } else {
          quantity = dotNumber ?? 2;
          hashColor = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `TwoCircles_${productColor}`;
        }
        break;
      case "Large Size Room - 3x4m - 4x5m (1/4 lights)":
        circleComponent
          ? (circleComponent += dotNumber ? `,${words[dotNumber]}Circles_${productColor}` : `,FourCircles_${productColor}`)
          : (circleComponent = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `FourCircles_${productColor}`);
        if (productSku.startsWith("P24")) {
          quantity = dotNumber ?? 1;
          hashColor = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `OneCircles_${productColor}`;
          lightSize = "large";
        } else if (productSku.startsWith("P30S")) {
          quantity = dotNumber ?? 1;
          hashColor = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `OneCircles_${productColor}`;
          lightSize = "large";
        } else {
          quantity = dotNumber ?? 4;
          hashColor = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `FourCircles_${productColor}`;
        }
        break;
      case "X-Large Size Room: 4x5m - 5x8m (1/2/6 lights)":
        circleComponent
          ? (circleComponent += dotNumber ? `,${words[dotNumber]}Circles_${productColor}` : `,SixCircles_${productColor}`)
          : (circleComponent = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `SixCircles_${productColor}`);

        if (productSku.startsWith("P24")) {
          quantity = dotNumber ?? 2;
          hashColor = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `TwoCircles_${productColor}`;
          lightSize = "large";
        } else if (productSku.startsWith("P18S")) {
          quantity = dotNumber ?? 2;
          hashColor = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `TwoCircles_${productColor}`;
          lightSize = "medium";
        } else if (productSku.startsWith("P30S")) {
          quantity = dotNumber ?? 2;
          hashColor = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `TwoCircle_${productColor}`;
          lightSize = "medium";
        } else {
          quantity = dotNumber ?? 6;
          hashColor = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `SixCircles_${productColor}`;
        }
        break;
      case "X-Large Size Room: 5x8m - 6x10m (2/8 lights)":
        circleComponent
          ? (circleComponent += dotNumber ? `,${words[dotNumber]}Circles_${productColor}` : `,EightCircles_${productColor}`)
          : (circleComponent = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `EightCircles_${productColor}`);
        if (productSku.startsWith("P24")) {
          quantity = dotNumber ?? 2;
          hashColor = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `TwoCircles_${productColor}`;
          lightSize = "large";
        } else if (productSku.startsWith("P30S")) {
          quantity = dotNumber ?? 2;
          hashColor = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `TwoCircle_${productColor}`;
          lightSize = "large";
        } else {
          quantity = dotNumber ?? 8;
          hashColor = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `EightCircles_${productColor}`;
        }
        break;
      case "X-Large Size Room: 6x8m - 7x12m (3/9 lights)":
        circleComponent
          ? (circleComponent += dotNumber ? `,${words[dotNumber]}Circles_${productColor}` : `,EightCircles_${productColor}`)
          : (circleComponent = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `EightCircles_${productColor}`);
        if (productSku.startsWith("P24")) {
          quantity = dotNumber ?? 3;
          hashColor = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `TwoCircles_${productColor}`;
          lightSize = "large";
        } else if (productSku.startsWith("P18S")) {
          quantity = dotNumber ?? 3;
          hashColor = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `TwoCircles_${productColor}`;
          lightSize = "medium";
        } else if (productSku.startsWith("P30S")) {
          quantity = dotNumber ?? 2;
          hashColor = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `TwoCircles_${productColor}`;
          lightSize = "large";
        } else {
          quantity = dotNumber ?? 9;
          hashColor = dotNumber ? `${words[dotNumber]}Circles_${productColor}` : `EightCircles_${productColor}`;
        }
        break;
      default:
        circleComponent = null;
        break;
    }


    const singleType = (isSingle !== undefined && isSingle !== null && isSingle === true) ? true : false;

    var selectedProduct = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: quantity,
      color: productColor,
      category: productCategory, // Store the category/room type for later use
      flag: flagType,
      isSingle: isSingle,
      imageUrl: productUrl,
      height: height,
      width: width,
      // isApplied: false,
      // isApplied: isSingle ? false : true,
      createdAt: Date.now()
    };

    // console.log('aftav********', selectedProduct);

    //  Get localstorage array
    let curentPositionArr = JSON.parse(
      localStorage.getItem("currentNodePositions")
    );
    let editCurrentNodeId = JSON.parse(
      localStorage.getItem("editCurrentNodeId")
    );

    if (Array.isArray(curentPositionArr) == true) {
      if (curentPositionArr.length >= 1) {
        if (props.categoryId == null && editCurrentNodeId == null) {
          let lastIndex = curentPositionArr.length - 1;
          let lastArrObj = curentPositionArr[lastIndex];
          lastArrObj.placeLight = hashColor;
          lastArrObj.categoryId = productCategory;
          lastArrObj.selectedProductList = selectedProduct;
          lastArrObj.fileName = fileName;
          lastArrObj.lightSize = lightSize;
          curentPositionArr[lastIndex] = lastArrObj;
          // let lastArrElement = curentPositionArr[curentPositionArr.length - 1]
          // set active page
          let activePageIndex = parseInt(
            localStorage.getItem("activePageIndex")
          );
          curentPositionArr[lastIndex].pageIndex = activePageIndex;
        } else {
          console.log("updated else array before", curentPositionArr);
          for (let i = 0; i < curentPositionArr.length; i++) {
            if (
              curentPositionArr[i].nodeId == props.nodeId ||
              curentPositionArr[i].nodeId == editCurrentNodeId
            ) {
              curentPositionArr[i].placeLight = hashColor;
              curentPositionArr[i].selectedProductList = selectedProduct;
              curentPositionArr[i].categoryId = productCategory;
              curentPositionArr[i].lightSize = lightSize;

              if (editCurrentNodeId) {
                console.log("updated array if edit the node");
                localStorage.removeItem("editCurrentNodeId");
              }
            }
          }
        }
      }

      // Update the property
      localStorage.setItem(
        "currentNodePositions",
        JSON.stringify(curentPositionArr)
      );
    } else {
      if (props.categoryId != null) {
        for (let i = 0; i < lightPlacementPositions.length; i++) {
          if (lightPlacementPositions[i].nodeId == props.nodeId) {
            lightPlacementPositions[i].placeLight = hashColor;
          }
        }
      }
    }
    //navigate(`/editview?file=${decodeURIComponent(fileName)}`, { state: selectedProduct });
    props.onSendMessage(selectedProduct, singleType);
    props.setShowLightPlacementComp(false);
    // props.setIsSelect(true);
    // &placeLight=${circleComponent}
  };

  const steps = [
    {
      target: ".select-room-type",
      content: "By clicking on this button you can select room type",
      disableBeacon: true,
      hideCloseButton: true,
      placement: "auto",
    },
    {
      target: ".select-product-type",
      content: "By clicking on this button you can select prooduct type",
      hideCloseButton: true,
      hideBackButton: true,
      placement: "auto",
    },
  ];

  // joyride callback function
  const handleJoyrideCallback = (data) => {
    const { action, index, origin, status, type } = data;
    console.log("data", data);
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // You need to set our running state to false, so we can restart if we click start again.
      localStorage.setItem("lightPlacementViewVisited", "true");
      setRun(false);
    }
  };

  // console.log("childrenCategories", childrenCategories);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fileName = params.get("file");

    if (!fileName || !selectedCategory) return;

    const storedData = JSON.parse(localStorage.getItem("fileCategoryMap")) || {};

    // Update or add
    storedData[fileName] = selectedCategory;

    // Save back
    localStorage.setItem("fileCategoryMap", JSON.stringify(storedData));

  }, [selectedCategory]);

  const handlePrefill = () => {
    const params = new URLSearchParams(window.location.search);
    const fileName = params.get("file");

    if (!fileName || selectedCategory) return;

    const storedData = JSON.parse(localStorage.getItem("fileCategoryMap")) || {};
    const categoryData = storedData[fileName];
    if (!categoryData) return;

    setSelectedCategory(categoryData);
    GetProductData(categoryData.id, categoryData);
  };

  useEffect(() => {
    handlePrefill();
  }, []);

  return (
    <>
      <Joyride
        callback={(data) => handleJoyrideCallback(data)}
        steps={steps}
        run={run}
        styles={{
          options: {
            primaryColor: "#00BD00",
          },
        }}
        continuous
        showSkipButton
        showProgress
        disableOverlayClose={true}
        disableScrollParentFix={true}
      />
      <div className="row">
        <div className="col-md-12 select-lighting-block-area">
          <div className={'select-lighting-block'}>
            <div className="lightheader select-light-header">
              {/* <div className="custom-back-btn-align header-inner-text">
                <button onClick={handleBackButtonClick}><ChevronLeftIcon />Back</button>
              </div> */}
              <div className="header-inner-text">Selected lighting</div>
              <div className="header-inner-text"></div>
            </div>

            {!showAllProducts && (
              <div className="select-collapse-area-block">
                {/* Only show room type selection if no category is pre-selected (not in edit mode with category) */}
                {!props.categoryId && (
                  <div className="select-collapse-collapse">
                    <div className="select-collapse-button">
                      {/* {selectedCategory ?  
                  // (
                  //   <button type="button" className="btn" >{selectedCategory.name}  < ExpandMoreIcon className="expand-icon" /> </button>
                  // ) 
                  // : (*/}
                      <button
                        type="button"
                        className={`select-room-type btn ${showRoomType ? "" : "collapsed"
                          }`}
                        onClick={() => {
                          // if (props.categoryId == null) {
                          setShowRoomType(!showRoomType);
                          // }
                          // else {
                          //   setShowRoomType(false);
                          // }
                        }}
                      >
                        {selectedCategory ?
                          (selectedCategory.name === "X-Large Size Room: 5x8m - 6x10m (2/8 lights)" ? "XX-Large Size Room: 5x8m - 6x10m (2/8 lights)" :
                            selectedCategory.name === "X-Large Size Room: 6x8m - 7x12m (3/9 lights)" ? "XXX-Large Size Room: 6x8m - 7x12m (3/9 lights)" : selectedCategory.name)
                          :
                          "Select Room Type"}
                        {" "}
                        <ExpandMoreIcon className="expand-icon" />
                      </button>

                      {/*   // )
              } */}
                    </div>
                    <div
                      id="select-collapse"
                      className={`collapse${showRoomType ? " show" : ""}`}
                    >
                      {isLoading ? (
                        // <div> loading....</div>
                        // <OldSpinnerLoader />
                        <></>
                      ) : (
                        childrenCategories.length > 0 && (
                          <>
                            {childrenCategories.map((category, index) => (
                              <div
                                key={index}
                                onClick={() => handleCategoryClick(category)}
                              >
                                <div className="categoryblock">
                                  <div>
                                    <strong>
                                      {category.name === "X-Large Size Room: 5x8m - 6x10m (2/8 lights)" ?
                                        "XX-Large Size Room: 5x8m - 6x10m (2/8 lights)" :
                                        category.name === "X-Large Size Room: 6x8m - 7x12m (3/9 lights)" ?
                                          "XXX-Large Size Room: 6x8m - 7x12m (3/9 lights)" :
                                          category.name}
                                    </strong>
                                  </div>
                                  <div>
                                    {
                                      category.custom_attributes.find(
                                        (attr) =>
                                          attr.attribute_code === "description"
                                      )?.value
                                    }
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        )
                      )}
                      {/* {selectedCategory && (
                    <div className="collapse-nav-block">{selectedCategory.name}</div>
                  )} */}
                    </div>
                  </div>
                )}
                {/* {isLoading && <OldSpinnerLoader />} */}
                <div className="select-collapse-collapse">
                  <div className="select-collapse-button">
                    <button
                      type="button"
                      className={`btn select-product-type ${showProducts ? "" : "collapsed"}`}
                      data-bs-toggle="collapse"
                      data-bs-target="#select-collapse2"
                      onClick={() => {
                        // If category is pre-selected, ensure products are shown
                        if (props.categoryId && !showProducts) {
                          setShowProducts(true);
                        }
                      }}
                    >
                      {selectedCategory && props.categoryId
                        ? `${selectedCategory.name} - Products`
                        : "Select Product Type"}{" "}
                      <ExpandMoreIcon className="expand-icon" />
                    </button>
                  </div>
                  <div
                    id="select-collapse2"
                    className={`collapse${showProducts == true ? " show" : ""}`}
                  >
                    {selectedCategory && (
                      <div className="selected-lighting">

                        {(!isLoading && Array.isArray(productData)) && <div className="section-label best-value-label">
                          BEST VALUE Lighting (Recommended)
                        </div>}

                        {Array.isArray(productData) &&
                          productData.slice(0, 3).map((product, index) => (
                            <div className="selected-light-block" key={index}>
                              <div
                                className="selected-light-name"
                                key={index}
                                onClick={() =>
                                  handleProductClick(
                                    product,
                                    product.custom_attributes.find((attr) => attr.attribute_code === "hashcolor")?.value
                                  )
                                }
                              >
                                <div className="product-image-block">
                                  {product?.media_gallery_entries?.length > 0 ? (<img
                                    src={`https://greenhse.com/pub/media/catalog/product${product?.media_gallery_entries[0]?.file}`}
                                    alt={product.name}
                                  />) : (<img src={DefaultImg} alt="Default" />)}
                                </div>
                                <div className="product-name-info">
                                  {product.sku}
                                </div>
                              </div>
                              <div className="selected-light-content-info">
                                <div className="custom-bottom-margin selected-light-poduct-name">
                                  {product.name}
                                </div>
                                {/* <div className="custom-bottom-margin">{product.custom_attributes.find(attr => attr.attribute_code === 'meta_description')?.value}</div> */}
                                <div className="custom-bottom-margin light-price-text-info">
                                  ${product.price}+GST
                                </div>
                                <a
                                  href={`https://greenhse.com/${product.custom_attributes.find(
                                    (attr) =>
                                      attr.attribute_code === "url_key"
                                  )?.value
                                    }.html`}
                                  target="_blank"
                                >
                                  Click here for detailed information
                                </a>
                                <div
                                  style={{
                                    color: product.custom_attributes.find(
                                      (attr) =>
                                        attr.attribute_code === "hashcolor"
                                    )?.value,
                                  }}
                                >
                                  <LightbulbIcon className="light-icon" />
                                </div>
                              </div>
                            </div>
                          ))}

                        {(!isLoading && Array.isArray(productData)) && <div className="section-label premium-label">
                          PREMIUM Lighting
                        </div>}

                        {Array.isArray(productData) &&
                          productData.slice(3).map((product, index) => (
                            <div className="selected-light-block" key={index}>
                              <div
                                className="selected-light-name"
                                key={index}
                                onClick={() =>
                                  handleProductClick(
                                    product,
                                    product.custom_attributes.find((attr) => attr.attribute_code === "hashcolor")?.value
                                  )
                                }
                              >
                                <div className="product-image-block">
                                  {product?.media_gallery_entries?.length > 0 ? (<img
                                    src={`https://greenhse.com/pub/media/catalog/product${product?.media_gallery_entries[0]?.file}`}
                                    alt={product?.name}
                                  />) : (<img src={DefaultImg} alt="Default" />)}
                                </div>
                                <div className="product-name-info">
                                  {product?.sku}
                                </div>
                              </div>
                              <div className="selected-light-content-info">
                                <div className="custom-bottom-margin selected-light-poduct-name">
                                  {product?.name}
                                </div>
                                {/* <div className="custom-bottom-margin">{product.custom_attributes.find(attr => attr.attribute_code === 'meta_description')?.value}</div> */}
                                <div className="custom-bottom-margin light-price-text-info">
                                  ${product.price}+GST
                                </div>
                                <a
                                  href={`https://greenhse.com/${product.custom_attributes.find(
                                    (attr) =>
                                      attr.attribute_code === "url_key"
                                  )?.value
                                    }.html`}
                                  target="_blank"
                                >
                                  Click here for detailed information
                                </a>
                                <div
                                  style={{
                                    color: product.custom_attributes.find(
                                      (attr) =>
                                        attr.attribute_code === "hashcolor"
                                    )?.value,
                                  }}
                                >
                                  <LightbulbIcon className="light-icon" />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>


                {/* single lights placements */}
                <div className="lightheader select-light-header">
                  <div className="header-inner-text">Extended Lighting Range (Single Placement)</div>
                  <div className="header-inner-text"></div>
                </div>

                {/* airflow */}
                <div className="select-collapse-area-block" style={{ marginBottom: "1rem" }}>
                  <div className="select-collapse-collapse">
                    <div className="select-collapse-button">
                      <button
                        type="button"
                        className={`btn select-product-type ${airFlow ? "" : "collapsed"}`}
                        // data-bs-toggle="collapse"
                        // data-bs-target="#select-collapse3"
                        onClick={() => setAirFlow(prev => !prev)}
                      >
                        Airflow (Fans, Exhaust Fan)
                        {selectedCategory && props.categoryId ? `${selectedCategory.name}` : ""} {" "}
                        <ExpandMoreIcon className="expand-icon" />
                      </button>
                    </div>
                    <div
                      // id="select-collapse3"
                      className={`collapse${airFlow ? " show" : ""}`}
                    >
                      {/* {selectedCategory && ( */}
                      <div className="selected-lighting">
                        {Array.isArray(airFlows) &&
                          airFlows.map((product, index) => (
                            <div className="selected-light-block" key={index}>
                              <div
                                className="selected-light-name"
                                key={index}
                                onClick={() =>
                                  handleProductClick(
                                    product,
                                    product.custom_attributes.find((attr) => attr.attribute_code === "hashcolor")?.value,
                                    childrenCategories[0],
                                    true,
                                    "airflow",
                                    true
                                  )
                                }
                              >
                                <div className="product-image-block">
                                  {product?.media_gallery_entries?.length > 0 ? (<img
                                    src={`https://greenhse.com/pub/media/catalog/product${product?.media_gallery_entries[0]?.file}`}
                                    alt={product.name}
                                  />) : (<img src={DefaultImg} alt="Default" />)}
                                </div>
                                <div className="product-name-info">
                                  {product.sku}
                                </div>
                              </div>
                              <div className="selected-light-content-info">
                                <div className="custom-bottom-margin selected-light-poduct-name">
                                  {product.name}
                                </div>
                                {/* <div className="custom-bottom-margin">{product.custom_attributes.find(attr => attr.attribute_code === 'meta_description')?.value}</div> */}
                                <div className="custom-bottom-margin light-price-text-info">
                                  ${product.price}+GST
                                </div>
                                <a
                                  href={`https://greenhse.com/${product.custom_attributes.find(
                                    (attr) =>
                                      attr.attribute_code === "url_key"
                                  )?.value
                                    }.html`}
                                  target="_blank"
                                >
                                  Click here for detailed information
                                </a>
                                <div
                                  style={{
                                    color: product.custom_attributes.find(
                                      (attr) =>
                                        attr.attribute_code === "hashcolor"
                                    )?.value,
                                  }}
                                >
                                  <LightbulbIcon className="light-icon" />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                      {/* )} */}
                    </div>
                  </div>
                </div>


                {/* OutDoor */}
                <div className="select-collapse-area-block" style={{ marginBottom: "1rem" }}>
                  <div className="select-collapse-collapse">
                    <div className="select-collapse-button">
                      <button
                        type="button"
                        className={`btn select-product-type ${outDoor ? "" : "collapsed"}`}
                        // data-bs-toggle="collapse"
                        // data-bs-target="#select-collapse3"
                        onClick={() => setOutDoor(prev => !prev)}
                      >
                        Outdoor Lights & Flood Lights
                        {/* {selectedCategory && props.categoryId ? `${selectedCategory.name}` : ""} {" "} */}
                        <ExpandMoreIcon className="expand-icon" />
                      </button>
                    </div>
                    <div
                      // id="select-collapse3"
                      className={`collapse${outDoor ? " show" : ""}`}
                    >
                      {/* {selectedCategory && ( */}
                      <div className="selected-lighting">
                        {Array.isArray(outflow) &&
                          outflow.map((product, index) => (
                            <div className="selected-light-block" key={index}>
                              <div
                                className="selected-light-name"
                                key={index}
                                onClick={() =>
                                  handleProductClick(
                                    product,
                                    product.custom_attributes.find((attr) => attr.attribute_code === "hashcolor")?.value,
                                    childrenCategories[0],
                                    true,
                                    null,
                                    true
                                    // "outdoor"
                                  )
                                }
                              >
                                <div className="product-image-block">
                                  {product?.media_gallery_entries?.length > 0 ? (<img
                                    src={`https://greenhse.com/pub/media/catalog/product${product?.media_gallery_entries[0]?.file}`}
                                    alt={product.name}
                                  />) : (<img src={DefaultImg} alt="Default" />)}
                                </div>
                                <div className="product-name-info">
                                  {product?.sku}
                                </div>
                              </div>
                              <div className="selected-light-content-info">
                                <div className="custom-bottom-margin selected-light-poduct-name">
                                  {product?.name}
                                </div>
                                {/* <div className="custom-bottom-margin">{product.custom_attributes.find(attr => attr.attribute_code === 'meta_description')?.value}</div> */}
                                <div className="custom-bottom-margin light-price-text-info">
                                  ${product?.price}+GST
                                </div>
                                <a
                                  href={`https://greenhse.com/${product?.custom_attributes.find(
                                    (attr) =>
                                      attr.attribute_code === "url_key"
                                  )?.value
                                    }.html`}
                                  target="_blank"
                                >
                                  Click here for detailed information
                                </a>
                                <div
                                  style={{
                                    color: product.custom_attributes.find(
                                      (attr) =>
                                        attr.attribute_code === "hashcolor"
                                    )?.value,
                                  }}
                                >
                                  <LightbulbIcon className="light-icon" />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                      {/* )} */}
                    </div>
                  </div>
                </div>

                {/* Spcialised Lights */}
                <div className="select-collapse-area-block">
                  <div className="select-collapse-collapse">
                    <div className="select-collapse-button">
                      <button
                        type="button"
                        className={`btn select-product-type ${specialized ? "" : "collapsed"}`}
                        // data-bs-toggle="collapse"
                        // data-bs-target="#select-collapse3"
                        onClick={() => setSpecialized(prev => !prev)}
                      >
                        Specialised Lights
                        {/* {selectedCategory && props.categoryId ? `${selectedCategory.name}` : ""} {" "} */}
                        <ExpandMoreIcon className="expand-icon" />
                      </button>
                    </div>
                    <div
                      // id="select-collapse3"
                      className={`collapse${specialized ? " show" : ""}`}
                    >
                      {/* {selectedCategory && ( */}
                      <div className="selected-lighting">
                        {Array.isArray(specializedLighting) &&
                          specializedLighting.map((product, index) => (
                            <div className="selected-light-block" key={index}>
                              <div
                                className="selected-light-name"
                                key={index}
                                onClick={() =>
                                  handleProductClick(
                                    product,
                                    product.custom_attributes.find((attr) => attr.attribute_code === "hashcolor")?.value,
                                    childrenCategories[0],
                                    true,
                                    null,
                                    true
                                    // "specialized"
                                  )
                                }
                              >
                                <div className="product-image-block">
                                  {product?.media_gallery_entries?.length > 0 ? (<img
                                    src={`https://greenhse.com/pub/media/catalog/product${product?.media_gallery_entries[0]?.file}`}
                                    alt={product.name}
                                  />) : (<img src={DefaultImg} alt="Default" />)}
                                </div>
                                <div className="product-name-info">
                                  {product.sku}
                                </div>
                              </div>
                              <div className="selected-light-content-info">
                                <div className="custom-bottom-margin selected-light-poduct-name">
                                  {product.name}
                                </div>
                                {/* <div className="custom-bottom-margin">{product.custom_attributes.find(attr => attr.attribute_code === 'meta_description')?.value}</div> */}
                                <div className="custom-bottom-margin light-price-text-info">
                                  ${product.price}+GST
                                </div>
                                <a
                                  href={`https://greenhse.com/${product.custom_attributes.find(
                                    (attr) =>
                                      attr.attribute_code === "url_key"
                                  )?.value
                                    }.html`}
                                  target="_blank"
                                >
                                  Click here for detailed information
                                </a>
                                <div
                                  style={{
                                    color: product.custom_attributes.find(
                                      (attr) =>
                                        attr.attribute_code === "hashcolor"
                                    )?.value,
                                  }}
                                >
                                  <LightbulbIcon className="light-icon" />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                      {/* )} */}
                    </div>
                  </div>
                </div>

              </div>
            )}


            <div>
              {/* {<button onClick={GetAllProductData} className="allproduct-button"><span className=""><LightbulbIcon /></span> All Lights</button>} */}
              {showAllProducts && (
                <div className="selected-lighting">
                  {Array.isArray(allProductData) &&
                    allProductData.map((product, index) => (
                      <div className="selected-light-block" key={index}>
                        <div className="selected-light-name">
                          <div className="product-image-block">
                            {product?.media_gallery_entries?.length > 0 ? (
                              <img
                                src={`https://greenhse.com/pub/media/catalog/product${product?.media_gallery_entries[0]?.file}`}
                                alt={product?.name}
                              />
                            ) : (
                              <img src={DefaultImg} alt="Default" />
                            )}
                          </div>
                          <div className="product-name-info">{product?.sku}</div>
                        </div>
                        <div className="selected-light-content-info">
                          <div className="custom-bottom-margin selected-light-poduct-name">
                            {product?.name}
                          </div>
                          {/* <div className="custom-bottom-margin">{product.custom_attributes.find(attr => attr.attribute_code === 'meta_description')?.value}</div> */}
                          <div className="custom-bottom-margin light-price-text-info">
                            ${product?.price}+GST
                          </div>
                          <a
                            href={`https://greenhse.com/${product?.custom_attributes.find(
                              (attr) => attr.attribute_code === "url_key"
                            )?.value
                              }`}
                          >
                            Click here for detailed information
                          </a>
                          <div
                            style={{
                              color: product?.custom_attributes.find(
                                (attr) => attr.attribute_code === "hashcolor"
                              )?.value,
                            }}
                          >
                            <LightbulbIcon className="light-icon" />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isLoading && <OldSpinnerLoader />}
    </>
  );
};

export default LightPlacement;
