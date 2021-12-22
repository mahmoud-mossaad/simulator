   
  // return the token from the session storage
  export const getToken = () => {
    //console.log(sessionStorage.getItem('token') || null)
    return sessionStorage.getItem('token') || null;
  }
   
  // remove the token and user from the session storage
  export const removeUserSession = () => {
    sessionStorage.removeItem('token');
  }
   
  // set the token and user from the session storage
  export const setUserSession = (token) => {
    sessionStorage.setItem('token', token);
  }