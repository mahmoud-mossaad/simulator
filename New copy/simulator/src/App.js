import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
 
import Login from './components/login/login';
import Dashboard from './components/dashboard/dashboard';
import PrivateRoute from './Utils/PrivateRoutes';
import PublicRoute from './Utils/PublicRoutes';
import 'semantic-ui-css/semantic.min.css'

 
function App() {
  const NoMatchPage = () => {
    return (
      <h3>404 - Not found</h3>
    );
  };
  return (
    <div className="App">
      <BrowserRouter>
        <div>
          <div>
            <Switch>
              <PrivateRoute exact path="/" component={Dashboard} />
              <PublicRoute path="/login" component={Login} />
              <PrivateRoute path="/dashboard" component={Dashboard} />
              <Route path="/*" component={NoMatchPage} />
            </Switch>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}
 
export default App;