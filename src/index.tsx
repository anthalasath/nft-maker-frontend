import { Button, Divider, Grid, Stack, TextField } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom';
import { BigNumber } from "ethers";
import AddBoxIcon from '@mui/icons-material/AddBox';

interface PicturePartCategoryViewState {
  name: string
  posX: number
  posY: number
  pictureUris: string[]
}

class PicturePartCategoryView extends React.Component<{}, PicturePartCategoryViewState> {


}

interface BreedableNFTFormState {
  name?: string
  symbol?: string
  breedingFeeInWei?: BigNumber
  fatherGeneChance?: number
  motherGeneChance?: number
}

class BreedableNFTForm extends React.Component<{}, BreedableNFTFormState> {

  constructor(props: {}) {
    super(props);
    this.state = {}
  }

  handleNameChange(value: string) {
    this.setState({
      name: value
    });
  }

  handleSymbolChange(value: string) {
    this.setState({
      symbol: value
    });
  }

  handleBreedingFeeInWeiChange(value: string) {
    this.setState({
      breedingFeeInWei: BigNumber.from(value)
    });
  }

  handleFatherGeneChanceChange(value: string) {
    this.setState({
      fatherGeneChance: Number.parseInt(value)
    });
  }

  handleMotherGeneChanceChange(value: string) {
    this.setState({
      motherGeneChance: Number.parseInt(value)
    });
  }

  handleAddCategoryClick() {
    alert("Clicked");
  }

  render() {
    return <Stack spacing={1}>
      <TextField label="name" onChange={e => this.handleNameChange(e.target.value)}>
      </TextField>
      <TextField label="symbol" onChange={e => this.handleSymbolChange(e.target.value)}>
      </TextField>
      <TextField label="breedingFeeInWei" onChange={e => this.handleBreedingFeeInWeiChange(e.target.value)}>
      </TextField>
      <TextField label="fatherGeneChance" onChange={e => this.handleFatherGeneChanceChange(e.target.value)}>
      </TextField>
      <TextField label="motherGeneChance" onChange={e => this.handleMotherGeneChanceChange(e.target.value)}>
      </TextField>
      <Button variant="contained" onClick={() => this.handleAddCategoryClick()}>
        <AddBoxIcon></AddBoxIcon>
      </Button>
    </Stack>
  }
}

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