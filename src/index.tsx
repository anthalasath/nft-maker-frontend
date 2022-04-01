import { Grid } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom';
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { BreedableNFTForm } from './breedableNFTForm/BreedableNFTForm';

class App extends React.Component {
  render() {
    return <Grid container>
      <Grid item xs={4}></Grid>
      <Grid item xs={4}>
        <BreedableNFTForm></BreedableNFTForm>
      </Grid>
      <Grid item xs={4}></Grid>
    </Grid>
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App></App>
  </React.StrictMode>,
  document.getElementById('root')
);