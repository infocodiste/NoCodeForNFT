/***
 *
 * App.js
 * Created By : Nishant
 *
 ***/

// Import required Modules
import React from "react";
import {
  Switch,
  Route,
  Redirect,
  BrowserRouter as Router,
} from "react-router-dom";
import "./App.css";
import Dashboard from "./components/admin/dashboard";
import Login from "./components/admin/login";
import Header from "./components/Header/Header";
import MintingOptions from "./components/MintingOptions/MintingOptions.component";

function App() {
  return (
    <Router>
      <Header/>
      <Switch>
        <Route exact path="/">
          <MintingOptions />
        </Route>
        <Route exact path="/admin">
          <Login />
        </Route>
        <Route exact path="/admin/dashboard">
          <Dashboard />
        </Route>
        <Redirect to="/" />
      </Switch>
    </Router>
  );
}

export default App;
