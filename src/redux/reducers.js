const initialState = {
    variable: '',
  };
  
  export const reducer = (state = initialState, action) => {
    switch (action.type) {
      case 'UPDATE_VARIABLE':
        return { ...state, variable: action.payload };
      default:
        return state;
    }
  };