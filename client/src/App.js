import React from "react";
import "./styles.css";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { Redirect, Route, Switch } from "react-router-dom";
import Home from "./components/Home";
import NotFound from "./components/NotFound";
export default function App() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={SignUp} />
      <Route path="/home" render={(props) => <Home display={true} {...props} />} />
      <Redirect to="/login" />
    </Switch>
  );
}
