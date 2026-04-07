

const initialState = {
    user: JSON.parse(localStorage.getItem("user")) || null,
};

const adminReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'ADMIN_LOGIN':
            return {
                ...state,
                user: action.payload,
            };
        default:
            return state;
    }
};

export default adminReducer;