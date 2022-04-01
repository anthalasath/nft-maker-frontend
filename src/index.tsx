import { Button, Divider, Grid, Paper, Stack, TextField } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom';
import { BigNumber } from "ethers";
import AddBoxIcon from '@mui/icons-material/AddBox';
import { PicturePartCategoryStruct } from "../nft-maker/typechain-types/contracts/BreedableNFT";

interface PicturePartCategoryViewProps {
  picturePart: PicturePartCategoryStruct
  handleNameChange: (value: string) => void
  handlePosXChange: (value: number) => void
  handlePosYChange: (value: number) => void
}

function PicturePartCategoryView(props: PicturePartCategoryViewProps) {
  return <Paper>
    <TextField label="name" onChange={e => props.handleNameChange(e.target.value)}></TextField>
    <TextField label="posX" onChange={e => props.handlePosXChange(Number.parseInt(e.target.value))}></TextField>
    <TextField label="posY" onChange={e => props.handlePosYChange(Number.parseInt(e.target.value))}></TextField>
  </Paper>
}

interface BreedableNFTFormState {
  name?: string
  symbol?: string
  breedingFeeInWei?: BigNumber
  fatherGeneChance?: number
  motherGeneChance?: number
  categories: PicturePartCategoryStruct[]
}

class BreedableNFTForm extends React.Component<{}, BreedableNFTFormState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      categories: []
    }
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

  handleCategoryNameChange(index: number, value: string) {
    this.handleCategoryChange(index, cat => {
      cat.name = value;
    });
  }

  handleCategoryPosXChange(index: number, value: number) {
    this.handleCategoryChange(index, cat => {
      cat.position.x = value;
    });
  }

  handleCategoryPosYChange(index: number, value: number) {
    this.handleCategoryChange(index, cat => {
      cat.position.y = value;
    });
  }

  handleCategoryChange(index: number, f: (value: PicturePartCategoryStruct) => void) {
    const cat = this.state.categories[index];
    f(cat);
    this.setState({ categories: this.state.categories })
  }

  handleAddCategoryClick() {
    const categories = this.state.categories;
    categories.push({
      name: "",
      position: { x: 0, y: 0 },
      picturesUris: []
    });
    this.setState({ categories: categories });
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
      {this.state.categories.map((cat, index) => <PicturePartCategoryView
        picturePart={cat}
        handleNameChange={value => this.handleCategoryNameChange(index, value)}
        handlePosXChange={value => this.handleCategoryPosXChange(index, value)}
        handlePosYChange={value => this.handleCategoryPosYChange(index, value)}
      ></PicturePartCategoryView>)}
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